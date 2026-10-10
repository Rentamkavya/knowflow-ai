import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'knowflow_data.json');

// In-memory data store structure
let store = {
  documents: [],
  document_pages: [],
  chunks: [],
  chat_sessions: [],
  chat_messages: [],
  activity_logs: []
};

// Load existing data from file if present
function loadStore() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      if (content.trim()) {
        store = { ...store, ...JSON.parse(content) };
        console.log(`[Pure-JS DB] Loaded persisted database from ${dbFilePath}`);
      }
    }
  } catch (err) {
    console.error('[Pure-JS DB] Error loading database file:', err.message);
  }
}

// Persist current store state to disk
function saveStore() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Pure-JS DB] Error saving database file:', err.message);
  }
}

loadStore();

class PureJSStatement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  run(...params) {
    const sql = this.sql;

    if (sql.startsWith('INSERT INTO documents')) {
      let docObj;
      const created_at = new Date().toISOString();

      if (sql.includes('154200')) {
        // Seed samples query: (id, filename, original_name, file_size, page_count, category, status, workspace_id)
        // Params passed: (docId, filename, original_name, page_count, category, workspaceId)
        const [id, filename, original_name, page_count, category, workspace_id] = params;
        docObj = { id, filename, original_name, file_size: 154200, page_count, category, status: 'indexed', workspace_id, created_at };
      } else {
        // Standard upload query: (id, filename, original_name, file_size, page_count, category, status, workspace_id)
        // Params passed: (docId, originalName, originalName, fileSize, pageCount/0, category, workspaceId)
        const [id, filename, original_name, file_size, page_count, category, workspace_id] = params;
        docObj = { id, filename, original_name, file_size, page_count: page_count || 0, category, status: 'processing', workspace_id, created_at };
      }

      const existingIdx = store.documents.findIndex(d => d.id === docObj.id);
      if (existingIdx >= 0) store.documents[existingIdx] = docObj;
      else store.documents.push(docObj);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('INSERT INTO document_pages')) {
      const [id, document_id, page_number, text] = params;
      store.document_pages.push({ id, document_id, page_number, text });
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('INSERT INTO chunks')) {
      const [id, document_id, page_number, chunk_index, text, embedding, workspace_id] = params;
      const created_at = new Date().toISOString();
      store.chunks.push({ id, document_id, page_number, chunk_index, text, embedding, workspace_id, created_at });
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('INSERT INTO chat_sessions')) {
      const [id, title, workspace_id] = params;
      const created_at = new Date().toISOString();
      store.chat_sessions.push({ id, title, workspace_id, created_at });
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('INSERT INTO chat_messages')) {
      const created_at = new Date().toISOString();
      let msgObj;

      if (sql.includes("'user'")) {
        // user msg: (id, session_id, role, content, workspace_id)
        // Params: (id, session_id, content, workspace_id)
        const [id, session_id, content, workspace_id] = params;
        msgObj = { id, session_id, role: 'user', content, citations: null, workspace_id, created_at };
      } else if (sql.includes("'assistant'")) {
        // assistant msg: (id, session_id, role, content, citations, workspace_id)
        // Params: (id, session_id, content, citations, workspace_id)
        const [id, session_id, content, citations, workspace_id] = params;
        msgObj = { id, session_id, role: 'assistant', content, citations, workspace_id, created_at };
      }

      if (msgObj) {
        store.chat_messages.push(msgObj);
        saveStore();
      }
      return { changes: 1 };
    }

    if (sql.startsWith('INSERT INTO activity_logs')) {
      const created_at = new Date().toISOString();
      let logObj;

      if (sql.includes("'AI_QUERY'")) {
        const [id, details, workspace_id] = params;
        logObj = { id, action: 'AI_QUERY', details, user_role: 'Employee', workspace_id, created_at };
      } else if (sql.includes("'KNOWLEDGE_BASE_CLEARED'")) {
        const [id, workspace_id] = params;
        logObj = { id, action: 'KNOWLEDGE_BASE_CLEARED', details: 'Purged all documents, pages, and chunk embeddings from workspace', user_role: 'Admin', workspace_id, created_at };
      } else {
        const [id, action, details, workspace_id] = params;
        logObj = { id, action, details, user_role: 'Admin', workspace_id, created_at };
      }

      store.activity_logs.unshift(logObj);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('UPDATE documents')) {
      const [page_count, id] = params;
      const doc = store.documents.find(d => d.id === id);
      if (doc) {
        doc.status = 'indexed';
        doc.page_count = page_count;
        saveStore();
      }
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM chunks WHERE workspace_id = ?')) {
      const [wsId] = params;
      store.chunks = store.chunks.filter(c => c.workspace_id !== wsId);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM chunks WHERE document_id = ?')) {
      const [docId] = params;
      store.chunks = store.chunks.filter(c => c.document_id !== docId);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM document_pages WHERE document_id IN')) {
      const [wsId] = params;
      const docIds = new Set(store.documents.filter(d => d.workspace_id === wsId).map(d => d.id));
      store.document_pages = store.document_pages.filter(p => !docIds.has(p.document_id));
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM document_pages WHERE document_id = ?')) {
      const [docId] = params;
      store.document_pages = store.document_pages.filter(p => p.document_id !== docId);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM documents WHERE workspace_id = ?')) {
      const [wsId] = params;
      store.documents = store.documents.filter(d => d.workspace_id !== wsId);
      saveStore();
      return { changes: 1 };
    }

    if (sql.startsWith('DELETE FROM documents WHERE id = ?')) {
      const [docId] = params;
      store.documents = store.documents.filter(d => d.id !== docId);
      saveStore();
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  get(...params) {
    const sql = this.sql;

    if (sql.includes('FROM documents WHERE id = ?')) {
      const [id] = params;
      return store.documents.find(d => d.id === id) || null;
    }

    if (sql.includes('FROM documents WHERE filename = ? AND workspace_id = ?')) {
      const [filename, wsId] = params;
      return store.documents.find(d => d.filename === filename && d.workspace_id === wsId) || null;
    }

    if (sql.includes('FROM chat_sessions WHERE id = ?')) {
      const [id] = params;
      return store.chat_sessions.find(s => s.id === id) || null;
    }

    if (sql.includes('COUNT(*) as count FROM documents WHERE workspace_id = ?')) {
      const [wsId] = params;
      const count = store.documents.filter(d => d.workspace_id === wsId).length;
      return { count };
    }

    if (sql.includes('SUM(page_count) as total FROM documents WHERE workspace_id = ?')) {
      const [wsId] = params;
      const total = store.documents.filter(d => d.workspace_id === wsId).reduce((sum, d) => sum + (d.page_count || 0), 0);
      return { total };
    }

    if (sql.includes('COUNT(*) as count FROM chunks WHERE workspace_id = ?')) {
      const [wsId] = params;
      const count = store.chunks.filter(c => c.workspace_id === wsId).length;
      return { count };
    }

    if (sql.includes('COUNT(*) as count FROM chat_messages WHERE role = "user" AND workspace_id = ?')) {
      const [wsId] = params;
      const count = store.chat_messages.filter(m => m.role === 'user' && m.workspace_id === wsId).length;
      return { count };
    }

    return null;
  }

  all(...params) {
    const sql = this.sql;

    if (sql.includes('FROM documents d') && sql.includes('WHERE d.workspace_id = ?')) {
      const [wsId] = params;
      return store.documents
        .filter(d => d.workspace_id === wsId)
        .map(d => ({
          ...d,
          chunk_count: store.chunks.filter(c => c.document_id === d.id).length
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sql.includes('FROM document_pages WHERE document_id = ?')) {
      const [docId] = params;
      return store.document_pages
        .filter(p => p.document_id === docId)
        .sort((a, b) => a.page_number - b.page_number);
    }

    if (sql.includes('FROM chunks WHERE document_id = ? LIMIT 3')) {
      const [docId] = params;
      return store.chunks
        .filter(c => c.document_id === docId)
        .slice(0, 3);
    }

    if (sql.includes('FROM chunks WHERE document_id = ? ORDER BY chunk_index')) {
      const [docId] = params;
      return store.chunks
        .filter(c => c.document_id === docId)
        .sort((a, b) => a.chunk_index - b.chunk_index);
    }

    if (sql.includes('FROM chunks c') && sql.includes('JOIN documents d')) {
      const wsId = params[0];
      const catFilter = params[1];

      return store.chunks
        .filter(c => c.workspace_id === wsId)
        .map(c => {
          const doc = store.documents.find(d => d.id === c.document_id);
          return {
            ...c,
            document_name: doc ? doc.original_name : 'Unknown Document',
            category: doc ? doc.category : 'General'
          };
        })
        .filter(c => !catFilter || c.category === catFilter);
    }

    if (sql.includes('FROM chat_sessions s')) {
      const [wsId] = params;
      return store.chat_sessions
        .filter(s => s.workspace_id === wsId)
        .map(s => ({
          ...s,
          message_count: store.chat_messages.filter(m => m.session_id === s.id).length
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sql.includes('FROM chat_messages WHERE session_id = ?')) {
      const [sessionId] = params;
      return store.chat_messages
        .filter(m => m.session_id === sessionId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    if (sql.includes('GROUP BY category')) {
      const [wsId] = params;
      const catCounts = {};
      store.documents.filter(d => d.workspace_id === wsId).forEach(d => {
        catCounts[d.category] = (catCounts[d.category] || 0) + 1;
      });
      return Object.entries(catCounts).map(([category, count]) => ({ category, count }));
    }

    if (sql.includes('FROM activity_logs')) {
      const [wsId] = params;
      const limit = sql.includes('LIMIT 10') ? 10 : 100;
      return store.activity_logs
        .filter(l => l.workspace_id === wsId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    }

    return [];
  }
}

const db = {
  exec: (sql) => {
    console.log('[Pure-JS DB] Schema verified.');
  },
  prepare: (sql) => new PureJSStatement(sql)
};

export default db;
