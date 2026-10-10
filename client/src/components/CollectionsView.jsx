import React, { useState } from 'react';
import { 
  FolderKanban, 
  Files, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Plus
} from 'lucide-react';

export default function CollectionsView({ documents, onNavigate, onAskPrompt, onOpenUpload }) {
  const [search, setSearch] = useState('');

  const collectionMeta = [
    {
      id: 'HR',
      name: 'Human Resources & Workplace',
      desc: 'Employee handbooks, remote work guidelines, leave policies, benefits, and workplace standards.',
      color: 'from-pink-500 to-rose-500',
      borderGlow: 'hover:border-pink-500/50',
      badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-800/50',
      topics: ['Remote Work Stipend', 'PTO & Leave', 'Code of Conduct', 'Health Benefits'],
      sampleQuery: 'What is our company remote work policy and equipment stipend?'
    },
    {
      id: 'Finance',
      name: 'Finance, Procurement & Travel',
      desc: 'Corporate travel policies, expense reimbursement caps, procurement vendor approvals, and audit rules.',
      color: 'from-emerald-500 to-teal-500',
      borderGlow: 'hover:border-emerald-500/50',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
      topics: ['Travel Reimbursement', 'Per Diem Caps', 'Vendor Invoicing', 'Expense Approval'],
      sampleQuery: 'What are the rules for travel expense reimbursement and hotel caps?'
    },
    {
      id: 'IT',
      name: 'Information Security & Infrastructure',
      desc: 'Information security guidelines, MFA password rules, device management, and SOC2 compliance.',
      color: 'from-blue-500 to-cyan-500',
      borderGlow: 'hover:border-cyan-500/50',
      badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/50',
      topics: ['MFA Requirements', 'Password Rotation', 'Device Encryption', 'Incident Response'],
      sampleQuery: 'What are password security requirements and MFA protocols?'
    },
    {
      id: 'Engineering',
      name: 'Engineering & Architecture Standards',
      desc: 'Microservices architecture guidelines, CI/CD deployment pipelines, API versioning, and SLA metrics.',
      color: 'from-amber-500 to-orange-500',
      borderGlow: 'hover:border-amber-500/50',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
      topics: ['Microservice SLAs', 'RESTful API Standards', 'Deployment Runbooks', 'Database Migrations'],
      sampleQuery: 'What are our engineering microservice standards and SLA targets?'
    },
    {
      id: 'Product',
      name: 'Product Strategy & Roadmaps',
      desc: 'Feature specifications, roadmap milestones, persona definitions, and user experience requirements.',
      color: 'from-purple-500 to-indigo-500',
      borderGlow: 'hover:border-indigo-500/50',
      badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50',
      topics: ['Feature Roadmaps', 'User Personas', 'Release Cycles', 'Design Tokens'],
      sampleQuery: 'What are the upcoming product release milestones?'
    }
  ];

  const filteredCollections = collectionMeta.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Knowledge Collections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curated departmental repositories and knowledge domain clusters
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search collections or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Documents</span>
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((col) => {
          const catDocs = (documents || []).filter(d => d.category === col.id);
          const totalPages = catDocs.reduce((acc, d) => acc + (d.page_count || 0), 0);
          const totalChunks = catDocs.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

          return (
            <div
              key={col.id}
              className={`glass-panel p-6 rounded-2xl border border-white/[0.08] ${col.borderGlow} transition-all duration-300 flex flex-col justify-between group relative overflow-hidden`}
            >
              {/* Top ambient glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${col.color} opacity-5 blur-2xl pointer-events-none group-hover:opacity-15 transition`} />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${col.badgeBg}`}>
                    {col.id} Domain
                  </span>

                  <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                    <Files className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{catDocs.length} Docs</span>
                  </span>
                </div>

                {/* Collection Title & Desc */}
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  {col.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {col.desc}
                </p>

                {/* Metrics Pill */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-900/50 border border-white/[0.05] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Extracted Pages</span>
                    <strong className="text-slate-200">{totalPages} Pages</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Vector Chunks</span>
                    <strong className="text-slate-200">{totalChunks} Chunks</strong>
                  </div>
                </div>

                {/* Topic tags */}
                <div className="space-y-1.5 mb-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Core Topics Covered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {col.topics.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between gap-2">
                <button
                  onClick={() => onAskPrompt(col.sampleQuery)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  title="Ask question from this collection"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Query AI</span>
                </button>

                <button
                  onClick={() => onNavigate('library')}
                  className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white transition group-hover:translate-x-0.5"
                >
                  <span>View Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
