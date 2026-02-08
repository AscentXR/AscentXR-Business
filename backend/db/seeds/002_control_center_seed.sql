-- Ascent XR Control Center - Seed Data
-- Pre-populates from existing documentation

-- ============================================================
-- PRODUCTS (from proposals/01_DISTRICT_LICENSING_PROPOSAL.md)
-- ============================================================

INSERT INTO products (id, name, description, category, pricing_model, base_price, price_max, billing_frequency, status, target_audience, competitive_advantage) VALUES
  (gen_random_uuid(), 'Custom XR Experience', 'Fully custom immersive learning experience designed for specific curriculum needs. Includes 3D environment design, interactive elements, assessment integration, and teacher dashboard.', 'custom_experience', 'one_time', 15000, 50000, NULL, 'active', 'School districts seeking curriculum-aligned XR content', 'Curriculum-aligned, built for education from the ground up'),
  (gen_random_uuid(), 'District Subscription', 'Annual district-wide license for the Ascent XR platform. Includes content library, teacher tools, student analytics, and admin dashboard.', 'subscription', 'recurring', 3000, 10000, 'annually', 'active', 'K-12 school districts', 'Purpose-built for K-12 with FERPA compliance'),
  (gen_random_uuid(), 'Professional Services', 'Expert consulting for XR implementation: needs assessment, teacher training, curriculum integration planning, and ongoing support.', 'professional_services', 'hourly', 150, NULL, NULL, 'active', 'Districts needing implementation support', 'Ed-tech expertise combined with XR technology'),
  (gen_random_uuid(), 'Pilot Program', 'Limited 90-day pilot for a single school. Includes platform access, 2 training sessions, and success metrics dashboard.', 'pilot', 'one_time', 2000, 2000, NULL, 'active', 'Districts evaluating XR solutions', 'Low-risk entry point with clear success metrics')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BUDGETS (from marketing_sales_plan_q1_2026.md)
-- ============================================================

INSERT INTO budgets (category, period, allocated, spent, notes) VALUES
  ('marketing', 'Q1_2026', 15000, 0, 'LinkedIn ads, content creation, webinar costs'),
  ('sales_ops', 'Q1_2026', 5000, 0, 'CRM tools, sales enablement, demo infrastructure'),
  ('software', 'Q1_2026', 3000, 0, 'SaaS subscriptions, development tools'),
  ('contractors', 'Q1_2026', 8000, 0, '3D designers, content creators, developers'),
  ('travel', 'Q1_2026', 2000, 0, 'Conference attendance, district visits'),
  ('legal', 'Q1_2026', 2000, 0, 'Entity setup, contracts, compliance review'),
  ('insurance', 'Q1_2026', 1500, 0, 'Business liability, E&O insurance'),
  ('training', 'Q1_2026', 1000, 0, 'Team development, certifications')
ON CONFLICT (category, period) DO NOTHING;

-- ============================================================
-- GOALS / OKRs (from marketing_sales_plan_q1_2026.md)
-- ============================================================

-- Company Objective
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Build revenue pipeline to hit $300K by June 2026', 'Primary company objective for H1 2026. Establish market presence, build pipeline, close first deals.', 'objective', 'operations', 'Q1_2026', 300000, 0, 'currency', 0, 'on_track', 'jim');

-- Sales Objectives & Key Results
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Build a $300K qualified sales pipeline', 'Generate and qualify enough pipeline to support $300K close target', 'objective', 'sales', 'Q1_2026', NULL, NULL, NULL, 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'Generate 150 qualified leads', NULL, 'key_result', 'sales', 'Q1_2026', 150, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000010', 'Conduct 45 discovery calls', NULL, 'key_result', 'sales', 'Q1_2026', 45, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000010', 'Deliver 17 product demos', NULL, 'key_result', 'sales', 'Q1_2026', 17, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000010', 'Send 7 proposals', NULL, 'key_result', 'sales', 'Q1_2026', 7, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000010', 'Build $300K in total pipeline value', NULL, 'key_result', 'sales', 'Q1_2026', 300000, 0, 'currency', 0, 'on_track', 'jim');

-- Marketing Objectives & Key Results
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Establish Ascent XR brand presence on LinkedIn', 'Build thought leadership and generate inbound leads through content marketing', 'objective', 'marketing', 'Q1_2026', NULL, NULL, NULL, 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000020', 'Publish 3 LinkedIn posts per week', NULL, 'key_result', 'marketing', 'Q1_2026', 36, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000020', 'Achieve 4% average engagement rate', NULL, 'key_result', 'marketing', 'Q1_2026', 4, 0, 'percentage', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000020', 'Grow LinkedIn connections by 200/month', NULL, 'key_result', 'marketing', 'Q1_2026', 600, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000020', 'Host first webinar', NULL, 'key_result', 'marketing', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'jim');

-- Finance Objectives & Key Results
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Establish financial operations', 'Set up bookkeeping, invoicing, expense tracking, and budget management', 'objective', 'finance', 'Q1_2026', NULL, NULL, NULL, 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000030', 'Bookkeeping system operational', NULL, 'key_result', 'finance', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000030', 'Invoice template ready and tested', NULL, 'key_result', 'finance', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000030', 'Q1 budget tracked weekly', NULL, 'key_result', 'finance', 'Q1_2026', 12, 0, 'count', 0, 'on_track', 'nick');

-- Product Objectives & Key Results
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'Finalize product offerings and demo experiences', 'Define pricing tiers, create demo content, and establish pilot program', 'objective', 'product', 'Q1_2026', NULL, NULL, NULL, 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000040', 'Pricing tiers finalized and published', NULL, 'key_result', 'product', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000040', '3 demo experiences ready', NULL, 'key_result', 'product', 'Q1_2026', 3, 0, 'count', 0, 'on_track', 'nick'),
  ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000040', 'Pilot program defined and documented', NULL, 'key_result', 'product', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'nick');

-- Customer Success Objectives & Key Results
INSERT INTO goals (id, parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner) VALUES
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', 'Build customer success foundation', 'Establish onboarding, health monitoring, and retention processes', 'objective', 'customer_success', 'Q1_2026', NULL, NULL, NULL, 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000050', 'Onboarding process documented', NULL, 'key_result', 'customer_success', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000050', 'Health scoring system active', NULL, 'key_result', 'customer_success', 'Q1_2026', 1, 0, 'count', 0, 'on_track', 'jim'),
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000050', 'Achieve 90%+ gross retention rate', NULL, 'key_result', 'customer_success', 'Q1_2026', 90, 0, 'percentage', 0, 'on_track', 'jim');

-- ============================================================
-- TAX EVENTS (quarterly deadlines for 2026)
-- ============================================================

INSERT INTO tax_events (title, event_type, due_date, status, entity_type, state, notes) VALUES
  ('Q4 2025 Estimated Tax Payment (Federal)', 'quarterly_estimate', '2026-01-15', 'completed', 'llc', 'federal', 'Federal estimated tax - Q4 2025'),
  ('Q4 2025 Estimated Tax Payment (Indiana)', 'quarterly_estimate', '2026-01-15', 'completed', 'llc', 'IN', 'Indiana estimated tax - Q4 2025'),
  ('Q1 2026 Estimated Tax Payment (Federal)', 'quarterly_estimate', '2026-04-15', 'upcoming', 'llc', 'federal', 'Federal estimated tax - Q1 2026'),
  ('Q1 2026 Estimated Tax Payment (Indiana)', 'quarterly_estimate', '2026-04-15', 'upcoming', 'llc', 'IN', 'Indiana estimated tax - Q1 2026'),
  ('2025 Federal Tax Return Filing', 'filing_deadline', '2026-04-15', 'upcoming', 'llc', 'federal', 'Form 1065 (LLC) or 1120-S (if S-Corp elected)'),
  ('2025 Indiana State Tax Return', 'filing_deadline', '2026-04-15', 'upcoming', 'llc', 'IN', 'Indiana IT-65 Partnership Return'),
  ('Q2 2026 Estimated Tax Payment (Federal)', 'quarterly_estimate', '2026-06-15', 'upcoming', 'llc', 'federal', 'Federal estimated tax - Q2 2026'),
  ('Q2 2026 Estimated Tax Payment (Indiana)', 'quarterly_estimate', '2026-06-15', 'upcoming', 'llc', 'IN', 'Indiana estimated tax - Q2 2026'),
  ('Q3 2026 Estimated Tax Payment (Federal)', 'quarterly_estimate', '2026-09-15', 'upcoming', 'llc', 'federal', 'Federal estimated tax - Q3 2026'),
  ('Q3 2026 Estimated Tax Payment (Indiana)', 'quarterly_estimate', '2026-09-15', 'upcoming', 'llc', 'IN', 'Indiana estimated tax - Q3 2026'),
  ('Ohio Commercial Activity Tax (CAT)', 'filing_deadline', '2026-05-10', 'upcoming', 'llc', 'OH', 'Ohio CAT annual minimum tax if doing business in OH'),
  ('Illinois Annual Report', 'renewal', '2026-03-01', 'upcoming', 'llc', 'IL', 'Illinois LLC annual report if registered'),
  ('R&D Tax Credit Documentation Review', 'filing_deadline', '2026-03-31', 'upcoming', 'llc', 'federal', 'Compile R&D activities for Form 6765')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BRAND ASSETS (from branding/BRAND_STYLE_GUIDE.md)
-- ============================================================

INSERT INTO brand_assets (name, asset_type, category, value, description, usage_notes) VALUES
  ('Ascent Blue', 'color', 'primary', '#2563EB', 'Primary brand color - trust, technology, reliability', 'Use for primary CTAs, headers, and key UI elements'),
  ('Learning Purple', 'color', 'secondary', '#7C3AED', 'Secondary brand color - innovation, creativity, education', 'Use for accents, highlights, and educational features'),
  ('Ascent Blue Dark', 'color', 'primary', '#1D4ED8', 'Dark variant of primary', 'Use for hover states and dark backgrounds'),
  ('Ascent Blue Light', 'color', 'primary', '#3B82F6', 'Light variant of primary', 'Use for light backgrounds and subtle elements'),
  ('Success Green', 'color', 'accent', '#10B981', 'Positive metrics, success states', 'Use for positive changes, completed items'),
  ('Warning Orange', 'color', 'accent', '#F59E0B', 'Caution, attention needed', 'Use for warnings and items needing attention'),
  ('Danger Red', 'color', 'accent', '#EF4444', 'Errors, critical alerts', 'Use for errors, deletions, critical alerts'),
  ('Navy Background', 'color', 'accent', '#0A1D45', 'Primary dark background', 'Main application background'),
  ('Inter', 'font', 'heading', 'Inter', 'Primary heading font - clean, modern, professional', 'Use for all headings H1-H6, weight 600-700'),
  ('Inter', 'font', 'body', 'Inter', 'Body text font', 'Use for body text, weight 400-500'),
  ('Mono', 'font', 'body', 'JetBrains Mono', 'Code/data font', 'Use for code snippets, data values, metrics'),
  ('Primary Logo', 'logo', 'primary', '/assets/logo-primary.svg', 'Full Ascent XR logo with text', 'Use on light/dark backgrounds, minimum 120px width'),
  ('Icon Logo', 'logo', 'secondary', '/assets/logo-icon.svg', 'Ascent XR icon only', 'Use for favicons, small displays, minimum 32px'),
  ('White Logo', 'logo', 'primary', '/assets/logo-white.svg', 'White version for dark backgrounds', 'Use on dark navy backgrounds only')
ON CONFLICT DO NOTHING;

-- ============================================================
-- AGENT PROFILES (Tier 1 + Tier 2)
-- ============================================================

INSERT INTO agents (id, name, description, status, capabilities) VALUES
  ('mission-director', 'Mission Director', 'Orchestrates all agents, generates reviews, manages priorities', 'active', ARRAY['weekly_review', 'priority_management', 'agent_coordination', 'progress_tracking']),
  ('content-creator', 'Content Creator', 'LinkedIn posts, blog content, case studies, email copy', 'active', ARRAY['linkedin_posts', 'blog_writing', 'case_studies', 'email_copy', 'content_calendar']),
  ('crm-specialist', 'CRM Specialist', 'Contact management, pipeline updates, district research', 'active', ARRAY['contact_research', 'pipeline_management', 'district_profiling', 'data_enrichment']),
  ('financial-controller', 'Financial Controller', 'Budget tracking, invoicing, expense management, forecasting', 'active', ARRAY['expense_categorization', 'invoice_generation', 'budget_tracking', 'cash_flow_forecast']),
  ('sdr-agent', 'SDR Agent', 'Prospecting, lead qualification, outreach drafts', 'active', ARRAY['lead_research', 'lead_scoring', 'outreach_drafts', 'qualification']),
  ('proposal-agent', 'Proposal Agent', 'Proposal creation and customization', 'active', ARRAY['proposal_generation', 'pricing_customization', 'roi_calculation']),
  ('analytics-agent', 'Analytics Agent', 'Data analysis, reporting, insights generation', 'active', ARRAY['weekly_reports', 'monthly_reports', 'data_analysis', 'trend_detection']),
  ('tax-agent', 'Tax Agent', 'Tax compliance, R&D credit documentation, quarterly prep', 'active', ARRAY['r_and_d_credits', 'quarterly_estimates', 'deduction_tracking', 'compliance']),
  ('cs-agent', 'CS Agent', 'Customer health monitoring, intervention plans', 'active', ARRAY['health_reports', 'intervention_plans', 'usage_analysis', 'risk_assessment']),
  ('email-marketing', 'Email Marketing Agent', 'Email nurture sequences, campaign management', 'paused', ARRAY['email_sequences', 'newsletter', 'drip_campaigns']),
  ('brand-agent', 'Brand Agent', 'Brand consistency audits, asset management', 'paused', ARRAY['brand_audit', 'asset_review', 'consistency_check']),
  ('compliance-agent', 'Compliance Agent', 'FERPA/COPPA compliance, audit preparation', 'paused', ARRAY['ferpa_review', 'coppa_review', 'audit_prep', 'gap_analysis']),
  ('partner-agent', 'Partner Agent', 'Partner research, fit analysis, relationship management', 'paused', ARRAY['partner_research', 'fit_analysis', 'co_marketing'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities;

-- ============================================================
-- TEAM MEMBERS
-- ============================================================

INSERT INTO team_members (name, type, role, email, department, bio, responsibilities, status) VALUES
  ('Jim', 'human', 'CEO', NULL, 'Executive', 'Co-founder and CEO of Ascent XR. Leads sales, marketing, and business strategy.', ARRAY['Sales strategy', 'Marketing', 'Business development', 'Investor relations', 'Customer success'], 'active'),
  ('Nick', 'human', 'CTO', NULL, 'Executive', 'Co-founder and CTO of Ascent XR. Leads product development, technology, and engineering.', ARRAY['Product development', 'Technology strategy', 'Engineering', 'Infrastructure', 'Security'], 'active')
ON CONFLICT DO NOTHING;

-- Link AI agents as team members
INSERT INTO team_members (name, type, role, department, agent_id, bio, responsibilities, status)
SELECT
  a.name, 'ai_agent', 'AI Agent', 'Operations', a.id,
  a.description,
  a.capabilities,
  CASE WHEN a.status = 'active' THEN 'active' ELSE 'inactive' END
FROM agents a
WHERE a.id IN ('mission-director', 'content-creator', 'crm-specialist', 'financial-controller', 'sdr-agent', 'proposal-agent', 'analytics-agent', 'tax-agent', 'cs-agent')
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMPLIANCE ITEMS (FERPA/COPPA from ASCENT_ASSISTANT_CONSTITUTION.md)
-- ============================================================

INSERT INTO compliance_items (framework, requirement, description, status, priority) VALUES
  -- FERPA
  ('ferpa', 'Student data encryption at rest', 'All student PII must be encrypted using AES-256 at rest in database', 'in_progress', 'critical'),
  ('ferpa', 'Student data encryption in transit', 'All data transmitted over TLS 1.2+', 'compliant', 'critical'),
  ('ferpa', 'Access controls for student records', 'Role-based access control limiting student data to authorized personnel', 'in_progress', 'critical'),
  ('ferpa', 'Parental consent mechanism', 'System for obtaining and recording parental consent for data use', 'not_started', 'high'),
  ('ferpa', 'Data breach notification procedure', 'Documented process for notifying districts within 72 hours of breach', 'not_started', 'high'),
  ('ferpa', 'Annual FERPA training', 'All team members complete FERPA training annually', 'not_started', 'medium'),
  ('ferpa', 'Data retention policy', 'Clear policy on student data retention and deletion timelines', 'not_started', 'medium'),
  ('ferpa', 'Third-party data sharing agreements', 'DPAs signed with all vendors who access student data', 'not_started', 'high'),
  -- COPPA
  ('coppa', 'No data collection under 13 without consent', 'System prevents collection of PII from children under 13 without verifiable parental consent', 'in_progress', 'critical'),
  ('coppa', 'Privacy policy accessible to parents', 'Clear, comprehensive privacy policy available and linked from all entry points', 'not_started', 'high'),
  ('coppa', 'Parental access to child data', 'Parents can view, request deletion of child data', 'not_started', 'high'),
  ('coppa', 'Data minimization for minors', 'Only collect data strictly necessary for educational purpose', 'in_progress', 'high'),
  -- State Privacy
  ('state_privacy', 'Indiana Student Data Privacy (HB 1003)', 'Compliance with Indiana student data privacy requirements', 'not_started', 'medium'),
  ('state_privacy', 'Ohio Student Data Privacy Act', 'Compliance with Ohio student data privacy requirements', 'not_started', 'medium'),
  -- Data Security
  ('data_security', 'SOC 2 Type II readiness', 'Prepare for SOC 2 audit - security, availability, confidentiality', 'not_started', 'medium'),
  ('data_security', 'Penetration testing', 'Annual third-party penetration test', 'not_started', 'medium'),
  ('data_security', 'Incident response plan', 'Documented incident response plan with roles and procedures', 'not_started', 'high'),
  -- Accessibility
  ('accessibility', 'WCAG 2.1 AA compliance', 'All student-facing content meets WCAG 2.1 AA standards', 'in_progress', 'high'),
  ('accessibility', 'Section 508 compliance', 'Platform meets Section 508 requirements for federally funded districts', 'not_started', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CONTENT CALENDAR (content pillars from ASCENT_XR_LINKEDIN_STRATEGY.md)
-- ============================================================

INSERT INTO content_calendar (title, content_type, content_pillar, scheduled_date, status, author) VALUES
  ('XR in Education: Why Now?', 'linkedin_post', 'xr_education', '2026-02-09', 'planned', 'jim'),
  ('How VR Improves Student Engagement', 'linkedin_post', 'student_outcomes', '2026-02-11', 'planned', 'jim'),
  ('Teacher Spotlight: XR in the Classroom', 'linkedin_post', 'teacher_empowerment', '2026-02-13', 'planned', 'jim'),
  ('The ROI of Immersive Learning for Districts', 'linkedin_post', 'admin_roi', '2026-02-16', 'planned', 'jim'),
  ('5 Ways XR Supports Special Education', 'linkedin_post', 'student_outcomes', '2026-02-18', 'planned', 'jim'),
  ('Building the Future of Education Technology', 'linkedin_post', 'thought_leadership', '2026-02-20', 'planned', 'jim'),
  ('Case Study: Pilot Program Results', 'case_study', 'admin_roi', '2026-02-25', 'planned', 'jim'),
  ('Webinar: XR Implementation Best Practices', 'webinar', 'teacher_empowerment', '2026-03-15', 'planned', 'jim')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CAMPAIGNS
-- ============================================================

INSERT INTO campaigns (name, description, channel, status, start_date, end_date, budget, target_audience) VALUES
  ('Q1 LinkedIn Thought Leadership', 'Establish Ascent XR as thought leader in XR education through consistent LinkedIn presence', 'linkedin', 'active', '2026-01-06', '2026-03-31', 5000, 'K-12 education decision makers, curriculum directors, technology coordinators'),
  ('District Outreach - Indiana', 'Direct outreach to Indiana school districts via LinkedIn and email', 'email', 'draft', '2026-02-01', '2026-03-31', 2000, 'Indiana school district superintendents and technology directors'),
  ('First Webinar Series', 'Introductory webinar on XR in K-12 education', 'webinar', 'draft', '2026-03-01', '2026-03-31', 1000, 'Education professionals interested in XR technology')
ON CONFLICT DO NOTHING;
