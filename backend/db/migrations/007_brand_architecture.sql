-- Migration 007: Brand Architecture + Learning Time VR Products
-- Adds brand_entity to products, seeds LTVR products and features, inserts brand asset records

-- ============================================================
-- 1. Add brand_entity column to products table
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_entity VARCHAR(50) DEFAULT 'ascent_xr';

-- Tag existing products as Ascent XR
UPDATE products SET brand_entity = 'ascent_xr' WHERE brand_entity IS NULL;

-- ============================================================
-- 2. Insert brand asset records for both brands
-- ============================================================
INSERT INTO brand_assets (name, asset_type, category, value, description, usage_notes) VALUES
  ('Ascent XR Primary Orange', 'color', 'ascent_xr', '#ff6b00', 'Ascent XR primary brand color — innovation, energy, premium', 'Use for CTAs, headers, and emphasis on enterprise/custom materials'),
  ('Ascent XR Deep Navy', 'color', 'ascent_xr', '#132e5e', 'Ascent XR secondary brand color — authority, trust, depth', 'Use for backgrounds, body text, and dark UI elements on enterprise materials'),
  ('Ascent XR Tagline', 'guideline', 'ascent_xr', 'Delivering Immersive Experiences', 'Official Ascent XR tagline for enterprise/custom work', 'Use on corporate website, proposals, investor materials'),
  ('Learning Time VR Blue', 'color', 'learning_time_vr', '#0052cc', 'LTVR primary brand color — education, trust, technology', 'Use for CTAs, headers, and emphasis on K-12 district-facing materials'),
  ('Learning Time VR Red', 'color', 'learning_time_vr', '#DC1625', 'LTVR accent color — energy, engagement, urgency', 'Use sparingly for emphasis, urgency, and highlight elements on K-12 materials'),
  ('Learning Time VR Tagline', 'guideline', 'learning_time_vr', 'Learn Beyond Limits', 'Official Learning Time VR tagline for K-12 education', 'Use on all LTVR materials — district outreach, social media, product pages, proposals'),
  ('Dashboard Ascent Blue', 'color', 'dashboard', '#2563EB', 'Internal dashboard primary color', 'Use for dashboard UI primary actions, links, active states'),
  ('Dashboard Learning Purple', 'color', 'dashboard', '#7C3AED', 'Internal dashboard agent/AI color', 'Use for agent features, AI indicators, secondary dashboard actions')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Seed Learning Time VR Products
-- ============================================================

-- LTVR Classroom Pack (VR Headsets)
INSERT INTO products (name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage, brand_entity)
VALUES (
  'Learning Time VR — Classroom Pack (VR Headsets)',
  'Turnkey VR classroom bundle: Pico 4 headset class set, VictoryXR 200+ immersive experiences, ArborXR device management, teacher dashboard, and onsite training. Everything a school needs to launch VR learning in a single classroom.',
  'subscription',
  'recurring',
  5000,
  15000,
  'year',
  'active',
  '["Pico 4 headsets (class set of 15-30)", "VictoryXR 200+ immersive experiences", "ArborXR device management", "Teacher dashboard & analytics", "Onsite teacher training", "Curriculum alignment guides", "FERPA-compliant data handling", "Technical support & warranty"]',
  'K-12 school districts with technology budgets, ESSER/Title IV-A funding, STEM-focused schools',
  'All-in-one bundle eliminates integration headaches; VictoryXR content library is the largest K-12 VR library available; ArborXR simplifies fleet management for non-technical staff',
  'learning_time_vr'
);

-- LTVR Tablet Subscription
INSERT INTO products (name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage, brand_entity)
VALUES (
  'Learning Time VR — Tablet Subscription',
  'WebXR access on existing tablets and Chromebooks — no new hardware required. Students experience immersive 3D learning through their browser. Ideal for budget-conscious districts and Title I schools.',
  'subscription',
  'recurring',
  1500,
  5000,
  'year',
  'active',
  '["WebXR browser-based access", "Chromebook & tablet compatible", "VictoryXR content library (WebXR-optimized)", "Teacher dashboard & analytics", "No hardware purchase required", "LMS integration (Google Classroom, Canvas)", "FERPA-compliant data handling"]',
  'Budget-conscious districts, Title I schools, districts with existing 1:1 device programs, schools without VR hardware budget',
  'Zero hardware cost — leverages existing devices; lowest barrier to entry for immersive learning; works on any modern browser',
  'learning_time_vr'
);

-- LTVR District Enterprise License
INSERT INTO products (name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage, brand_entity)
VALUES (
  'Learning Time VR — District Enterprise License',
  'District-wide deployment across all schools. Includes VR headset packs and/or tablet subscriptions for every building, centralized admin analytics, curriculum alignment services, and dedicated success manager.',
  'subscription',
  'recurring',
  10000,
  50000,
  'year',
  'active',
  '["District-wide access (all schools)", "Mix of VR headset packs + tablet subscriptions", "Centralized admin analytics dashboard", "Curriculum alignment services", "Dedicated customer success manager", "Priority technical support", "Quarterly business reviews", "Professional development workshops", "FERPA & COPPA compliant"]',
  'Large school districts (5+ schools), districts with district-wide technology initiatives, superintendent-level buyers',
  'Single contract covers entire district; centralized analytics give administrators visibility across all schools; dedicated success manager ensures adoption',
  'learning_time_vr'
);

-- LTVR Pilot Program
INSERT INTO products (name, description, category, pricing_model, base_price, price_max, billing_frequency, status, features, target_audience, competitive_advantage, brand_entity)
VALUES (
  'Learning Time VR — Pilot Program',
  '90-day single-classroom trial. Includes VR headset pack or tablet access, teacher training, and success metrics tracking. Designed to prove ROI before district-wide commitment.',
  'pilot',
  'one_time',
  1500,
  2500,
  NULL,
  'active',
  '["Single classroom deployment (VR or tablet)", "90-day trial period", "Teacher training session", "Success metrics tracking", "Student engagement reports", "ROI analysis report at completion", "Conversion path to full subscription"]',
  'Districts evaluating VR/immersive learning, risk-averse decision makers, technology committees requiring proof of concept',
  'Low-risk entry point; includes ROI measurement to justify expansion; 90-day timeline fits within semester planning',
  'learning_time_vr'
);

-- ============================================================
-- 4. Seed Product Features (Roadmap)
-- ============================================================

-- VR Classroom Pack features
INSERT INTO product_features (product_id, name, description, status, priority, target_date)
SELECT p.id, feat.name, feat.description, feat.status, feat.priority, feat.target_date::date
FROM products p
CROSS JOIN (VALUES
  ('Pico 4 Device Management', 'Remote management, app deployment, and kiosk mode via ArborXR', 'released', 1, NULL),
  ('VictoryXR Content Library', '200+ standards-aligned immersive experiences across STEM, social studies, and arts', 'released', 1, NULL),
  ('Teacher Dashboard', 'Real-time student progress, session analytics, and assignment management', 'released', 2, NULL),
  ('FERPA Compliance Module', 'Student data privacy controls, consent management, and audit logging', 'released', 2, NULL),
  ('AI Lesson Generator', 'AI-powered lesson plan creation aligned to state standards using VR content', 'planned', 3, '2026-03-15'),
  ('Adaptive Learning Engine', 'Automatically adjusts difficulty and pacing based on student performance', 'planned', 4, '2026-04-30'),
  ('Multi-Language Support', 'Content available in Spanish, French, and Mandarin', 'planned', 5, '2026-05-31')
) AS feat(name, description, status, priority, target_date)
WHERE p.name = 'Learning Time VR — Classroom Pack (VR Headsets)';

-- Tablet Subscription features
INSERT INTO product_features (product_id, name, description, status, priority, target_date)
SELECT p.id, feat.name, feat.description, feat.status, feat.priority, feat.target_date::date
FROM products p
CROSS JOIN (VALUES
  ('WebXR Browser Access', 'Works on Chrome, Safari, Edge — no app installation required', 'released', 1, NULL),
  ('Chromebook Compatibility', 'Optimized for Chromebook hardware and ChromeOS', 'released', 1, NULL),
  ('LMS Integration', 'Google Classroom and Canvas integration for assignment sync', 'in_progress', 2, '2026-03-01'),
  ('Offline Mode', 'Download experiences for use without internet connection', 'planned', 3, '2026-04-15'),
  ('AI Lesson Generator', 'AI-powered lesson plan creation aligned to state standards', 'planned', 3, '2026-03-15'),
  ('Adaptive Learning Engine', 'Adjusts difficulty based on student performance', 'planned', 4, '2026-04-30')
) AS feat(name, description, status, priority, target_date)
WHERE p.name = 'Learning Time VR — Tablet Subscription';

-- District Enterprise features
INSERT INTO product_features (product_id, name, description, status, priority, target_date)
SELECT p.id, feat.name, feat.description, feat.status, feat.priority, feat.target_date::date
FROM products p
CROSS JOIN (VALUES
  ('Centralized Admin Dashboard', 'District-wide analytics: usage, engagement, and learning outcomes across all schools', 'released', 1, NULL),
  ('Curriculum Alignment Services', 'Content mapped to state standards with pacing guides', 'released', 1, NULL),
  ('Dedicated Success Manager', 'Named contact for onboarding, training, and quarterly reviews', 'released', 2, NULL),
  ('Custom Curriculum Builder', 'District can create and deploy custom VR experiences', 'planned', 3, '2026-09-01'),
  ('AI Lesson Generator', 'AI-powered lesson plan creation across the district', 'planned', 3, '2026-03-15'),
  ('Multi-Language Support', 'Content available in Spanish, French, and Mandarin', 'planned', 5, '2026-05-31')
) AS feat(name, description, status, priority, target_date)
WHERE p.name = 'Learning Time VR — District Enterprise License';

-- Pilot Program features
INSERT INTO product_features (product_id, name, description, status, priority, target_date)
SELECT p.id, feat.name, feat.description, feat.status, feat.priority, feat.target_date::date
FROM products p
CROSS JOIN (VALUES
  ('Single Classroom Setup', 'Complete setup of VR or tablet experience in one classroom', 'released', 1, NULL),
  ('Teacher Training Session', 'Half-day training for classroom teacher and tech coordinator', 'released', 1, NULL),
  ('Success Metrics Tracking', '90-day engagement, participation, and learning outcome measurement', 'released', 2, NULL),
  ('ROI Analysis Report', 'End-of-pilot report quantifying student engagement and teacher time savings', 'released', 2, NULL),
  ('Conversion Path', 'Streamlined upgrade to full Classroom Pack or Tablet Subscription', 'released', 3, NULL)
) AS feat(name, description, status, priority, target_date)
WHERE p.name = 'Learning Time VR — Pilot Program';
