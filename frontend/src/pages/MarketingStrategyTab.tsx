import { useState, useEffect, useRef } from 'react';
import {
  Linkedin, Mail, Calendar, Bot, Target,
  TrendingUp, Phone, MousePointerClick, Eye,
  MessageSquare, Clock, CheckCircle2, AlertCircle,
  ChevronRight, ArrowRight, School, GraduationCap,
  Building2, Landmark, Send, Flame, User, Wrench,
  FileText, DollarSign, MapPin, Briefcase, Zap, Users
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────
const REVENUE_TARGET = 300000;
const REVENUE_CURRENT = 47500;
const REVENUE_GAP = REVENUE_TARGET - REVENUE_CURRENT;
const DEADLINE = new Date('2026-06-30');
const START = new Date('2026-03-18');
const DAYS_REMAINING = Math.ceil((DEADLINE.getTime() - START.getTime()) / 86400000);
const MONTHLY_RATE = Math.round(REVENUE_GAP / (DAYS_REMAINING / 30));
const PROGRESS_PCT = (REVENUE_CURRENT / REVENUE_TARGET) * 100;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IC = React.ElementType<any>;

// ─── Data ──────────────────────────────────────────────────────
const waterfallItems = [
  { label: 'Existing Revenue', amount: 47500, detail: 'Booked to date', color: '#6366f1', icon: CheckCircle2 as IC },
  { label: 'School Upgrades', amount: 80000, detail: '40 schools x $2K', color: '#0052cc', icon: School as IC },
  { label: 'District Deals', amount: 120000, detail: '8 districts x $15K', color: '#2563eb', icon: Building2 as IC },
  { label: 'Teacher Pro', amount: 29850, detail: '150 teachers x $199', color: '#14b8a6', icon: GraduationCap as IC },
  { label: 'ESC Bulk', amount: 30000, detail: '3 ESCs x $10K', color: '#8b5cf6', icon: Landmark as IC },
];

const channels = [
  { name: 'Direct Outreach', effort: 60, desc: 'Reactivate 200 existing schools + cold outreach to OH, IL, MI districts', metric: '100/wk', metricLabel: 'Emails', icon: Send as IC, color: '#0052cc' },
  { name: 'LinkedIn Content', effort: 20, desc: '3x/week posts: outcomes, teacher tips, admin ROI, culture', metric: '3/wk', metricLabel: 'Posts', icon: Linkedin as IC, color: '#0a66c2' },
  { name: 'Email Sequences', effort: 15, desc: 'Free->Pro conversion, demo nurture, school reactivation', metric: '3', metricLabel: 'Sequences', icon: Mail as IC, color: '#14b8a6' },
  { name: 'Events', effort: 5, desc: 'ESC presentations, monthly webinars, ISTE 2026', metric: '1/mo', metricLabel: 'Webinars', icon: Calendar as IC, color: '#8b5cf6' },
];

const contentCalendar = [
  { day: 'Mon 3/18', pillar: 'outcomes', title: '76% higher retention with spatial learning...', color: '#22c55e' },
  { day: 'Wed 3/20', pillar: 'teacher', title: 'Start spatial learning today. Free. No headset needed.', color: '#3b82f6' },
  { day: 'Fri 3/22', pillar: 'admin', title: 'Title IV-A funds \u2192 spatial learning before June 30', color: '#f59e0b' },
  { day: 'Mon 3/23', pillar: 'outcomes', title: "Annie O'Rourke testimonial - HSE Schools", color: '#22c55e' },
  { day: 'Wed 3/25', pillar: 'teacher', title: '3 ways to use Learning Time with just Chromebooks', color: '#3b82f6' },
  { day: 'Fri 3/27', pillar: 'culture', title: 'Why we dropped "VR" from our name', color: '#a855f7' },
];

const pillarLegend = [
  { name: 'Student Outcomes', pct: 40, color: '#22c55e' },
  { name: 'Teacher Support', pct: 30, color: '#3b82f6' },
  { name: 'Admin / ROI', pct: 20, color: '#f59e0b' },
  { name: 'Culture', pct: 10, color: '#a855f7' },
];

const agentTasks = [
  { agent: 'content-creator', role: 'Content Creator', tasks: ['Draft 3 LinkedIn posts/week', 'Write 3 email sequences (9-12 emails)'], frequency: '3x/week + one-time', status: 'active' as const, color: '#3b82f6' },
  { agent: 'sdr-agent', role: 'SDR Agent', tasks: ['Build 200-school target list', 'Send 20 outreach emails/day'], frequency: 'Daily', status: 'active' as const, color: '#0052cc' },
  { agent: 'crm-specialist', role: 'CRM Specialist', tasks: ['Track pipeline deals', 'Update stages, flag stale deals'], frequency: 'Daily', status: 'active' as const, color: '#14b8a6' },
  { agent: 'proposal-agent', role: 'Proposal Agent', tasks: ['Create district quote template', 'Prepare DPA package'], frequency: 'One-time', status: 'pending' as const, color: '#f59e0b' },
  { agent: 'analytics-agent', role: 'Analytics Agent', tasks: ['Weekly pipeline report', 'Conversion metrics dashboard'], frequency: 'Weekly', status: 'scheduled' as const, color: '#8b5cf6' },
  { agent: 'cs-agent', role: 'CS Agent', tasks: ['Onboard free-trial signups', 'Track activation rates'], frequency: 'Daily', status: 'scheduled' as const, color: '#ec4899' },
  { agent: 'brand-agent', role: 'Brand Agent', tasks: ['Audit outbound for "Learning Time" consistency'], frequency: 'Ongoing', status: 'active' as const, color: '#f97316' },
  { agent: 'partner-agent', role: 'Partner Agent', tasks: ['Reach out to 3 target ESCs', 'Arrange bulk presentation opportunities'], frequency: 'This week', status: 'pending' as const, color: '#06b6d4' },
];

const timeline = [
  { week: 'Wk 1-2', label: 'Reactivation Blast', detail: 'Email 200 existing VR schools', type: 'blast' as const },
  { week: 'Wk 3-4', label: 'Follow-Up Wave', detail: 'Phone/email warm leads from blast', type: 'followup' as const },
  { week: 'Wk 5+', label: 'Steady Outreach', detail: '20 new cold emails/day ongoing', type: 'ongoing' as const },
  { week: 'Apr', label: 'Webinar #1', detail: 'Spatial Learning in Your Classroom', type: 'event' as const },
  { week: 'May', label: 'Webinar #2', detail: 'Title IV-A procurement how-to', type: 'event' as const },
  { week: 'Jun', label: 'Close Sprint', detail: 'Final push - budget deadline June 30', type: 'blast' as const },
];

const kpiTargets = [
  { label: 'Outreach Emails', value: '100/wk', icon: Send as IC, color: '#0052cc' },
  { label: 'Demo Calls', value: '10/wk', icon: Phone as IC, color: '#14b8a6' },
  { label: 'Free Trial Signups', value: '20/wk', icon: MousePointerClick as IC, color: '#22c55e' },
  { label: 'Pipeline Added', value: '$50K/wk', icon: TrendingUp as IC, color: '#f59e0b' },
  { label: 'Deals Closed', value: '3-5/wk', icon: Target as IC, color: '#DC1625' },
  { label: 'LinkedIn Impressions', value: '2K/wk', icon: Eye as IC, color: '#0a66c2' },
  { label: 'Contact Submissions', value: '5/wk', icon: MessageSquare as IC, color: '#8b5cf6' },
];

const targetSegments = [
  { segment: '~200 Existing VR Schools', size: '200', whyNow: 'Already know you, need device-agnostic upgrade pitch', deal: '$1,500-2,500/school', priority: 'critical' },
  { segment: 'Indiana ESC Contacts', size: '50+ districts', whyNow: "Jim's warm relationships, spring budget window", deal: '$5-10/student', priority: 'high' },
  { segment: 'DonorsChoose Teachers', size: 'Unlimited', whyNow: 'Self-funding, no admin approval needed', deal: '$199/teacher', priority: 'medium' },
  { segment: 'Cold: OH, IL, MI Districts', size: '500+', whyNow: 'Adjacent states, same budget cycle', deal: '$5-10/student', priority: 'medium' },
];

const emailSequences = [
  {
    name: 'Free Trial \u2192 Teacher Pro',
    trigger: 'Free signup',
    emails: [
      { day: 0, subject: 'Welcome + quick-start guide' },
      { day: 3, subject: 'How Ms. [Teacher] used Learning Time in her first week' },
      { day: 7, subject: 'Unlock unlimited lessons - Teacher Pro is $199/year' },
      { day: 14, subject: 'Your free lesson expires in 16 days - upgrade now' },
    ],
    color: '#22c55e',
  },
  {
    name: 'Contact Form \u2192 Demo',
    trigger: 'Contact submission',
    emails: [
      { day: 0, subject: 'Thanks for reaching out - here\'s a calendar link' },
      { day: 2, subject: 'Follow-up if no booking' },
      { day: 5, subject: 'Case study relevant to their role' },
    ],
    color: '#3b82f6',
  },
  {
    name: 'School Reactivation',
    trigger: 'Existing school blast',
    emails: [
      { day: 0, subject: 'Learning Time works on every device now' },
      { day: 3, subject: 'Pricing comparison: VR-only vs. new pricing' },
      { day: 7, subject: "Let's schedule 15 minutes to show you what's new" },
    ],
    color: '#f59e0b',
  },
];

// ─── Animated Arc ──────────────────────────────────────────────
function RevenueArc() {
  const [animatedPct, setAnimatedPct] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(eased * PROGRESS_PCT);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = 100, lw = 12;
    const sa = 0.75 * Math.PI, ea = 2.25 * Math.PI, ta = ea - sa;

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, ea);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

    for (let i = 0; i <= 10; i++) {
      const a = sa + (ta * i) / 10;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (r - lw / 2 - 4), cy + Math.sin(a) * (r - lw / 2 - 4));
      ctx.lineTo(cx + Math.cos(a) * (r - lw / 2 - (i % 5 === 0 ? 12 : 7)), cy + Math.sin(a) * (r - lw / 2 - (i % 5 === 0 ? 12 : 7)));
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = i % 5 === 0 ? 2 : 1; ctx.stroke();
    }

    const pa = sa + ta * (animatedPct / 100);
    const grad = ctx.createLinearGradient(0, size, size, 0);
    grad.addColorStop(0, '#0052cc'); grad.addColorStop(0.5, '#2563eb'); grad.addColorStop(1, '#60a5fa');
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, pa); ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, pa); ctx.strokeStyle = 'rgba(37,99,235,0.3)'; ctx.lineWidth = lw + 8; ctx.lineCap = 'round'; ctx.stroke();

    if (animatedPct > 0) {
      const dx = cx + Math.cos(pa) * r, dy = cy + Math.sin(pa) * r;
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(dx, dy, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(37,99,235,0.4)'; ctx.fill();
    }
  }, [animatedPct]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <span className="text-3xl font-black text-white tracking-tight font-mono">${(REVENUE_CURRENT / 1000).toFixed(1)}K</span>
        <span className="text-[10px] text-gray-400 mt-0.5">of $300K target</span>
        <span className="text-base font-bold text-blue-400 mt-0.5">{animatedPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ─── Waterfall ─────────────────────────────────────────────────
function WaterfallChart() {
  const total = waterfallItems.reduce((s, i) => s + i.amount, 0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-2.5">
      {waterfallItems.map((item, i) => {
        const pct = (item.amount / total) * 100;
        const Icon = item.icon;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${item.color}22` }}>
                  <Icon size={12} style={{ color: item.color }} />
                </div>
                <span className="text-xs text-gray-300 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">{item.detail}</span>
                <span className="text-xs font-bold font-mono text-white">${(item.amount / 1000).toFixed(item.amount % 1000 === 0 ? 0 : 1)}K</span>
              </div>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: visible ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`, transitionDelay: `${i * 150}ms`, boxShadow: `0 0 10px ${item.color}44` }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-xs font-semibold text-gray-400">Total Pipeline</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black font-mono text-white">${(total / 1000).toFixed(1)}K</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">On Track</span>
        </div>
      </div>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────
function AgentStatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${s[status] || s.scheduled}`}>{status}</span>;
}

// ─── Main Tab Component ────────────────────────────────────────
export default function MarketingStrategyTab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const fade = (delay: number) => `transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`;

  return (
    <div className="space-y-4">
      {/* ── Subtitle ──────────────────────────────────── */}
      <div className={fade(0)}>
        <div className="bg-gradient-to-r from-[#0052cc]/10 to-[#DC1625]/10 border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
          <Zap size={16} className="text-blue-400 shrink-0" />
          <span className="text-sm text-gray-300"><span className="font-bold text-white">Spring 2026 Revenue Sprint</span> — 90-day campaign to close $252.5K gap before June 30 budget deadline</span>
        </div>
      </div>

      {/* ── Row 1: Revenue Arc + Channel Cards ────────── */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 ${fade(50)}`}>
        <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 flex flex-col items-center">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2 self-start">Revenue Target</h3>
          <RevenueArc />
          <div className="grid grid-cols-3 gap-2 w-full mt-2">
            <div className="text-center">
              <div className="text-base font-black font-mono text-red-400">${(REVENUE_GAP / 1000).toFixed(1)}K</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">Gap</div>
            </div>
            <div className="text-center">
              <div className="text-base font-black font-mono text-amber-400">{DAYS_REMAINING}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">Days Left</div>
            </div>
            <div className="text-center">
              <div className="text-base font-black font-mono text-blue-400">${(MONTHLY_RATE / 1000).toFixed(0)}K</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">/Month</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.name} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 hover:border-navy-700 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ch.color}18` }}>
                    <Icon size={16} style={{ color: ch.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ch.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1 rounded-full bg-white/[0.06] w-12 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ch.effort}%`, background: ch.color }} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500">{ch.effort}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{ch.desc}</p>
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.04]">
                  <span className="text-base font-black font-mono text-white">{ch.metric}</span>
                  <span className="text-[10px] text-gray-500">{ch.metricLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Target Segments Table ──────────────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(100)}`}>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Target Segments — Priority Order</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 text-gray-500 font-medium">Segment</th>
                <th className="text-left py-2 text-gray-500 font-medium">Size</th>
                <th className="text-left py-2 text-gray-500 font-medium">Why Now</th>
                <th className="text-left py-2 text-gray-500 font-medium">Deal Size</th>
                <th className="text-left py-2 text-gray-500 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {targetSegments.map((seg) => (
                <tr key={seg.segment} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 text-white font-medium">{seg.segment}</td>
                  <td className="py-2.5 text-gray-400 font-mono">{seg.size}</td>
                  <td className="py-2.5 text-gray-400 max-w-[300px]">{seg.whyNow}</td>
                  <td className="py-2.5 text-gray-300 font-mono">{seg.deal}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                      seg.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      seg.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{seg.priority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 3: Revenue Waterfall + KPI Targets ───── */}
      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-3 ${fade(150)}`}>
        <div className="lg:col-span-3 bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Revenue Waterfall — Path to $307K</h3>
          <WaterfallChart />
        </div>

        <div className="lg:col-span-2 bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Weekly KPI Targets</h3>
          <div className="grid grid-cols-2 gap-2">
            {kpiTargets.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04] hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} style={{ color: kpi.color }} />
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-medium truncate">{kpi.label}</span>
                  </div>
                  <div className="text-base font-black font-mono text-white">{kpi.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 4: Content Calendar ──────────────────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(200)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">LinkedIn Content Calendar — Week 1 & 2</h3>
          <div className="flex items-center gap-3">
            {pillarLegend.map((p) => (
              <div key={p.name} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                <span className="text-[9px] text-gray-500">{p.name} ({p.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {contentCalendar.map((post, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg p-3 border-l-[3px] hover:bg-white/[0.05] transition-colors" style={{ borderLeftColor: post.color }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{post.day}</span>
                <div className="flex items-center gap-1">
                  <Linkedin size={10} className="text-gray-500" />
                  <span className="text-[9px] text-gray-500 capitalize">{post.pillar}</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{post.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 5: Email Sequences ────────────────────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(250)}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Email Nurture Sequences</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {emailSequences.map((seq) => (
            <div key={seq.name} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: seq.color }} />
                <span className="text-xs font-bold text-white">{seq.name}</span>
              </div>
              <div className="flex items-center gap-1 mb-2.5">
                <Zap size={10} className="text-gray-500" />
                <span className="text-[10px] text-gray-500">Trigger: {seq.trigger}</span>
              </div>
              <div className="space-y-1.5">
                {seq.emails.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[9px] font-mono text-gray-600 w-8 shrink-0 pt-0.5">D+{e.day}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: seq.color, opacity: 0.5 }} />
                      <span className="text-[11px] text-gray-400">{e.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 6: Agent Task Board ──────────────────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(300)}`}>
        <div className="flex items-center gap-2 mb-3">
          <Bot size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Agent Task Assignments</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {agentTasks.map((agent) => (
            <div key={agent.agent} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04] hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: agent.color }} />
                  <span className="text-[11px] font-bold text-white">{agent.role}</span>
                </div>
                <AgentStatusBadge status={agent.status} />
              </div>
              <ul className="space-y-1 mb-2">
                {agent.tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-1 text-[11px] text-gray-400">
                    <ChevronRight size={9} className="mt-0.5 shrink-0 text-gray-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1 pt-1.5 border-t border-white/[0.04]">
                <Clock size={9} className="text-gray-600" />
                <span className="text-[9px] text-gray-500">{agent.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 7: Jim & Nick Action Items ────────────── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 ${fade(350)}`}>
        <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Briefcase size={12} className="text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-white">Jim's Priorities (Sales)</h3>
          </div>
          <div className="space-y-2">
            {[
              { action: 'Send reactivation email to 200 existing VR schools', urgency: 'This week', icon: Send },
              { action: 'Schedule 3 ESC presentation calls (ECESC, CIC, +1)', urgency: 'This week', icon: Phone },
              { action: 'Post Monday LinkedIn content (or approve agent draft)', urgency: 'Mon 3/18', icon: Linkedin },
              { action: 'Follow up on warm pipeline deals before spring window closes', urgency: 'Ongoing', icon: Target },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white/[0.03] rounded-lg">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={10} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-300">{item.action}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{item.urgency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Wrench size={12} className="text-teal-400" />
            </div>
            <h3 className="text-xs font-bold text-white">Nick's Priorities (Product)</h3>
          </div>
          <div className="space-y-2">
            {[
              { action: 'Ensure free trial signup flow works end-to-end on website', urgency: 'This week', icon: MousePointerClick },
              { action: 'Set up email sending capability (or integrate service)', urgency: 'This week', icon: Mail },
              { action: 'Verify contact form submissions flow to dashboard', urgency: 'This week', icon: FileText },
              { action: 'DPA/compliance docs ready for district procurement', urgency: 'Before April', icon: CheckCircle2 },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-white/[0.03] rounded-lg">
                  <div className="w-5 h-5 rounded-md bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={10} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-300">{item.action}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{item.urgency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 8: 90-Day Timeline ───────────────────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(400)}`}>
        <div className="flex items-center gap-2 mb-4">
          <Flame size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">90-Day Sprint — March 18 &rarr; June 30</h3>
        </div>
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0052cc] via-[#2563eb] to-[#DC1625] opacity-25" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 relative">
            {timeline.map((evt, i) => {
              const tc: Record<string, { bg: string; border: string; dot: string }> = {
                blast: { bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
                followup: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
                ongoing: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
                event: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-500' },
              };
              const c = tc[evt.type] || tc.ongoing;
              return (
                <div key={i} className={`${c.bg} border ${c.border} rounded-lg p-3 relative`}>
                  <div className={`w-2.5 h-2.5 ${c.dot} rounded-full absolute -top-1 left-1/2 -translate-x-1/2 ring-[3px] ring-navy-800`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5 mt-0.5">{evt.week}</span>
                  <span className="text-xs font-bold text-white block">{evt.label}</span>
                  <span className="text-[10px] text-gray-400">{evt.detail}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-[#DC1625]/10 to-[#0052cc]/10 border border-white/[0.06] rounded-lg p-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-white">Spring budget window is open NOW.</span>
            <span className="text-xs text-gray-400 ml-1">Districts commit Title IV-A and remaining FY funds in March-April. Every week of delay costs pipeline.</span>
          </div>
          <ArrowRight size={14} className="text-gray-500 shrink-0 ml-auto" />
        </div>
      </div>

      {/* ── Row 9: Reactivation Email Template ───────── */}
      <div className={`bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 ${fade(450)}`}>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Reactivation Email Template — 200 Existing Schools</h3>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.04] max-w-2xl">
          <div className="mb-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Subject:</span>
            <p className="text-sm font-bold text-white mt-0.5">Learning Time now works on every device — no headsets needed</p>
          </div>
          <div className="space-y-2.5 text-xs text-gray-400 leading-relaxed">
            <p>Hi <span className="text-gray-300">[Name]</span>,</p>
            <p>You've seen what spatial learning can do with VR headsets. Now imagine every student joining in — from tablets, Chromebooks, and computers too.</p>
            <p><span className="text-white font-semibold">Learning Time is now device-agnostic.</span> Same immersive sessions. Same teacher controls. Every device in your classroom.</p>
            <div className="pl-3 border-l-2 border-blue-500/30 space-y-1">
              <p className="text-gray-300">WebAR on tablets — holograms in the real classroom</p>
              <p className="text-gray-300">Computer access — any browser, no install</p>
              <p className="text-gray-300">VR headsets still work — all devices join the same session</p>
            </div>
            <p>Want a 15-minute walkthrough? Reply to this email or <span className="text-blue-400">[book a time here]</span>.</p>
            <p className="text-gray-300">— Jim</p>
          </div>
        </div>
      </div>
    </div>
  );
}
