import React from 'react';
import { FileText, CheckCircle2, Clock, AlertCircle, Eye, Trash2, MessageSquare } from 'lucide-react';

export default function DocumentCard({ doc, onInspect, onDelete, onAsk }) {
  const getBadgeClass = (cat) => {
    switch (cat) {
      case 'HR': return 'bg-pink-950/80 text-pink-300 border-pink-800/50';
      case 'Finance': return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50';
      case 'IT': return 'bg-blue-950/80 text-blue-300 border-blue-800/50';
      case 'Engineering': return 'bg-amber-950/80 text-amber-300 border-amber-800/50';
      default: return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50';
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header: Category Badge & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getBadgeClass(doc.category)}`}>
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
                <span>Failed</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
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

        {/* Metrics */}
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-2">
        <button
          onClick={() => onInspect && onInspect(doc.id)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Chunks</span>
        </button>

        <div className="flex items-center space-x-2">
          {onAsk && (
            <button
              onClick={() => onAsk(`Summarize key requirements from ${doc.original_name}`)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05] transition"
              title="Ask AI about this document"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(doc.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
