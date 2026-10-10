import React, { useState, useEffect } from 'react';
import { Search, FileText, MessageSquare, Orbit, LayoutDashboard, Library, ShieldCheck, FolderKanban, Activity, ArrowRight, Sparkles, X, CornerDownLeft } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onNavigate, documents = [], onAskPrompt }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { id: 'dashboard', label: 'Go to Overview Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'library', label: 'Go to Knowledge Base & Documents', icon: Library, category: 'Navigation' },
    { id: 'chat', label: 'Open AI Assistant', icon: MessageSquare, category: 'Navigation' },
    { id: 'galaxy', label: 'Explore Knowledge Graph', icon: Orbit, category: 'Navigation' },
    { id: 'collections', label: 'Browse Department Collections', icon: FolderKanban, category: 'Navigation' },
    { id: 'activity', label: 'View Audit & Activity Logs', icon: Activity, category: 'Navigation' },
    { id: 'admin', label: 'System & Admin Settings', icon: ShieldCheck, category: 'Navigation' }
  ];

  const filteredNav = quickNav.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = (documents || []).filter(doc =>
    doc.original_name.toLowerCase().includes(query.toLowerCase()) ||
    doc.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const samplePrompts = [
    "What is our company remote work policy?",
    "What are the rules for travel expense reimbursement?",
    "What are password security requirements and MFA policies?",
    "What are our microservices standards and SLA targets?"
  ].filter(p => p.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-glow bg-[#0D152A] border border-indigo-500/30 shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#111A33]/80">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search documents, or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
          
          {/* Ask AI Direct Action */}
          {query.trim().length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instant AI Query</p>
              <button
                onClick={() => {
                  onAskPrompt(query);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/70 to-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                      Ask KnowFlow AI: "{query}"
                    </span>
                    <p className="text-[10px] text-slate-400">Run RAG query across indexed documents</p>
                  </div>
                </div>
                <CornerDownLeft className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          )}

          {/* Quick Navigation Items */}
          {filteredNav.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pages & Tools</p>
              <div className="space-y-1">
                {filteredNav.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-indigo-600/20 border border-transparent hover:border-indigo-500/30 transition group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Document Matches */}
          {filteredDocs.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Matching Documents</p>
              <div className="space-y-1">
                {filteredDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onNavigate('library');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-medium truncate">{doc.original_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {doc.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{doc.page_count} pgs</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {samplePrompts.length > 0 && query.trim().length === 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suggested Inquiries</p>
              <div className="space-y-1">
                {samplePrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAskPrompt(prompt);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition group text-left"
                  >
                    <span className="line-clamp-1 italic">"{prompt}"</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0B1020]/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↵</kbd></span>
          </div>
          <span>Close: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd></span>
        </div>

      </div>
    </div>
  );
}
