import React, { useEffect, useState } from 'react';
import { X, FileText, BookOpen, Layers, RefreshCw, Search, Copy, Check } from 'lucide-react';

export default function InspectModal({ docId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chunks'); // 'chunks' | 'pages'
  const [searchInDoc, setSearchInDoc] = useState('');
  const [copiedChunkIdx, setCopiedChunkIdx] = useState(null);

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    fetch(`/api/documents/${docId}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('[Inspect Fetch Error]:', err);
        setLoading(false);
      });
  }, [docId]);

  if (!docId) return null;

  const filteredChunks = (data?.chunks || []).filter(c =>
    !searchInDoc || c.text.toLowerCase().includes(searchInDoc.toLowerCase())
  );

  const filteredPages = (data?.pages || []).filter(p =>
    !searchInDoc || p.text.toLowerCase().includes(searchInDoc.toLowerCase())
  );

  const handleCopy = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkIdx(idx);
    setTimeout(() => setCopiedChunkIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 max-w-3xl w-full h-[82vh] flex flex-col bg-[#0D152A]/95 shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-base text-white truncate" title={data?.document?.original_name}>
                {data?.document?.original_name || 'Inspect Document Metadata'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Domain: <strong className="text-cyan-300">{data?.document?.category}</strong> • {data?.document?.page_count} Pages • {data?.chunks?.length || 0} Chunks
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 pb-2.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('chunks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'chunks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              Vector Chunks ({data?.chunks?.length || 0})
            </button>
            
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'pages'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              Extracted Pages ({data?.pages?.length || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search text in document..."
              value={searchInDoc}
              onChange={(e) => setSearchInDoc(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3.5">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 text-xs space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Loading extracted text & embeddings...</span>
            </div>
          ) : activeTab === 'chunks' ? (
            filteredChunks.length > 0 ? (
              filteredChunks.map((chunk, idx) => (
                <div key={chunk.id || idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2 hover:border-indigo-500/30 transition">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-400">Vector Chunk #{chunk.chunk_index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-white/[0.06]">
                        Page {chunk.page_number}
                      </span>
                      <button
                        onClick={() => handleCopy(idx, chunk.text)}
                        className="text-slate-400 hover:text-white transition"
                        title="Copy chunk text"
                      >
                        {copiedChunkIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200 leading-relaxed border border-white/[0.04]">
                    "{chunk.text}"
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">No matching chunks found.</div>
            )
          ) : (
            filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <div key={page.page_number} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-400">Extracted Page #{page.page_number}</span>
                    <button
                      onClick={() => handleCopy(`p-${page.page_number}`, page.text)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copiedChunkIdx === `p-${page.page_number}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 font-sans text-xs text-slate-200 leading-relaxed border border-white/[0.04] whitespace-pre-wrap">
                    {page.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">No matching pages found.</div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
