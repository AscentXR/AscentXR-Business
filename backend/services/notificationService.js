const { query } = require('../db/connection');

class NotificationService {
  // ========================
  // CRUD
  // ========================

  async getNotifications({ page = 1, limit = 50, section = '', severity = '', is_read = null, user_id = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM notifications';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (section) {
      conditions.push(`section = $${paramIndex}`);
      params.push(section);
      paramIndex++;
    }
    if (severity) {
      conditions.push(`severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }
    if (is_read !== null && is_read !== undefined && is_read !== '') {
      conditions.push(`is_read = $${paramIndex}`);
      params.push(is_read === true || is_read === 'true');
      paramIndex++;
    }
    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM notifications';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (section) {
      countConditions.push(`section = $${cIdx}`);
      countParams.push(section);
      cIdx++;
    }
    if (severity) {
      countConditions.push(`severity = $${cIdx}`);
      countParams.push(severity);
      cIdx++;
    }
    if (is_read !== null && is_read !== undefined && is_read !== '') {
      countConditions.push(`is_read = $${cIdx}`);
      countParams.push(is_read === true || is_read === 'true');
      cIdx++;
    }
    if (user_id) {
      countConditions.push(`user_id = $${cIdx}`);
      countParams.push(user_id);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      notifications: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getNotificationById(id) {
    const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createNotification(data) {
    const { type, severity, title, message, section, action_url, entity_id, entity_type, user_id } = data;
    const result = await query(
      `INSERT INTO notifications (type, severity, title, message, section, action_url, entity_id, entity_type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [type, severity || 'medium', title, message || null, section, action_url || null, entity_id || null, entity_type || null, user_id || null]
    );
    return result.rows[0];
  }

  async markAsRead(id) {
    const result = await query(
      `UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async markAllAsRead({ user_id = '', section = '' } = {}) {
    let sql = 'UPDATE notifications SET is_read = true, read_at = NOW() WHERE is_read = false';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    if (section) {
      sql += ` AND section = $${paramIndex}`;
      params.push(section);
      paramIndex++;
    }

    const result = await query(sql, params);
    return { updated: result.rowCount };
  }

  async deleteNotification(id) {
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async getUnreadCount({ user_id = '' } = {}) {
    let sql = 'SELECT COUNT(*) as count FROM notifications WHERE is_read = false';
    const params = [];
    if (user_id) {
      sql += ' AND user_id = $1';
      params.push(user_id);
    }
    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }

  // ========================
  // ALERT RULE CHECKING ENGINE
  // ========================

  /**
   * Check all alert rules and create notifications for any triggered conditions.
   * Returns an array of newly created notifications.
   */
  async checkAlerts() {
    const newAlerts = [];

    const [
      renewalAlerts,
      healthDropAlerts,
      slaBreachAlerts,
      taxDeadlineAlerts,
      budgetWarningAlerts,
      invoiceOverdueAlerts,
      goalBehindAlerts
    ] = await Promise.all([
      this._checkRenewalDue(),
      this._checkHealthDrop(),
      this._checkSLABreach(),
      this._checkTaxDeadline(),
      this._checkBudgetWarning(),
      this._checkInvoiceOverdue(),
      this._checkGoalBehind()
    ]);

    newAlerts.push(...renewalAlerts, ...healthDropAlerts, ...slaBreachAlerts, ...taxDeadlineAlerts, ...budgetWarningAlerts, ...invoiceOverdueAlerts, ...goalBehindAlerts);

    return newAlerts;
  }

  /**
   * renewal_due: customer_health.renewal_date within 90/60/30 days
   */
  async _checkRenewalDue() {
    const alerts = [];
    const thresholds = [
      { days: 30, severity: 'critical' },
      { days: 60, severity: 'high' },
      { days: 90, severity: 'medium' }
    ];

    for (const { days, severity } of thresholds) {
      const result = await query(
        `SELECT ch.id, ch.renewal_date, ch.contract_value, sd.name as school_district_name
         FROM customer_health ch
         LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
         WHERE ch.renewal_date IS NOT NULL
           AND ch.renewal_date >= CURRENT_DATE
           AND ch.renewal_date <= CURRENT_DATE + ($1 || ' days')::interval
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.entity_id = ch.id AND n.entity_type = 'customer_health'
               AND n.type = 'renewal_due' AND n.severity = $2
               AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
           )`,
        [days, severity]
      );

      for (const row of result.rows) {
        const daysLeft = Math.ceil((new Date(row.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
        const notification = await this.createNotification({
          type: 'renewal_due',
          severity,
          title: `Renewal due in ${daysLeft} days: ${row.school_district_name}`,
          message: `Contract renewal for ${row.school_district_name} is due on ${row.renewal_date}. Contract value: $${parseFloat(row.contract_value || 0).toLocaleString()}.`,
          section: 'customer_success',
          action_url: `/customer-success/health/${row.id}`,
          entity_id: row.id,
          entity_type: 'customer_health'
        });
        alerts.push(notification);
      }
    }

    return alerts;
  }

  /**
   * health_drop: customer_health.overall_score < 50
   */
  async _checkHealthDrop() {
    const result = await query(
      `SELECT ch.id, ch.overall_score, ch.risk_level, sd.name as school_district_name
       FROM customer_health ch
       LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
       WHERE ch.overall_score < 50
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.entity_id = ch.id AND n.entity_type = 'customer_health'
             AND n.type = 'health_drop'
             AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`
    );

    const alerts = [];
    for (const row of result.rows) {
      const severity = row.overall_score <= 25 ? 'critical' : 'high';
      const notification = await this.createNotification({
        type: 'health_drop',
        severity,
        title: `Low health score: ${row.school_district_name} (${row.overall_score})`,
        message: `${row.school_district_name} health score has dropped to ${row.overall_score} (${row.risk_level}). Immediate attention recommended.`,
        section: 'customer_success',
        action_url: `/customer-success/health/${row.id}`,
        entity_id: row.id,
        entity_type: 'customer_health'
      });
      alerts.push(notification);
    }

    return alerts;
  }

  /**
   * sla_breach: support_tickets where sla_resolution_due < NOW() and status not in (resolved, closed)
   */
  async _checkSLABreach() {
    const result = await query(
      `SELECT st.id, st.subject, st.priority, st.sla_resolution_due, sd.name as school_district_name
       FROM support_tickets st
       LEFT JOIN school_districts sd ON st.school_district_id = sd.id
       WHERE st.sla_resolution_due < NOW()
         AND st.status NOT IN ('resolved', 'closed')
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.entity_id = st.id AND n.entity_type = 'support_ticket'
             AND n.type = 'sla_breach'
             AND n.created_at >= CURRENT_DATE - INTERVAL '1 day'
         )`
    );

    const alerts = [];
    for (const row of result.rows) {
      const notification = await this.createNotification({
        type: 'sla_breach',
        severity: 'critical',
        title: `SLA breach: ${row.subject}`,
        message: `Support ticket "${row.subject}" for ${row.school_district_name || 'Unknown'} has exceeded its SLA resolution deadline (${row.sla_resolution_due}). Priority: ${row.priority}.`,
        section: 'customer_success',
        action_url: `/customer-success/tickets/${row.id}`,
        entity_id: row.id,
        entity_type: 'support_ticket'
      });
      alerts.push(notification);
    }

    return alerts;
  }

  /**
   * tax_deadline: tax_events.due_date within 30/14/7 days, status != completed
   */
  async _checkTaxDeadline() {
    const alerts = [];
    const thresholds = [
      { days: 7, severity: 'critical' },
      { days: 14, severity: 'high' },
      { days: 30, severity: 'medium' }
    ];

    for (const { days, severity } of thresholds) {
      const result = await query(
        `SELECT te.id, te.title, te.due_date, te.amount, te.event_type
         FROM tax_events te
         WHERE te.status != 'completed'
           AND te.due_date >= CURRENT_DATE
           AND te.due_date <= CURRENT_DATE + ($1 || ' days')::interval
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.entity_id = te.id AND n.entity_type = 'tax_event'
               AND n.type = 'tax_deadline' AND n.severity = $2
               AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
           )`,
        [days, severity]
      );

      for (const row of result.rows) {
        const daysLeft = Math.ceil((new Date(row.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const notification = await this.createNotification({
          type: 'tax_deadline',
          severity,
          title: `Tax deadline in ${daysLeft} days: ${row.title}`,
          message: `${row.event_type}: "${row.title}" is due on ${row.due_date}.${row.amount ? ' Amount: $' + parseFloat(row.amount).toLocaleString() + '.' : ''}`,
          section: 'taxes',
          action_url: `/taxes/events/${row.id}`,
          entity_id: row.id,
          entity_type: 'tax_event'
        });
        alerts.push(notification);
      }
    }

    return alerts;
  }

  /**
   * budget_warning: budgets where spent/allocated > 0.8
   */
  async _checkBudgetWarning() {
    const result = await query(
      `SELECT b.id, b.category, b.period, b.allocated, b.spent
       FROM budgets b
       WHERE b.allocated > 0
         AND (b.spent / b.allocated) > 0.8
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.entity_id = b.id AND n.entity_type = 'budget'
             AND n.type = 'budget_warning'
             AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`
    );

    const alerts = [];
    for (const row of result.rows) {
      const utilization = Math.round((parseFloat(row.spent) / parseFloat(row.allocated)) * 100);
      const severity = utilization >= 100 ? 'critical' : utilization >= 90 ? 'high' : 'medium';
      const notification = await this.createNotification({
        type: 'budget_warning',
        severity,
        title: `Budget ${utilization >= 100 ? 'exceeded' : 'warning'}: ${row.category} (${row.period})`,
        message: `Budget for ${row.category} (${row.period}) is at ${utilization}% utilization. Spent: $${parseFloat(row.spent).toLocaleString()} / Allocated: $${parseFloat(row.allocated).toLocaleString()}.`,
        section: 'finance',
        action_url: `/finance/budgets/${row.id}`,
        entity_id: row.id,
        entity_type: 'budget'
      });
      alerts.push(notification);
    }

    return alerts;
  }

  /**
   * invoice_overdue: invoices where due_date < NOW() and status not in (paid, cancelled)
   */
  async _checkInvoiceOverdue() {
    const result = await query(
      `SELECT i.id, i.invoice_number, i.due_date, i.total, i.status, sd.name as school_district_name
       FROM invoices i
       LEFT JOIN school_districts sd ON i.school_district_id = sd.id
       WHERE i.due_date < CURRENT_DATE
         AND i.status NOT IN ('paid', 'cancelled')
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.entity_id = i.id AND n.entity_type = 'invoice'
             AND n.type = 'invoice_overdue'
             AND n.created_at >= CURRENT_DATE - INTERVAL '3 days'
         )`
    );

    const alerts = [];
    for (const row of result.rows) {
      const daysOverdue = Math.ceil((new Date() - new Date(row.due_date)) / (1000 * 60 * 60 * 24));
      const severity = daysOverdue >= 30 ? 'critical' : daysOverdue >= 14 ? 'high' : 'medium';
      const notification = await this.createNotification({
        type: 'invoice_overdue',
        severity,
        title: `Invoice overdue: ${row.invoice_number} (${daysOverdue} days)`,
        message: `Invoice ${row.invoice_number} for ${row.school_district_name || 'Unknown'} is ${daysOverdue} days overdue. Amount: $${parseFloat(row.total).toLocaleString()}.`,
        section: 'finance',
        action_url: `/finance/invoices/${row.id}`,
        entity_id: row.id,
        entity_type: 'invoice'
      });
      alerts.push(notification);
    }

    return alerts;
  }

  /**
   * goal_behind: goals where progress < expected progress based on time elapsed.
   * Expected progress is calculated as: (days elapsed since quarter start / total quarter days) * 100
   */
  async _checkGoalBehind() {
    const result = await query(
      `SELECT g.id, g.title, g.progress, g.quarter, g.due_date, g.goal_type, g.business_area
       FROM goals g
       WHERE g.status NOT IN ('completed')
         AND g.goal_type = 'objective'
         AND g.due_date IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.entity_id = g.id AND n.entity_type = 'goal'
             AND n.type = 'goal_behind'
             AND n.created_at >= CURRENT_DATE - INTERVAL '7 days'
         )`
    );

    const alerts = [];
    const now = new Date();

    for (const row of result.rows) {
      // Calculate expected progress based on time elapsed
      let expectedProgress;
      if (row.quarter) {
        // Parse quarter: Q1_2026 format
        const match = row.quarter.match(/Q(\d)_(\d{4})/);
        if (match) {
          const q = parseInt(match[1]);
          const year = parseInt(match[2]);
          const quarterStart = new Date(year, (q - 1) * 3, 1);
          const quarterEnd = new Date(year, q * 3, 0); // last day of quarter
          const totalDays = (quarterEnd - quarterStart) / (1000 * 60 * 60 * 24);
          const elapsedDays = Math.max(0, (now - quarterStart) / (1000 * 60 * 60 * 24));
          expectedProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
        } else {
          continue; // Skip if quarter format doesn't match
        }
      } else if (row.due_date) {
        // Use due_date and created_at-based estimation (assume 90 day span)
        const dueDate = new Date(row.due_date);
        const totalDays = 90;
        const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
        const elapsedDays = totalDays - daysUntilDue;
        expectedProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
      } else {
        continue;
      }

      const actualProgress = row.progress || 0;
      const gap = expectedProgress - actualProgress;

      // Only alert if significantly behind (gap > 15%)
      if (gap > 15) {
        const severity = gap > 40 ? 'critical' : gap > 25 ? 'high' : 'medium';
        const notification = await this.createNotification({
          type: 'goal_behind',
          severity,
          title: `Goal behind schedule: ${row.title}`,
          message: `"${row.title}" is at ${actualProgress}% progress but expected to be at ${expectedProgress}% based on time elapsed. Gap: ${gap}%.`,
          section: 'goals',
          action_url: `/goals/${row.id}`,
          entity_id: row.id,
          entity_type: 'goal'
        });
        alerts.push(notification);
      }
    }

    return alerts;
  }
}

module.exports = new NotificationService();
