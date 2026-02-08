import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { search as searchApi } from '../../api/endpoints';
import type { SearchResult } from '../../types';
import clsx from 'clsx';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await searchApi.query(q);
      setResults(response.data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Close on escape & Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    }
  }

  function handleResultClick(result: SearchResult) {
    navigate(result.url);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }

  // Group results by section
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((groups, result) => {
    const section = result.section;
    if (!groups[section]) groups[section] = [];
    groups[section].push(result);
    return groups;
  }, {});

  let flatIndex = -1;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search everything... (Ctrl+K)"
          className="w-full pl-9 pr-8 py-2 bg-navy-900 border border-navy-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-ascent-blue focus:ring-1 focus:ring-ascent-blue transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setSelectedIndex(-1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.trim().length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(groupedResults).map(([section, sectionResults]) => (
              <div key={section}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-navy-900/50">
                  {section}
                </div>
                {sectionResults.map((result) => {
                  flatIndex++;
                  const currentIndex = flatIndex;
                  return (
                    <button
                      key={`${result.section}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={clsx(
                        'w-full text-left px-3 py-2.5 hover:bg-navy-700 transition-colors flex flex-col',
                        currentIndex === selectedIndex && 'bg-navy-700'
                      )}
                    >
                      <span className="text-sm text-white">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-gray-500 mt-0.5">{result.subtitle}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
