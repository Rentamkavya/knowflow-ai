import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { getEmbedding, cosineSimilarity, generateGroundedAnswer } from '../services/gemini.js';

const router = express.Router();

/**
 * Calculates keyword / term match score between query string and chunk text.
 */
function calculateTermScore(query, text) {
  if (!query || !text) return 0;
  const stopWords = new Set([
    'what', 'where', 'when', 'which', 'who', 'how', 'why', 'is', 'are', 'was', 'were', 
    'the', 'our', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 
    'about', 'company', 'policy', 'regarding', 'does', 'do', 'did', 'have', 'has', 'had',
    'please', 'tell', 'me', 'what', 'say', 'says'
  ]);
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const queryTerms = cleanQuery.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t));
  
  if (queryTerms.length === 0) return 0.2;

  const lowerText = text.toLowerCase();
  let matches = 0;

  for (const term of queryTerms) {
    if (lowerText.includes(term)) {
      matches++;
    }
  }

  return matches / queryTerms.length;
}

// RAG Grounded Query Handler
const handleChatQuery = async (req, res) => {
  try {
    const { question, query, sessionId, category, documentIds } = req.body;
    const userQuestion = (question || query || '').trim();
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';

    if (!userQuestion) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const activeSessionId = sessionId || `session_${crypto.randomUUID().slice(0, 8)}`;

    // Ensure session exists
    const existingSession = db.prepare('SELECT id FROM chat_sessions WHERE id = ?').get(activeSessionId);
    if (!existingSession) {
      db.prepare(`
        INSERT INTO chat_sessions (id, title, workspace_id)
        VALUES (?, ?, ?)
      `).run(activeSessionId, userQuestion.slice(0, 40) + '...', workspaceId);
    }

    // 1. Embed query
    console.log(`[RAG Engine] Querying: "${userQuestion}" (Category: ${category || 'All'}, Docs: ${documentIds ? documentIds.length : 'All'})`);
    const queryVector = await getEmbedding(userQuestion);

    // 2. Query stored chunks from DB with filters
    let querySql = `
      SELECT c.*, d.original_name as document_name, d.category
      FROM chunks c
      JOIN documents d ON c.document_id = d.id
      WHERE c.workspace_id = ?
    `;
    const params = [workspaceId];

    // Filter by specific document IDs if provided
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      const placeholders = documentIds.map(() => '?').join(',');
      querySql += ` AND c.document_id IN (${placeholders})`;
      params.push(...documentIds);
    }

    // Filter by department category if provided
    if (category && category !== 'All') {
      querySql += ` AND d.category = ?`;
      params.push(category);
    }

    const allChunks = db.prepare(querySql).all(...params);

    if (allChunks.length === 0) {
      return res.json({
        sessionId: activeSessionId,
        answer: "I couldn't find a reliable answer to this question in the selected documents.",
        citations: [],
        sources: [],
        retrievedChunks: []
      });
    }

    // 3. Compute Hybrid Similarity Score (Vector Cosine + Term Matching)
    const scoredChunks = allChunks.map(chunk => {
      let vec = [];
      try {
        vec = JSON.parse(chunk.embedding || '[]');
      } catch (e) {
        vec = [];
      }

      const vecSim = cosineSimilarity(queryVector, vec);
      const termScore = calculateTermScore(userQuestion, chunk.text);
      
      // Strict relevance gate: requiring at least 50% keyword match or high vector similarity (>= 0.55)
      let hybridScore = 0;
      if (termScore >= 0.4 || vecSim >= 0.55) {
        hybridScore = parseFloat(((vecSim * 0.5) + (termScore * 0.5)).toFixed(4));
      }

      return {
        ...chunk,
        similarity: hybridScore,
        vecSim,
        termScore
      };
    });

    // Sort descending by hybrid score
    scoredChunks.sort((a, b) => b.similarity - a.similarity);

    // Filter chunks with positive relevance
    const topChunks = scoredChunks.filter(c => c.similarity > 0.15).slice(0, 5);

    if (topChunks.length === 0) {
      return res.json({
        sessionId: activeSessionId,
        answer: "I couldn't find a reliable answer to this question in the selected documents.",
        citations: [],
        sources: [],
        retrievedChunks: []
      });
    }

    console.log(`[RAG Engine] Retrieved top ${topChunks.length} chunks. Highest similarity score: ${topChunks[0]?.similarity || 0}`);

    // 4. Generate Grounded Gemini Answer
    const { answer, citations } = await generateGroundedAnswer(userQuestion, topChunks);

    // 5. Record messages in DB
    const userMsgId = `msg_${crypto.randomUUID().slice(0, 8)}`;
    const assistantMsgId = `msg_${crypto.randomUUID().slice(0, 8)}`;

    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, workspace_id)
      VALUES (?, ?, 'user', ?, ?)
    `).run(userMsgId, activeSessionId, userQuestion, workspaceId);

    db.prepare(`
      INSERT INTO chat_messages (id, session_id, role, content, citations, workspace_id)
      VALUES (?, ?, 'assistant', ?, ?, ?)
    `).run(assistantMsgId, activeSessionId, answer, JSON.stringify(citations), workspaceId);

    // Log Activity
    db.prepare(`
      INSERT INTO activity_logs (id, action, details, workspace_id)
      VALUES (?, 'AI_QUERY', ?, ?)
    `).run(`act_${crypto.randomUUID()}`, `Q&A Query: "${userQuestion.slice(0, 50)}..."`, workspaceId);

    const formattedChunks = topChunks.map(c => ({
      id: c.id,
      documentId: c.document_id,
      documentName: c.document_name,
      category: c.category,
      pageNumber: c.page_number,
      similarity: c.similarity,
      excerpt: c.text
    }));

    res.json({
      sessionId: activeSessionId,
      answer,
      citations,
      sources: formattedChunks,
      retrievedChunks: formattedChunks
    });

  } catch (err) {
    console.error('[Chat Route Error]:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI query.' });
  }
};

// POST /api/chat - RAG Grounded Query Endpoint
router.post('/', handleChatQuery);

// POST /api/chat/ask - Alias RAG Grounded Query Endpoint
router.post('/ask', handleChatQuery);

// GET /api/chat/sessions - List past chat sessions
router.get('/sessions', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
    const sessions = db.prepare(`
      SELECT s.*, 
             (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id) as message_count
      FROM chat_sessions s
      WHERE s.workspace_id = ?
      ORDER BY s.created_at DESC
    `).all(workspaceId);

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/history/:sessionId - Retrieve thread history
router.get('/history/:sessionId', (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(req.params.sessionId);

    const formatted = messages.map(m => ({
      ...m,
      citations: m.citations ? JSON.parse(m.citations) : []
    }));

    res.json({ messages: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
