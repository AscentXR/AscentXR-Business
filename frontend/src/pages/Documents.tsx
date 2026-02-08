import { useState, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import SearchInput from '../components/shared/SearchInput';
import Modal from '../components/shared/Modal';
import StatusBadge from '../components/shared/StatusBadge';
import { documents } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import type { Document } from '../types';

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  'application/pdf': { icon: 'PDF', color: 'text-red-400 bg-red-500/20' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'DOC', color: 'text-blue-400 bg-blue-500/20' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: 'XLS', color: 'text-emerald-400 bg-emerald-500/20' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: 'PPT', color: 'text-orange-400 bg-orange-500/20' },
  'image/png': { icon: 'PNG', color: 'text-purple-400 bg-purple-500/20' },
  'image/jpeg': { icon: 'JPG', color: 'text-purple-400 bg-purple-500/20' },
  'text/plain': { icon: 'TXT', color: 'text-gray-400 bg-gray-500/20' },
};

function getFileIcon(mimetype?: string) {
  if (mimetype && FILE_ICONS[mimetype]) return FILE_ICONS[mimetype];
  return { icon: 'FILE', color: 'text-gray-400 bg-gray-500/20' };
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const { data: docsData, loading } = useApi<Document[]>(() => documents.list(), []);
  const { data: categoriesData } = useApi<string[]>(() => documents.getCategories(), []);

  const docs = docsData || [];
  const categories = categoriesData || [];

  const filteredDocs = useMemo(() => {
    let filtered = docs;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [docs, selectedCategory, searchQuery]);

  const docsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    docs.forEach((d) => {
      map[d.category] = (map[d.category] || 0) + 1;
    });
    return map;
  }, [docs]);

  return (
    <PageShell title="Documents" subtitle="Document library and file management">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#2563EB]/20 text-[#2563EB]'
                    : 'text-gray-400 hover:text-white hover:bg-navy-700'
                }`}
              >
                All Documents
                <span className="float-right text-xs text-gray-500">{docs.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                    selectedCategory === cat
                      ? 'bg-[#2563EB]/20 text-[#2563EB]'
                      : 'text-gray-400 hover:text-white hover:bg-navy-700'
                  }`}
                >
                  {cat}
                  <span className="float-right text-xs text-gray-500">{docsByCategory[cat] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="mt-4 bg-navy-800/60 backdrop-blur-md border border-navy-700/50 border-dashed rounded-xl p-6 text-center">
            <svg className="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-500">Drag files here or click to upload</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search documents..." />
            </div>
            <div className="flex gap-1 bg-navy-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-navy-700 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-navy-700 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Document Display */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`bg-navy-700 rounded-xl animate-pulse ${viewMode === 'grid' ? 'h-36' : 'h-16'}`} />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No documents found.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => {
                const fileIcon = getFileIcon(doc.mimetype);
                return (
                  <div
                    key={doc.id}
                    className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl p-4 hover:border-[#2563EB]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${fileIcon.color}`}>
                        <span className="text-xs font-bold">{fileIcon.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                          <span className="text-xs text-gray-600">|</span>
                          <span className="text-xs text-gray-500 capitalize">{doc.category}</span>
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">{tag}</span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{doc.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-navy-800/60 backdrop-blur-md border border-navy-700/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-navy-700 text-xs text-gray-500 font-medium">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Date</div>
              </div>
              {filteredDocs.map((doc) => {
                const fileIcon = getFileIcon(doc.mimetype);
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors cursor-pointer items-center"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${fileIcon.color}`}>
                        <span className="text-xs font-bold">{fileIcon.icon}</span>
                      </div>
                      <span className="text-sm text-white truncate">{doc.title}</span>
                    </div>
                    <div className="col-span-2 text-xs text-gray-400 capitalize">{doc.category}</div>
                    <div className="col-span-2 text-xs text-gray-400">{formatFileSize(doc.size)}</div>
                    <div className="col-span-3 text-xs text-gray-400">{doc.created_at?.slice(0, 10) || '-'}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Document Detail Modal */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title="Document Details">
        {selectedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileIcon(selectedDoc.mimetype).color}`}>
                <span className="text-sm font-bold">{getFileIcon(selectedDoc.mimetype).icon}</span>
              </div>
              <div>
                <h3 className="text-white font-medium">{selectedDoc.title}</h3>
                <p className="text-xs text-gray-400">{selectedDoc.original_name || selectedDoc.filename}</p>
              </div>
            </div>
            {selectedDoc.description && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <p className="text-sm text-gray-300">{selectedDoc.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <p className="text-sm text-white capitalize">{selectedDoc.category}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Size</label>
                <p className="text-sm text-white">{formatFileSize(selectedDoc.size)}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Uploaded By</label>
                <p className="text-sm text-white">{selectedDoc.uploaded_by || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <p className="text-sm text-white">{selectedDoc.created_at?.slice(0, 10) || '-'}</p>
              </div>
            </div>
            {selectedDoc.tags && selectedDoc.tags.length > 0 && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {selectedDoc.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#2563EB]/20 text-[#2563EB]">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
