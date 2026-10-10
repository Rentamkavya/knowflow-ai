import React, { useState } from 'react';
import { FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCitation({ chunk, idx, isHighlighted, onCopy }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(chunk.excerpt || chunk.text);
    setCopied(true);
    if (onCopy) onCopy(chunk.id || idx);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`source-chunk-${idx}`}
      className={`p-3.5 rounded-xl border text-xs transition-all duration-200 space-y-2.5 ${
        isHighlighted
          ? 'bg-indigo-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-indigo-500/40'
      }`}
    >
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

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Relevance Match</span>
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

      <div className="p-2.5 rounded-lg bg-slate-950/80 text-slate-200 font-mono text-[11px] leading-relaxed border border-white/[0.05]">
        <span className={isExpanded ? '' : 'line-clamp-4'}>
          "{chunk.excerpt || chunk.text}"
        </span>
        
        {((chunk.excerpt || chunk.text)?.length > 200) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Collapse' : 'Show full chunk'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span className="uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.05]">
          {chunk.category || 'General'}
        </span>
        
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-slate-300 hover:text-cyan-300 transition"
        >
          {copied ? (
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
}
