import React from 'react';
import { 
  Files, 
  Database, 
  MessageSquare, 
  FolderKanban, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Layers, 
  Zap, 
  ArrowUpRight,
  Eye,
  Trash2
} from 'lucide-react';

export default function OverviewDashboard({ 
  stats, 
  documents = [], 
  setActiveTab, 
  onSeedSamples, 
  onOpenUpload, 
  onAskPrompt, 
  onInspectDocument,
  onDeleteDocument,
  isLoading 
}) {
  const quickPrompts = [
    { text: "What is our company remote work policy and equipment stipend?", cat: "HR", color: "from-pink-500 to-rose-500" },
    { text: "What are the rules for travel expense reimbursement and hotel caps?", cat: "Finance", color: "from-emerald-500 to-teal-500" },
    { text: "What are the password security requirements and MFA policies?", cat: "IT", color: "from-blue-500 to-cyan-500" },
    { text: "What are our engineering microservice standards and SLA targets?", cat: "Engineering", color: "from-amber-500 to-orange-500" }
  ];

  const recentDocs = (documents || []).slice(0, 5);

  const categories = [
    { name: 'HR', count: stats?.categories?.find(c => c.category === 'HR')?.count || 0, color: 'bg-pink-500' },
    { name: 'Finance', count: stats?.categories?.find(c => c.category === 'Finance')?.count || 0, color: 'bg-emerald-500' },
    { name: 'IT', count: stats?.categories?.find(c => c.category === 'IT')?.count || 0, color: 'bg-cyan-500' },
    { name: 'Engineering', count: stats?.categories?.find(c => c.category === 'Engineering')?.count || 0, color: 'bg-amber-500' },
    { name: 'Product', count: stats?.categories?.find(c => c.category === 'Product')?.count || 0, color: 'bg-indigo-500' }
  ];

  const totalIndexedDocs = stats?.totalDocuments || documents.length || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-[#0F172E]/95 via-[#131E3D]/80 to-[#0F172E]/95 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Grounded Knowledge Intelligence Engine</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Knowledge, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                Instantly Searchable & 100% Verifiable.
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              KnowFlow AI indexes your company policies, engineering runbooks, and manuals page-by-page. Ask questions and receive citations grounded in real enterprise documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenUpload}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={onSeedSamples}
              disabled={isLoading}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-3 rounded-xl font-semibold text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              title="Quick-load 4 realistic enterprise PDFs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">1-Click Seed Sample Docs</span>
              <span className="sm:hidden">Seed Docs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-indigo-500/40 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Documents</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition">
              {totalIndexedDocs}
            </h3>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.totalPages || 0} pages extracted</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition">
            <Files className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-cyan-500/40 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vector Chunks</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition">
              {stats?.totalChunks || 0}
            </h3>
            <div className="flex items-center space-x-1 text-[11px] text-cyan-400 mt-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Embedded for RAG search</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-violet-500/40 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Questions Answered</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition">
              {stats?.totalQueries || 0}
            </h3>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verifiable citations</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:bg-violet-500/20 transition">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Collections</span>
            <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition">
              {stats?.categories?.length || 5}
            </h3>
            <div className="flex items-center space-x-1 text-[11px] text-amber-400 mt-1">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>HR, IT, Finance, Eng, Product</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 transition">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Knowledge Health Score</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              99.4% Factual Grounding
            </span>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Department Coverage Distribution
            </span>
            {categories.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-mono text-slate-400">{cat.count} Docs</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all`}
                    style={{ width: `${Math.min(cat.count * 25, 100) || 12}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-cyan-300 mb-0.5">Automated Hallucination Prevention</p>
            Gemini RAG cross-references every answer chunk against SQLite vector embeddings before answering.
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Ask KnowFlow AI</h3>
            </div>
            <button
              onClick={() => setActiveTab('chat')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Launch Full Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Click any prompt below to query our knowledge base with instant citations:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onAskPrompt(p.text)}
                className="text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-cyan-500/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {p.cat}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                    "{p.text}"
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400 mt-2 font-semibold group-hover:underline">
                  Execute query →
                </span>
              </button>
            ))}
          </div>

          <div 
            onClick={() => setActiveTab('galaxy')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-violet-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-400/50 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-cyan-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                  Interactive Knowledge Galaxy Available
                </p>
                <p className="text-[11px] text-slate-400">
                  Explore orbital relationship nodes connecting categories, documents, and chunk clusters.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Files className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Recently Indexed Documents</h3>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              View All ({totalIndexedDocs}) →
            </button>
          </div>

          {recentDocs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-2.5 px-3">Document Name</th>
                    <th className="py-2.5 px-3">Collection</th>
                    <th className="py-2.5 px-3">Pages</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.original_name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{doc.page_count}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Indexed</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onInspectDocument && onInspectDocument(doc.id)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/[0.05] transition"
                            title="Inspect Chunks"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDocument && onDeleteDocument(doc.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <FileText className="w-8 h-8 mx-auto text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-300">No Documents Uploaded Yet</p>
                <p className="text-[11px] text-slate-400">Seed sample documents or upload PDFs to begin.</p>
              </div>
              <button
                onClick={onSeedSamples}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                1-Click Seed Sample Docs
              </button>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-white">Live Activity Stream</h3>
              </div>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                View Log →
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        {log.action}
                      </span>
                      <span className="font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 font-medium leading-snug line-clamp-2">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>RAG Engine 100% Online</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">v1.0 Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
}
