import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400 group-hover:bg-violet-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20'
  };

  const styleClass = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-indigo-500/40 transition-all flex items-center justify-between group">
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
        <h3 className="text-3xl font-extrabold text-white mt-1 group-hover:text-cyan-300 transition">{value}</h3>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl border ${styleClass} transition`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
