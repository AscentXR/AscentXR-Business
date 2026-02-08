import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { products } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { Product, ProductFeature } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  custom_experience: 'Custom Experience',
  subscription: 'Subscription',
  professional_services: 'Professional Services',
  pilot: 'Pilot Program',
};

export default function Products() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>({});
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  const { data: productsData, loading, refetch } = useApi<Product[]>(() => products.list(), []);
  const productList = productsData || [];

  async function loadFeatures(productId: string) {
    setFeaturesLoading(true);
    try {
      const resp = await products.getFeatures(productId);
      setFeatures(resp.data.data || []);
    } catch { setFeatures([]); }
    finally { setFeaturesLoading(false); }
  }

  function openProduct(p: Product) {
    setEditing(p);
    loadFeatures(p.id);
    setShowModal(true);
  }

  // Collect all features from all products for roadmap
  const allFeatures = productList.flatMap((p) => (p.features || []) as ProductFeature[]);

  return (
    <PageShell title="Products & Services" subtitle="Product catalog and feature roadmap">
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
        ) : productList.map((product) => (
          <div
            key={product.id}
            className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5 hover:border-[#2563EB]/50 transition-colors cursor-pointer"
            onClick={() => openProduct(product)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-semibold">{product.name}</h3>
              <StatusBadge status={product.status} />
            </div>
            <p className="text-xs text-gray-400 mb-3">{CATEGORY_LABELS[product.category] || product.category}</p>
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
        ))}
      </div>

      {/* Feature Roadmap */}
      <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Feature Roadmap</h3>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-navy-700 rounded" />)}
          </div>
        ) : allFeatures.length === 0 ? (
          <p className="text-gray-500 text-sm">No features in roadmap yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['planned', 'in_progress', 'released'] as const).map((status) => {
              const items = allFeatures.filter((f) => f.status === status);
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={status} size="md" />
                    <span className="text-xs text-gray-500">{items.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((f, i) => (
                      <div key={f.id || i} className="p-3 bg-navy-700/50 rounded-lg">
                        <p className="text-sm text-white">{f.name}</p>
                        {f.description && <p className="text-xs text-gray-400 mt-1">{f.description}</p>}
                        {f.target_date && <p className="text-xs text-gray-500 mt-1">Target: {f.target_date.slice(0, 10)}</p>}
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-xs text-gray-600">No items</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
