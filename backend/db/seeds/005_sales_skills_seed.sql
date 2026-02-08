-- Seed 005: Sales Skills & Workflow Templates
-- 25 professional sales skills + 6 workflow templates for Ascent XR
-- Sourced from gtmagents/gtm-agents, OneWave-AI/claude-skills, Prospeda/gtm-skills

-- ============================================================
-- SALES SKILLS (25 total)
-- ============================================================

INSERT INTO sales_skills (skill_id, name, category, description, content, applicable_agents, edtech_relevance, estimated_duration_minutes, output_format, tags, source_repo, source_version) VALUES

-- Prospecting & Outreach (4 skills)
('cold-outreach', 'Cold Outreach & Email Sequences', 'Prospecting & Outreach',
 'Build multi-touch cold outreach sequences that generate meetings with school district decision makers',
 '# Cold Outreach & Email Sequences Skill

## Framework: Multi-Touch Outreach Cadence

### Step 1: Prospect Research
- Identify the district''s current technology initiatives
- Review recent board meeting minutes for tech budget discussions
- Find the right contacts: Superintendent, CTO/Tech Director, Curriculum Director
- Check LinkedIn for mutual connections and recent activity
- Research district size, student count, and funding status

### Step 2: Craft the Sequence (8-Touch / 21-Day Cadence)
**Touch 1 (Day 1)**: Personalized email — reference a specific district initiative
**Touch 2 (Day 3)**: LinkedIn connection request with personal note
**Touch 3 (Day 5)**: Follow-up email with relevant case study
**Touch 4 (Day 8)**: Phone call attempt + voicemail script
**Touch 5 (Day 10)**: Email with value-add content (research report, guide)
**Touch 6 (Day 14)**: LinkedIn engagement (comment on their post)
**Touch 7 (Day 17)**: Break-up email with low-commitment ask
**Touch 8 (Day 21)**: Final value-add email with open door

### Step 3: Email Copy Framework
- **Subject Line**: Under 50 chars, personalized, curiosity-driven
- **Opening**: Reference something specific about their district (not generic)
- **Value Prop**: One sentence connecting XR to their stated priorities
- **Social Proof**: "Districts like [similar district] saw [specific result]"
- **CTA**: Single, specific, low-commitment ask (15-min call, not demo)

### Step 4: A/B Testing
- Test subject lines (question vs statement vs personalized)
- Test send times (Tue-Thu 7-9am vs 4-6pm)
- Test CTA types (calendar link vs reply request)
- Track open rates, reply rates, meeting rates

## Output Format
Deliver a complete outreach cadence with:
1. Full sequence timeline with channel mix
2. Email templates for each touch
3. Phone/voicemail scripts
4. LinkedIn message templates
5. Tracking metrics and benchmarks

## EdTech Application
For K-12 district outreach:
- Reference state-level education technology mandates
- Tie to STEM/STEAM curriculum goals
- Mention ESSER/federal funding availability
- Reference similar districts in their state/region
- Align outreach to budget planning cycles (Jan-Mar for next fiscal year)',
 ARRAY['sdr-agent'], 9, 40, 'outreach_sequence',
 ARRAY['outreach', 'cold-email', 'prospecting', 'cadence'],
 'gtmagents/gtm-agents', 'v1.0'),

('social-selling', 'LinkedIn Social Selling', 'Prospecting & Outreach',
 'Leverage LinkedIn for warm prospecting, relationship building, and social proof with education decision makers',
 '# LinkedIn Social Selling Skill

## Framework: Social Selling Index Optimization

### Step 1: Profile Optimization for EdTech Sales
- Headline: Focus on value delivered, not title ("Helping K-12 districts transform learning with XR")
- About section: Customer-centric story with results
- Featured section: Case studies, testimonials, pilot results
- Experience: Frame in terms of customer outcomes
- Recommendations: Request from champion teachers and administrators

### Step 2: Content Strategy (3-2-1 Rule)
- 3 pieces of curated/shared education industry content per week
- 2 pieces of thought leadership or insight content
- 1 piece of product/company-related content
- Always add personal commentary when sharing

### Step 3: Engagement Tactics
**Daily (15 minutes):**
- Comment meaningfully on 5 target prospect posts
- React to 10 education industry posts
- Accept/send 3-5 strategic connection requests

**Weekly (30 minutes):**
- Publish 1 original post or article
- Send 5-10 personalized InMail messages
- Join and participate in education LinkedIn groups

### Step 4: Social Selling Metrics
- Social Selling Index (SSI) score: Target 70+
- Profile views per week: Track trending
- Connection acceptance rate: >30%
- InMail response rate: >15%
- Content engagement rate: >5%

### Step 5: Converting Engagement to Meetings
- Warm outreach after 3+ engagement touches
- Reference their content in outreach
- Offer value before asking for time
- Use mutual connections for introductions

## EdTech Application
- Join education technology groups (ISTE, CoSN, state EdTech associations)
- Engage with superintendents, tech directors, curriculum coordinators
- Share student success stories and XR learning outcomes
- Comment on EdTech policy discussions and funding announcements
- Post about education conference takeaways',
 ARRAY['sdr-agent'], 9, 30, 'social_selling_plan',
 ARRAY['linkedin', 'social-selling', 'prospecting', 'networking'],
 'OneWave-AI/claude-skills', 'v1.0'),

('conference-selling', 'Conference & Event Selling', 'Prospecting & Outreach',
 'Maximize sales opportunities at education conferences through strategic pre-event, at-event, and post-event playbooks',
 '# Conference & Event Selling Skill

## Framework: Event Revenue Maximization

### Step 1: Pre-Event Preparation (4-6 weeks before)
- **Target List**: Build list of attending districts/decision makers
- **Meeting Scheduling**: Send personalized outreach to book meetings
- **Demo Preparation**: Customize demo for conference themes
- **Collateral**: Prepare one-pagers, case studies, leave-behinds
- **Social Media**: Announce attendance, engage with event hashtags
- **Booth/Presence**: Plan interactive XR demo stations

### Step 2: At-Event Execution
**Booth Strategy:**
- Lead with experience, not pitch (let them try XR first)
- Qualification questions within 2 minutes of engagement
- Badge scanning + handwritten notes on each interaction
- Scheduled demo times for serious prospects

**Session Strategy:**
- Attend sessions your prospects are presenting/attending
- Ask insightful questions during Q&A (visibility play)
- Connect with speakers post-session

**Networking Strategy:**
- Target evening receptions and dinners
- Use the "conference buddy" approach (help first, sell later)
- Exchange contact info with a clear next step

### Step 3: Post-Event Follow-Up (Within 48 Hours)
- Day 1: Personal email referencing specific conversation
- Day 2: LinkedIn connection with conference note
- Day 3-5: Send promised resources/case studies
- Day 7: Meeting request for qualified prospects
- Day 14: Add to nurture sequence if no response

### Step 4: Measurement
- Meetings booked pre-event
- Qualified leads generated at event
- Follow-up meeting conversion rate
- Pipeline created within 90 days
- ROI: Pipeline generated / total event cost

## EdTech Application
Key conferences to target:
- ISTE (International Society for Technology in Education)
- FETC (Future of Education Technology Conference)
- CoSN (Consortium for School Networking)
- State-level EdTech conferences (IETC, TCEA, CUE, etc.)
- AASA (American Association of School Administrators)
- Regional superintendent summits',
 ARRAY['sdr-agent'], 10, 35, 'event_playbook',
 ARRAY['conferences', 'events', 'networking', 'trade-shows'],
 'Prospeda/gtm-skills', 'v1.0'),

('referral-generation', 'Referral & Network Prospecting', 'Prospecting & Outreach',
 'Systematically generate warm introductions and referrals from existing customers, partners, and network contacts',
 '# Referral & Network Prospecting Skill

## Framework: Referral Engine

### Step 1: Identify Referral Sources
**Tier 1 - Champion Customers:**
- Teachers actively using and loving the product
- Administrators who''ve seen measurable results
- Tech directors who''ve had smooth implementations

**Tier 2 - Partners & Ecosystem:**
- EdTech consultants and advisors
- Integration partners
- Education service providers

**Tier 3 - Network:**
- Education conference connections
- LinkedIn engaged contacts
- Board members and advisors

### Step 2: Referral Ask Framework
- **Timing**: Ask after a success moment (great QBR, positive feedback, milestone)
- **Specificity**: "Do you know any tech directors in [neighboring district]?" not "Know anyone?"
- **Make it easy**: Offer to draft the intro email for them
- **Reciprocate**: Offer value in return (reference call credit, feature prioritization)

### Step 3: Referral Process
1. Identify ideal referral request timing
2. Make the specific ask
3. Provide draft intro email/message
4. Follow up within 24 hours of introduction
5. Keep referrer updated on progress
6. Thank referrer regardless of outcome

### Step 4: Referral Tracking
- Referrals requested per month
- Referrals received per month
- Referral-to-meeting conversion rate
- Referral-to-close rate
- Average deal size from referrals vs cold

## EdTech Application
- Leverage superintendent networks (they talk to each other)
- Use regional education service centers as referral hubs
- Partner with education consultants who advise multiple districts
- Tap into state technology director associations
- Create a formal "Champion Educator" referral program',
 ARRAY['sdr-agent'], 8, 25, 'referral_plan',
 ARRAY['referrals', 'networking', 'warm-intro', 'prospecting'],
 'OneWave-AI/claude-skills', 'v1.0'),

-- Discovery & Qualification (4 skills)
('discovery-call', 'Discovery Call Framework', 'Discovery & Qualification',
 'Run structured discovery calls that uncover district needs, priorities, budget, and decision-making processes',
 '# Discovery Call Framework Skill

## Framework: SPIN + MEDDPICC Hybrid

### Step 1: Pre-Call Research (15 minutes)
- Review district website for strategic plan and technology vision
- Check recent board meeting minutes for budget/tech discussions
- Research contact on LinkedIn (background, posts, interests)
- Review any prior interactions or notes in CRM
- Prepare 3 district-specific questions

### Step 2: Call Structure (45 minutes)
**Opening (5 min):**
- Build rapport with genuine personal connection
- Set agenda and confirm time available
- Ask permission to take notes and ask questions

**Situation Questions (10 min):**
- "Walk me through how technology decisions get made in your district?"
- "What learning platforms/tools are you currently using?"
- "How many schools/students would this impact?"
- "Where are you in your budget cycle?"

**Problem Questions (10 min):**
- "What challenges are you facing with student engagement?"
- "Where do you see gaps in your current STEM/STEAM curriculum?"
- "What feedback are you hearing from teachers about technology tools?"
- "How are you measuring learning outcomes currently?"

**Implication Questions (10 min):**
- "If engagement continues to decline, what impact does that have on outcomes?"
- "How does the achievement gap affect your district''s funding and reputation?"
- "What happens if you don''t address the STEM pipeline issue this year?"

**Need-Payoff Questions (5 min):**
- "If you could show a 20% improvement in STEM engagement, what would that mean?"
- "How would immersive learning experiences change your teachers'' ability to reach all learners?"
- "What would it be worth to have measurable evidence of technology impact?"

**Next Steps (5 min):**
- Summarize key findings
- Propose clear next step with date/time
- Confirm who else should be involved

### Step 3: Post-Call Documentation
- Update CRM within 30 minutes
- Send follow-up email summarizing discussion and next steps
- Update deal stage and qualification score
- Brief team on key findings

## Output Format
Provide a customized discovery call script with:
1. Pre-call research checklist
2. Personalized questions for the specific district
3. Objection response preparation
4. Clear next-step proposals

## EdTech Application
K-12 specific discovery areas:
- ESSER/federal funding status and timeline
- State technology standards and mandates
- Board approval process and timeline
- Pilot program interest and process
- Teacher professional development capacity
- IT infrastructure and device availability',
 ARRAY['sdr-agent'], 10, 45, 'discovery_script',
 ARRAY['discovery', 'qualification', 'SPIN', 'sales-call'],
 'gtmagents/gtm-agents', 'v1.0'),

('lead-qualification', 'MEDDPICC Lead Qualification', 'Discovery & Qualification',
 'Score and qualify leads using the MEDDPICC framework adapted for K-12 EdTech sales cycles',
 '# MEDDPICC Lead Qualification Skill

## Framework: MEDDPICC for K-12 EdTech

### M - Metrics
- What measurable outcomes does the district need?
- Student achievement targets, engagement scores, test results
- Score 1-3: 1=no metrics defined, 2=vague goals, 3=specific measurable targets

### E - Economic Buyer
- Who controls the budget? (Superintendent, CFO, School Board)
- Do we have access to or a path to the economic buyer?
- Score 1-3: 1=unknown, 2=identified not engaged, 3=engaged and supportive

### D - Decision Criteria
- What factors will drive the decision? (outcomes, cost, ease of use, compliance)
- How do they evaluate EdTech vendors?
- Score 1-3: 1=unknown criteria, 2=known but not aligned, 3=criteria favor us

### D - Decision Process
- What is the approval workflow? (Committee, Board vote, Admin decision)
- What is the timeline? (Current fiscal year, next budget cycle)
- Score 1-3: 1=unknown process, 2=understood but complex, 3=clear path mapped

### P - Paper Process
- What procurement process must be followed? (RFP, sole source, cooperative purchasing)
- Legal/compliance requirements (FERPA, COPPA, data privacy agreements)
- Score 1-3: 1=unknown, 2=complex but navigable, 3=straightforward

### I - Identified Pain
- Is there an acknowledged problem that XR solves?
- Is there urgency? (funding deadline, mandate, competitive pressure)
- Score 1-3: 1=no acknowledged pain, 2=pain recognized, 3=urgent priority

### C - Champion
- Do we have an internal advocate? (Tech-savvy teacher, enthusiastic admin)
- Will they actively sell internally on our behalf?
- Score 1-3: 1=no champion, 2=friendly but passive, 3=active internal advocate

### C - Competition
- What alternatives are they considering? (Other EdTech, status quo, DIY)
- What is our competitive advantage?
- Score 1-3: 1=strong competitor ahead, 2=level playing field, 3=we are preferred

### Qualification Scoring
- **Total 20-24**: Hot lead - prioritize and accelerate
- **Total 14-19**: Warm lead - nurture and develop
- **Total 8-13**: Cool lead - long-term nurture
- **Total below 8**: Disqualify or park

## Output Format
Complete MEDDPICC scorecard with:
1. Score for each criterion (1-3)
2. Evidence/notes supporting each score
3. Overall qualification status
4. Recommended next actions to improve score
5. Deal risk assessment

## EdTech Application
K-12 specific qualification signals:
- Active ESSER/federal funding = higher urgency
- Board-approved technology plan = clearer decision process
- Failed prior EdTech implementation = identified pain
- Superintendent champion = strongest internal advocate
- Active RFP = immediate opportunity',
 ARRAY['sdr-agent'], 9, 30, 'qualification_scorecard',
 ARRAY['qualification', 'MEDDPICC', 'scoring', 'pipeline'],
 'gtmagents/gtm-agents', 'v1.0'),

('stakeholder-mapping', 'Stakeholder & Decision Maker Mapping', 'Discovery & Qualification',
 'Map all stakeholders in the district buying decision, understand their roles, motivations, and relationships',
 '# Stakeholder & Decision Maker Mapping Skill

## Framework: Power Map Analysis

### Step 1: Identify the Buying Committee
**Typical K-12 District Buying Committee:**

| Role | Title Examples | Typical Influence | Key Concerns |
|------|---------------|-------------------|--------------|
| Economic Buyer | Superintendent, CFO | Final budget authority | ROI, budget fit, board approval |
| Technical Buyer | CTO, IT Director | Infrastructure/security | Compatibility, security, support |
| User Buyer | Teachers, Principals | Day-to-day usage | Ease of use, training, outcomes |
| Champion | Tech-savvy Admin/Teacher | Internal advocate | Innovation, student impact |
| Gatekeeper | Procurement, Legal | Process compliance | RFP, contracts, compliance |
| Influencer | Board Members, Parents | Political influence | Community perception, safety |

### Step 2: Map Relationships
For each stakeholder, document:
- **Power Level**: High/Medium/Low influence on final decision
- **Disposition**: Strong Advocate / Supportive / Neutral / Concerned / Adversary
- **Engagement Level**: Deeply Engaged / Aware / Uninformed
- **Key Motivations**: What drives their decisions?
- **Potential Objections**: What concerns might they raise?
- **Access Strategy**: How to reach and influence them

### Step 3: Influence Strategy
- **Advocates**: Arm them with data and talking points for internal selling
- **Supportive**: Deepen engagement, move to champion status
- **Neutral**: Educate, provide evidence, demonstrate value
- **Concerned**: Address objections directly, provide references
- **Adversary**: Understand opposition, neutralize if possible

### Step 4: Communication Plan
For each key stakeholder:
- Preferred communication channel
- Message framing (ROI for CFO, outcomes for Curriculum, security for IT)
- Meeting cadence and format
- Content/collateral tailored to their concerns

### Step 5: Decision Map Visualization
Create a visual power map showing:
- Stakeholder positions (x-axis: disposition, y-axis: influence)
- Relationship connections between stakeholders
- Our engagement status with each
- Action items to move stakeholders

## Output Format
Deliver a complete stakeholder map with:
1. Organizational chart with buying roles
2. Individual stakeholder profiles
3. Power/influence matrix
4. Tailored messaging per stakeholder
5. Action plan to advance each relationship

## EdTech Application
- Map school board dynamics and voting patterns
- Identify teacher champions who can pilot and advocate
- Understand the superintendent''s cabinet and their influence
- Track curriculum committee review processes
- Map IT department concerns (bandwidth, devices, security)',
 ARRAY['crm-specialist'], 10, 35, 'stakeholder_map',
 ARRAY['stakeholders', 'decision-makers', 'power-map', 'org-chart'],
 'Prospeda/gtm-skills', 'v1.0'),

('needs-assessment', 'Needs Assessment & Gap Analysis', 'Discovery & Qualification',
 'Conduct thorough needs assessments to identify gaps between current state and desired outcomes for districts',
 '# Needs Assessment & Gap Analysis Skill

## Framework: Current-Future-Gap-Bridge

### Step 1: Current State Assessment
**Technology Landscape:**
- What EdTech tools are currently deployed?
- What is the utilization rate of existing tools?
- What infrastructure exists? (devices, bandwidth, IT support)
- What is the annual technology spend per student?

**Learning Outcomes:**
- Current standardized test performance
- Student engagement metrics
- Teacher satisfaction with current tools
- STEM/STEAM program participation rates

**Organizational Readiness:**
- Teacher technology proficiency levels
- Professional development budget and time
- Change management history (past technology adoptions)
- IT support capacity

### Step 2: Future State Definition
- District strategic plan technology goals
- State education technology standards compliance
- Student outcome improvement targets
- Teacher capability development goals
- Budget allocation for innovation

### Step 3: Gap Identification
For each area, document:
- **Gap Description**: What is missing or underperforming?
- **Impact**: What is the cost/consequence of the gap?
- **Urgency**: How time-sensitive is addressing this gap?
- **Complexity**: How difficult is it to close the gap?

### Step 4: Solution Mapping
Map each identified gap to:
- How XR experiences address the gap
- Evidence/research supporting the approach
- Implementation timeline and requirements
- Expected outcomes and metrics

### Step 5: Recommendation Prioritization
Rank recommendations by:
- Impact on student outcomes (highest weight)
- Alignment with district priorities
- Ease of implementation
- Budget fit
- Quick wins vs. long-term initiatives

## Output Format
Complete needs assessment report with:
1. Current state summary
2. Desired future state
3. Prioritized gap analysis
4. Solution recommendations with ROI projections
5. Implementation roadmap

## EdTech Application
K-12 specific assessment areas:
- Curriculum alignment to state standards
- Equity and access gaps across schools
- Special education and differentiation needs
- Career and technical education requirements
- Social-emotional learning integration opportunities',
 ARRAY['sdr-agent'], 9, 40, 'needs_report',
 ARRAY['needs-assessment', 'gap-analysis', 'discovery', 'requirements'],
 'OneWave-AI/claude-skills', 'v1.0'),

-- Presentation & Demo (3 skills)
('demo-preparation', 'Demo Preparation & Storytelling', 'Presentation & Demo',
 'Prepare compelling, customized product demonstrations that tell a story aligned with district priorities',
 '# Demo Preparation & Storytelling Skill

## Framework: Story-Driven Demo

### Step 1: Pre-Demo Intelligence
- Review all discovery call notes and MEDDPICC scorecard
- Understand the primary use case and pain points
- Know who will be in the room and their roles
- Research what demos they''ve seen from competitors
- Prepare for the top 3 objections likely to arise

### Step 2: Demo Structure (The Hero''s Journey)
**Act 1: The World Today (5 min)**
- Paint the picture of their current challenges
- Use their own words and data from discovery
- Create emotional connection to the problem
- "Based on our conversation, your district is facing..."

**Act 2: The Vision (5 min)**
- Show what''s possible with immersive learning
- Start with the most impactful XR experience
- Connect every feature to their stated priorities
- "Imagine your 8th graders experiencing..."

**Act 3: The Experience (15-20 min)**
- Hands-on XR demo customized to their curriculum
- Let the champion experience it first
- Show teacher controls and analytics dashboard
- Demonstrate ease of deployment and management

**Act 4: The Evidence (5 min)**
- Share results from similar districts
- Show before/after engagement data
- Present ROI calculations specific to their size
- Reference relevant case studies

**Act 5: The Path Forward (5 min)**
- Propose pilot program structure
- Outline implementation timeline
- Define success metrics together
- Confirm next steps with dates

### Step 3: Demo Customization Checklist
- [ ] Custom demo environment with their district name
- [ ] Subject areas matching their curriculum priorities
- [ ] Grade levels they serve
- [ ] Student demographic considerations
- [ ] Integration points with their existing tools
- [ ] Compliance badges relevant to their state

### Step 4: Technical Preparation
- Test all equipment 24 hours before
- Have backup demo (video) ready
- Prepare for different audience sizes
- Ensure stable internet or have offline capability

## Output Format
Complete demo preparation package:
1. Customized demo script with transitions
2. Talking points per audience member
3. Objection response cards
4. Technical setup checklist
5. Follow-up action plan

## EdTech Application
- Customize XR experiences to state curriculum standards
- Show accessibility features for diverse learners
- Demonstrate teacher dashboard and analytics
- Highlight FERPA/COPPA compliance
- Include professional development support demo',
 ARRAY['proposal-agent'], 10, 45, 'demo_script',
 ARRAY['demo', 'presentation', 'storytelling', 'sales-demo'],
 'gtmagents/gtm-agents', 'v1.0'),

('roi-calculator', 'ROI & Value Quantification', 'Presentation & Demo',
 'Build customized ROI models and value quantification analyses for district decision makers',
 '# ROI & Value Quantification Skill

## Framework: Total Value of Ownership (TVO)

### Step 1: Quantify the Problem (Cost of Inaction)
**Hard Costs:**
- Current EdTech spend per student per year
- Cost of tools being replaced or consolidated
- Teacher time lost to ineffective tools (hourly rate x hours)
- Student remediation costs for learning gaps

**Soft Costs:**
- Opportunity cost of lower student engagement
- Teacher turnover linked to inadequate tools
- Competitive disadvantage vs. peer districts
- Parent/community perception impact

### Step 2: Quantify the Value (Benefits of XR)
**Direct Financial Benefits:**
- Consolidation of multiple tool subscriptions
- Reduction in field trip costs (virtual experiences)
- Professional development efficiency gains
- Reduced remediation needs

**Measurable Outcome Benefits:**
- Student engagement improvement (benchmark: 25-40% increase)
- Test score improvement (benchmark: 10-15% in STEM)
- Teacher satisfaction increase (benchmark: 30% improvement)
- Student attendance improvement for XR days

**Strategic Benefits:**
- STEM/STEAM program differentiation
- College and career readiness advancement
- Equity in access to experiences
- Community and parent engagement boost

### Step 3: Build the ROI Model
**Inputs (customize per district):**
- Number of students
- Number of teachers
- Current EdTech spend
- Average teacher salary (for time calculations)
- Target grade levels and subjects

**Calculations:**
- Total Investment = License + Implementation + PD + Hardware
- Total Value = Hard savings + Soft savings + Outcome value
- ROI = (Total Value - Total Investment) / Total Investment x 100
- Payback Period = Total Investment / Annual Value

### Step 4: Present the Business Case
- Lead with outcomes, not cost
- Compare to cost per student per year ($2-5/student is compelling)
- Show 3-year projection (value compounds over time)
- Benchmark against similar districts
- Include sensitivity analysis (conservative/baseline/optimistic)

## Output Format
Complete ROI package:
1. Customized ROI calculator with inputs
2. 3-year value projection
3. Cost comparison vs alternatives
4. Executive summary (1-page)
5. Detailed appendix with methodology

## EdTech Application
- Frame against per-pupil expenditure benchmarks
- Include ESSER/grant funding offset scenarios
- Show Title IV-A funding eligibility
- Compare to traditional field trip costs
- Calculate PD cost savings from integrated training',
 ARRAY['proposal-agent'], 10, 40, 'roi_analysis',
 ARRAY['roi', 'value', 'business-case', 'financial-analysis'],
 'Prospeda/gtm-skills', 'v1.0'),

('objection-handling', 'Objection Handling Playbook', 'Presentation & Demo',
 'Prepare for and overcome the most common sales objections in K-12 EdTech with structured response frameworks',
 '# Objection Handling Playbook Skill

## Framework: LAER (Listen, Acknowledge, Explore, Respond)

### Common Objections & Response Playbook

**1. "We don''t have the budget."**
- Listen: Understand their budget cycle and constraints
- Acknowledge: "Budget is always a consideration for districts"
- Explore: "When does your next fiscal year start?" / "Are you aware of ESSER/Title IV-A funding?"
- Respond: Show funding options, pilot pricing, cost-per-student breakdown, phased implementation

**2. "We already have an EdTech solution."**
- Listen: What are they using? What do they like/dislike?
- Acknowledge: "That makes sense — you''ve already invested in technology"
- Explore: "How are engagement and outcomes with your current tools?"
- Respond: Position as complement, not replacement. Show differentiation. Offer comparison pilot.

**3. "Our teachers aren''t tech-savvy enough."**
- Listen: What training challenges have they faced?
- Acknowledge: "Teacher readiness is crucial for any technology adoption"
- Explore: "What does your current PD program look like?"
- Respond: Show teacher ease-of-use, built-in PD, implementation support, champion teacher model

**4. "We need to see research/evidence."**
- Listen: What type of evidence matters? (peer-reviewed, case studies, pilot data)
- Acknowledge: "Evidence-based decision making is exactly right"
- Explore: "What specific outcomes are you looking to improve?"
- Respond: Share relevant research, offer pilot with defined metrics, reference similar districts

**5. "The decision isn''t mine alone."**
- Listen: Who else is involved? What''s the process?
- Acknowledge: "Collaborative decision-making leads to better outcomes"
- Explore: "Can you help me understand the approval process?"
- Respond: Offer to present to the committee, provide materials for internal selling, support the champion

**6. "We''re not ready for this technology."**
- Listen: What readiness concerns exist? (infrastructure, training, culture)
- Acknowledge: "Readiness assessment is a smart approach"
- Explore: "What would need to be true for you to feel ready?"
- Respond: Offer readiness assessment, phased implementation, start-small pilot approach

**7. "The timing isn''t right."**
- Listen: What''s driving the timing concern?
- Acknowledge: "Timing matters for successful implementation"
- Explore: "When would be ideal? What needs to happen before then?"
- Respond: Align to their calendar, offer planning now / implementing later, lock in pricing

### Advanced Objection Techniques
- **Feel-Felt-Found**: "I understand how you feel. Others have felt the same way. What they found was..."
- **Boomerang**: Turn the objection into a reason to act
- **Isolate**: "If we could solve [this concern], would you be ready to move forward?"
- **Third-Party Story**: Reference a similar district that had the same concern

## Output Format
Customized objection handling guide with:
1. Top 5 likely objections for this specific prospect
2. LAER responses for each
3. Supporting evidence and stories
4. Reframe strategies
5. Next-step recovery paths

## EdTech Application
- Map objections to EdTech procurement cycle stages
- Prepare funding/grant responses for budget objections
- Create internal champion toolkit for "not my decision" objections
- Build evidence library organized by objection type
- Track objection frequency to improve proactive messaging',
 ARRAY['sdr-agent'], 10, 30, 'objection_playbook',
 ARRAY['objections', 'negotiation', 'closing', 'sales-skills'],
 'gtmagents/gtm-agents', 'v1.0'),

-- Proposal & Closing (3 skills)
('proposal-writing', 'Proposal & RFP Response Writing', 'Proposal & Closing',
 'Write compelling proposals and RFP responses that win K-12 EdTech contracts',
 '# Proposal & RFP Response Writing Skill

## Framework: Winning Proposal Structure

### Step 1: Proposal Planning
- Review RFP requirements thoroughly (compliance matrix)
- Map evaluation criteria to our strengths
- Identify win themes (3-4 differentiators to weave throughout)
- Assign sections and set internal deadlines
- Gather supporting evidence (case studies, data, references)

### Step 2: Executive Summary (Most Important Section)
- Lead with the district''s challenges (show understanding)
- Present the vision of success with XR
- 3 compelling reasons why Ascent XR (win themes)
- Brief evidence of success with similar districts
- Clear call to action and next steps

### Step 3: Technical Solution
- Solution overview aligned to stated requirements
- Implementation approach and timeline
- Integration with existing district infrastructure
- Customization for their specific curriculum
- Scalability and future-proofing

### Step 4: Implementation Plan
- Phase 1: Planning and setup (weeks 1-2)
- Phase 2: Pilot deployment (weeks 3-6)
- Phase 3: Teacher training and PD (weeks 4-8)
- Phase 4: Full rollout (weeks 8-12)
- Phase 5: Ongoing support and optimization
- Include clear milestones and success criteria

### Step 5: Pricing Section
- Clear pricing structure (per-student, per-school, or district-wide)
- Multi-year options with savings
- Implementation and training costs (no hidden fees)
- Optional add-ons clearly separated
- Total cost of ownership comparison

### Step 6: Evidence & References
- 3-5 relevant case studies with measurable outcomes
- Customer testimonials from similar districts
- Research citations supporting XR in education
- Awards and recognition
- Reference contact information

### Step 7: Compliance & Security
- FERPA compliance documentation
- COPPA compliance (if applicable)
- Data privacy practices and policies
- Accessibility compliance (Section 508, WCAG)
- State-specific data privacy agreements

## Output Format
Complete proposal document with:
1. Compliance matrix (RFP requirements mapped to responses)
2. Executive summary (1-2 pages)
3. Full technical solution
4. Implementation timeline
5. Pricing and ROI analysis
6. Case studies and references
7. Compliance documentation

## EdTech Application
- Follow state procurement guidelines
- Address E-Rate and funding compatibility
- Include professional development plan
- Demonstrate alignment to state standards
- Provide student data privacy addendum',
 ARRAY['proposal-agent'], 10, 60, 'proposal_document',
 ARRAY['proposal', 'RFP', 'writing', 'procurement'],
 'Prospeda/gtm-skills', 'v1.0'),

('negotiation-tactics', 'Negotiation & Closing Techniques', 'Proposal & Closing',
 'Navigate complex K-12 procurement negotiations and close deals effectively',
 '# Negotiation & Closing Techniques Skill

## Framework: Principled Negotiation (Getting to Yes)

### Step 1: Preparation
**Know Your Numbers:**
- Walk-away price (minimum acceptable terms)
- Target price (ideal outcome)
- Best alternative (BATNA)
- Value metrics to justify pricing

**Know Their Position:**
- Budget constraints and approval thresholds
- Alternative options they''re considering
- Timeline pressures (funding deadlines, school year start)
- Decision-maker preferences and concerns

### Step 2: Negotiation Tactics

**Value-Based Negotiation:**
- Never negotiate price without discussing value first
- Reframe from "cost" to "investment per student"
- Show ROI before discussing discounts
- Compare to cost of inaction

**Concession Strategy:**
- Never give without getting (trade, don''t cave)
- Make concessions progressively smaller
- Bundle concessions for maximum perceived value
- Always attach conditions to discounts

**Common Trade-Offs:**
| They Want | We Can Offer | In Exchange For |
|-----------|-------------|-----------------|
| Lower price | Volume discount | Multi-year commitment |
| Extended pilot | Free 60-day pilot | Full deployment commitment |
| More features | Premium tier | Case study participation |
| Faster timeline | Dedicated support | Reference customer |

### Step 3: Closing Techniques

**Trial Close:**
"Based on what we''ve discussed, does this solution meet your needs?"

**Summary Close:**
"Let me summarize: you need X, Y, Z — our solution delivers all three at $X per student. Shall we proceed?"

**Calendar Close:**
"To have this ready for the fall semester, we''d need to start the contract process by [date]. Can we target that?"

**Pilot Close:**
"Let''s start with a pilot in 2-3 classrooms. If you see the results, we expand district-wide. Sound fair?"

### Step 4: Handling Price Pushback
1. Reframe to value per student per day
2. Show multi-year savings vs alternatives
3. Offer phased implementation to spread cost
4. Identify applicable funding sources
5. Provide case study showing ROI timeline

## Output Format
Negotiation preparation document:
1. Pricing strategy and boundaries
2. Concession plan with trade-offs
3. Closing approach recommendation
4. Counter-argument preparation
5. Timeline to close

## EdTech Application
- Understand district procurement thresholds (under $X = admin approval, over = board vote)
- Align pricing to available funding sources
- Navigate cooperative purchasing agreements (TIPS, BuyBoard)
- Handle school board presentation requirements
- Time negotiations to budget cycle deadlines',
 ARRAY['crm-specialist'], 8, 35, 'negotiation_plan',
 ARRAY['negotiation', 'closing', 'pricing', 'procurement'],
 'gtmagents/gtm-agents', 'v1.0'),

('pricing-negotiation', 'Pricing Strategy & Packaging', 'Proposal & Closing',
 'Design and present pricing packages that maximize deal value while meeting district budget constraints',
 '# Pricing Strategy & Packaging Skill

## Framework: Value-Based Pricing Architecture

### Step 1: Pricing Model Design
**Per-Student Models:**
- Basic: $2-3/student/year (core XR experiences)
- Professional: $4-6/student/year (full library + analytics)
- Enterprise: $7-10/student/year (custom content + PD + support)

**Per-School Models:**
- Small school (< 500 students): $1,500-3,000/year
- Medium school (500-1,500 students): $3,000-6,000/year
- Large school (1,500+ students): $5,000-10,000/year

**District-Wide Models:**
- Site license: Based on total enrollment
- Unlimited: Flat fee for all schools and students
- Custom: Tailored to specific programs/grades

### Step 2: Packaging Strategy
**Good-Better-Best Framework:**

| Feature | Starter | Professional | Enterprise |
|---------|---------|-------------|------------|
| XR Experiences | 10 core | Full library | Custom + library |
| Analytics | Basic | Advanced | Custom reports |
| PD Training | Self-serve | 2 sessions | Unlimited |
| Support | Email | Priority | Dedicated CSM |
| Integration | None | LMS | Full ecosystem |
| Price anchor | Low | RECOMMENDED | Premium |

### Step 3: Discount Framework
- Multi-year discount: 10% (2yr), 15% (3yr), 20% (4yr+)
- Volume discount: 10% (2-5 schools), 15% (6-10), 20% (11+)
- Funding source bonus: 5% additional if using ESSER before deadline
- Reference discount: 5% for case study participation
- Max total discount: 30% (requires VP approval above this)

### Step 4: Proposal Pricing Presentation
- Lead with the middle option (Professional) as recommended
- Show per-student-per-day cost (makes large numbers feel small)
- Include ROI projection alongside pricing
- Offer annual and multi-year side by side
- Clearly show what''s included vs. add-on

### Step 5: Competitive Pricing Intelligence
- Monitor competitor pricing quarterly
- Maintain comparison matrix for sales team
- Document competitive wins/losses by price point
- Identify pricing objection patterns

## Output Format
Pricing package for the prospect:
1. Customized pricing options (3 tiers)
2. Multi-year projection with savings
3. Per-student-per-day breakdown
4. Comparison to alternatives
5. Funding source recommendations

## EdTech Application
- Align to fiscal year billing (July-June for most districts)
- Offer purchase order and invoicing
- Price within common approval thresholds
- Include Title IV-A, ESSER, E-Rate eligibility notes
- Provide per-student calculation for budget justification',
 ARRAY['proposal-agent'], 9, 30, 'pricing_package',
 ARRAY['pricing', 'packaging', 'discounts', 'revenue'],
 'Prospeda/gtm-skills', 'v1.0'),

-- Account Management (3 skills)
('account-planning', 'Strategic Account Planning', 'Account Management',
 'Develop comprehensive strategic plans for key district accounts to maximize retention and expansion',
 '# Strategic Account Planning Skill

## Framework: LAMP (Land, Adopt, Monetize, Protect)

### Step 1: Account Assessment
**Current State:**
- Products/services currently deployed
- Number of schools, teachers, students using
- Contract value and renewal date
- Usage metrics and engagement scores
- Health score and risk indicators

**Relationship Map:**
- Key contacts and their satisfaction level
- Champion identification and strength
- Executive sponsor engagement
- Detractors or at-risk relationships

### Step 2: Account Growth Strategy

**Land (Expand Footprint):**
- Identify schools/departments not yet using
- Map additional use cases (new subjects, grade levels)
- Cross-sell additional products/services
- Upsell to higher tier

**Adopt (Drive Usage):**
- Usage targets per school/teacher
- Adoption milestones and timeline
- PD and training plan
- Success metrics and reporting cadence

**Monetize (Grow Revenue):**
- Expansion revenue targets for the account
- Upsell/cross-sell opportunities prioritized
- Multi-year renewal with growth built in
- Professional services opportunities

**Protect (Prevent Churn):**
- Risk factors to monitor
- Competitive threats
- Contract renewal strategy (start 6 months early)
- Executive engagement plan

### Step 3: Account Action Plan
For each quarter, define:
- Meetings and touchpoints scheduled
- Content and value to deliver
- Expansion conversations to initiate
- Risks to mitigate
- Success stories to capture

### Step 4: Account Metrics Dashboard
- Net Revenue Retention (NRR): Target 120%+
- Product usage / active users
- Health score trend
- Expansion pipeline
- Time-to-renewal countdown

## Output Format
Strategic account plan with:
1. Account overview and current state
2. Relationship/org chart
3. Growth strategy (LAMP framework)
4. Quarterly action plan
5. Metrics and KPI tracking

## EdTech Application
- Align account plans to school year calendar
- Track budget cycle for expansion timing
- Monitor superintendent/admin changes
- Plan around state testing windows
- Coordinate with teacher champions for internal advocacy',
 ARRAY['crm-specialist'], 9, 45, 'account_plan',
 ARRAY['account-management', 'strategic-planning', 'retention', 'expansion'],
 'OneWave-AI/claude-skills', 'v1.0'),

('qbr-preparation', 'QBR Preparation & Execution', 'Account Management',
 'Prepare and deliver Quarterly Business Reviews that demonstrate value and drive expansion conversations',
 '# QBR Preparation & Execution Skill

## Framework: Value-Driven QBR

### Step 1: Pre-QBR Data Gathering (1 week before)
**Usage Data:**
- Active users (teachers and students)
- Sessions/experiences completed
- Time spent in XR experiences
- Most popular content/experiences
- Adoption trend (growing, stable, declining)

**Outcome Data:**
- Student engagement metrics
- Assessment/performance improvements
- Teacher feedback and satisfaction scores
- Support ticket summary
- Goal achievement vs. targets set last QBR

### Step 2: QBR Deck Structure

**Slide 1: Executive Summary**
- Key wins this quarter (3 bullets)
- Usage highlights (visual chart)
- ROI delivered to date

**Slide 2: Goals Review**
- Goals set last QBR
- Progress against each goal
- Green/yellow/red status

**Slide 3: Usage & Adoption Deep Dive**
- Usage trends (charts)
- School-by-school comparison
- Teacher adoption leaders (celebrate them)
- Areas needing attention

**Slide 4: Student Impact**
- Engagement data
- Learning outcome improvements
- Student and teacher quotes
- Comparison to baseline

**Slide 5: Support & Service**
- Support ticket summary
- Resolution times
- Feature requests and roadmap updates
- Upcoming improvements

**Slide 6: Recommendations & Next Quarter Goals**
- Expansion opportunities identified
- New use cases to explore
- Professional development recommendations
- Proposed goals for next quarter

**Slide 7: Roadmap Preview**
- Upcoming features relevant to their use case
- Beta program opportunities
- Partnership and integration updates

### Step 3: QBR Meeting Facilitation
- Send agenda and data preview 3 days before
- Keep presentation to 30 minutes, reserve 30 for discussion
- Ask questions, don''t just present
- Document action items in real-time
- Confirm next QBR date before leaving

### Step 4: Post-QBR Follow-Up
- Send QBR summary and recording within 24 hours
- Action items with owners and deadlines
- Updated success plan
- Schedule any follow-up meetings

## Output Format
Complete QBR package:
1. Slide deck with data visualizations
2. Discussion guide with key questions
3. Expansion talk track
4. Action item template
5. Follow-up email template

## EdTech Application
- Align QBRs to school calendar (Oct, Jan, Apr, Jun)
- Include state testing correlation data
- Celebrate teacher champions publicly
- Tie usage to district strategic plan goals
- Present data superintendent can share with board',
 ARRAY['crm-specialist'], 9, 40, 'qbr_package',
 ARRAY['QBR', 'business-review', 'account-management', 'retention'],
 'OneWave-AI/claude-skills', 'v1.0'),

('expansion-upsell', 'Expansion & Upsell Playbook', 'Account Management',
 'Identify and execute expansion opportunities within existing district accounts',
 '# Expansion & Upsell Playbook Skill

## Framework: Expand-from-Within

### Step 1: Identify Expansion Signals
**Usage Signals:**
- High adoption rates (>80% of licensed users active)
- Feature limit hits (requesting more experiences, users)
- Usage in non-licensed schools (word-of-mouth spread)
- Requests for additional subjects/grade levels

**Relationship Signals:**
- Champion enthusiasm and internal advocacy
- Executive engagement increase
- Reference/case study willingness
- Unsolicited positive feedback

**Timing Signals:**
- Budget cycle approaching (4-6 months before fiscal year)
- New funding announced (ESSER, grants, bond measures)
- Leadership changes (new superintendent = new priorities)
- Contract renewal approaching (6+ months before)

### Step 2: Expansion Playbooks

**Horizontal Expansion (More Schools):**
1. Identify pilot school success metrics
2. Create peer school comparison data
3. Propose phased expansion (3-5 schools at a time)
4. Offer implementation support for new schools
5. Volume pricing incentive for larger deployment

**Vertical Expansion (More Products/Services):**
1. Identify unmet needs from QBR discussions
2. Demonstrate new capabilities relevant to their goals
3. Offer trial of premium features
4. Bundle services for value pricing
5. Include professional development packages

**Upgrade Expansion (Higher Tier):**
1. Show feature usage that justifies upgrade
2. Calculate ROI of premium features
3. Present upgrade as natural next step
4. Offer upgrade path with minimal disruption
5. Multi-year lock-in incentive

### Step 3: Expansion Conversation Framework
- Open with value delivered: "Your teachers have completed X experiences..."
- Bridge to opportunity: "Based on your success, here''s what we see..."
- Present the expansion: Specific, relevant, data-supported
- Address concerns proactively
- Propose next steps with timeline

### Step 4: Expansion Metrics
- Net Revenue Retention (NRR): Target 120%+
- Expansion rate: % of accounts that expand annually
- Upsell conversion rate
- Average expansion deal size
- Time from pilot to full deployment

## Output Format
Expansion opportunity analysis:
1. Account expansion readiness score
2. Specific expansion opportunities identified
3. Recommended approach and timeline
4. Pricing and packaging for expansion
5. Talk track and objection preparation

## EdTech Application
- Time expansion asks to budget planning season
- Leverage teacher champions for internal advocacy
- Use QBR data to support expansion case
- Offer summer implementation for fall expansion
- Create district-wide vs. school-by-school comparison',
 ARRAY['crm-specialist'], 9, 35, 'expansion_plan',
 ARRAY['expansion', 'upsell', 'cross-sell', 'account-growth'],
 'OneWave-AI/claude-skills', 'v1.0'),

-- Sales Operations (3 skills)
('pipeline-management', 'Pipeline Management & Hygiene', 'Sales Operations',
 'Maintain a clean, accurate pipeline with consistent stage definitions, deal scoring, and forecasting hygiene',
 '# Pipeline Management & Hygiene Skill

## Framework: Pipeline Operating System

### Step 1: Stage Definitions
**Discovery** (10% probability):
- Initial meeting completed
- Basic qualification done
- Contact and district info captured

**Needs Assessment** (25% probability):
- Discovery call completed with MEDDPICC
- Key stakeholders identified
- Pain points and requirements documented

**Proposal** (50% probability):
- Proposal/RFP response submitted
- Pricing discussed and shared
- Technical requirements validated

**Negotiation** (75% probability):
- Terms being actively negotiated
- Budget confirmed and available
- Legal/procurement engaged

**Contract Review** (90% probability):
- Contract sent for signature
- Final approvals in progress
- Implementation planning started

### Step 2: Pipeline Hygiene Rules
**Weekly Pipeline Review Checklist:**
- [ ] Every deal has a next action and date
- [ ] No deal has been in the same stage for >30 days without update
- [ ] All deals >$5K have MEDDPICC score
- [ ] Close dates are realistic (not "end of quarter" default)
- [ ] Lost deals are marked with loss reason
- [ ] Win probability matches stage definition

**Monthly Pipeline Audit:**
- Remove stale deals (no activity in 60+ days)
- Verify contact information is current
- Update deal values based on latest conversations
- Review stage accuracy (deals in wrong stage)
- Recalculate weighted pipeline

### Step 3: Deal Scoring Model
| Factor | Weight | Criteria |
|--------|--------|----------|
| MEDDPICC Score | 30% | Qualification strength |
| Engagement Level | 20% | Recency and frequency of interactions |
| Budget Confirmed | 20% | Is budget identified and available? |
| Timeline Alignment | 15% | Does timeline fit our capacity? |
| Champion Strength | 15% | Active internal advocate? |

### Step 4: Pipeline Metrics
- Pipeline coverage ratio: 3-4x target
- Pipeline velocity: Average days per stage
- Win rate by stage: Track conversion rates
- Average deal size: Trending up or down?
- Pipeline creation rate: New deals per week/month

## Output Format
Pipeline health report:
1. Current pipeline snapshot by stage
2. Deals requiring attention (stale, wrong stage)
3. Pipeline coverage analysis
4. Velocity metrics and trends
5. Recommended actions

## EdTech Application
- Adjust velocity expectations for K-12 sales cycles (3-9 months)
- Track deals by funding source
- Monitor pipeline by school year timing
- Flag deals at risk due to budget cycle changes
- Segment pipeline by district size and state',
 ARRAY['crm-specialist'], 8, 30, 'pipeline_report',
 ARRAY['pipeline', 'CRM', 'hygiene', 'deal-management'],
 'Prospeda/gtm-skills', 'v1.0'),

('sales-forecasting', 'Sales Forecasting Methodology', 'Sales Operations',
 'Build accurate sales forecasts using multiple methodologies and data sources',
 '# Sales Forecasting Methodology Skill

## Framework: Multi-Method Forecast

### Step 1: Bottom-Up Forecast (Deal-Level)
**For each deal in pipeline:**
- Current stage and probability
- Expected close date (validated, not default)
- Deal value (weighted by probability)
- Confidence adjustment (rep assessment)

**Roll-Up Calculation:**
- Best Case = Sum of all deals at 25%+ probability
- Commit = Sum of deals at 75%+ probability
- Worst Case = Sum of deals at 90%+ probability (contract stage only)

### Step 2: Historical Analysis
- Win rate by stage (last 4 quarters)
- Average deal size trending
- Sales cycle length by deal type
- Seasonal patterns (budget cycle impact)
- Close rate by lead source

### Step 3: Pipeline Coverage Analysis
- Required pipeline = Target / Historical win rate
- Current pipeline coverage ratio
- Gap analysis (pipeline shortfall by period)
- New pipeline needed per week to hit target

### Step 4: Forecast Categories
**Closed Won**: Contract signed, revenue confirmed
**Commit**: High confidence, will close this period
**Best Case**: Likely but not certain, some risk factors
**Pipeline**: Possible but significant uncertainty
**Upside**: Stretch opportunities, not in base forecast

### Step 5: Forecast Accuracy Tracking
- Track forecast vs. actual monthly
- Measure forecast accuracy by category
- Identify systematic biases (over/under-forecasting)
- Improve methodology based on accuracy data

### Step 6: Scenario Planning
**Conservative**: Only committed + 50% of best case
**Baseline**: Committed + 75% of best case + 25% of pipeline
**Optimistic**: Committed + best case + 50% of pipeline

## Output Format
Sales forecast report:
1. Revenue forecast by category (commit/best case/pipeline)
2. Quarterly roll-up with monthly breakdown
3. Pipeline coverage analysis
4. Risk factors and scenarios
5. Actions needed to hit target

## EdTech Application
- Account for K-12 budget cycle seasonality
- Factor in ESSER funding deadlines
- Weight pipeline by funding source certainty
- Adjust for summer slowdown periods
- Track fiscal year vs. school year pipeline',
 ARRAY['crm-specialist'], 8, 35, 'forecast_report',
 ARRAY['forecasting', 'revenue', 'pipeline', 'planning'],
 'Prospeda/gtm-skills', 'v1.0'),

('win-loss-analysis', 'Win/Loss Analysis & Learning', 'Sales Operations',
 'Systematically analyze won and lost deals to improve win rates and sales effectiveness',
 '# Win/Loss Analysis & Learning Skill

## Framework: Structured Win/Loss Review

### Step 1: Data Collection
**For Every Closed Deal (Won or Lost):**
- Deal size and timeline
- Competitors involved
- Key decision factors (from buyer''s perspective)
- Stakeholders involved in decision
- Sales process steps completed
- Pricing and terms proposed/accepted

**Win/Loss Interview (Ideal):**
- Request 15-minute debrief with buyer
- Use neutral third party if possible
- Ask open-ended questions about decision process
- Focus on "what" not "why" (less defensive)

### Step 2: Analysis Framework

**Product/Solution Fit:**
- Did our solution meet their stated requirements?
- Were there feature gaps that hurt us?
- How did integration capabilities factor in?

**Sales Process:**
- Did we follow our methodology?
- Were all stakeholders engaged?
- Was discovery thorough enough?
- Did we demo effectively?

**Pricing & Value:**
- Was pricing competitive?
- Did we effectively communicate value?
- Were packaging/terms appropriate?

**Competitive:**
- Who did we lose to and why?
- What did the winner do differently?
- What competitive advantages played out?

**Relationship & Trust:**
- Did we have the right champion?
- Was executive engagement adequate?
- How was our responsiveness perceived?

### Step 3: Pattern Identification
Across multiple deals, identify:
- Common win factors (what we do when we win)
- Common loss factors (what happens when we lose)
- Competitive patterns (where we win/lose vs specific competitors)
- Pricing patterns (deal size sweet spot)
- Process patterns (which activities correlate with wins)

### Step 4: Action Planning
For each insight, define:
- Specific change to make (process, messaging, pricing, etc.)
- Owner responsible for implementation
- Timeline for implementation
- How to measure improvement

## Output Format
Win/Loss analysis report:
1. Deal summary and outcome
2. Analysis across all five dimensions
3. Key insights and patterns
4. Competitive intelligence gathered
5. Recommended improvements

## EdTech Application
- Analyze wins/losses by district size and region
- Track impact of ESSER funding on win rates
- Compare pilot-to-purchase conversion factors
- Assess competitive positioning vs EdTech incumbents
- Identify most effective champion profiles in K-12',
 ARRAY['crm-specialist'], 9, 40, 'analysis_report',
 ARRAY['win-loss', 'analysis', 'competitive', 'improvement'],
 'gtmagents/gtm-agents', 'v1.0'),

-- K-12 EdTech Specialization (3 skills)
('district-buying-cycles', 'K-12 District Buying Cycles', 'K-12 EdTech Specialization',
 'Navigate the complex K-12 district procurement and budget cycles to time sales activities for maximum success',
 '# K-12 District Buying Cycles Skill

## Framework: District Fiscal Year Sales Calendar

### The K-12 Budget Cycle (July-June Fiscal Year)

**July-August: New Fiscal Year**
- New budgets are active — purchase orders can flow
- Summer PD is happening — demo opportunities
- Implementation window for fall deployment
- Best time for expansion of existing accounts

**September-October: Settling In**
- Teachers focused on start-of-year — harder to get attention
- Tech directors evaluating fall deployments
- Good time for QBRs on existing accounts
- Start relationship building for next budget cycle

**November-December: Evaluation Period**
- Pilot results being evaluated
- Mid-year budget reviews
- Holiday slowdown — limited meetings
- Good time for internal planning and pipeline cleanup

**January-March: Budget Planning Season (CRITICAL)**
- Districts planning next fiscal year budget
- This is when technology decisions are influenced
- RFPs and RFIs are issued
- School board budget workshops
- **Peak time for sales presentations and proposals**

**April-May: Budget Approval**
- School boards vote on budgets
- Final purchasing decisions for current fiscal year
- Contracts signed for next year
- Use-it-or-lose-it spending on remaining budget

**June: Year-End Sprint**
- Fiscal year ending — last chance for current year purchases
- Purchase orders must be issued before June 30
- Teachers available for summer PD planning
- Transition meetings for changing administrators

### Key Sales Activities by Period
| Period | Primary Activity | Secondary Activity |
|--------|------------------|-------------------|
| Jul-Aug | Close & implement | Expand existing accounts |
| Sep-Oct | Build relationships | Conduct QBRs |
| Nov-Dec | Evaluate pilots | Plan next year''s pipeline |
| Jan-Mar | Present & propose | Respond to RFPs |
| Apr-May | Close deals | Negotiate contracts |
| Jun | Year-end close | Summer planning |

### Budget Decision Triggers
- New superintendent = new technology vision
- State mandate = funded requirement
- Bond measure passed = capital budget available
- Federal funding announcement = additional funds
- Failed audit/compliance = urgency to act

## Output Format
Customized sales calendar:
1. Monthly activity plan aligned to district buying cycle
2. Key dates and deadlines by state
3. Trigger events to monitor
4. Outreach timing recommendations
5. Pipeline milestone targets by month

## EdTech Application
- Map to specific state fiscal year variations
- Track board meeting schedules for target districts
- Monitor state education budget announcements
- Align marketing campaigns to buying cycle phases
- Create urgency around funding deadlines',
 ARRAY['sdr-agent'], 10, 35, 'sales_calendar',
 ARRAY['k-12', 'buying-cycle', 'budget', 'procurement', 'fiscal-year'],
 'Prospeda/gtm-skills', 'v1.0'),

('funding-navigation', 'ESSER & Federal Funding Navigation', 'K-12 EdTech Specialization',
 'Help districts identify, access, and allocate federal and state funding for EdTech purchases',
 '# ESSER & Federal Funding Navigation Skill

## Framework: Funding Source Navigator

### Federal Funding Sources for EdTech

**1. ESSER (Elementary & Secondary School Emergency Relief)**
- ESSER I: Most funds expended
- ESSER II: Deadline extended in many states
- ESSER III (ARP): Largest allocation, deadline September 2025
- **Eligible Uses**: Technology for learning acceleration, addressing learning loss
- **Key Strategy**: Help districts justify XR as learning acceleration tool
- **Status**: Track remaining funds by district

**2. Title IV-A (Student Support & Academic Enrichment)**
- Annual allocation per district
- Three buckets: Well-Rounded Education, Safe/Healthy, Technology
- Technology bucket funds EdTech purchases directly
- Typically $10K-$100K per district depending on size

**3. Title II-A (Supporting Effective Instruction)**
- Professional development funding
- Can fund teacher training on XR technology
- Pair with technology purchase from another source

**4. E-Rate Program**
- Funds internet connectivity and networking
- Can support infrastructure needed for XR deployment
- Application window: January-March annually

**5. State-Level Grants**
- Vary by state — research specific to prospect''s state
- STEM/STEAM grants often applicable
- Innovation and technology transformation grants
- Rural education technology grants

### Step 1: Funding Assessment
For each district prospect:
- Check ESSER allocation and remaining balance
- Identify Title IV-A allocation
- Research state-specific grant programs
- Determine E-Rate discount percentage
- Review recent bond measures or levy results

### Step 2: Funding Alignment Strategy
- Map XR solution to specific funding requirements
- Prepare funding justification language
- Provide sample budget narratives
- Create allowable use documentation
- Offer grant-writing support or templates

### Step 3: Funding Urgency Messaging
- "X% of your ESSER funds remain unallocated"
- "Title IV-A funds reset annually — use it or lose it"
- "This grant application window closes [date]"
- Frame as: "We help districts maximize their funding impact"

### Step 4: Procurement Support
- Help complete required documentation
- Provide W-9, certificates of insurance
- Assist with sole-source justification (if applicable)
- Support cooperative purchasing processes
- Navigate state-specific procurement rules

## Output Format
Funding navigation package:
1. District-specific funding analysis
2. Eligible funding sources with amounts
3. Budget narrative templates
4. Procurement documentation checklist
5. Timeline aligned to application deadlines

## EdTech Application
- Maintain updated database of funding deadlines by state
- Create funding calculator for sales team
- Train sales team on funding conversations
- Partner with grant writers for larger opportunities
- Track funding expiration dates as urgency triggers',
 ARRAY['proposal-agent'], 10, 45, 'funding_guide',
 ARRAY['funding', 'ESSER', 'grants', 'Title-IV', 'procurement'],
 'Prospeda/gtm-skills', 'v1.0'),

('pilot-to-purchase', 'Pilot-to-Purchase Conversion', 'K-12 EdTech Specialization',
 'Design and execute pilot programs that systematically convert to full district purchases',
 '# Pilot-to-Purchase Conversion Skill

## Framework: Success-Driven Pilot Design

### Step 1: Pilot Structure Design
**Pilot Parameters:**
- Duration: 6-8 weeks (enough for data, not too long to lose momentum)
- Scope: 2-4 classrooms, 1-2 schools, specific subjects/grades
- Investment: $2,000-5,000 (low barrier, high perceived value)
- Success Metrics: Defined upfront and agreed upon

**Pilot Agreement Template:**
- Schools and classrooms participating
- Duration and timeline
- Success criteria (specific, measurable)
- Data collection methodology
- Decision meeting date (locked in at start)
- Path to full deployment if successful

### Step 2: Pre-Pilot Setup (Week 0)
- Technical setup and testing
- Teacher training (2-hour session minimum)
- Baseline data collection (pre-assessments, engagement scores)
- Communication to parents and administrators
- Project plan with weekly milestones

### Step 3: During Pilot (Weeks 1-6)
**Week 1: Launch & Support**
- Daily check-ins with pilot teachers
- Rapid response to any issues
- Collect initial impressions

**Weeks 2-4: Monitor & Optimize**
- Weekly usage data review
- Teacher feedback sessions
- Student engagement observations
- Address any adoption barriers
- Share early wins with administrators

**Weeks 5-6: Document & Prepare**
- Collect post-assessments
- Teacher satisfaction surveys
- Student feedback (age-appropriate)
- Compile usage and outcome data
- Prepare pilot results presentation

### Step 4: Pilot Results Presentation
**Structure:**
1. Pilot overview (scope, participants, duration)
2. Usage data (adoption, engagement, completion)
3. Outcome data (before/after comparisons)
4. Teacher testimonials and quotes
5. Student feedback highlights
6. ROI projection for full deployment
7. Recommended next steps and timeline
8. Pricing for full deployment

### Step 5: Conversion Tactics
- Present results within 2 weeks of pilot end
- Include champion teacher in presentation
- Show side-by-side: pilot school vs non-pilot outcomes
- Create urgency: "Lock in pilot pricing for 30 days"
- Offer seamless expansion (no re-implementation)
- Provide board presentation support if needed

### Step 6: Pilot Metrics
- Pilot acceptance rate: % of proposals accepted
- Pilot completion rate: % that run full duration
- Pilot-to-purchase conversion rate: Target 60%+
- Average time from pilot end to purchase: Target 45 days
- Average expansion multiplier: 10-20x pilot size

## Output Format
Pilot program package:
1. Pilot proposal customized for district
2. Success criteria framework
3. Weekly monitoring plan
4. Results presentation template
5. Conversion strategy and timeline

## EdTech Application
- Time pilot to avoid testing windows
- Include teacher PD as part of pilot value
- Plan pilot completion before budget deadlines
- Involve administrators in classroom observations
- Create shareable artifacts for board presentations',
 ARRAY['sdr-agent'], 10, 40, 'pilot_plan',
 ARRAY['pilot', 'trial', 'conversion', 'proof-of-concept'],
 'gtmagents/gtm-agents', 'v1.0'),

-- Sales Enablement (2 skills)
('battle-cards', 'Competitive Battle Cards', 'Sales Enablement',
 'Create and maintain competitive intelligence battle cards for the sales team',
 '# Competitive Battle Cards Skill

## Framework: Competitive Intelligence System

### Step 1: Competitor Identification
**Direct Competitors** (XR/VR in Education):
- Identify companies offering similar XR learning experiences
- Map their target market, pricing, and positioning
- Assess their market share and growth trajectory

**Indirect Competitors** (Alternative Solutions):
- Traditional EdTech platforms (non-XR)
- DIY/open-source VR content
- Hardware-only vendors (no content)
- Status quo (no change)

### Step 2: Battle Card Structure (Per Competitor)

**Quick Facts:**
- Company overview (size, funding, age)
- Target market and customer base
- Pricing model and range
- Key product capabilities

**Their Strengths** (Be Honest):
- What do they do well?
- Where are they ahead of us?
- What do customers love about them?

**Their Weaknesses** (Be Fair):
- Known limitations or gaps
- Customer complaints or issues
- Technical or operational weaknesses
- Service or support shortcomings

**Our Differentiation:**
- Specific advantages we have
- Feature comparisons (apples-to-apples)
- Customer outcome differences
- Service/support advantages

**Talk Track:**
When a prospect mentions [Competitor]:
1. Acknowledge: "They''re a solid company..."
2. Differentiate: "Where we differ is..."
3. Evidence: "Our customers have seen..."
4. Redirect: "What matters most to your district is..."

**Trap Questions** (Questions that expose their weakness):
- "Ask them about [specific capability they lack]..."
- "Request a reference from a district your size..."
- "Ask about their [known pain point]..."

**Landmines** (Questions they might ask to hurt us):
- Prepare response for each known competitive attack
- Counter with evidence and customer references

### Step 3: Competitive Intelligence Gathering
- Monitor competitor websites and product updates
- Track their job postings (reveals strategy)
- Attend their webinars and read their content
- Gather feedback from prospects who''ve seen their demo
- Review G2/Capterra/EdSurge reviews

### Step 4: Battle Card Maintenance
- Update monthly with new intelligence
- Add win/loss insights in real-time
- Track competitive win rate by competitor
- Share new intelligence with team immediately
- Quarterly deep-dive competitive review

## Output Format
Complete battle card set:
1. One-page battle card per competitor
2. Quick reference comparison matrix
3. Talk tracks for each competitive scenario
4. Trap questions and landmine responses
5. Competitive win/loss analysis summary

## EdTech Application
- Focus on EdTech-specific competitors in XR space
- Include compliance comparison (FERPA, COPPA, accessibility)
- Map competitor presence at key conferences
- Track competitor wins/losses in target districts
- Monitor EdSurge, THE Journal, District Administration for mentions',
 ARRAY['proposal-agent'], 9, 35, 'battle_cards',
 ARRAY['competitive-intelligence', 'battle-cards', 'competitors', 'differentiation'],
 'OneWave-AI/claude-skills', 'v1.0'),

('call-coaching', 'Sales Call Review & Coaching', 'Sales Enablement',
 'Review recorded sales calls and provide structured coaching feedback to improve sales skills',
 '# Sales Call Review & Coaching Skill

## Framework: SCORE Call Coaching

### S - Structure Review
- Did the call follow a logical structure?
- Was there a clear agenda set?
- Were time boundaries respected?
- Was there a next-step commitment?

### C - Communication Quality
**Listening:**
- Talk-to-listen ratio (target: 40% talk, 60% listen)
- Active listening indicators (paraphrasing, follow-up questions)
- Did they let the prospect finish speaking?

**Questioning:**
- Open-ended vs closed questions ratio
- Question depth (surface vs insight-generating)
- Did questions follow a logical progression?
- Were responses used to drive deeper conversation?

**Delivery:**
- Pace and energy level
- Confidence and authority
- Empathy and rapport building
- Clarity of value proposition delivery

### O - Opportunity Advancement
- Was qualification information gathered?
- Were next steps clearly defined?
- Was urgency established?
- Was the deal moved forward?

### R - Response Handling
- How were objections handled?
- Were competitive mentions addressed effectively?
- Was pricing discussed appropriately?
- Were difficult questions managed well?

### E - Execution of Methodology
- Was SPIN/discovery framework followed?
- Were MEDDPICC elements addressed?
- Was the value proposition effectively communicated?
- Were case studies or evidence shared?

### Coaching Output Structure

**Strengths (2-3 specific):**
- What went well with specific examples
- Skills that should be maintained
- Techniques to replicate

**Areas for Improvement (2-3 specific):**
- What could be improved with specific examples
- How to handle it differently next time
- Practice exercises to develop the skill

**Action Items:**
- Specific behaviors to change or adopt
- Practice scenarios before next call
- Resources for skill development

### Call Scoring (1-10)
| Category | Score | Notes |
|----------|-------|-------|
| Structure | /10 | |
| Communication | /10 | |
| Opportunity Advancement | /10 | |
| Response Handling | /10 | |
| Methodology Execution | /10 | |
| **Overall** | **/50** | |

## Output Format
Call coaching report:
1. Call summary and context
2. SCORE analysis with specific examples
3. Top 3 strengths with evidence
4. Top 3 improvement areas with recommendations
5. Action items and practice exercises

## EdTech Application
- Evaluate education-specific terminology usage
- Assess empathy for educator challenges
- Review handling of funding/budget conversations
- Check curriculum alignment messaging
- Evaluate compliance and safety messaging delivery',
 ARRAY['sdr-agent'], 8, 30, 'coaching_report',
 ARRAY['coaching', 'call-review', 'sales-skills', 'development'],
 'OneWave-AI/claude-skills', 'v1.0')

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

-- 1. New District Prospecting Campaign (6 steps, 215min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'New District Prospecting Campaign',
  'district-prospecting-campaign',
  'Full district prospecting playbook: understand buying cycles, map stakeholders, launch cold outreach, engage on LinkedIn, run discovery calls, and qualify leads. Designed for new K-12 district targets.',
  'Prospecting',
  215
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('district-buying-cycles', 1, 'sdr-agent'),
  ('stakeholder-mapping', 2, 'crm-specialist'),
  ('cold-outreach', 3, 'sdr-agent'),
  ('social-selling', 4, 'sdr-agent'),
  ('discovery-call', 5, 'sdr-agent'),
  ('lead-qualification', 6, 'sdr-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'district-prospecting-campaign'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 2. Pilot-to-Purchase Conversion (6 steps, 260min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Pilot-to-Purchase Conversion',
  'pilot-to-purchase-conversion',
  'Convert pilot programs to full district purchases: assess needs, build ROI case, prepare demo, write proposal, negotiate terms, and package pricing.',
  'Closing',
  260
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('needs-assessment', 1, 'sdr-agent'),
  ('roi-calculator', 2, 'proposal-agent'),
  ('demo-preparation', 3, 'proposal-agent'),
  ('proposal-writing', 4, 'proposal-agent'),
  ('negotiation-tactics', 5, 'crm-specialist'),
  ('pricing-negotiation', 6, 'proposal-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'pilot-to-purchase-conversion'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 3. Conference Lead Follow-up (5 steps, 225min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Conference Lead Follow-up',
  'conference-lead-followup',
  'Maximize ROI from education conference leads: execute conference selling playbook, qualify leads, run discovery, prepare customized demos, and write proposals.',
  'Events',
  225
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('conference-selling', 1, 'sdr-agent'),
  ('lead-qualification', 2, 'sdr-agent'),
  ('discovery-call', 3, 'sdr-agent'),
  ('demo-preparation', 4, 'proposal-agent'),
  ('proposal-writing', 5, 'proposal-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'conference-lead-followup'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 4. Renewal & Expansion Play (5 steps, 195min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Renewal & Expansion Play',
  'renewal-expansion-play',
  'Drive account growth and retention: build strategic account plans, deliver QBRs, execute expansion playbooks, optimize pricing, and learn from outcomes.',
  'Account Mgmt',
  195
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('account-planning', 1, 'crm-specialist'),
  ('qbr-preparation', 2, 'crm-specialist'),
  ('expansion-upsell', 3, 'crm-specialist'),
  ('pricing-negotiation', 4, 'proposal-agent'),
  ('win-loss-analysis', 5, 'crm-specialist')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'renewal-expansion-play'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 5. Quick Win: Discovery Call Prep (3 steps, 120min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Quick Win: Discovery Call Prep',
  'quick-discovery-call-prep',
  'Rapid preparation for an upcoming discovery call: map stakeholders, assess needs, and prepare a customized discovery framework.',
  'Quick Win',
  120
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('stakeholder-mapping', 1, 'crm-specialist'),
  ('needs-assessment', 2, 'sdr-agent'),
  ('discovery-call', 3, 'sdr-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'quick-discovery-call-prep'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;

-- 6. Quick Win: Competitive Deal (2 steps, 65min)
INSERT INTO sales_workflows (name, slug, description, category, estimated_total_minutes)
VALUES (
  'Quick Win: Competitive Deal',
  'quick-competitive-deal',
  'Quick preparation for a competitive deal: review battle cards and prepare objection handling playbook.',
  'Quick Win',
  65
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_total_minutes = EXCLUDED.estimated_total_minutes,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO sales_workflow_steps (workflow_id, skill_id, step_order, agent_id)
SELECT w.id, s.skill_id_ref, step_data.step_order, step_data.agent_id
FROM (VALUES
  ('battle-cards', 1, 'proposal-agent'),
  ('objection-handling', 2, 'sdr-agent')
) AS step_data(skill_slug, step_order, agent_id)
JOIN sales_workflows w ON w.slug = 'quick-competitive-deal'
JOIN (SELECT id AS skill_id_ref, skill_id AS slug FROM sales_skills) s ON s.slug = step_data.skill_slug
ON CONFLICT (workflow_id, step_order) DO NOTHING;
