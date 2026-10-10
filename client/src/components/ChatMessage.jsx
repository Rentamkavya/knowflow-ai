import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, BookOpen, RotateCcw } from 'lucide-react';

export default function ChatMessage({ message, idx, onCitationClick, onRetry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContentWithCitations = (content) => {
    const parts = content.split(/(\[Doc:[^\]]+\])/g);

    return parts.map((part, i) => {
      const match = part.match(/\[Doc:\s*(.*?),\s*Page:\s*(\d+)\]/i);
      if (match) {
        const docName = match[1];
        const pageNum = parseInt(match[2], 10);

        return (
          <button
            key={i}
            onClick={() => onCitationClick && onCitationClick({ documentName: docName, pageNumber: pageNum })}
            className="inline-flex items-center space-x-1 px-2 py-0.5 mx-1 rounded bg-indigo-950/90 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/50 font-mono text-[11px] font-bold cursor-pointer transition shadow-xs align-baseline"
            title={`View citation: ${docName}, Page ${pageNum}`}
          >
            <BookOpen className="w-3 h-3 text-cyan-400 inline" />
            <span>[{docName} • Pg {pageNum}]</span>
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
        message.role === 'user'
          ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
          : message.isError
          ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-tl-none'
          : 'glass-panel border border-white/[0.08] text-slate-200 rounded-tl-none bg-[#111A33]/80'
      }`}>
        <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
          {message.role === 'assistant'
            ? renderContentWithCitations(message.content)
            : message.content}
        </div>

        {message.role === 'assistant' && !message.isError && (
          <div className="pt-2.5 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
            {message.citations && message.citations.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Sources ({message.citations.length}):
                </span>
                {message.citations.map((cit, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => onCitationClick && onCitationClick(cit)}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/[0.08] font-mono text-[10px] font-semibold transition"
                  >
                    {cit.documentName} (Pg {cit.pageNumber})
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-500 italic">No specific document citations required</span>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition ml-auto"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Answer</span>
                </>
              )}
            </button>
          </div>
        )}

        {message.isError && message.failedQuery && onRetry && (
          <div className="pt-2 border-t border-rose-800/40 flex justify-end">
            <button
              onClick={() => onRetry(message.failedQuery)}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Question</span>
            </button>
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
