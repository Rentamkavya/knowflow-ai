import React, { useState } from 'react';
import { FileText, BookOpen, ExternalLink, Check, Copy, X, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourcePanel({ retrievedChunks, highlightedCitation, onClose }) {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedChunkId, setExpandedChunkId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedChunkId(prev => prev === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-indigo-500/30 bg-[#0C1224]/95 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#10182F]/70">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs sm:text-sm text-white">Source Grounding Evidence</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
            {retrievedChunks?.length || 0} Chunks
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subheader info */}
      <div className="px-4 py-2 bg-indigo-950/30 border-b border-white/[0.05] text-[11px] text-slate-300 flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Strict factual excerpts retrieved via vector similarity</span>
      </div>

      {/* Chunks List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {retrievedChunks && retrievedChunks.length > 0 ? (
          retrievedChunks.map((chunk, idx) => {
            const isHighlighted = highlightedCitation &&
              (highlightedCitation.documentName === chunk.documentName && 
               Number(highlightedCitation.pageNumber) === Number(chunk.pageNumber));

            const isExpanded = expandedChunkId === (chunk.id || idx);

            return (
              <div
                key={chunk.id || idx}
                id={`source-chunk-${idx}`}
                className={`p-3.5 rounded-xl border text-xs transition-all duration-200 space-y-2.5 ${
                  isHighlighted
                    ? 'bg-indigo-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-indigo-500/40'
                }`}
              >
                {/* Header: Doc Name & Page Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-100 truncate text-xs" title={chunk.documentName}>
                      {chunk.documentName}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 shrink-0">
                    Page {chunk.pageNumber}
                  </span>
                </div>

                {/* Similarity Match Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Relevance Confidence</span>
                    <span className="font-bold text-cyan-400 font-mono">
                      {Math.round((chunk.similarity || 0.88) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${Math.min(Math.round((chunk.similarity || 0.88) * 100), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Snippet Content */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 text-slate-200 font-mono text-[11px] leading-relaxed border border-white/[0.05] relative">
                  <span className={isExpanded ? '' : 'line-clamp-4'}>
                    "{chunk.excerpt || chunk.text}"
                  </span>
                  
                  {((chunk.excerpt || chunk.text)?.length > 200) && (
                    <button
                      onClick={() => toggleExpand(chunk.id || idx)}
                      className="mt-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Collapse excerpt' : 'Show full chunk'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span className="uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.05]">
                    {chunk.category || 'General'}
                  </span>
                  
                  <button
                    onClick={() => handleCopy(chunk.id || idx, chunk.excerpt || chunk.text)}
                    className="flex items-center space-x-1 text-slate-300 hover:text-cyan-300 transition"
                  >
                    {copiedId === (chunk.id || idx) ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Quote</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-slate-400 text-xs space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
            <p className="font-bold text-slate-300 text-sm">No Grounding Sources Retrieved</p>
            <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
              Ask a question in the AI Chat. The system will retrieve relevant PDF page excerpts and cite them here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
