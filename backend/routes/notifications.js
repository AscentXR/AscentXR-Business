const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// GET /api/notifications - List notifications
router.get('/', async (req, res, next) => {
  try {
    const { section, is_read } = req.query;
    const data = await notificationService.getNotifications({ section, is_read });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all - Mark all as read
// NOTE: This must be defined before /:id/read to avoid matching "read-all" as an id
router.put('/read-all', async (req, res, next) => {
  try {
    const data = await notificationService.markAllAsRead();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await notificationService.markAsRead(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
