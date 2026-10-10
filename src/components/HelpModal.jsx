import React from 'react';
import { X, Sparkles, BookOpen, Command, Cpu, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/30 max-w-xl w-full space-y-6 bg-[#0E1529]/95 shadow-2xl animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">KnowFlow AI Guide & Architecture</h3>
              <p className="text-xs text-slate-400">Company Knowledge Intelligence Platform</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-300">Open Command Palette</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-400">⌘K / Ctrl+K</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-300">Close Any Modal</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-400">ESC</kbd>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">How KnowFlow Grounded RAG Works</h4>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">1. Page-Level PDF Extraction:</strong> Uploaded manuals, HR policies, and technical specs are extracted page-by-page.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">2. Semantic Vector Chunking:</strong> Documents are chunked into overlapping windows and indexed into high-dimensional vector embeddings.
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">3. 100% Verifiable Source Citations:</strong> When you ask questions, answers are generated strictly grounded in retrieved chunks with clickable page citations.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise Hackathon Edition 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
          >
            Got it, Let's Explore
          </button>
        </div>

      </div>
    </div>
  );
}
