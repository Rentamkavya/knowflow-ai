import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  Trash2, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  Filter, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  MessageSquare,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function DocumentLibrary({ 
  documents = [], 
  onDeleteDocument, 
  onInspectDocument, 
  onOpenUpload, 
  onSeedSamples, 
  onAskPrompt,
  isLoading 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('date-desc');
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);

  const categories = ['All', 'HR', 'Finance', 'IT', 'Engineering', 'Product'];

  // Filtering
  const filteredDocs = (documents || []).filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Sorting
  filteredDocs.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'name') return a.original_name.localeCompare(b.original_name);
    if (sortBy === 'pages') return (b.page_count || 0) - (a.page_count || 0);
    return 0;
  });

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'HR':
        return { badge: 'bg-pink-950/80 text-pink-300 border-pink-800/50', border: 'hover:border-pink-500/40' };
      case 'Finance':
        return { badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50', border: 'hover:border-emerald-500/40' };
      case 'IT':
        return { badge: 'bg-blue-950/80 text-blue-300 border-blue-800/50', border: 'hover:border-blue-500/40' };
      case 'Engineering':
        return { badge: 'bg-amber-950/80 text-amber-300 border-amber-800/50', border: 'hover:border-amber-500/40' };
      default:
        return { badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50', border: 'hover:border-indigo-500/40' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Document Knowledge Base
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage company PDFs, inspect vector chunks, and explore extracted knowledge pages
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={onSeedSamples}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center space-x-1.5"
            title="Seed 4 sample enterprise documents"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Seed Sample PDFs</span>
          </button>
          
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/20 transition transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search document title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout & Sort controls */}
        <div className="flex items-center space-x-2 self-end md:self-center">
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="pages">Most Pages</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Documents List / Grid */}
      {filteredDocs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const theme = getCategoryTheme(doc.category);

              return (
                <div
                  key={doc.id}
                  className={`glass-panel p-5 rounded-2xl border border-white/[0.08] ${theme.border} transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    {/* Header: Category Badge & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${theme.badge}`}>
                        {doc.category}
                      </span>

                      <div className="flex items-center space-x-1 text-xs">
                        {doc.status === 'indexed' ? (
                          <span className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Indexed</span>
                          </span>
                        ) : doc.status === 'processing' ? (
                          <span className="flex items-center space-x-1 text-amber-400 text-[11px] font-semibold">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-rose-400 text-[11px] font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Error</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Document Title & Details */}
                    <div className="flex items-start space-x-3 my-2">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-cyan-400 border border-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition" title={doc.original_name}>
                          {doc.original_name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Box */}
                    <div className="grid grid-cols-2 gap-2 my-4 p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.05] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Extracted Pages</span>
                        <strong className="text-white font-mono">{doc.page_count} Pages</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Vector Chunks</span>
                        <strong className="text-cyan-400 font-mono">{doc.chunk_count || 0} Chunks</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-2">
                    <button
                      onClick={() => onInspectDocument(doc.id)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                      title="Inspect extracted pages and chunk embeddings"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Chunks</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      {onAskPrompt && (
                        <button
                          onClick={() => onAskPrompt(`Summarize key requirements and facts from ${doc.original_name}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05] transition"
                          title="Ask AI about this document"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Collection</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Pages</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-sm">{doc.original_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4 font-mono">{doc.page_count}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400">{doc.chunk_count || 0}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Indexed</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onInspectDocument(doc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05] transition"
                            title="Inspect Chunks"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="glass-panel p-14 rounded-3xl border border-white/[0.08] text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-cyan-400">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-white">No Documents in This Scope</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {searchQuery || selectedCategory !== 'All'
                ? 'No documents matched your active search filters. Try clearing the filter or search bar.'
                : 'Your knowledge base is currently empty. Upload company PDFs or 1-click seed sample enterprise manuals.'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white transition shadow-md shadow-indigo-600/20"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </button>
            <button
              onClick={onSeedSamples}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Seed Sample Documents
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 max-w-md w-full space-y-4 bg-[#0E1528] shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Document?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteConfirmDoc.original_name}"</strong>? All associated extracted pages and vector chunks will be permanently removed from the knowledge base.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDocument(deleteConfirmDoc.id);
                  setDeleteConfirmDoc(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
