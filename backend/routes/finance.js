const express = require('express');
const router = express.Router();
const financeService = require('../services/financeService');

// GET /api/finance/invoices - List invoices
router.get('/invoices', async (req, res, next) => {
  try {
    const { status } = req.query;
    const data = await financeService.getInvoices({ status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/finance/invoices/:id - Get invoice by ID
router.get('/invoices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await financeService.getInvoiceById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/finance/invoices - Create invoice
router.post('/invoices', async (req, res, next) => {
  try {
    const { invoice_number, due_date, total } = req.body;

    if (!invoice_number || !due_date || total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'invoice_number, due_date, and total are required'
      });
    }

    const data = await financeService.createInvoice(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/finance/invoices/:id - Update invoice
router.put('/invoices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateInvoice(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/finance/expenses - List expenses
router.get('/expenses', async (req, res, next) => {
  try {
    const { category } = req.query;
    const data = await financeService.getExpenses({ category });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/finance/expenses - Create expense
router.post('/expenses', async (req, res, next) => {
  try {
    const { description, amount, category } = req.body;

    if (!description || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: 'description, amount, and category are required'
      });
    }

    const data = await financeService.createExpense(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/finance/expenses/:id - Update expense
router.put('/expenses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateExpense(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/finance/budgets - List budgets
router.get('/budgets', async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await financeService.getBudgets({ period });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/finance/budgets - Create budget
router.post('/budgets', async (req, res, next) => {
  try {
    const data = await financeService.createBudget(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/finance/budgets/:id - Update budget
router.put('/budgets/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateBudget(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/finance/summary - Financial summary
router.get('/summary', async (req, res, next) => {
  try {
    const data = await financeService.getFinancialSummary();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
