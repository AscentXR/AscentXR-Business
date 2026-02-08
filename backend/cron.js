const cron = require('node-cron');

let notificationService = null;

function initCron() {
  try {
    notificationService = require('./services/notificationService');
  } catch (err) {
    console.error('Failed to load notification service for cron:', err.message);
    return;
  }

  // Check for alerts every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running notification alert check...');
    try {
      const alerts = await notificationService.checkAlerts();
      if (alerts.length > 0) {
        console.log(`[CRON] Generated ${alerts.length} new notifications`);
      }
    } catch (err) {
      console.error('[CRON] Alert check failed:', err.message);
    }
  });

  // Daily summary at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily summary...');
    try {
      await notificationService.checkAlerts();
    } catch (err) {
      console.error('[CRON] Daily summary failed:', err.message);
    }
  });

  // Check overdue invoices daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Checking overdue invoices...');
    try {
      const { query } = require('./db/connection');
      await query(`
        UPDATE invoices
        SET status = 'overdue'
        WHERE status = 'sent'
        AND due_date < CURRENT_DATE
      `);
    } catch (err) {
      console.error('[CRON] Overdue invoice check failed:', err.message);
    }
  });

  // Check overdue tax events weekly on Monday at 8 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('[CRON] Checking overdue tax events...');
    try {
      const { query } = require('./db/connection');
      await query(`
        UPDATE tax_events
        SET status = 'overdue'
        WHERE status = 'upcoming'
        AND due_date < CURRENT_DATE
      `);
    } catch (err) {
      console.error('[CRON] Overdue tax event check failed:', err.message);
    }
  });

  console.log('[CRON] Scheduled jobs initialized');
}

module.exports = { initCron };
