import React from 'react';
import { LayoutDashboard, Library, MessageSquareCode, Orbit, ShieldCheck, Sparkles, Building2, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiStatus, workspace, setWorkspace, role, setRole }) {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Document Library', icon: Library },
    { id: 'chat', label: 'AI Knowledge Chat', icon: MessageSquareCode },
    { id: 'galaxy', label: 'Knowledge Galaxy', icon: Orbit },
    { id: 'admin', label: 'Admin Center', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-[#0B0F19] justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  KnowFlow<span className="text-cyan-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-violet-950/80 text-violet-300 border border-violet-700/50">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Company Knowledge Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-white border border-violet-500/40 shadow-sm shadow-violet-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Gemini API Key Status Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${apiStatus?.geminiConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className={apiStatus?.geminiConfigured ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {apiStatus?.geminiConfigured ? 'Gemini 2.5 Flash Active' : 'Local Fallback Mode'}
              </span>
            </div>

            {/* Role Toggle */}
            <button
              onClick={() => setRole(role === 'Admin' ? 'Employee' : 'Admin')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60 transition"
              title="Click to toggle user authorization role"
            >
              <User className="w-3.5 h-3.5 text-violet-400" />
              <span>Role: <strong className="text-white">{role}</strong></span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
