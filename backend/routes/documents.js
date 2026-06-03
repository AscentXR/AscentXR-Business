const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentsService = require('../services/documentsService');

// Single source of truth for the upload directory (used by both upload and download)
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'));
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Derive a safe extension from the original name; reject anything unexpected
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '';
    cb(null, file.fieldname + '-' + uniqueSuffix + safeExt);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, Word, Excel, TXT, Images'));
    }
  }
});

// GET /api/documents - List all documents
router.get('/', async (req, res, next) => {
  try {
    const { category, search = '' } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    const documents = await documentsService.listDocuments({
      category,
      search,
      page,
      limit
    });

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total: documents.total || documents.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/categories - Get document categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await documentsService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/documents - Upload new document
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { title, description, category, tags } = req.body;
    
    const document = await documentsService.createDocument({
      file: req.file,
      title: title || req.file.originalname,
      description: description || '',
      category: category || 'uncategorized',
      tags: tags ? tags.split(',') : []
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id - Get document metadata
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentsService.getDocumentById(id);
    
    if (document) {
      res.json({
        success: true,
        data: document
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id/download - Download document file
router.get('/:id/download', async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentsService.getDocumentById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Resolve within UPLOAD_DIR and verify containment (path-traversal defense)
    const filePath = path.resolve(UPLOAD_DIR, document.filename);
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
      return res.status(400).json({ success: false, error: 'Invalid file path' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    res.download(filePath, document.originalName || document.filename);
  } catch (error) {
    next(error);
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedDocument = await documentsService.updateDocument(id, updates);
    
    if (updatedDocument) {
      res.json({
        success: true,
        message: 'Document updated successfully',
        data: updatedDocument
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await documentsService.deleteDocument(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error || 'Document not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id/preview - Get document preview (first 1000 chars for text files)
router.get('/:id/preview', async (req, res, next) => {
  try {
    const { id } = req.params;
    const preview = await documentsService.getDocumentPreview(id);
    
    if (preview) {
      res.json({
        success: true,
        data: preview
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Document not found or preview not available'
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/documents/:id/share - Share document with link
router.post('/:id/share', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expiresAt, password } = req.body;
    
    const shareLink = await documentsService.createShareLink(id, {
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      password
    });
    
    res.json({
      success: true,
      message: 'Share link created',
      data: shareLink
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;