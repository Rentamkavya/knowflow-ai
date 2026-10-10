import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  MessageSquare, 
  Orbit, 
  FolderKanban, 
  Activity, 
  Settings, 
  Sparkles, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  User, 
  ShieldCheck, 
  FileText,
  Layers,
  Database
} from 'lucide-react';

export default function Sidebar({
  activeTab, 
  setActiveTab, 
  workspace, 
  setWorkspace, 
  role, 
  setRole, 
  stats, 
  collapsed, 
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const workspaces = [
    { id: 'knowflow-enterprise-demo', name: 'KnowFlow Enterprise Demo', plan: 'Enterprise' },
    { id: 'engineering-core-rag', name: 'Engineering Core Specs', plan: 'Team Pro' },
    { id: 'global-compliance-hr', name: 'Global HR & Compliance', plan: 'Enterprise' }
  ];

  const currentWorkspace = workspaces.find(w => w.id === workspace) || workspaces[0];

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Overview', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: 'library', 
      label: 'Knowledge Base', 
      icon: Library,
      badge: stats?.totalDocuments ? `${stats.totalDocuments}` : null
    },
    { 
      id: 'chat', 
      label: 'AI Assistant', 
      icon: MessageSquare,
      badge: 'Live'
    },
    { 
      id: 'galaxy', 
      label: 'Knowledge Graph', 
      icon: Orbit,
      badge: null
    },
    { 
      id: 'collections', 
      label: 'Collections', 
      icon: FolderKanban,
      badge: stats?.categories?.length ? `${stats.categories.length}` : '5'
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: Activity,
      badge: null
    },
    { 
      id: 'admin', 
      label: 'Settings', 
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 flex flex-col
        bg-[#0D1426] border-r border-white/[0.07]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.07] shrink-0">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center space-x-3 cursor-pointer group ${collapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-cyan-400/30 transition">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    KnowFlow<span className="text-cyan-400">.AI</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    SaaS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Knowledge Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Switcher */}
        {!collapsed ? (
          <div className="p-3 border-b border-white/[0.06] shrink-0 relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition text-left"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {currentWorkspace.name}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-medium">
                    {currentWorkspace.plan}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Workspace dropdown menu */}
            {workspaceMenuOpen && (
              <div className="absolute top-full left-3 right-3 mt-1.5 py-1.5 rounded-xl bg-[#111A33] border border-indigo-500/30 shadow-2xl z-50 animate-scaleIn">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWorkspace(ws.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition ${
                      ws.id === workspace
                        ? 'bg-indigo-600/20 text-cyan-300 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{ws.plan}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-white/[0.06] shrink-0">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-indigo-400" title={currentWorkspace.name}>
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Navigation
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'}
                  rounded-xl text-xs font-semibold transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-600/25 via-indigo-600/15 to-cyan-500/15 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    item.badge === 'Live'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 animate-pulse'
                      : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Left active accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Knowledge Capacity Widget in Sidebar (when expanded) */}
        {!collapsed && stats && (
          <div className="p-3 mx-2.5 mb-2 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 text-xs">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-300 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Knowledge Base</span>
              </span>
              <span className="text-cyan-400 font-mono">{stats.totalChunks || 0} Chunks</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full" 
                style={{ width: `${Math.min(((stats.totalDocuments || 0) / 10) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
              <span>{stats.totalDocuments || 0} Docs Indexed</span>
              <span>WAL Engine</span>
            </div>
          </div>
        )}

        {/* User Profile & Collapse Bar */}
        <div className="p-2.5 border-t border-white/[0.07] bg-[#0A0F1E] shrink-0 space-y-2">
          
          {/* User profile card */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-1.5 rounded-xl hover:bg-white/[0.04] transition`}>
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#0D1426] rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                    {role === 'Admin' ? 'AC' : 'EM'}
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0A0F1E]" />
              </div>

              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Alex Chen</p>
                  <p className="text-[10px] text-slate-400 truncate">alex@knowflow.internal</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => setRole(role === 'Admin' ? 'Employee' : 'Admin')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 hover:text-cyan-300 border border-indigo-800/50 transition"
                title="Toggle authorization role between Admin and Employee"
              >
                {role}
              </button>
            )}
          </div>

          {/* Collapse sidebar toggle button */}
          <div className="hidden lg:flex items-center justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center py-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition text-[11px]"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center space-x-1.5">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium text-slate-400">Collapse sidebar</span>
                </div>
              )}
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
