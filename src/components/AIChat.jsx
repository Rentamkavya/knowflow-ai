import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  PanelRightOpen, 
  PanelRightClose, 
  BookOpen, 
  Copy, 
  Check, 
  Plus, 
  MessageSquare, 
  Clock, 
  CornerDownLeft, 
  FileText,
  RotateCcw
} from 'lucide-react';
import SourcePanel from './SourcePanel';

export default function AIChat({ initialPrompt, onAskPrompt }) {
  const [question, setQuestion] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedDocId, setSelectedDocId] = useState('All');
  const [availableDocs, setAvailableDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
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
    { title: "Remote Work & Stipend", q: "What is our company remote work policy and home office allowance?", cat: "HR" },
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

  // Fetch available documents
  const fetchAvailableDocs = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { 'x-workspace-id': 'knowflow-enterprise-demo' }
      });
      const data = await res.json();
      setAvailableDocs(data.documents || []);
    } catch (e) {
      console.error('[Fetch docs error]:', e);
    }
  };

  // Fetch past chat sessions
  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/chat/sessions', {
        headers: { 'x-workspace-id': 'knowflow-enterprise-demo' }
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('[Sessions fetch error]:', e);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAvailableDocs();
  }, []);

  // Handle external initialPrompt passed from dashboard
  useEffect(() => {
    if (initialPrompt) {
      setQuestion(initialPrompt);
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Load a past session
  const handleSelectSession = async (sId) => {
    if (sId === sessionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/history/${sId}`);
      const data = await res.json();
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

  const handleCopyAnswer = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || question;
    if (!query || !query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const payload = {
        question: query,
        sessionId,
        category: categoryFilter,
        documentIds: selectedDocId !== 'All' ? [selectedDocId] : null
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': 'knowflow-enterprise-demo'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
        fetchSessions(); // refresh sessions list
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

  // Render assistant content with clickable citations
  const renderMessageContent = (content, citations) => {
    const parts = content.split(/(\[Doc:[^\]]+\])/g);

    return parts.map((part, i) => {
      const match = part.match(/\[Doc:\s*(.*?),\s*Page:\s*(\d+)\]/i);
      if (match) {
        const docName = match[1];
        const pageNum = parseInt(match[2], 10);

        return (
          <button
            key={i}
            onClick={() => {
              setHighlightedCitation({ documentName: docName, pageNumber: pageNum });
              setShowSourcePanel(true);
            }}
            className="inline-flex items-center space-x-1 px-2 py-0.5 mx-1 rounded bg-indigo-950/90 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-500/50 font-mono text-[11px] font-bold cursor-pointer transition shadow-xs align-baseline"
            title={`View verified excerpt: ${docName}, Page ${pageNum}`}
          >
            <BookOpen className="w-3 h-3 text-cyan-400 inline" />
            <span>[{docName} • Pg {pageNum}]</span>
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4 animate-fadeIn">
      
      {/* 1. Conversations Sessions Sidebar */}
      <div className={`
        ${showSessionsSidebar ? 'w-full lg:w-64' : 'hidden'}
        shrink-0 glass-panel rounded-2xl border border-white/[0.08] bg-[#0C1224]/90 flex flex-col overflow-hidden transition-all duration-300
      `}>
        {/* New Chat Button */}
        <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Sessions List */}
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

      {/* 2. Main Chat Conversation Canvas */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/[0.08] bg-[#0B1020]/95 overflow-hidden shadow-2xl">
        
        {/* Chat Top Control Bar */}
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
            {/* Document Selector */}
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

            {/* Category Filter Scope Selector */}
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

            {/* Source Panel Toggle */}
            <button
              onClick={() => setShowSourcePanel(!showSourcePanel)}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition"
              title={showSourcePanel ? 'Hide Source Evidence Panel' : 'Show Source Evidence Panel'}
            >
              {showSourcePanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Message Thread List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Welcome Prompt Cards (when only 1 greeting message) */}
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

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                  : msg.isError
                  ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-tl-none'
                  : 'glass-panel border border-white/[0.08] text-slate-200 rounded-tl-none bg-[#111A33]/80'
              }`}>
                
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                  {msg.role === 'assistant'
                    ? renderMessageContent(msg.content, msg.citations)
                    : msg.content}
                </div>

                {/* Assistant Footer: Citations and Copy Action */}
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="pt-2.5 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
                    
                    {/* Citations pill list */}
                    {msg.citations && msg.citations.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Sources ({msg.citations.length}):
                        </span>
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => {
                              setHighlightedCitation(cit);
                              setShowSourcePanel(true);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-white/[0.08] font-mono text-[10px] font-semibold transition"
                          >
                            {cit.documentName} (Pg {cit.pageNumber})
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No specific document citations required</span>
                    )}

                    {/* Copy answer button */}
                    <button
                      onClick={() => handleCopyAnswer(idx, msg.content)}
                      className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition ml-auto"
                      title="Copy response to clipboard"
                    >
                      {copiedMsgIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Answer</span>
                        </>
                      )}
                    </button>

                  </div>
                )}

                {/* Error Retry Option */}
                {msg.isError && msg.failedQuery && (
                  <div className="pt-2 border-t border-rose-800/40 flex justify-end">
                    <button
                      onClick={() => handleSend(msg.failedQuery)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Question</span>
                    </button>
                  </div>
                )}

              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Searching vector state */}
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

        {/* Input Form Bar */}
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

      {/* 3. Right Source Grounding Evidence Panel */}
      {showSourcePanel && (
        <div className="w-full lg:w-96 h-96 lg:h-full shrink-0 animate-scaleIn">
          <SourcePanel
            retrievedChunks={activeChunks.length > 0 ? activeChunks : (messages[messages.length - 1]?.retrievedChunks || [])}
            highlightedCitation={highlightedCitation}
            onClose={() => setShowSourcePanel(false)}
          />
        </div>
      )}

    </div>
  );
}
