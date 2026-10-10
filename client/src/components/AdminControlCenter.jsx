import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  Lock, 
  HardDrive
} from 'lucide-react';

export default function AdminControlCenter({
  stats,
  documents = [],
  onSeedSamples,
  onClearWorkspace,
  onDeleteDocument,
  isLoading,
  apiStatus,
  role,
  workspace
}) {
  const [logFilter, setLogFilter] = useState('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = stats?.recentActivity ? stats.recentActivity.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.action.includes(logFilter);
  }) : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 sm:p-7 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-[#0F172E]/95 to-[#121B35]/95 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings & Admin Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System diagnostics, vector indexing controls, tenant isolation, and security configuration
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onSeedSamples}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Seed 4 Sample PDFs</span>
          </button>

          {role === 'Admin' && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Knowledge Base</span>
            </button>
          )}
        </div>
      </div>

      {/* System Infrastructure Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Gemini AI Engine Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Generation Engine</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${apiStatus?.geminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <h4 className="font-extrabold text-white text-base">
                {apiStatus?.geminiConfigured ? 'Gemini 2.5 Flash' : 'Vector Fallback Active'}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {apiStatus?.geminiConfigured
                ? 'High-performance grounding model & text-embedding-004 (768-dim vectors)'
                : 'Local cosine vector generator active. Add GEMINI_API_KEY to .env for production Gemini model.'}
            </p>
          </div>
        </div>

        {/* Database Storage Engine */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vector Database</span>
            <HardDrive className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="font-extrabold text-white text-base">Pure-JS / SQLite WAL</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Persisted {stats?.totalChunks || 0} chunks across {stats?.totalDocuments || 0} documents in <code className="text-cyan-300 font-mono text-[10px]">knowflow_data.json</code>
            </p>
          </div>
        </div>

        {/* Workspace Security */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workspace & Security</span>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="font-extrabold text-white text-base truncate">
                {workspace || 'knowflow-enterprise-demo'}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Active Authorization Level: <strong className="text-cyan-300">{role}</strong> (Click profile to switch)
            </p>
          </div>
        </div>

      </div>

      {/* Document Vector Repository Management */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Registered Knowledge Repository</h3>
            <p className="text-xs text-slate-400">Total {documents?.length || 0} documents registered in vector repository</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Pages</th>
                <th className="py-3 px-4">Chunks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-semibold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-xs">{doc.original_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-white/[0.08]">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{doc.page_count}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{doc.chunk_count || 0}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Indexed</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {role === 'Admin' ? (
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No documents indexed in this workspace yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Security & Audit Activity Logs</h3>
          </div>

          <div className="flex items-center space-x-1.5">
            {['ALL', 'UPLOAD', 'QUERY', 'DELETE', 'SEED'].map(type => (
              <button
                key={type}
                onClick={() => setLogFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  logFilter === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    {log.action}
                  </span>
                  <span className="text-slate-300 font-medium">{log.details}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No activity logs match the filter.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clear Workspace */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 max-w-md w-full space-y-4 bg-[#0E1528] shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Purge Entire Knowledge Base?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete all indexed PDF documents, extracted text pages, and vector embedding chunks from workspace <strong className="text-white">"{workspace}"</strong>. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearWorkspace();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Confirm Delete All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
