const { query } = require('../db/connection');

class SearchService {
  /**
   * Global search across all business sections.
   * Returns results grouped by section with type, id, title, subtitle, url.
   */
  async search(searchQuery, { limit = 10 } = {}) {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return { results: [], total: 0 };
    }

    const term = `%${searchQuery.trim()}%`;

    // Run all searches in parallel for performance
    const [
      contacts,
      schoolDistricts,
      pipelineDeals,
      documents,
      goals,
      products,
      invoices,
      partners,
      agents,
      campaigns,
      supportTickets,
      contracts
    ] = await Promise.all([
      // Contacts - search by name and email
      query(
        `SELECT id, first_name, last_name, email, title
         FROM contacts
         WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // School districts - search by name
      query(
        `SELECT id, name, state, city
         FROM school_districts
         WHERE name ILIKE $1 OR city ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Pipeline deals - search by notes
      query(
        `SELECT p.id, p.stage, p.opportunity_value, p.notes, sd.name as school_district_name
         FROM pipeline p
         LEFT JOIN school_districts sd ON p.school_district_id = sd.id
         WHERE p.notes ILIKE $1 OR sd.name ILIKE $1
         ORDER BY p.updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Documents - search by title
      query(
        `SELECT id, title, category, description
         FROM documents
         WHERE title ILIKE $1 OR description ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Goals - search by title
      query(
        `SELECT id, title, goal_type, business_area, quarter
         FROM goals
         WHERE title ILIKE $1 OR description ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Products - search by name
      query(
        `SELECT id, name, category, description
         FROM products
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Invoices - search by invoice_number
      query(
        `SELECT i.id, i.invoice_number, i.status, i.total, sd.name as school_district_name
         FROM invoices i
         LEFT JOIN school_districts sd ON i.school_district_id = sd.id
         WHERE i.invoice_number ILIKE $1 OR sd.name ILIKE $1
         ORDER BY i.updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Partners - search by name
      query(
        `SELECT id, name, type, contact_name
         FROM partners
         WHERE name ILIKE $1 OR contact_name ILIKE $1 OR contact_email ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Agents - search by name
      query(
        `SELECT id, name, description, status
         FROM agents
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY name ASC LIMIT $2`,
        [term, limit]
      ),
      // Campaigns - search by name
      query(
        `SELECT id, name, channel, status
         FROM campaigns
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Support tickets - search by subject
      query(
        `SELECT st.id, st.subject, st.status, st.priority, sd.name as school_district_name
         FROM support_tickets st
         LEFT JOIN school_districts sd ON st.school_district_id = sd.id
         WHERE st.subject ILIKE $1 OR st.description ILIKE $1
         ORDER BY st.updated_at DESC LIMIT $2`,
        [term, limit]
      ),
      // Contracts - search by title
      query(
        `SELECT ct.id, ct.title, ct.contract_type, ct.status, sd.name as school_district_name
         FROM contracts ct
         LEFT JOIN school_districts sd ON ct.school_district_id = sd.id
         WHERE ct.title ILIKE $1 OR sd.name ILIKE $1
         ORDER BY ct.updated_at DESC LIMIT $2`,
        [term, limit]
      )
    ]);

    const results = [];

    // Map contacts
    contacts.rows.forEach(row => {
      results.push({
        type: 'contact',
        section: 'crm',
        id: row.id,
        title: `${row.first_name} ${row.last_name}`,
        subtitle: `${row.title} - ${row.email}`,
        url: `/crm/contacts/${row.id}`
      });
    });

    // Map school districts
    schoolDistricts.rows.forEach(row => {
      results.push({
        type: 'school_district',
        section: 'crm',
        id: row.id,
        title: row.name,
        subtitle: `${row.city}, ${row.state}`,
        url: `/crm/companies/${row.id}`
      });
    });

    // Map pipeline deals
    pipelineDeals.rows.forEach(row => {
      results.push({
        type: 'deal',
        section: 'sales',
        id: row.id,
        title: row.school_district_name || 'Deal',
        subtitle: `${row.stage} - $${parseFloat(row.opportunity_value).toLocaleString()}`,
        url: `/crm/deals/${row.id}`
      });
    });

    // Map documents
    documents.rows.forEach(row => {
      results.push({
        type: 'document',
        section: 'documents',
        id: row.id,
        title: row.title,
        subtitle: row.category || 'Uncategorized',
        url: `/documents/${row.id}`
      });
    });

    // Map goals
    goals.rows.forEach(row => {
      results.push({
        type: 'goal',
        section: 'goals',
        id: row.id,
        title: row.title,
        subtitle: `${row.goal_type} - ${row.business_area || 'General'} (${row.quarter || 'No quarter'})`,
        url: `/goals/${row.id}`
      });
    });

    // Map products
    products.rows.forEach(row => {
      results.push({
        type: 'product',
        section: 'products',
        id: row.id,
        title: row.name,
        subtitle: row.category,
        url: `/products/${row.id}`
      });
    });

    // Map invoices
    invoices.rows.forEach(row => {
      results.push({
        type: 'invoice',
        section: 'finance',
        id: row.id,
        title: row.invoice_number,
        subtitle: `${row.status} - $${parseFloat(row.total).toLocaleString()}${row.school_district_name ? ' - ' + row.school_district_name : ''}`,
        url: `/finance/invoices/${row.id}`
      });
    });

    // Map partners
    partners.rows.forEach(row => {
      results.push({
        type: 'partner',
        section: 'partnerships',
        id: row.id,
        title: row.name,
        subtitle: `${row.type}${row.contact_name ? ' - ' + row.contact_name : ''}`,
        url: `/partnerships/${row.id}`
      });
    });

    // Map agents
    agents.rows.forEach(row => {
      results.push({
        type: 'agent',
        section: 'agents',
        id: row.id,
        title: row.name,
        subtitle: `${row.status} - ${row.description || ''}`.substring(0, 80),
        url: `/agents/${row.id}`
      });
    });

    // Map campaigns
    campaigns.rows.forEach(row => {
      results.push({
        type: 'campaign',
        section: 'marketing',
        id: row.id,
        title: row.name,
        subtitle: `${row.channel} - ${row.status}`,
        url: `/marketing/campaigns/${row.id}`
      });
    });

    // Map support tickets
    supportTickets.rows.forEach(row => {
      results.push({
        type: 'support_ticket',
        section: 'customer_success',
        id: row.id,
        title: row.subject,
        subtitle: `${row.priority} - ${row.status}${row.school_district_name ? ' - ' + row.school_district_name : ''}`,
        url: `/customer-success/tickets/${row.id}`
      });
    });

    // Map contracts
    contracts.rows.forEach(row => {
      results.push({
        type: 'contract',
        section: 'legal',
        id: row.id,
        title: row.title,
        subtitle: `${row.contract_type} - ${row.status}${row.school_district_name ? ' - ' + row.school_district_name : ''}`,
        url: `/legal/contracts/${row.id}`
      });
    });

    // Group by section
    const grouped = {};
    for (const result of results) {
      if (!grouped[result.section]) {
        grouped[result.section] = [];
      }
      grouped[result.section].push(result);
    }

    return {
      results,
      grouped,
      total: results.length,
      query: searchQuery
    };
  }
}

module.exports = new SearchService();
