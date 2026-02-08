-- Sample data for Ascent XR CRM
-- For development and testing

-- School Districts
INSERT INTO school_districts (id, name, state, city, total_students, total_schools, budget_range, free_reduced_lunch_percent, title_i_status, current_curriculum, technology_inventory, grade_levels, tech_readiness_score, esser_funding_status) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Indianapolis Public Schools', 'IN', 'Indianapolis', 25000, 72, '$500M - $750M', 68.5, true, 'Pearson K-12', '1:1 Chromebooks grades 3-12', 'K-12', 7, 'approved'),
  ('d1000000-0000-0000-0000-000000000002', 'Hamilton Southeastern Schools', 'IN', 'Fishers', 21000, 25, '$250M - $500M', 12.3, false, 'McGraw-Hill', '1:1 iPads K-5, Chromebooks 6-12', 'K-12', 9, 'applied'),
  ('d1000000-0000-0000-0000-000000000003', 'Carmel Clay Schools', 'IN', 'Carmel', 16500, 18, '$200M - $300M', 8.1, false, 'Custom blend', '1:1 devices all grades', 'K-12', 9, 'received'),
  ('d1000000-0000-0000-0000-000000000004', 'Lawrence Township Schools', 'IN', 'Indianapolis', 15800, 21, '$150M - $250M', 55.2, true, 'Houghton Mifflin', '1:1 Chromebooks grades 5-12', '5-12', 6, 'approved'),
  ('d1000000-0000-0000-0000-000000000005', 'Chicago Public Schools', 'IL', 'Chicago', 340000, 642, '$5B - $7B', 76.4, true, 'District-developed', 'Mixed devices, improving', 'K-12', 5, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Contacts
INSERT INTO contacts (id, school_district_id, first_name, last_name, title, email, phone, linkedin_url, is_primary, is_decision_maker, notes) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Sarah', 'Martinez', 'Superintendent', 'smartinez@ips.k12.in.us', '317-555-0101', 'https://linkedin.com/in/sarah-martinez-edu', true, true, 'Very interested in XR for STEM. Met at EdTech conference.'),
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'James', 'Wilson', 'Technology Director', 'jwilson@ips.k12.in.us', '317-555-0102', null, false, false, 'Technical evaluator. Wants API docs.'),
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'Emily', 'Chen', 'Assistant Superintendent', 'echen@hse.k12.in.us', '317-555-0201', 'https://linkedin.com/in/emily-chen-hse', true, true, 'Champion for innovation. Previously implemented 1:1 program.'),
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 'Michael', 'Thompson', 'Curriculum Director', 'mthompson@ccs.k12.in.us', '317-555-0301', null, true, true, 'Looking for NGSS-aligned XR content.'),
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'Lisa', 'Rodriguez', 'Principal', 'lrodriguez@ltms.k12.in.us', '317-555-0401', null, true, false, 'Piloting XR in science classes.'),
  ('c1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000005', 'David', 'Kim', 'Chief Technology Officer', 'dkim@cps.edu', '312-555-0501', 'https://linkedin.com/in/david-kim-cps', true, true, 'Large district opportunity. Needs district-wide pilot proof.')
ON CONFLICT (id) DO NOTHING;

-- Relationships
INSERT INTO relationships (id, school_district_id, status, implementation_status, start_date, renewal_date, license_count, teacher_adoption_rate, avg_session_duration) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'pilot', 'pilot', '2026-01-15', '2026-07-15', 500, 35.0, 22.5),
  ('r1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'prospect', 'needs_assessment', null, null, 0, 0, 0),
  ('r1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'prospect', 'proposal', null, null, 0, 0, 0),
  ('r1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', 'active', 'active', '2025-08-01', '2026-08-01', 300, 62.5, 28.3),
  ('r1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'prospect', 'discovery', null, null, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Pipeline
INSERT INTO pipeline (id, school_district_id, stage, probability, opportunity_value, budget_availability, decision_timeline, champion_strength, fit_score, next_action, next_action_date, notes) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'pilot_negotiation', 65, 125000.00, 7, 8, 8, 9, 'Review pilot results with superintendent', '2026-03-01', 'Pilot running in 3 schools. Strong teacher engagement.'),
  ('p1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'needs_assessment', 30, 200000.00, 8, 5, 7, 8, 'Schedule demo with curriculum team', '2026-02-15', 'High budget availability. Need to build champion.'),
  ('p1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'proposal_sent', 45, 150000.00, 7, 6, 6, 9, 'Follow up on proposal review', '2026-02-20', 'Proposal sent Jan 28. Waiting for board review.'),
  ('p1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', 'contract_review', 85, 90000.00, 6, 9, 8, 7, 'Finalize renewal contract terms', '2026-02-10', 'Existing customer. Renewal with expansion.'),
  ('p1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'discovery', 15, 500000.00, 5, 3, 4, 7, 'Initial meeting with CTO', '2026-03-15', 'Massive opportunity but long sales cycle.')
ON CONFLICT (id) DO NOTHING;

-- Communications
INSERT INTO communications (id, school_district_id, contact_id, type, direction, subject, content, date, follow_up_date) VALUES
  ('m1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'meeting', 'outbound', 'Pilot Review Meeting', 'Reviewed pilot data from 3 schools. 300% engagement increase in science classes. Teacher feedback overwhelmingly positive. Superintendent wants to discuss expansion.', '2026-02-01 10:00:00-05', '2026-02-15'),
  ('m1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'email', 'outbound', 'Ascent XR Demo Follow-up', 'Following up on our conversation at the Indiana EdTech Summit. Attached our needs assessment questionnaire and case studies.', '2026-01-28 14:30:00-05', '2026-02-07'),
  ('m1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004', 'call', 'inbound', 'Proposal Questions', 'Michael called with questions about our NGSS alignment. Sent additional documentation. Board meeting scheduled for Feb 18.', '2026-01-30 11:00:00-05', '2026-02-19'),
  ('m1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005', 'meeting', 'outbound', 'Renewal Discussion', 'Met with Lisa to discuss renewal. Wants to add 2 more grade levels. Reviewing budget for expansion.', '2026-02-03 09:00:00-05', '2026-02-10'),
  ('m1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006', 'linkedin', 'outbound', 'Initial Connection', 'Connected on LinkedIn. David responded positively to our XR in education post. Scheduled intro call.', '2026-02-05 16:00:00-06', '2026-02-12')
ON CONFLICT (id) DO NOTHING;

-- LinkedIn Posts
INSERT INTO linkedin_posts (id, text, scheduled_time, status, impressions, engagements, clicks) VALUES
  ('l1000000-0000-0000-0000-000000000001', 'The engagement gap in K-12 education is real. Our data shows 300% increase in student engagement when switching from traditional worksheets to spatial learning experiences. Here''s what we learned...', '2026-02-03 08:30:00-05', 'published', 2450, 187, 89),
  ('l1000000-0000-0000-0000-000000000002', 'AI + Spatial Learning = a match made in education heaven. We''re building custom XR lessons in minutes, not months. The future of adaptive learning is immersive.', '2026-02-05 10:00:00-05', 'published', 1890, 142, 67),
  ('l1000000-0000-0000-0000-000000000003', 'The superintendent''s dilemma: How do you measure ROI on educational technology? Our framework breaks it down into 4 pillars: Engagement, Outcomes, Cost-Efficiency, and Scalability.', '2026-02-07 09:00:00-05', 'scheduled', 0, 0, 0),
  ('l1000000-0000-0000-0000-000000000004', 'Just wrapped up an incredible pilot program with Indianapolis Public Schools. The results speak for themselves - 35% teacher adoption in just 3 weeks.', '2026-02-10 08:30:00-05', 'draft', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Agents
INSERT INTO agents (id, name, description, status, progress, tasks_completed, total_tasks, current_task, capabilities) VALUES
  ('agent-001', 'Content Creator Agent', 'Creates and schedules content for LinkedIn and other platforms', 'active', 85, 17, 20, 'Creating LinkedIn post about XR technology', ARRAY['content_creation', 'scheduling', 'social_media']),
  ('agent-002', 'CRM Integration Agent', 'Manages data sync between dashboard and CRM systems', 'active', 60, 12, 20, 'Syncing contact data with CRM', ARRAY['data_sync', 'api_integration', 'webhooks']),
  ('agent-003', 'Analytics Agent', 'Generates reports and analyzes performance metrics', 'active', 45, 9, 20, 'Generating weekly performance report', ARRAY['analytics', 'reporting', 'forecasting']),
  ('agent-004', 'Sales Enablement Agent', 'Supports sales pipeline and proposal generation', 'active', 70, 14, 20, 'Preparing proposal for Carmel Clay', ARRAY['proposals', 'pipeline', 'roi_analysis']),
  ('agent-005', 'Deployment Agent', 'Handles CI/CD and deployment operations', 'paused', 30, 6, 20, 'Waiting for staging approval', ARRAY['deployment', 'monitoring', 'infrastructure'])
ON CONFLICT (id) DO NOTHING;
