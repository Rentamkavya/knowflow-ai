import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import OverviewDashboard from './components/OverviewDashboard';
import DocumentLibrary from './components/DocumentLibrary';
import AIChat from './components/AIChat';
import KnowledgeGalaxy from './components/KnowledgeGalaxy';
import CollectionsView from './components/CollectionsView';
import ActivityView from './components/ActivityView';
import AdminControlCenter from './components/AdminControlCenter';
import UploadModal from './components/UploadModal';
import InspectModal from './components/InspectModal';
import HelpModal from './components/HelpModal';
import CommandPalette from './components/CommandPalette';
import { Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [role, setRole] = useState('Admin');
  const [workspace, setWorkspace] = useState('knowflow-enterprise-demo');
  const [initialPrompt, setInitialPrompt] = useState('');
  
  // Modals & Navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [inspectDocId, setInspectDocId] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus(data);
    } catch (e) {
      console.error('[Health Error]:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-workspace-id': workspace }
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('[Stats Error]:', e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { 'x-workspace-id': workspace }
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      console.error('[Documents Error]:', e);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchStats();
    fetchDocuments();
  }, [workspace]);

  // Global keyboard shortcuts for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSeedSamples = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents/seed-samples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspace
        }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showToast(data.message || 'Seeded synthetic enterprise documents!');
      await fetchStats();
      await fetchDocuments();
    } catch (err) {
      showToast(`Failed to seed sample documents: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearWorkspace = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': workspace
        }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showToast('Workspace knowledge base cleared.', 'info');
      await fetchStats();
      await fetchDocuments();
    } catch (err) {
      showToast(`Failed to reset workspace: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'x-workspace-id': workspace }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showToast(data.message || 'Document deleted.');
      await fetchStats();
      await fetchDocuments();
    } catch (err) {
      showToast(`Failed to delete document: ${err.message}`, 'error');
    }
  };

  const handleAskPrompt = (promptText) => {
    setInitialPrompt(promptText);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 font-sans flex antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspace={workspace}
        setWorkspace={setWorkspace}
        role={role}
        setRole={setRole}
        stats={stats}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* 2. Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
      `}>
        
        {/* Top Navigation Bar */}
        <TopNav
          activeTab={activeTab}
          workspace={workspace}
          role={role}
          setRole={setRole}
          apiStatus={apiStatus}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Body View */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Dynamic Tab Screens */}
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              stats={stats}
              documents={documents}
              setActiveTab={setActiveTab}
              onSeedSamples={handleSeedSamples}
              onOpenUpload={() => setUploadModalOpen(true)}
              onAskPrompt={handleAskPrompt}
              onInspectDocument={(id) => setInspectDocId(id)}
              onDeleteDocument={handleDeleteDocument}
              isLoading={loading}
            />
          )}

          {activeTab === 'library' && (
            <DocumentLibrary
              documents={documents}
              onDeleteDocument={handleDeleteDocument}
              onInspectDocument={(id) => setInspectDocId(id)}
              onOpenUpload={() => setUploadModalOpen(true)}
              onSeedSamples={handleSeedSamples}
              onAskPrompt={handleAskPrompt}
              isLoading={loading}
            />
          )}

          {activeTab === 'chat' && (
            <AIChat
              initialPrompt={initialPrompt}
              onAskPrompt={handleAskPrompt}
            />
          )}

          {activeTab === 'galaxy' && (
            <KnowledgeGalaxy
              onAskPrompt={handleAskPrompt}
              onInspectDocument={(id) => setInspectDocId(id)}
            />
          )}

          {activeTab === 'collections' && (
            <CollectionsView
              stats={stats}
              documents={documents}
              onNavigate={(tab) => setActiveTab(tab)}
              onAskPrompt={handleAskPrompt}
              onOpenUpload={() => setUploadModalOpen(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityView
              workspace={workspace}
            />
          )}

          {activeTab === 'admin' && (
            <AdminControlCenter
              stats={stats}
              documents={documents}
              onSeedSamples={handleSeedSamples}
              onClearWorkspace={handleClearWorkspace}
              onDeleteDocument={handleDeleteDocument}
              isLoading={loading}
              apiStatus={apiStatus}
              role={role}
              workspace={workspace}
            />
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/[0.07] bg-[#070B16] py-6 text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white">KnowFlow<span className="text-cyan-400">.AI</span></span>
              <span>— Grounded Company Knowledge Intelligence Platform.</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SQLite WAL</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Gemini 2.5 Flash</span>
              </span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Global Modals & Overlays */}
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          showToast('Document processed and indexed into Knowledge Base!');
          fetchStats();
          fetchDocuments();
        }}
      />

      {/* Inspect Document Modal */}
      <InspectModal
        docId={inspectDocId}
        onClose={() => setInspectDocId(null)}
      />

      {/* Help & Architecture Modal */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        documents={documents}
        onAskPrompt={handleAskPrompt}
        onOpenUpload={() => setUploadModalOpen(true)}
        onSeedSamples={handleSeedSamples}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs border backdrop-blur-xl animate-fadeIn ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-800'
            : toast.type === 'info'
            ? 'bg-cyan-950/90 text-cyan-200 border-cyan-800'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-75 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
