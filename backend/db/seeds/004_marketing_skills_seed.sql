-- Seed 004: Marketing Skills & Workflow Templates
-- 25 professional marketing skills + 6 workflow templates for Ascent XR

-- ============================================================
-- MARKETING SKILLS (25 total)
-- ============================================================

INSERT INTO marketing_skills (skill_id, name, category, description, content, applicable_agents, edtech_relevance, estimated_duration_minutes, output_format, tags, source_repo, source_version) VALUES

-- Conversion Optimization (6 skills)
('page-cro', 'Page CRO', 'Conversion Optimization',
 'Conversion rate optimization for landing pages and key website pages',
 '# Page CRO Skill

## Framework: LIFT Model Analysis

### Step 1: Value Proposition Clarity
- Is the value proposition immediately clear within 5 seconds?
- Does the headline match the traffic source promise?
- Are benefits stated in customer language, not feature language?

### Step 2: Relevance Assessment
- Does the page match visitor intent from the traffic source?
- Is content aligned with the awareness stage of the visitor?
- Are images/visuals relevant to the target audience?

### Step 3: Clarity Audit
- Is the page hierarchy clear (H1 > H2 > H3)?
- Is the CTA unmistakable and action-oriented?
- Is copy scannable with bullet points and short paragraphs?
- Remove jargon and ambiguous language

### Step 4: Urgency & Motivation
- Are there legitimate urgency elements (limited availability, deadlines)?
- Does social proof reinforce the decision (testimonials, logos, stats)?
- Are objections preemptively addressed?

### Step 5: Anxiety Reduction
- Are trust signals present (security badges, guarantees, privacy policy)?
- Is the form/process as simple as possible?
- Are expectations set for what happens after conversion?

### Step 6: Distraction Elimination
- Remove navigation elements that compete with CTA
- Limit exit points on high-intent pages
- Ensure visual hierarchy guides eye to CTA

## Output Format
Provide a prioritized list of CRO recommendations with:
1. Issue identified
2. Impact level (High/Medium/Low)
3. Specific recommendation
4. Expected conversion lift estimate

## EdTech Application
For K-12 EdTech landing pages, focus on:
- Educator-specific trust signals (research backing, district testimonials)
- Clear ROI messaging for administrators
- Student safety and compliance badges (FERPA, COPPA)
- Free pilot/demo CTAs (low-commitment entry points)',
 ARRAY['content-creator'], 9, 45, 'analysis_report',
 ARRAY['cro', 'landing-pages', 'conversion', 'optimization'],
 'coreyhaines31/marketingskills', 'v1.0'),

('signup-flow-cro', 'Signup Flow CRO', 'Conversion Optimization',
 'Optimize user signup and registration flows for maximum completion',
 '# Signup Flow CRO Skill

## Framework: Friction-Value Analysis

### Step 1: Map Current Flow
- Document each step from initial click to account activation
- Count total fields, clicks, and page loads required
- Identify where users drop off (if analytics available)

### Step 2: Reduce Friction
- Minimize form fields to absolute essentials
- Implement progressive profiling (collect more data later)
- Add social/SSO login options
- Use inline validation instead of submit-then-error
- Auto-detect and prefill where possible (location, timezone)

### Step 3: Increase Perceived Value
- Show progress indicators for multi-step flows
- Display value reminders at each step
- Add micro-copy explaining why each field is needed
- Show what the user will get immediately after signup

### Step 4: Build Confidence
- Display security and privacy assurances near form fields
- Show number of existing users/customers
- Include testimonials relevant to the signup context
- Offer guest/trial options to reduce commitment anxiety

### Step 5: Optimize Post-Signup
- Immediate value delivery (don''t make users wait)
- Welcome email with clear next steps
- Guided onboarding that demonstrates core value quickly

## EdTech Application
- School/district lookup auto-complete
- Role-based signup paths (teacher, admin, tech director)
- Compliance messaging throughout (FERPA, COPPA, data handling)
- Integration with existing school SSO (Clever, ClassLink)',
 ARRAY['content-creator'], 8, 30, 'optimization_plan',
 ARRAY['cro', 'signup', 'registration', 'onboarding'],
 'coreyhaines31/marketingskills', 'v1.0'),

('form-cro', 'Form CRO', 'Conversion Optimization',
 'Optimize forms for higher completion rates and better data quality',
 '# Form CRO Skill

## Framework: Form Optimization Checklist

### Layout & Design
- Single-column layout (proven to outperform multi-column)
- Logical field grouping with clear section headers
- Adequate spacing between fields
- Mobile-responsive design with touch-friendly inputs
- Clear visual distinction between required and optional fields

### Field Optimization
- Remove every non-essential field
- Use appropriate input types (email, tel, number, date pickers)
- Smart defaults and placeholder text (examples, not labels)
- Conditional logic to show/hide fields based on selections
- Auto-format inputs (phone numbers, dates)

### Labels & Microcopy
- Labels above fields (not inside as placeholders)
- Helper text for complex fields
- Error messages that explain how to fix the issue
- Success states for validated fields

### CTA Optimization
- Descriptive CTA text (not "Submit" - use "Get Your Free Demo")
- Button stands out with contrasting color
- One primary CTA per form
- Loading state feedback on submission

### Error Handling
- Inline validation as user types
- Preserve entered data on errors
- Scroll to first error with visual highlight
- Clear, friendly error messages

## EdTech Application
- District/school selection with search
- Role-appropriate fields (different for teachers vs admins)
- Grade level and subject multi-select
- Student count ranges for pricing estimates',
 ARRAY['content-creator'], 7, 25, 'optimization_checklist',
 ARRAY['cro', 'forms', 'ux', 'conversion'],
 'coreyhaines31/marketingskills', 'v1.0'),

('popup-cro', 'Popup CRO', 'Conversion Optimization',
 'Design and optimize popups, modals, and overlays for conversions without hurting UX',
 '# Popup CRO Skill

## Framework: Intent-Based Popup Strategy

### Popup Types & When to Use
1. **Exit-Intent**: Triggered when cursor moves toward browser close
2. **Scroll-Depth**: After user has engaged with 50%+ of content
3. **Time-Delay**: After 30-60 seconds of active engagement
4. **Click-Triggered**: User initiates by clicking a CTA element

### Design Principles
- Clear, benefit-focused headline
- Minimal fields (email only for lead gen)
- Easy, obvious close mechanism
- Mobile: use slide-ups, not full-screen overlays
- Respect frequency: max 1 popup per session
- Never interrupt form fills or checkout flows

### Targeting Rules
- New vs returning visitors get different offers
- Page-specific offers matching content context
- Exclude users already converted
- Geography and referral source targeting

### Testing Framework
- A/B test trigger timing
- Test offer types (content vs discount vs demo)
- Test copy variations
- Measure both conversion AND bounce rate impact

## EdTech Application
- Offer free pilot program guides on pricing pages
- Case study downloads on solution pages
- Webinar signups on blog content
- Avoid popups on student-facing content',
 ARRAY['content-creator'], 6, 20, 'popup_strategy',
 ARRAY['cro', 'popups', 'lead-gen', 'ux'],
 'coreyhaines31/marketingskills', 'v1.0'),

('onboarding-cro', 'Onboarding CRO', 'Conversion Optimization',
 'Optimize user onboarding to drive activation and reduce churn',
 '# Onboarding CRO Skill

## Framework: Time-to-Value Optimization

### Step 1: Define the Aha Moment
- Identify the single action that correlates with retention
- Measure time from signup to aha moment
- Remove all steps that don''t lead toward this moment

### Step 2: Welcome Experience
- Personalized welcome based on role/use case
- Clear 3-step getting started guide
- Video walkthrough option (under 2 minutes)
- Skip option for experienced users

### Step 3: Progressive Disclosure
- Don''t show everything at once
- Unlock features as users complete key actions
- Celebrate milestones with micro-interactions
- Contextual tooltips over comprehensive tours

### Step 4: Activation Checklist
- Visual progress checklist (5-7 items max)
- Each item delivers immediate value
- Offer assistance at common drop-off points
- Email reminders for incomplete onboarding

### Step 5: Measure & Iterate
- Track completion rate per onboarding step
- Identify and fix the biggest drop-off point
- Cohort analysis: compare onboarded vs non-onboarded retention
- Qualitative feedback from churned users

## EdTech Application
- Role-specific onboarding (teacher gets classroom setup, admin gets dashboard)
- First XR experience within 10 minutes of signup
- District-wide rollout playbooks for tech directors
- Teacher PD credit integration with onboarding completion',
 ARRAY['content-creator'], 9, 35, 'onboarding_plan',
 ARRAY['cro', 'onboarding', 'activation', 'retention'],
 'coreyhaines31/marketingskills', 'v1.0'),

('paywall-upgrade-cro', 'Paywall & Upgrade CRO', 'Conversion Optimization',
 'Optimize upgrade flows, paywalls, and pricing page conversions',
 '# Paywall & Upgrade CRO Skill

## Framework: Value-Gap Conversion

### Step 1: Free-to-Paid Trigger Design
- Identify features that demonstrate premium value
- Soft paywalls: show the value, limit the quantity
- Usage-based triggers (e.g., after 3 free experiences)
- Feature-based triggers (premium features behind upgrade)

### Step 2: Pricing Page Optimization
- Anchor pricing with 3 tiers (recommend middle)
- Highlight most popular plan
- Annual vs monthly toggle with savings displayed
- Feature comparison table with checkmarks
- FAQ section addressing common objections

### Step 3: Upgrade Prompt Design
- Contextual upgrade prompts (when user hits limit)
- Show what they''re missing with preview/blur
- Social proof from similar customers who upgraded
- Risk-free trial of premium features

### Step 4: Reduce Upgrade Friction
- One-click upgrade from within the product
- Pre-fill billing with saved payment methods
- Offer monthly option even if annual is preferred
- Money-back guarantee prominently displayed

## EdTech Application
- Free pilot to paid district license conversion
- Per-seat vs site license comparison
- Budget cycle alignment (fiscal year purchasing)
- Purchase order and invoicing support for districts
- Multi-year discount incentives',
 ARRAY['content-creator'], 8, 30, 'upgrade_strategy',
 ARRAY['cro', 'pricing', 'paywall', 'upgrade', 'monetization'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Content & Copy (4 skills)
('copywriting', 'Copywriting', 'Content & Copy',
 'Write persuasive, conversion-focused copy for any marketing context',
 '# Copywriting Skill

## Framework: PAS + AIDA Hybrid

### Problem-Agitate-Solve (PAS)
1. **Problem**: Identify the specific pain point your audience faces
2. **Agitate**: Amplify the emotional impact of not solving it
3. **Solve**: Present your solution as the clear answer

### AIDA Structure
1. **Attention**: Hook with a surprising stat, question, or bold claim
2. **Interest**: Build relevance with specific details and stories
3. **Desire**: Paint the picture of life after using the solution
4. **Action**: Clear, specific CTA with urgency element

### Copy Principles
- Write at 8th-grade reading level
- Lead with benefits, support with features
- Use specific numbers over vague claims
- One idea per paragraph
- Active voice, present tense
- "You" focused, not "we" focused
- Cut 30% of your first draft

### Headline Formulas
- How to [Achieve Desired Outcome] Without [Common Objection]
- [Number] Ways to [Solve Problem] in [Timeframe]
- The [Adjective] Guide to [Topic] for [Audience]
- Why [Common Approach] Is [Negative Result] (And What to Do Instead)

### CTA Best Practices
- Start with a verb (Get, Start, Download, Join)
- Include the value proposition (Get Your Free Demo)
- Add urgency when authentic (Limited spots available)
- Reduce risk (No credit card required, Free for 30 days)

## EdTech Application
- Speak to educators as professionals, not consumers
- Lead with student outcome data
- Address budget concerns proactively
- Emphasize ease of implementation
- Include compliance/safety credentials',
 ARRAY['content-creator'], 10, 30, 'copy',
 ARRAY['copywriting', 'content', 'persuasion', 'conversion'],
 'coreyhaines31/marketingskills', 'v1.0'),

('copy-editing', 'Copy Editing', 'Content & Copy',
 'Review and improve existing copy for clarity, impact, and consistency',
 '# Copy Editing Skill

## Framework: 4-Pass Editing Process

### Pass 1: Structure & Flow
- Does the piece have a clear beginning, middle, end?
- Is the most important information first?
- Are transitions smooth between sections?
- Does each paragraph serve the overall message?
- Cut sections that don''t advance the argument

### Pass 2: Clarity & Readability
- Replace jargon with plain language
- Break long sentences (aim for 15-20 words avg)
- One idea per sentence
- Active voice over passive
- Eliminate weasel words (very, really, quite, somewhat)
- Ensure consistent tense and POV

### Pass 3: Persuasion & Impact
- Is the value proposition crystal clear?
- Are claims supported with evidence or examples?
- Does emotional language match the audience?
- Is the CTA compelling and specific?
- Check for power words and sensory language

### Pass 4: Polish & Consistency
- Grammar, spelling, punctuation
- Brand voice consistency
- Formatting consistency (headers, bullets, spacing)
- Link validation
- Mobile readability check

## Quality Checklist
- [ ] Headline grabs attention
- [ ] First sentence hooks the reader
- [ ] Copy addresses one clear audience
- [ ] Benefits outweigh features
- [ ] Social proof included
- [ ] CTA is clear and compelling
- [ ] No spelling/grammar errors
- [ ] Brand voice consistent throughout',
 ARRAY['content-creator'], 7, 20, 'edited_copy',
 ARRAY['editing', 'copy', 'quality', 'proofreading'],
 'coreyhaines31/marketingskills', 'v1.0'),

('email-sequence', 'Email Sequence', 'Content & Copy',
 'Design and write multi-email nurture sequences that convert',
 '# Email Sequence Skill

## Framework: Purpose-Driven Sequence Design

### Sequence Types
1. **Welcome Series** (3-5 emails): Introduce, educate, activate
2. **Nurture Sequence** (5-7 emails): Build trust, demonstrate value
3. **Sales Sequence** (4-6 emails): Overcome objections, drive decision
4. **Re-engagement** (3 emails): Win back inactive users
5. **Onboarding** (5-7 emails): Guide to first success

### Email Structure Template
- **Subject Line**: 6-10 words, curiosity or benefit-driven
- **Preview Text**: Extends the subject line promise
- **Opening Hook**: First sentence earns the second sentence
- **Body**: One key message per email, 150-300 words
- **CTA**: Single, clear action per email
- **P.S.**: Reinforce CTA or add secondary value

### Sequence Timing
- Welcome: Immediately, then Day 1, 3, 5, 7
- Nurture: Every 3-4 days
- Sales: Day 0, 2, 4, 7, 10, 14
- Re-engagement: Day 0, 3, 7 then remove

### Performance Benchmarks
- Open rate: 25-40% (B2B EdTech)
- Click rate: 3-7%
- Reply rate: 1-3%
- Unsubscribe: < 0.5% per email

### Key Principles
- Each email should stand alone (not everyone reads them all)
- Alternate between value-give and ask
- Personalize with merge fields and dynamic content
- Test subject lines with A/B splits
- Include plain text version

## EdTech Application
- Pilot request follow-up sequences
- Conference lead nurture (ISTE, state EdTech events)
- District decision-maker drip campaigns
- Teacher champion cultivation emails
- Renewal/expansion sequences aligned with budget cycles',
 ARRAY['content-creator'], 10, 45, 'email_sequence',
 ARRAY['email', 'nurture', 'automation', 'sequences'],
 'coreyhaines31/marketingskills', 'v1.0'),

('social-content', 'Social Content', 'Content & Copy',
 'Create engaging social media content strategies and individual posts',
 '# Social Content Skill

## Framework: Platform-Native Content Strategy

### LinkedIn (Primary for B2B EdTech)
**Post Types:**
1. **Thought Leadership**: Industry insights, data, predictions
2. **Story Posts**: Personal narratives with business lessons
3. **How-To**: Tactical advice in list or step format
4. **Engagement Posts**: Questions, polls, contrarian takes
5. **Social Proof**: Customer wins, milestones, testimonials

**LinkedIn Best Practices:**
- Hook in first 2 lines (before "see more")
- 1,300-2,000 characters optimal
- Line breaks every 1-2 sentences
- End with a question or CTA for comments
- Post between 8-10am or 5-6pm
- Engage with comments within first hour
- Use 3-5 relevant hashtags

### Content Calendar Framework
- Monday: Thought leadership / industry insight
- Tuesday: Product/feature highlight
- Wednesday: Customer story / case study
- Thursday: Educational content / how-to
- Friday: Culture / behind the scenes / lighter content

### Engagement Strategy
- Comment on target audience posts before posting your own
- Reply to every comment within 4 hours
- Tag relevant people (don''t overdo it)
- Share and add commentary to industry news

### Content Repurposing
- Blog post → 5 LinkedIn posts
- Webinar → 10 social clips + quote graphics
- Case study → customer spotlight series
- Data report → individual stat posts

## EdTech Application
- Educator appreciation content
- Student success spotlight stories
- EdTech conference live updates
- Classroom innovation showcases
- Administrator ROI testimonials',
 ARRAY['content-creator'], 10, 30, 'social_posts',
 ARRAY['social-media', 'linkedin', 'content', 'engagement'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- SEO & Discovery (4 skills)
('seo-audit', 'SEO Audit', 'SEO & Discovery',
 'Comprehensive technical and content SEO audit with actionable recommendations',
 '# SEO Audit Skill

## Framework: Complete SEO Health Check

### Technical SEO
- **Site Speed**: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Mobile-Friendly**: Responsive design, touch targets, readable text
- **Crawlability**: robots.txt, XML sitemap, canonical tags
- **HTTPS**: SSL certificate, mixed content issues
- **URL Structure**: Clean, descriptive, hierarchical
- **Internal Linking**: Logical structure, anchor text variety
- **404 Errors**: Find and fix broken links
- **Redirects**: Minimize chains, use 301s

### On-Page SEO
- **Title Tags**: Unique, 50-60 chars, keyword + brand
- **Meta Descriptions**: Compelling, 150-160 chars, include CTA
- **Header Hierarchy**: One H1, logical H2-H6 structure
- **Image Alt Text**: Descriptive, keyword-relevant
- **Content Quality**: Depth, uniqueness, E-E-A-T signals
- **Keyword Targeting**: Primary + secondary keywords per page
- **Internal Links**: 3-5 contextual links per page

### Content Audit
- Identify thin content (< 300 words)
- Find keyword cannibalization
- Assess content freshness and update needs
- Map content to buyer journey stages
- Identify content gaps vs competitors

### Off-Page SEO
- Backlink profile analysis
- Domain authority assessment
- Brand mention monitoring
- Local SEO signals (if applicable)

## Deliverable
Prioritized action plan with:
1. Critical issues (fix immediately)
2. High-impact opportunities (this month)
3. Strategic improvements (this quarter)
4. Ongoing optimization tasks

## EdTech Application
- Education-specific keyword research
- School district search behavior patterns
- .edu backlink opportunities
- Local SEO for regional targeting',
 ARRAY['content-creator'], 9, 60, 'audit_report',
 ARRAY['seo', 'audit', 'technical', 'optimization'],
 'coreyhaines31/marketingskills', 'v1.0'),

('programmatic-seo', 'Programmatic SEO', 'SEO & Discovery',
 'Scale content creation through template-based, data-driven SEO pages',
 '# Programmatic SEO Skill

## Framework: Template + Data = Scale

### Step 1: Identify Patterns
- Find repeatable search queries with variables
  - "[Product] for [Use Case]"
  - "[Topic] in [Location]"
  - "[Comparison] vs [Alternative]"
- Validate search volume for pattern variations
- Check competition level for target keywords

### Step 2: Design Templates
- Create a page template with fixed + variable sections
- Define data fields needed for each variation
- Ensure each page has unique, valuable content
- Include dynamic internal linking between related pages

### Step 3: Data Collection
- Build or source datasets for page generation
- Ensure data quality and accuracy
- Plan for data updates and freshness
- Add unique editorial content per page

### Step 4: Quality Gates
- Minimum content threshold per page
- Unique value requirement (not just data swaps)
- No-index thin pages that don''t meet quality bar
- Human review of sample pages

### Step 5: Technical Implementation
- URL structure planning
- XML sitemap generation
- Internal linking strategy
- Pagination and crawl budget management

## EdTech Application
- "XR Learning for [Subject]" pages (Math, Science, History, etc.)
- "[State] K-12 Technology Grants" resource pages
- "Virtual Reality in [Grade Level] Education" pages
- District comparison and research pages',
 ARRAY['content-creator'], 8, 45, 'seo_strategy',
 ARRAY['seo', 'programmatic', 'scale', 'content'],
 'coreyhaines31/marketingskills', 'v1.0'),

('competitor-alternatives', 'Competitor Alternatives', 'SEO & Discovery',
 'Create competitor comparison and alternatives pages that capture high-intent traffic',
 '# Competitor Alternatives Skill

## Framework: Comparison Content Strategy

### Step 1: Competitor Mapping
- Identify direct competitors (same product category)
- Identify indirect competitors (different approach, same problem)
- Identify aspirational competitors (larger companies in adjacent space)

### Step 2: Page Types
1. **[Your Product] vs [Competitor]**: Direct 1:1 comparison
2. **Best [Category] Alternatives**: Listicle format
3. **[Competitor] Alternatives**: Target competitor brand searches
4. **[Category] Comparison Guide**: Comprehensive buyer''s guide

### Step 3: Content Structure
- Fair and honest comparison (builds trust)
- Feature-by-feature comparison table
- Use case recommendations (who should use what)
- Pricing comparison (if publicly available)
- Migration/switching guide
- Real user testimonials and reviews

### Step 4: SEO Optimization
- Target "[competitor] alternative" and "[competitor] vs [you]" keywords
- Schema markup for comparison content
- Regular updates as competitors change
- Link to detailed product pages from comparisons

### Key Principles
- Be honest about competitor strengths
- Highlight your unique differentiators
- Focus on use-case fit, not "we''re better"
- Include third-party validation
- Update quarterly

## EdTech Application
- Compare against established EdTech platforms
- Emphasize XR-specific advantages
- District procurement comparison guides
- Compliance and safety comparison matrices',
 ARRAY['content-creator'], 8, 40, 'comparison_content',
 ARRAY['seo', 'competitors', 'comparison', 'alternatives'],
 'coreyhaines31/marketingskills', 'v1.0'),

('schema-markup', 'Schema Markup', 'SEO & Discovery',
 'Implement structured data markup for enhanced search results',
 '# Schema Markup Skill

## Framework: Structured Data Implementation

### Priority Schema Types for B2B SaaS
1. **Organization**: Company info, logo, social profiles
2. **Product**: Features, pricing, reviews
3. **FAQ**: Common questions on key pages
4. **HowTo**: Tutorial and guide content
5. **Article/BlogPosting**: Blog content with author info
6. **BreadcrumbList**: Navigation hierarchy
7. **Review/AggregateRating**: Customer reviews
8. **Event**: Webinars, conferences, demos
9. **VideoObject**: Product demos, tutorials

### Implementation Checklist
- Use JSON-LD format (Google recommended)
- Place in <head> or <body> of each page
- Validate with Google Rich Results Test
- Monitor in Google Search Console
- Test rendering in search results

### JSON-LD Template (Organization)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Company description",
  "sameAs": ["social media URLs"]
}
```

### Quality Guidelines
- Only mark up visible content
- Be accurate and specific
- Don''t mark up irrelevant content for rich results
- Keep schema updated with content changes
- Use most specific schema type available

## EdTech Application
- EducationalOrganization schema
- Course schema for learning modules
- Event schema for PD sessions and webinars
- SoftwareApplication for platform listing
- FAQ schema for educator questions',
 ARRAY['content-creator'], 6, 30, 'schema_code',
 ARRAY['seo', 'schema', 'structured-data', 'rich-results'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Paid & Distribution (1 skill)
('paid-ads', 'Paid Ads', 'Paid & Distribution',
 'Plan and optimize paid advertising campaigns across platforms',
 '# Paid Ads Skill

## Framework: Full-Funnel Paid Strategy

### Platform Selection
- **LinkedIn Ads**: Best for B2B EdTech targeting by job title, company size
- **Google Ads**: Capture high-intent search traffic
- **Facebook/Meta**: Retargeting and lookalike audiences
- **YouTube**: Product demos, testimonials, thought leadership

### Campaign Structure
1. **Top of Funnel (Awareness)**: Brand awareness, thought leadership content
2. **Middle of Funnel (Consideration)**: Case studies, webinar registrations
3. **Bottom of Funnel (Decision)**: Demo requests, free trial, pricing

### LinkedIn Ads Specifics
- Targeting: Job titles (Superintendent, Tech Director, Curriculum Coordinator)
- Company size: School districts with 5,000+ students
- Geography: Target states (IN, OH, IL, MI expanding)
- Ad types: Sponsored content, Message ads, Conversation ads
- Budget: Start with $50-100/day for testing

### Google Ads Strategy
- Brand keywords (protect brand name searches)
- Category keywords ("XR education", "VR classroom")
- Competitor keywords (bid on competitor names)
- Long-tail keywords ("virtual reality science lessons K-12")

### Optimization Framework
- Set up conversion tracking for all goals
- A/B test ad creative (headline, image, CTA)
- Review and optimize weekly
- Negative keyword management
- Audience refinement based on conversion data
- Bid strategy: Start manual, move to target CPA

### Metrics to Track
- Cost per click (CPC)
- Cost per lead (CPL)
- Click-through rate (CTR)
- Conversion rate
- Return on ad spend (ROAS)

## EdTech Application
- Target education conference seasons
- Budget cycle awareness (Q1/Q2 for next fiscal year)
- Compliance messaging in ad copy
- Pilot program as low-barrier CTA',
 ARRAY['content-creator'], 8, 45, 'ad_strategy',
 ARRAY['paid-ads', 'linkedin-ads', 'google-ads', 'ppc'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Measurement & Testing (2 skills)
('analytics-tracking', 'Analytics Tracking', 'Measurement & Testing',
 'Set up comprehensive analytics tracking for marketing attribution',
 '# Analytics Tracking Skill

## Framework: Measurement Architecture

### Step 1: Define Key Metrics
**Acquisition Metrics:**
- Traffic by source/medium/campaign
- New vs returning visitors
- Landing page performance

**Engagement Metrics:**
- Pages per session
- Average session duration
- Scroll depth
- Video completion rates
- Feature usage (for product)

**Conversion Metrics:**
- Macro conversions (demo request, signup, purchase)
- Micro conversions (email signup, content download, pricing page view)
- Conversion rate by source
- Multi-touch attribution

**Revenue Metrics:**
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- CAC payback period
- Marketing-sourced pipeline

### Step 2: Tracking Setup
- Google Analytics 4 configuration
- Conversion goals and events
- UTM parameter standards
- Cross-domain tracking (if needed)
- Enhanced ecommerce tracking
- Custom dimensions for segmentation

### Step 3: UTM Convention
- utm_source: platform (linkedin, google, email)
- utm_medium: channel type (paid, organic, newsletter)
- utm_campaign: campaign name (spring-launch-2026)
- utm_content: content variant (cta-button-blue)
- utm_term: keyword (for paid search)

### Step 4: Dashboards
- Weekly marketing performance dashboard
- Channel-specific deep-dive reports
- Funnel visualization
- Cohort analysis setup
- Automated alerts for anomalies

## EdTech Application
- Track pilot request to paid conversion journey
- Measure content pillar performance
- District-level engagement tracking
- Event/conference ROI measurement',
 ARRAY['analytics-agent'], 9, 40, 'tracking_plan',
 ARRAY['analytics', 'tracking', 'measurement', 'attribution'],
 'coreyhaines31/marketingskills', 'v1.0'),

('ab-test-setup', 'A/B Test Setup', 'Measurement & Testing',
 'Design and execute statistically valid A/B tests',
 '# A/B Test Setup Skill

## Framework: Scientific Testing Process

### Step 1: Hypothesis Formation
- Format: "If we [change], then [metric] will [improve/increase] because [reason]"
- Base hypothesis on data, not opinion
- Prioritize tests by potential impact and ease

### Step 2: Test Design
- Define primary metric (one per test)
- Define secondary metrics (monitor for side effects)
- Calculate required sample size for statistical significance
- Determine test duration (minimum 2 weeks, full business cycles)
- Document control vs variant changes

### Step 3: Implementation
- Randomized assignment (50/50 split for simple tests)
- Ensure no sampling bias
- QA both variants thoroughly
- Set up real-time monitoring for errors

### Step 4: Analysis
- Wait for statistical significance (95% confidence minimum)
- Check for segment-specific effects
- Validate with secondary metrics
- Document results regardless of outcome

### Step 5: Decision Framework
- **Clear winner (>95% confidence, meaningful lift)**: Implement
- **No significant difference**: Keep control, learn from it
- **Mixed results**: Segment analysis, consider follow-up test
- **Unexpected negative**: Investigate, don''t just revert

### Common Test Ideas (Prioritized)
1. Headline/value proposition variations
2. CTA button copy and color
3. Form length (fewer vs more fields)
4. Social proof placement
5. Pricing page layout
6. Email subject lines
7. Landing page layout

### Statistical Concepts
- Sample size calculator inputs: baseline rate, minimum detectable effect, significance level
- Avoid peeking at results before adequate sample
- Account for multiple comparisons if testing many variants

## EdTech Application
- Test educator vs administrator messaging
- A/B test pilot program offers
- Compare ROI vs student outcome messaging
- Test demo vs free trial CTAs',
 ARRAY['analytics-agent'], 8, 30, 'test_plan',
 ARRAY['ab-testing', 'experimentation', 'optimization', 'statistics'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Growth Engineering (2 skills)
('free-tool-strategy', 'Free Tool Strategy', 'Growth Engineering',
 'Design free tools that drive organic acquisition and demonstrate product value',
 '# Free Tool Strategy Skill

## Framework: Value-First Growth

### Step 1: Identify Tool Opportunities
- What manual tasks does your audience do regularly?
- What calculations or assessments are done on spreadsheets?
- What information do people frequently search for?
- What would make a great "first taste" of your product?

### Tool Type Ideas
1. **Calculators**: ROI, savings, budget, comparison
2. **Assessments**: Readiness, maturity, gap analysis
3. **Templates**: Documents, spreadsheets, plans
4. **Generators**: Name, copy, outline generators
5. **Checkers/Auditors**: Website, compliance, quality checks

### Step 2: Design for Growth
- Require email to save/export results (lead capture)
- Make results shareable (viral loop)
- Include product mentions naturally in results
- SEO-optimize the tool landing page
- Build backlink-worthy utility

### Step 3: Build Minimal Version
- Start with the simplest useful version
- Ship fast, iterate based on usage data
- Mobile-friendly from day one
- Fast load time (< 2 seconds)

### Step 4: Distribution
- Product Hunt launch
- Reddit/community sharing
- Outreach to relevant bloggers/journalists
- Social media announcement series
- Partner/affiliate sharing

## EdTech Application
- XR Readiness Assessment for districts
- Technology Budget Calculator
- Digital Learning Gap Analyzer
- Classroom VR Equipment Planner
- Student Engagement ROI Calculator',
 ARRAY['content-creator'], 9, 40, 'tool_strategy',
 ARRAY['growth', 'free-tools', 'lead-gen', 'acquisition'],
 'coreyhaines31/marketingskills', 'v1.0'),

('referral-program', 'Referral Program', 'Growth Engineering',
 'Design and launch customer referral and advocacy programs',
 '# Referral Program Skill

## Framework: Referral Engine Design

### Step 1: Program Structure
**Referral Models:**
1. **One-sided**: Reward the referrer only
2. **Two-sided**: Reward both referrer and referred (recommended)
3. **Tiered**: Increasing rewards for multiple referrals
4. **Community**: Points/status system

### Step 2: Incentive Design
**For Referrer:**
- Account credits or discounts
- Extended features or usage
- Gift cards or merchandise
- Recognition and status

**For Referred:**
- Extended trial period
- Discount on first purchase
- Free premium features for limited time
- Exclusive content access

### Step 3: Mechanics
- Simple sharing mechanism (link, email, in-app)
- Clear tracking and attribution
- Automated reward fulfillment
- Real-time status dashboard for referrers
- Fraud prevention (self-referral, fake accounts)

### Step 4: Promotion
- In-app prompts at moments of delight
- Post-purchase/activation email
- Dedicated referral page
- Customer success team enablement
- Social sharing optimization

### Step 5: Measurement
- Referral rate (% of customers who refer)
- Conversion rate (% of referred who convert)
- Cost per acquisition via referral vs other channels
- Referral customer LTV vs non-referral
- Program viral coefficient

## EdTech Application
- District-to-district referral program
- Teacher champion advocacy program
- Conference networking referrals
- Education consortium partnerships
- PD credit rewards for referrals',
 ARRAY['content-creator'], 7, 35, 'referral_plan',
 ARRAY['growth', 'referral', 'advocacy', 'viral'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Strategy & Monetization (4 skills)
('marketing-ideas', 'Marketing Ideas', 'Strategy & Monetization',
 'Generate creative marketing ideas and campaigns tailored to your product and audience',
 '# Marketing Ideas Skill

## Framework: Systematic Ideation Process

### Step 1: Audience Deep Dive
- Who are the primary buyers? (demographics, psychographics)
- What are their top 3 pain points?
- Where do they spend time online?
- What content do they already consume?
- Who influences their purchasing decisions?

### Step 2: Channel Audit
- Which channels have you not tried?
- Which channels work for competitors?
- Where is your audience underserved?
- What channels match your content strengths?

### Step 3: Idea Generation Categories
1. **Content Marketing**: Blog, podcast, video, webinar ideas
2. **Community Building**: Groups, events, forums, user conferences
3. **Partnership Marketing**: Co-marketing, integrations, affiliates
4. **Product-Led Growth**: Free tools, freemium, viral features
5. **Event Marketing**: Conferences, workshops, meetups
6. **PR & Media**: Press coverage, thought leadership, awards
7. **Guerrilla Marketing**: Creative, unexpected, low-budget tactics

### Step 4: Prioritization Matrix
Rate each idea on:
- Impact potential (1-10)
- Effort/cost (1-10, lower is better)
- Time to results (quick wins vs long-term)
- Alignment with brand and goals

### Step 5: Validation
- MVP test before full investment
- Set success criteria before launching
- 30-day check-in for new initiatives
- Kill criteria (when to stop)

## EdTech Application
- Education conference presence strategy
- Teacher influencer partnerships
- District success story campaigns
- EdTech media and publication outreach
- Pilot program marketing playbook',
 ARRAY['content-creator'], 9, 30, 'idea_list',
 ARRAY['strategy', 'ideation', 'brainstorming', 'campaigns'],
 'coreyhaines31/marketingskills', 'v1.0'),

('marketing-psychology', 'Marketing Psychology', 'Strategy & Monetization',
 'Apply behavioral psychology principles to marketing for ethical persuasion',
 '# Marketing Psychology Skill

## Framework: Ethical Persuasion Toolkit

### Core Principles (Cialdini+)

**1. Social Proof**
- Customer counts and logos
- Testimonials with specific results
- Case studies with data
- User-generated content
- Expert endorsements
Application: "500+ districts trust Ascent XR for immersive learning"

**2. Authority**
- Research partnerships and citations
- Industry awards and recognition
- Expert team credentials
- Media mentions and press coverage
Application: "Backed by peer-reviewed educational research"

**3. Scarcity & Urgency**
- Limited pilot program spots
- Seasonal pricing windows
- Early adopter benefits
- Budget cycle deadlines
Application: "Only 10 pilot spots remaining for Spring semester"

**4. Reciprocity**
- Free valuable content (guides, templates, tools)
- Generous free trial
- No-strings-attached demos
- Community contributions
Application: Offer free XR lesson plans before asking for sale

**5. Commitment & Consistency**
- Start with small asks (download → webinar → demo → pilot)
- Progressive engagement ladder
- Public commitments (case study participation)
Application: Free assessment → pilot → full deployment

**6. Loss Aversion**
- Frame around what they''ll miss, not just what they''ll gain
- Show cost of inaction
- Highlight competitive disadvantage of not innovating
Application: "Districts without XR are falling behind in STEM outcomes"

**7. Anchoring**
- Show premium pricing first
- Compare to cost of alternatives
- Annual vs per-student pricing framing
Application: "Less than $2 per student per year"

### Ethical Guidelines
- Never manipulate or deceive
- All claims must be verifiable
- Respect user autonomy
- Build genuine value, not artificial urgency',
 ARRAY['content-creator'], 8, 25, 'psychology_playbook',
 ARRAY['psychology', 'persuasion', 'behavioral', 'ethics'],
 'coreyhaines31/marketingskills', 'v1.0'),

('launch-strategy', 'Launch Strategy', 'Strategy & Monetization',
 'Plan and execute product launches for maximum market impact',
 '# Launch Strategy Skill

## Framework: 4-Phase Launch Playbook

### Phase 1: Pre-Launch (4-6 weeks before)
**Internal Preparation:**
- Product positioning document
- Key messaging and talking points
- Sales enablement materials
- Support team training
- Internal launch presentation

**Audience Building:**
- Waitlist/early access signup
- Teaser content on social media
- Email list warm-up sequence
- Influencer/partner outreach
- Press/media briefing preparation

### Phase 2: Soft Launch (1-2 weeks before)
- Beta access to select customers
- Gather testimonials and case studies
- Fix critical issues from beta feedback
- Finalize all launch assets
- Media embargo and pre-briefings

### Phase 3: Launch Day
**First 24 Hours:**
- Press release distribution
- Email announcement to full list
- Social media blitz (multiple posts throughout day)
- Community/forum announcements
- Partner cross-promotion
- Live event or webinar
- Real-time monitoring and response

### Phase 4: Post-Launch (2-4 weeks after)
- Follow-up email sequence to non-converters
- Content series expanding on launch themes
- Customer success stories from early adopters
- Performance analysis and optimization
- Retargeting campaigns for launch page visitors

### Launch Metrics Dashboard
- Signups/purchases in first 24h, 48h, week
- Media coverage and mentions
- Social media engagement and reach
- Email open and click rates
- Website traffic surge and sources

## EdTech Application
- Align with school year calendar (Aug/Sept for fall, Jan for spring)
- Target education conferences for timing
- Partner with pilot districts for launch testimonials
- State-specific compliance announcements
- Teacher PD tie-ins for new feature launches',
 ARRAY['content-creator'], 10, 60, 'launch_plan',
 ARRAY['launch', 'strategy', 'go-to-market', 'product'],
 'coreyhaines31/marketingskills', 'v1.0'),

('pricing-strategy', 'Pricing Strategy', 'Strategy & Monetization',
 'Develop and optimize pricing models for maximum revenue and market fit',
 '# Pricing Strategy Skill

## Framework: Value-Based Pricing

### Step 1: Value Assessment
- What problem does your product solve?
- What is the cost of the problem (in dollars, time, outcomes)?
- What alternatives exist and what do they cost?
- What is the perceived value to different segments?

### Step 2: Pricing Models
1. **Per-seat/Per-user**: Simple, predictable, scales with org size
2. **Tiered**: Feature-based tiers for different needs
3. **Usage-based**: Pay for what you use
4. **Flat rate**: One price for everything
5. **Freemium**: Free base + paid premium
6. **Enterprise**: Custom pricing for large deals

### Step 3: Pricing Page Design
- 3 tiers maximum (Good/Better/Best)
- Highlight recommended tier
- Show monthly and annual (with annual discount)
- Feature comparison table
- FAQ addressing common concerns
- Social proof near pricing
- Clear CTA per tier

### Step 4: Pricing Psychology
- Charm pricing ($99 vs $100)
- Anchor with highest price first
- Bundle for perceived value
- Per-unit pricing for large numbers ("$2/student/year")
- Show savings for longer commitments

### Step 5: Testing & Optimization
- Price sensitivity surveys (Van Westendorp)
- A/B test pricing page layout
- Monitor competitor pricing changes
- Track conversion rate by price point
- Analyze willingness to pay by segment

## EdTech Application
- Per-student pricing for district budgets
- Academic vs calendar year billing
- Pilot program pricing (low barrier to entry)
- Multi-year discount for budget certainty
- Grant-fundable pricing structures
- Purchase order and invoicing support',
 ARRAY['content-creator'], 9, 40, 'pricing_plan',
 ARRAY['pricing', 'monetization', 'strategy', 'revenue'],
 'coreyhaines31/marketingskills', 'v1.0'),

-- Foundation (1 skill)
('product-marketing-context', 'Product Marketing Context', 'Foundation',
 'Build comprehensive product marketing context for all marketing activities',
 '# Product Marketing Context Skill

## Framework: Marketing Foundation Document

### Step 1: Product Definition
- What does the product do? (One sentence)
- Who is it for? (Specific audience)
- What problem does it solve? (Pain point)
- How is it different? (Unique differentiators)
- Why should they care? (Benefit statement)

### Step 2: Target Audience Profiles
**Primary Buyer:**
- Job title and responsibilities
- Goals and challenges
- Decision-making process
- Information sources
- Objections and concerns

**Secondary Influencer:**
- Role in purchase decision
- What they care about
- How to reach them

**End User:**
- Daily workflow
- Pain points with current solution
- What success looks like

### Step 3: Positioning Statement
Template: "For [target audience] who [need/want], [product] is a [category] that [key benefit]. Unlike [competitors], [product] [key differentiator]."

### Step 4: Messaging Framework
- **Elevator Pitch** (30 seconds)
- **Value Propositions** (3-5 key benefits)
- **Proof Points** (data, testimonials, case studies for each)
- **Objection Handling** (top 5 objections with responses)

### Step 5: Competitive Landscape
- Direct competitors and their positioning
- Indirect competitors and alternatives
- Your unique strengths
- Market gaps you can own

### Step 6: Go-to-Market Channels
- Primary channels (where your audience is)
- Content types per channel
- Budget allocation recommendation
- Timeline and milestones

## EdTech Application
- Audience profiles: Superintendent, Tech Director, Curriculum Coordinator, Teacher
- Purchase cycle: School board approval, budget allocation, pilot, evaluation, rollout
- Seasonality: Budget planning (Q1-Q2), purchasing (Q3-Q4), implementation (summer/fall)
- Compliance positioning: FERPA, COPPA, accessibility, data privacy',
 ARRAY['content-creator'], 10, 45, 'marketing_context',
 ARRAY['positioning', 'messaging', 'foundation', 'strategy'],
 'coreyhaines31/marketingskills', 'v1.0')

ON CONFLICT (skill_id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  applicable_agents = EXCLUDED.applicable_agents,
  edtech_relevance = EXCLUDED.edtech_relevance,
  estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
  output_format = EXCLUDED.output_format,
  tags = EXCLUDED.tags,
  source_repo = EXCLUDED.source_repo,
  source_version = EXCLUDED.source_version,
  updated_at = CURRENT_TIMESTAMP;


-- ============================================================
-- WORKFLOW TEMPLATES (6 total)
-- ============================================================

-- 1. New Product Launch to Districts (8 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'New Product Launch to Districts',
  'product-launch-districts',
  'Full product launch playbook: from positioning through launch execution, email outreach, social promotion, and measurement. Designed for K-12 district sales.',
  'Launch',
  285
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('product-marketing-context', 1, 'content-creator'),
  ('marketing-ideas', 2, 'content-creator'),
  ('launch-strategy', 3, 'content-creator'),
  ('copywriting', 4, 'content-creator'),
  ('email-sequence', 5, 'content-creator'),
  ('social-content', 6, 'content-creator'),
  ('analytics-tracking', 7, 'analytics-agent'),
  ('ab-test-setup', 8, 'analytics-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'product-launch-districts'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 2. Website Conversion Optimization (5 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Website Conversion Optimization',
  'website-cro',
  'Systematic website conversion optimization: audit landing pages, optimize signup flow, fix forms, set up tracking, and design A/B tests.',
  'CRO',
  170
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('page-cro', 1, 'content-creator'),
  ('signup-flow-cro', 2, 'content-creator'),
  ('form-cro', 3, 'content-creator'),
  ('analytics-tracking', 4, 'analytics-agent'),
  ('ab-test-setup', 5, 'analytics-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'website-cro'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 3. Content & SEO Foundation (6 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Content & SEO Foundation',
  'content-seo-foundation',
  'Build your content and SEO foundation: product positioning, SEO audit, competitive analysis, schema markup, copywriting, and social content strategy.',
  'SEO',
  235
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('product-marketing-context', 1, 'content-creator'),
  ('seo-audit', 2, 'content-creator'),
  ('competitor-alternatives', 3, 'content-creator'),
  ('schema-markup', 4, 'content-creator'),
  ('copywriting', 5, 'content-creator'),
  ('social-content', 6, 'content-creator')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'content-seo-foundation'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 4. Growth Engine Setup (5 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Growth Engine Setup',
  'growth-engine',
  'Design your growth engine: marketing psychology foundations, referral program, free tool strategy, pricing optimization, and email nurture automation.',
  'Growth',
  165
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('marketing-psychology', 1, 'content-creator'),
  ('referral-program', 2, 'content-creator'),
  ('free-tool-strategy', 3, 'content-creator'),
  ('pricing-strategy', 4, 'content-creator'),
  ('email-sequence', 5, 'content-creator')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'growth-engine'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 5. Quick Win: Email Campaign (3 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Quick Win: Email Campaign',
  'quick-email-campaign',
  'Rapid email campaign creation: write compelling copy, design a nurture sequence, and set up A/B tests for optimization.',
  'Quick Win',
  105
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('copywriting', 1, 'content-creator'),
  ('email-sequence', 2, 'content-creator'),
  ('ab-test-setup', 3, 'analytics-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'quick-email-campaign'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 6. Quick Win: LinkedIn Authority (2 steps)
INSERT INTO marketing_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Quick Win: LinkedIn Authority',
  'quick-linkedin-authority',
  'Build LinkedIn thought leadership quickly: create engaging social content strategy and write compelling copy for posts.',
  'Quick Win',
  60
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO marketing_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('social-content', 1, 'content-creator'),
  ('copywriting', 2, 'content-creator')
) AS step_data(skill_slug, step_order, agent_id)
JOIN marketing_workflows w ON w.slug = 'quick-linkedin-authority'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM marketing_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;
