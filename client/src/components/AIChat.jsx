import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  PanelRightOpen, 
  PanelRightClose, 
  Plus, 
  Clock, 
  CornerDownLeft, 
  FileText
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import SourceCitation from './SourceCitation';
import { askAIQuestion, fetchDocuments, fetchChatSessions, fetchChatHistory } from '../services/api';

export default function AIChat({ initialPrompt, onAskPrompt }) {
  const [question, setQuestion] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedDocId, setSelectedDocId] = useState('All');
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [showSessionsSidebar, setShowSessionsSidebar] = useState(true);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to **KnowFlow AI** Assistant! Ask any question about your company policies, engineering runbooks, travel guidelines, or security standards. All responses are 100% grounded in your indexed documents with verifiable citations.',
      citations: [],
      retrievedChunks: []
    }
  ]);

  const [activeChunks, setActiveChunks] = useState([]);
  const [highlightedCitation, setHighlightedCitation] = useState(null);
  const [showSourcePanel, setShowSourcePanel] = useState(true);

  const chatEndRef = useRef(null);

  const categories = ['All', 'HR', 'Finance', 'IT', 'Engineering', 'Product'];

  const suggestedQuestions = [
    { title: "Remote Work & Stipend", q: "What is our company remote work policy and equipment stipend?", cat: "HR" },
    { title: "Travel Reimbursement Caps", q: "What are the rules for travel expense reimbursement and hotel caps?", cat: "Finance" },
    { title: "Security & MFA Policies", q: "What are the password security requirements and MFA policies?", cat: "IT" },
    { title: "Engineering Microservices SLA", q: "What are our engineering microservice standards and SLA targets?", cat: "Engineering" }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadAvailableDocs = async () => {
    try {
      const data = await fetchDocuments();
      setAvailableDocs(data.documents || []);
    } catch (e) {
      console.error('[Fetch docs error]:', e);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await fetchChatSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('[Sessions fetch error]:', e);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadAvailableDocs();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setQuestion(initialPrompt);
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSelectSession = async (sId) => {
    if (sId === sessionId) return;
    setLoading(true);
    try {
      const data = await fetchChatHistory(sId);
      if (data.messages && data.messages.length > 0) {
        setSessionId(sId);
        setMessages(data.messages);
        const lastWithChunks = [...data.messages].reverse().find(m => m.retrievedChunks && m.retrievedChunks.length > 0);
        if (lastWithChunks) {
          setActiveChunks(lastWithChunks.retrievedChunks);
        }
      }
    } catch (e) {
      console.error('[Load session error]:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        role: 'assistant',
        content: 'New conversation started. Select a document or ask any question across your knowledge base.',
        citations: [],
        retrievedChunks: []
      }
    ]);
    setActiveChunks([]);
    setHighlightedCitation(null);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || question;
    if (!query || !query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const data = await askAIQuestion({
        question: query,
        sessionId,
        category: categoryFilter,
        documentIds: selectedDocId !== 'All' ? [selectedDocId] : null
      });

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
        loadSessions();
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        retrievedChunks: data.retrievedChunks || data.sources || []
      };

      setMessages(prev => [...prev, assistantMsg]);
      setActiveChunks(data.retrievedChunks || data.sources || []);

    } catch (err) {
      console.error('[Chat Component Error]:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error retrieving answer: ${err.message}. Please verify server and database status.`,
          citations: [],
          retrievedChunks: [],
          isError: true,
          failedQuery: query
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4 animate-fadeIn">
      <div className={`
        ${showSessionsSidebar ? 'w-full lg:w-64' : 'hidden'}
        shrink-0 glass-panel rounded-2xl border border-white/[0.08] bg-[#0C1224]/90 flex flex-col overflow-hidden transition-all duration-300
      `}>
        <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        <div className="flex-1 p-2 overflow-y-auto space-y-1">
          <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Conversation History
          </p>

          {sessionsLoading ? (
            <div className="py-6 text-center text-slate-500 text-xs">Loading sessions...</div>
          ) : sessions.length > 0 ? (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                  sessionId === s.id
                    ? 'bg-indigo-600/25 text-cyan-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                  {s.message_count || 1}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-slate-500 text-xs">
              No previous chat history.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/[0.08] bg-[#0B1020]/95 overflow-hidden shadow-2xl">
        <div className="p-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-[#0F172E]/70">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowSessionsSidebar(!showSessionsSidebar)}
              className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08] transition text-xs"
              title="Toggle Past Sessions"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-cyan-400 border border-indigo-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white">KnowFlow Grounded Intelligence</h3>
                <p className="text-[10px] text-slate-400">Verifiable Q&A grounded in uploaded PDF documents</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-white/[0.08] rounded-xl px-2.5 py-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium pr-1 max-w-[140px] truncate"
              >
                <option value="All" className="bg-[#0B1020] text-slate-200">Doc: All Documents</option>
                {availableDocs.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#0B1020] text-slate-200">
                    Doc: {d.original_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900 border border-white/[0.08] rounded-xl px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium pr-1"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-[#0B1020] text-slate-200">
                    Domain: {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition"
              title={showSourcePanel ? 'Hide Source Evidence Panel' : 'Show Source Evidence Panel'}
            >
              {showSourcePanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.length === 1 && (
            <div className="my-6 space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Suggested Enterprise Queries</span>
                <p className="text-xs text-slate-400">Click a prompt to test factual document citation retrieval</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(sq.q);
                      handleSend(sq.q);
                    }}
                    className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-cyan-400/40 text-left transition group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sq.cat}
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                    </div>
                    <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                      "{sq.q}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg}
              idx={idx}
              onCitationClick={(cit) => {
                setHighlightedCitation(cit);
                setShowSourcePanel(true);
              }}
              onRetry={(q) => handleSend(q)}
            />
          ))}

          {loading && (
            <div className="flex items-start space-x-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-cyan-500/30 text-slate-200 text-xs flex items-center space-x-3 bg-[#111A33]/90">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Searching document passages & generating grounded answer...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#0E1528]/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <input
              type="text"
              placeholder="Ask anything about leave policies, travel reimbursements, microservices SLAs..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900/90 border border-white/[0.1] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
            />
            
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition transform hover:-translate-y-0.5 shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {showSourcePanel && (
        <div className="w-full lg:w-96 h-96 lg:h-full shrink-0 animate-scaleIn">
          <div className="h-full flex flex-col glass-panel rounded-2xl border border-indigo-500/30 bg-[#0C1224]/95 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#10182F]/70">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs sm:text-sm text-white">Source Grounding Evidence</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {activeChunks.length} Chunks
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {activeChunks.length > 0 ? (
                activeChunks.map((chunk, idx) => (
                  <SourceCitation
                    key={chunk.id || idx}
                    chunk={chunk}
                    idx={idx}
                    isHighlighted={highlightedCitation && (highlightedCitation.documentName === chunk.documentName && Number(highlightedCitation.pageNumber) === Number(chunk.pageNumber))}
                  />
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 text-xs space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-500" />
                  <p className="font-bold text-slate-300 text-sm">No Grounding Sources Retrieved</p>
                  <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Ask a question in the AI Chat. The system will retrieve relevant PDF page excerpts and cite them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
