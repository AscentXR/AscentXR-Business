const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

// POST /api/export/zip - Create ZIP archive of documents
router.post('/zip', async (req, res, next) => {
  try {
    const { documentIds, category, includeAll = false } = req.body;
    
    if (!documentIds && !category && !includeAll) {
      return res.status(400).json({
        error: 'Please specify documentIds, category, or set includeAll=true'
      });
    }

    // Create temporary export directory
    const exportDir = process.env.EXPORT_DIR || './exports';
    const timestamp = Date.now();
    const zipFileName = `documents-export-${timestamp}.zip`;
    const zipFilePath = path.join(exportDir, zipFileName);
    
    // Create ZIP archive
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} total bytes`);
      
      // Return download URL
      const downloadUrl = `/api/export/download/${zipFileName}`;
      
      res.json({
        success: true,
        message: 'ZIP archive created successfully',
        data: {
          filename: zipFileName,
          size: archive.pointer(),
          downloadUrl: downloadUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Simulate adding documents to archive
    // In a real implementation, this would fetch actual files
    if (includeAll) {
      // Add all documents from documents directory
      const docsDir = process.env.DOCUMENTS_DIR || './documents';
      if (fs.existsSync(docsDir)) {
        const files = fs.readdirSync(docsDir);
        files.forEach(file => {
          const filePath = path.join(docsDir, file);
          if (fs.statSync(filePath).isFile()) {
            archive.file(filePath, { name: file });
          }
        });
      }
    }

    // Add sample documents for demo
    archive.append('Sample Document 1: Ascent XR Project Overview', { name: 'ascent-xr-overview.txt' });
    archive.append('Sample Document 2: LinkedIn Strategy Document', { name: 'linkedin-strategy.md' });
    archive.append('Sample Document 3: CRM Integration Guide', { name: 'crm-integration-guide.md' });
    archive.append(JSON.stringify({
      exportDate: new Date().toISOString(),
      documentCount: 3,
      metadata: {
        system: 'Ascent XR Dashboard',
        version: '1.0.0',
        generatedBy: 'Export API'
      }
    }, null, 2), { name: 'export-metadata.json' });

    archive.finalize();
  } catch (error) {
    next(error);
  }
});

// GET /api/export/download/:filename - Download ZIP file
router.get('/download/:filename', (req, res, next) => {
  try {
    const { filename } = req.params;
    const exportDir = process.env.EXPORT_DIR || './exports';
    const filePath = path.join(exportDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Export file not found'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Clean up file after streaming (optional - could keep for 24 hours)
    fileStream.on('end', () => {
      // Schedule deletion in 24 hours
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 24 * 60 * 60 * 1000);
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/export/list - List available exports
router.get('/list', (req, res, next) => {
  try {
    const exportDir = process.env.EXPORT_DIR || './exports';
    const files = [];
    
    if (fs.existsSync(exportDir)) {
      fs.readdirSync(exportDir).forEach(file => {
        const filePath = path.join(exportDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && file.endsWith('.zip')) {
          files.push({
            filename: file,
            size: stats.size,
            created: stats.mtime,
            expiresAt: new Date(stats.mtime.getTime() + 24 * 60 * 60 * 1000),
            downloadUrl: `/api/export/download/${file}`
          });
        }
      });
    }

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/export/:filename - Delete export file
router.delete('/:filename', (req, res, next) => {
  try {
    const { filename } = req.params;
    const exportDir = process.env.EXPORT_DIR || './exports';
    const filePath = path.join(exportDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Export file not found'
      });
    }

    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Export file deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/export/custom - Create custom export with filters
router.post('/custom', async (req, res, next) => {
  try {
    const { 
      format = 'zip', 
      includeDocuments = true, 
      includeMetadata = true,
      compressionLevel = 9,
      password
    } = req.body;
    
    if (format !== 'zip') {
      return res.status(400).json({
        error: 'Only ZIP format is currently supported'
      });
    }

    // Create custom export
    const exportDir = process.env.EXPORT_DIR || './exports';
    const timestamp = Date.now();
    const exportFileName = `custom-export-${timestamp}.zip`;
    const exportFilePath = path.join(exportDir, exportFileName);
    
    const output = fs.createWriteStream(exportFilePath);
    const archive = archiver('zip', {
      zlib: { level: compressionLevel }
    });

    output.on('close', () => {
      const downloadUrl = `/api/export/download/${exportFileName}`;
      
      res.json({
        success: true,
        message: 'Custom export created successfully',
        data: {
          filename: exportFileName,
          size: archive.pointer(),
          format: format,
          downloadUrl: downloadUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);

    // Add metadata if requested
    if (includeMetadata) {
      archive.append(JSON.stringify({
        exportDate: new Date().toISOString(),
        format: format,
        compressionLevel: compressionLevel,
        passwordProtected: !!password,
        metadata: {
          system: 'Ascent XR Dashboard',
          version: '1.0.0',
          request: req.body
        }
      }, null, 2), { name: 'export-metadata.json' });
    }

    // Add sample data
    if (includeDocuments) {
      archive.append('This is a sample document included in the export.', { name: 'sample-document.txt' });
      archive.append('# Sample Markdown Document\n\nThis document demonstrates export functionality.', { name: 'sample-README.md' });
    }

    archive.finalize();
  } catch (error) {
    next(error);
  }
});

module.exports = router;