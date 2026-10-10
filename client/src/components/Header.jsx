import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Menu, ChevronRight, Upload, Sparkles } from 'lucide-react';

export default function Header({
  activeTab,
  workspace,
  role,
  setRole,
  apiStatus,
  onOpenCommandPalette,
  onOpenUpload,
  onOpenHelp,
  setMobileOpen
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Vector Knowledge Engine Active', desc: apiStatus?.geminiConfigured ? 'Gemini 2.5 Flash connected' : 'Local vector embedding ready', time: 'Just now' },
    { id: 2, title: 'SQLite WAL Database Synced', desc: 'All tenant knowledge chunks persisted', time: '12m ago' },
    { id: 3, title: 'RAG Citations Operational', desc: '100% verifiable page citations enabled', time: '1h ago' }
  ];

  const tabLabels = {
    dashboard: 'Overview Dashboard',
    library: 'Knowledge Base & Documents',
    chat: 'AI Knowledge Assistant',
    galaxy: 'Knowledge Graph Explorer',
    collections: 'Department Collections',
    activity: 'Audit Trail & Activity',
    admin: 'Settings & Administration'
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-white/[0.08] bg-[#0B1020]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.08]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <span className="text-slate-300 font-medium truncate max-w-[120px] sm:max-w-none">
            {workspace === 'knowflow-enterprise-demo' ? 'Enterprise Demo' : workspace}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-cyan-400 font-bold">
            {tabLabels[activeTab] || 'Dashboard'}
          </span>
        </nav>
      </div>

      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 transition group shadow-inner"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
            <span className="text-xs">Search documents, commands, queries...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 font-semibold shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition transform hover:-translate-y-0.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>

        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08]">
          <span className={`w-2 h-2 rounded-full ${apiStatus?.geminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span className="text-slate-300 text-[11px]">
            {apiStatus?.geminiConfigured ? 'Gemini 2.5 Flash' : 'Vector RAG Active'}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0B1020]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-glow bg-[#0E1528] border border-indigo-500/30 p-3 shadow-2xl z-50 animate-scaleIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
                <span className="text-xs font-bold text-white">System Notifications</span>
                <span className="text-[10px] font-semibold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  Live
                </span>
              </div>
              <div className="divide-y divide-white/[0.06] mt-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-white/[0.02] transition rounded-lg">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenHelp}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition"
          title="Help & documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-white/[0.06] transition"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-[#0D1426] rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                {role === 'Admin' ? 'AC' : 'EM'}
              </div>
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-glow bg-[#0E1528] border border-indigo-500/30 p-2 shadow-2xl z-50 animate-scaleIn">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="text-xs font-bold text-white">Alex Chen</p>
                <p className="text-[10px] text-slate-400">alex@knowflow.internal</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    if (setRole) setRole(role === 'Admin' ? 'Employee' : 'Admin');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-white/[0.06] rounded-xl transition"
                >
                  <span>Switch Role</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {role}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
