import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import TabBar from '../components/shared/TabBar';
import StatusBadge from '../components/shared/StatusBadge';
import ProgressBar from '../components/shared/ProgressBar';
import Modal from '../components/shared/Modal';
import AgentTriggerButton from '../components/shared/AgentTriggerButton';
import ErrorState from '../components/shared/ErrorState';
import { brand, knowledgeBase, businessActivities, forecasts, goals } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { BrandAsset, KnowledgeBaseArticle, BusinessActivity, Forecast, Goal } from '../types';

const BRAND_COLORS = [
  { name: 'Ascent Blue', hex: '#2563EB', usage: 'Primary brand color, CTAs, links' },
  { name: 'Learning Purple', hex: '#7C3AED', usage: 'AI/agent features, accents' },
  { name: 'Navy', hex: '#0a1d45', usage: 'Backgrounds, dark UI elements' },
  { name: 'Navy 800', hex: '#1a2744', usage: 'Card backgrounds' },
  { name: 'Navy 700', hex: '#2a3754', usage: 'Borders, dividers' },
  { name: 'White', hex: '#FFFFFF', usage: 'Primary text on dark backgrounds' },
  { name: 'Gray 400', hex: '#9CA3AF', usage: 'Secondary text, labels' },
  { name: 'Emerald', hex: '#10B981', usage: 'Success states, positive metrics' },
];

const FONTS = [
  { name: 'Inter', weight: '400-700', usage: 'Primary UI font - body text and labels', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Inter', weight: '700-800', usage: 'Headings and emphasis', sample: 'Ascent XR - Immersive Learning' },
];

const ASSET_TYPES = ['All', 'logo', 'color', 'font', 'template', 'guideline', 'icon'];

export default function Brand() {
  const [assetFilter, setAssetFilter] = useState('All');
  const [tab, setTab] = useState('Brand Assets');
  const [kbSearch, setKbSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('baseline');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);

  const { data: assetsData, loading, error, refetch } = useApi<BrandAsset[]>(() => brand.list(), []);
  const assets = assetsData || [];

  const { data: kbData } = useApi<any>(() => knowledgeBase.getArticles({ business_area: 'brand' }), []);
  const { data: activitiesData } = useApi<any>(() => businessActivities.getActivities({ business_area: 'brand' }), []);
  const { data: forecastsData } = useApi<Forecast[]>(() => forecasts.getForecasts({ business_area: 'brand' }), []);
  const { data: goalsData } = useApi<Goal[]>(() => goals.list({ business_area: 'brand', quarter: 'Q1_2026' }), []);

  const kbArticles: KnowledgeBaseArticle[] = kbData?.articles || kbData || [];
  const activities: BusinessActivity[] = activitiesData?.activities || activitiesData || [];
  const forecastItems: Forecast[] = forecastsData || [];
  const goalItems: Goal[] = goalsData || [];

  const filteredArticles = useMemo(() => {
    if (!kbSearch) return kbArticles;
    const s = kbSearch.toLowerCase();
    return kbArticles.filter((a) => a.title.toLowerCase().includes(s) || a.summary?.toLowerCase().includes(s));
  }, [kbArticles, kbSearch]);

  const filteredForecasts = useMemo(() => forecastItems.filter((f) => f.scenario === scenarioFilter), [forecastItems, scenarioFilter]);

  const filteredActivities = useMemo(() => {
    if (!activityFilter) return activities;
    return activities.filter((a) => a.priority === activityFilter);
  }, [activities, activityFilter]);

  const filteredAssets = useMemo(() => {
    if (assetFilter === 'All') return assets;
    return assets.filter((a) => a.asset_type === assetFilter);
  }, [assets, assetFilter]);

  const logos = assets.filter((a) => a.asset_type === 'logo');
  const templates = assets.filter((a) => a.asset_type === 'template');

  return (
    <PageShell
      title="Brand & Style Guide"
      subtitle="Colors, fonts, logos, and brand assets"
      actions={
        <AgentTriggerButton agentId="brand" label="Audit Brand Consistency" prompt="Audit our brand assets and marketing materials for consistency with brand guidelines" businessArea="marketing" />
      }
    >
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!error && <>
      <TabBar tabs={['Brand Assets', 'Knowledge Base', 'Goals', 'Forecasts', 'Activities']} active={tab} onChange={setTab} />

      {tab === 'Brand Assets' && (<>
      {/* Color Palette */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRAND_COLORS.map((color) => (
            <div key={color.hex} className="space-y-2">
              <div className="h-20 rounded-lg border border-navy-700" style={{ backgroundColor: color.hex }} />
              <div>
                <p className="text-sm font-medium text-white">{color.name}</p>
                <p className="text-xs text-gray-400 font-mono">{color.hex}</p>
                <p className="text-xs text-gray-500 mt-0.5">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Showcase */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Typography</h3>
        <div className="space-y-6">
          {FONTS.map((font, i) => (
            <div key={i} className="p-4 bg-navy-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{font.name} ({font.weight})</span>
                <span className="text-xs text-gray-400">{font.usage}</span>
              </div>
              <p className="text-lg text-gray-300" style={{ fontFamily: font.name, fontWeight: parseInt(font.weight) }}>
                {font.sample}
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: font.name }}>Heading 1 - 2xl Bold</p>
                <p className="text-xl font-semibold text-white" style={{ fontFamily: font.name }}>Heading 2 - xl Semibold</p>
                <p className="text-base text-gray-300" style={{ fontFamily: font.name }}>Body text - base regular</p>
                <p className="text-sm text-gray-400" style={{ fontFamily: font.name }}>Caption - sm regular</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Gallery */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Logos</h3>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-navy-700 rounded" />)}
          </div>
        ) : logos.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Dark Background', 'Light Background', 'Icon Only', 'Horizontal'].map((variant) => (
              <div key={variant} className="p-4 bg-navy-700/50 rounded-lg flex flex-col items-center justify-center h-24">
                <div className="text-[#2563EB] font-bold text-lg">Ascent XR</div>
                <span className="text-xs text-gray-500 mt-1">{variant}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {logos.map((logo) => (
              <div key={logo.id} className="p-4 bg-navy-700/50 rounded-lg flex flex-col items-center justify-center">
                {logo.file_url ? (
                  <img src={logo.file_url} alt={logo.name} className="h-12 object-contain" />
                ) : (
                  <div className="text-[#2563EB] font-bold text-lg">{logo.name}</div>
                )}
                <span className="text-xs text-gray-500 mt-2">{logo.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Library */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Template Library</h3>
        {templates.length === 0 ? (
          <p className="text-gray-500 text-sm">No templates uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="p-4 bg-navy-700/50 rounded-lg">
                <p className="text-sm text-white font-medium">{t.name}</p>
                {t.description && <p className="text-xs text-gray-400 mt-1">{t.description}</p>}
                {t.usage_notes && <p className="text-xs text-gray-500 mt-1">{t.usage_notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Grid */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">All Assets</h3>
          <div className="flex gap-2">
            {ASSET_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setAssetFilter(type)}
                className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                  assetFilter === type
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-navy-700 text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-navy-700 rounded" />)}
          </div>
        ) : filteredAssets.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No assets found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="p-4 bg-navy-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] capitalize">{asset.asset_type}</span>
                </div>
                <p className="text-sm text-white font-medium">{asset.name}</p>
                {asset.value && <p className="text-xs text-gray-400 font-mono mt-1">{asset.value}</p>}
                {asset.description && <p className="text-xs text-gray-500 mt-1">{asset.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      </>)}

      {tab === 'Knowledge Base' && (
        <div className="space-y-4">
          <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search articles..." className="w-full px-4 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          {filteredArticles.length === 0 ? <p className="text-gray-500 text-center py-8">No articles found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4 cursor-pointer hover:border-[#2563EB]/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white flex-1">{article.is_pinned && <span className="text-amber-400 mr-1">*</span>}{article.title}</h4>
                  </div>
                  {article.summary && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{article.summary}</p>}
                  <div className="flex flex-wrap gap-1">{article.tags?.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{tag}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Goals' && (
        <div className="space-y-4">
          {goalItems.length === 0 ? <p className="text-gray-500 text-center py-8">No goals for this quarter.</p> : goalItems.filter(g => g.goal_type === 'objective').map((obj) => (
            <div key={obj.id} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-medium text-white">{obj.title}</h4><StatusBadge status={obj.status} /></div>
              <ProgressBar value={obj.progress} color="blue" />
              <div className="mt-3 space-y-2">{goalItems.filter(kr => kr.parent_id === obj.id).map((kr) => (
                <div key={kr.id} className="flex items-center justify-between p-2 bg-navy-700/50 rounded-lg">
                  <span className="text-xs text-gray-300 flex-1">{kr.title}</span>
                  <div className="flex items-center gap-2 ml-2"><span className="text-xs text-gray-400">{kr.current_value}/{kr.target_value} {kr.unit}</span><div className="w-16"><ProgressBar value={kr.progress} color="blue" size="sm" /></div></div>
                </div>
              ))}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Forecasts' && (
        <div className="space-y-4">
          <div className="flex gap-2">{['conservative', 'baseline', 'optimistic'].map((s) => (
            <button key={s} onClick={() => setScenarioFilter(s)} className={`px-3 py-1 text-xs rounded-full capitalize ${scenarioFilter === s ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{s}</button>
          ))}</div>
          {filteredForecasts.length === 0 ? <p className="text-gray-500 text-center py-8">No forecasts available.</p> : (
            <div className="bg-navy-800/60 border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-2">Period</div><div className="col-span-3">Type</div><div className="col-span-2">Metric</div><div className="col-span-2">Projected</div><div className="col-span-2">Actual</div><div className="col-span-1">Conf.</div>
              </div>
              {filteredForecasts.map((f) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700/50 text-sm items-center">
                  <div className="col-span-2 text-gray-400">{f.period}</div><div className="col-span-3 text-white">{f.forecast_type}</div><div className="col-span-2 text-gray-400">{f.metric || '-'}</div>
                  <div className="col-span-2 text-white">{f.projected_value != null ? `$${Number(f.projected_value).toLocaleString()}` : '-'}</div><div className="col-span-2 text-gray-400">{f.actual_value != null ? `$${Number(f.actual_value).toLocaleString()}` : '-'}</div>
                  <div className="col-span-1"><span className={`text-xs px-1.5 py-0.5 rounded ${f.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : f.confidence === 'low' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{f.confidence}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Activities' && (
        <div className="space-y-4">
          <div className="flex gap-2">{['', 'asap', 'high', 'medium', 'low'].map((p) => (
            <button key={p} onClick={() => setActivityFilter(p)} className={`px-3 py-1 text-xs rounded-full capitalize ${activityFilter === p ? 'bg-[#2563EB] text-white' : 'bg-navy-700 text-gray-400 hover:text-white'}`}>{p || 'All'}</button>
          ))}</div>
          {filteredActivities.length === 0 ? <p className="text-gray-500 text-center py-8">No activities found.</p> : (
            <div className="space-y-2">{filteredActivities.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-navy-800/60 border border-navy-700/50 rounded-lg">
                <div className="flex-1 min-w-0"><div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${a.priority === 'asap' ? 'bg-red-500/20 text-red-400' : a.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : a.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-navy-700 text-gray-400'}`}>{a.priority}</span>
                  <span className="text-sm text-white truncate">{a.title}</span>
                </div>{a.description && <p className="text-xs text-gray-500 mt-1 truncate">{a.description}</p>}</div>
                <div className="flex items-center gap-2 ml-4">{a.due_date && <span className="text-xs text-gray-400">{a.due_date.slice(0, 10)}</span>}<StatusBadge status={a.status} /></div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      </>}
      <Modal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''}>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">{selectedArticle?.content}</div>
        </div>
      </Modal>
    </PageShell>
  );
}
