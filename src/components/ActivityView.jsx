import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  FileText, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  Upload, 
  Sparkles,
  Clock
} from 'lucide-react';

export default function ActivityView({ workspace }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'x-workspace-id': workspace }
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('[Activity Logs Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [workspace]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filterAction === 'ALL' || log.action.includes(filterAction);
    const matchesSearch = !searchQuery || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowflow-activity-${workspace}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action) => {
    if (action.includes('QUERY')) {
      return { bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50', icon: MessageSquare };
    }
    if (action.includes('UPLOAD')) {
      return { bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50', icon: Upload };
    }
    if (action.includes('DELETE') || action.includes('CLEARED')) {
      return { bg: 'bg-rose-950/80 text-rose-300 border-rose-800/50', icon: Trash2 };
    }
    if (action.includes('SEED')) {
      return { bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50', icon: Sparkles };
    }
    return { bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: Activity };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Audit & Activity Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time compliance trail of document indexing, Q&A queries, and workspace events
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.08] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search activity events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'QUERY', 'UPLOAD', 'DELETE', 'SEED'].map(act => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterAction === act
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {act === 'ALL' ? 'All Events' : act}
            </button>
          ))}
        </div>

      </div>

      {/* Logs Table / List */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden">
        <div className="divide-y divide-white/[0.06]">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Fetching audit log trail...</span>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;

              return (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-300 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {log.details}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Workspace: {log.workspace_id || workspace}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 shrink-0 self-end sm:self-center font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-300">No Activity Events Found</p>
              <p className="text-slate-400">Activity will be logged automatically as you ask questions and manage documents.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
