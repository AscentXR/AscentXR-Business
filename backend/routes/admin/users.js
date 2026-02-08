const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');

// GET /api/admin/users - List all users
router.get('/', async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

// POST /api/admin/users - Create a new user
router.post('/', async (req, res, next) => {
  try {
    const { email, displayName, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const user = await userService.createUser({ email, displayName, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }
    if (err.code === 'auth/invalid-email') {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }
    if (err.code === 'auth/weak-password') {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    next(err);
  }
});

// PUT /api/admin/users/:uid - Update user role
router.put('/:uid', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }
    const user = await userService.updateRole(req.params.uid, role);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:uid/disable - Disable user account
router.put('/:uid/disable', async (req, res, next) => {
  try {
    const user = await userService.disableUser(req.params.uid);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user, message: 'User account disabled' });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:uid/enable - Enable user account
router.put('/:uid/enable', async (req, res, next) => {
  try {
    const user = await userService.enableUser(req.params.uid);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user, message: 'User account enabled' });
  } catch (err) { next(err); }
});

// POST /api/admin/users/:uid/reset-password - Generate password reset link
router.post('/:uid/reset-password', async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.params.uid);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:uid - Delete user
router.delete('/:uid', async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.uid);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
