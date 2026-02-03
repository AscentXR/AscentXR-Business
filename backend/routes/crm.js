const express = require('express');
const router = express.Router();
const crmService = require('../services/crmService');

// POST /api/crm/connect - Connect to CRM API
router.post('/connect', async (req, res, next) => {
  try {
    const { username, password, apiKey } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    const connection = await crmService.connect({
      username,
      password,
      apiKey: apiKey || process.env.CRM_API_KEY
    });

    // Store connection data securely
    req.session.crmToken = connection.token;
    req.session.crmUserId = connection.userId;
    
    res.json({
      success: true,
      message: 'Connected to CRM successfully',
      data: connection
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/contacts - Get CRM contacts
router.get('/contacts', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    const contacts = await crmService.getContacts({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: contacts.total || contacts.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/contacts/:id - Get specific contact
router.get('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await crmService.getContactById(id);
    
    if (contact) {
      res.json({
        success: true,
        data: contact
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/crm/contacts - Create new contact
router.post('/contacts', async (req, res, next) => {
  try {
    const contactData = req.body;
    
    const newContact = await crmService.createContact(contactData);
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: newContact
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/crm/contacts/:id - Update contact
router.put('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    
    const updatedContact = await crmService.updateContact(id, contactData);
    
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/companies - Get CRM companies
router.get('/companies', async (req, res, next) => {
  try {
    const companies = await crmService.getCompanies();
    res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/deals - Get CRM deals
router.get('/deals', async (req, res, next) => {
  try {
    const deals = await crmService.getDeals();
    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/analytics - Get CRM analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await crmService.getAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/crm/sync - Trigger data sync
router.post('/sync', async (req, res, next) => {
  try {
    const { type = 'all' } = req.body;
    
    const syncResult = await crmService.syncData(type);
    
    res.json({
      success: true,
      message: 'Data sync completed',
      data: syncResult
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/crm/webhooks - Get CRM webhooks
router.get('/webhooks', async (req, res, next) => {
  try {
    const webhooks = await crmService.getWebhooks();
    res.json({
      success: true,
      data: webhooks
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/crm/webhooks - Create CRM webhook
router.post('/webhooks', async (req, res, next) => {
  try {
    const webhookData = req.body;
    
    const webhook = await crmService.createWebhook(webhookData);
    
    res.status(201).json({
      success: true,
      message: 'Webhook created successfully',
      data: webhook
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;