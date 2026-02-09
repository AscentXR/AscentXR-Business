const cron = require('node-cron');

let notificationService = null;
let taskSchedulerService = null;

function initCron() {
  try {
    notificationService = require('./services/notificationService');
  } catch (err) {
    console.error('Failed to load notification service for cron:', err.message);
    return;
  }

  try {
    taskSchedulerService = require('./services/taskSchedulerService');
  } catch (err) {
    console.error('Failed to load task scheduler service for cron:', err.message);
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

  // ============================================================
  // Agent Teams Scheduler Jobs
  // ============================================================

  if (taskSchedulerService) {
    // Generate daily tasks at 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('[CRON] Running daily task generation...');
      try {
        const results = await taskSchedulerService.generateDailyTasks();
        console.log(`[CRON] Daily tasks generated: ${results.generated} tasks, ${results.skipped} skipped, ${results.errors} errors`);
      } catch (err) {
        console.error('[CRON] Daily task generation failed:', err.message);
      }
    });

    // Monitor stuck tasks every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      try {
        const stuck = await taskSchedulerService.monitorStuckTasks();
        if (stuck.length > 0) {
          console.log(`[CRON] Found and marked ${stuck.length} stuck tasks as failed`);
        }
      } catch (err) {
        console.error('[CRON] Stuck task monitor failed:', err.message);
      }
    });

    // Evening summary at 6:00 PM
    cron.schedule('0 18 * * *', async () => {
      console.log('[CRON] Generating evening summary...');
      try {
        const summary = await taskSchedulerService.generateEveningSummary();
        console.log(`[CRON] Evening summary: ${summary.total} total, ${summary.completed} completed, ${summary.pending_review} pending review`);
      } catch (err) {
        console.error('[CRON] Evening summary failed:', err.message);
      }
    });
  }

  console.log('[CRON] Scheduled jobs initialized');
}

module.exports = { initCron };
