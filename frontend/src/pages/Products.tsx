import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import ErrorState from '../components/shared/ErrorState';
import { products } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import type { Product, ProductFeature } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  custom_experience: 'Custom Experience',
  subscription: 'Subscription',
  professional_services: 'Professional Services',
  pilot: 'Pilot Program',
};

const BRAND_FILTERS = [
  { value: '', label: 'All Products' },
  { value: 'learning_time_vr', label: 'Learning Time VR' },
  { value: 'ascent_xr', label: 'Ascent XR' },
];

const BRAND_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  learning_time_vr: { label: 'LTVR', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  ascent_xr: { label: 'AXR', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const LTVR_TIERS = [
  { tier: 'Classroom Pack', price: '$5,000–$15,000/yr', hardware: 'Pico 4 headsets', audience: 'STEM-focused schools', ideal: 'Schools wanting full VR immersion' },
  { tier: 'Tablet Subscription', price: '$1,500–$5,000/yr', hardware: 'Existing tablets/Chromebooks', audience: 'Budget-conscious / Title I', ideal: 'Schools with 1:1 devices, no VR budget' },
  { tier: 'District Enterprise', price: '$10,000–$50,000/yr', hardware: 'Mix of VR + tablet', audience: 'Large districts (5+ schools)', ideal: 'District-wide rollout with admin analytics' },
  { tier: 'Pilot Program', price: '$1,500–$2,500 one-time', hardware: 'VR or tablet (1 classroom)', audience: 'Risk-averse evaluators', ideal: '90-day proof of concept before commitment' },
];

export default function Products() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>({});
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [brandFilter, setBrandFilter] = useState('');
  const { showToast } = useToast();

  const { data: productsData, loading, error, refetch } = useApi<Product[]>(() => products.list(), []);
  const allProducts = productsData || [];

  const productList = useMemo(() => {
    if (!brandFilter) return allProducts;
    return allProducts.filter((p) => p.brand_entity === brandFilter);
  }, [allProducts, brandFilter]);

  async function loadFeatures(productId: string) {
    setFeaturesLoading(true);
    try {
      const resp = await products.getFeatures(productId);
      setFeatures(resp.data.data || []);
    } catch (err: any) { setFeatures([]); showToast(err.response?.data?.error || 'Failed to load features', 'error'); }
    finally { setFeaturesLoading(false); }
  }

  function openProduct(p: Product) {
    setEditing(p);
    loadFeatures(p.id);
    setShowModal(true);
  }

  // Features are loaded per-product via the modal, not from the list endpoint

  return (
    <PageShell title="Products & Services" subtitle="Learning Time VR subscriptions & Ascent XR custom experiences">
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!error && <>
      {/* Brand Filter Toggle */}
      <div className="flex items-center gap-2 mb-6">
        {BRAND_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setBrandFilter(f.value)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              brandFilter === f.value
                ? f.value === 'learning_time_vr' ? 'bg-[#0052cc] text-white' : f.value === 'ascent_xr' ? 'bg-[#ff6b00] text-white' : 'bg-[#2563EB] text-white'
                : 'bg-navy-700 text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-2">{productList.length} product{productList.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-navy-800/60 border border-navy-700/50 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-navy-700 rounded w-32 mb-3" />
              <div className="h-4 bg-navy-700 rounded w-20 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-navy-700 rounded" />
                <div className="h-3 bg-navy-700 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : productList.map((product) => {
          const badge = BRAND_BADGE[product.brand_entity || 'ascent_xr'];
          return (
            <div
              key={product.id}
              className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 hover:border-[#2563EB]/50 transition-colors cursor-pointer"
              onClick={() => openProduct(product)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-sm flex-1">{product.name}</h3>
                <StatusBadge status={product.status} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>{badge.label}</span>
                )}
                <span className="text-xs text-gray-400">{CATEGORY_LABELS[product.category] || product.category}</span>
              </div>
              <div className="text-lg font-bold text-[#2563EB] mb-3">
                ${product.base_price?.toLocaleString()}
                {product.price_max ? ` - $${product.price_max.toLocaleString()}` : ''}
                {product.billing_frequency ? <span className="text-xs text-gray-500 font-normal"> /{product.billing_frequency}</span> : null}
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{product.description}</p>
              {product.target_audience && (
                <p className="text-xs text-gray-500">Target: {product.target_audience}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* LTVR Subscription Tier Comparison */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Learning Time VR — Subscription Tier Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="text-left text-gray-400 py-2 px-3 font-medium">Tier</th>
                <th className="text-left text-gray-400 py-2 px-3 font-medium">Pricing</th>
                <th className="text-left text-gray-400 py-2 px-3 font-medium">Hardware</th>
                <th className="text-left text-gray-400 py-2 px-3 font-medium">Best For</th>
                <th className="text-left text-gray-400 py-2 px-3 font-medium">Ideal When</th>
              </tr>
            </thead>
            <tbody>
              {LTVR_TIERS.map((t) => (
                <tr key={t.tier} className="border-b border-navy-700/50">
                  <td className="py-2 px-3 text-white font-medium">{t.tier}</td>
                  <td className="py-2 px-3 text-[#0052cc] font-semibold">{t.price}</td>
                  <td className="py-2 px-3 text-gray-300">{t.hardware}</td>
                  <td className="py-2 px-3 text-gray-400">{t.audience}</td>
                  <td className="py-2 px-3 text-gray-400">{t.ideal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Roadmap */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Feature Roadmap</h3>
        <p className="text-gray-400 text-sm">Select a product above to view its roadmap features.</p>
      </div>

      </>}
      {/* Product Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing.name || 'Product Details'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="custom_experience">Custom Experience</option>
                <option value="subscription">Subscription</option>
                <option value="professional_services">Professional Services</option>
                <option value="pilot">Pilot</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Base Price ($)</label>
              <input type="number" value={editing.base_price || ''} onChange={(e) => setEditing({ ...editing, base_price: Number(e.target.value) })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select value={editing.status || 'active'} onChange={(e) => setEditing({ ...editing, status: e.target.value as Product['status'] })} className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#2563EB]">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Features list */}
          {editing.id && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Features</h4>
              {featuresLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-8 bg-navy-700 rounded" />)}
                </div>
              ) : features.length === 0 ? (
                <p className="text-xs text-gray-500">No features configured.</p>
              ) : (
                <div className="space-y-2">
                  {features.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-2 bg-navy-700/50 rounded">
                      <span className="text-sm text-gray-300">{f.name}</span>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </PageShell>
  );
}
