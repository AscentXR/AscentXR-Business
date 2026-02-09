const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const backupService = require('../../services/backupService');

const BACKUP_DIR = process.env.BACKUP_DIR || '/tmp/backups';
const FILENAME_RE = /^[a-zA-Z0-9._-]+$/;

function validateFilename(filename) {
  if (!FILENAME_RE.test(filename)) return false;
  const filePath = path.resolve(BACKUP_DIR, filename);
  return filePath.startsWith(path.resolve(BACKUP_DIR));
}

// GET /api/admin/backup - List all backups
router.get('/', async (req, res, next) => {
  try {
    const backups = backupService.listBackups();
    res.json({ success: true, data: backups });
  } catch (err) { next(err); }
});

// POST /api/admin/backup - Create a new backup
router.post('/', async (req, res, next) => {
  try {
    const { label, includeFiles } = req.body;
    const result = await backupService.createBackup({
      label,
      createdBy: req.user?.email || 'admin',
      includeFiles: !!includeFiles,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('already in progress')) {
      return res.status(409).json({ success: false, error: err.message });
    }
    next(err);
  }
});

// GET /api/admin/backup/:filename - Get backup details
router.get('/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!validateFilename(filename)) {
      return res.status(400).json({ success: false, error: 'Invalid filename' });
    }
    const info = backupService.getBackupInfo(filename);
    res.json({ success: true, data: info });
  } catch (err) {
    if (err.message === 'Backup file not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
});

// GET /api/admin/backup/:filename/download - Download backup ZIP
router.get('/:filename/download', async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!validateFilename(filename)) {
      return res.status(400).json({ success: false, error: 'Invalid filename' });
    }
    const filePath = path.resolve(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Backup file not found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Failed to read backup file' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (err) { next(err); }
});

// POST /api/admin/backup/:filename/restore - Restore from backup
router.post('/:filename/restore', async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!validateFilename(filename)) {
      return res.status(400).json({ success: false, error: 'Invalid filename' });
    }
    const result = await backupService.restoreFromBackup(filename, {
      createdBy: req.user?.email || 'admin',
    });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('already in progress')) {
      return res.status(409).json({ success: false, error: err.message });
    }
    if (err.message === 'Backup file not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
});

// DELETE /api/admin/backup/:filename - Delete backup
router.delete('/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    if (!validateFilename(filename)) {
      return res.status(400).json({ success: false, error: 'Invalid filename' });
    }
    backupService.deleteBackup(filename);
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (err) {
    if (err.message === 'Backup file not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    next(err);
  }
});

module.exports = router;
