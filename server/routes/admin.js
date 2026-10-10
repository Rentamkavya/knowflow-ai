import express from 'express';
import db from '../db.js';
import { isGeminiConfigured } from '../services/gemini.js';

const router = express.Router();

// GET /api/admin/stats - Overview Dashboard & Admin Statistics
router.get('/stats', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';

    const docCount = db.prepare('SELECT COUNT(*) as count FROM documents WHERE workspace_id = ?').get(workspaceId).count;
    const pageCount = db.prepare('SELECT SUM(page_count) as total FROM documents WHERE workspace_id = ?').get(workspaceId).total || 0;
    const chunkCount = db.prepare('SELECT COUNT(*) as count FROM chunks WHERE workspace_id = ?').get(workspaceId).count;
    const queryCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE role = "user" AND workspace_id = ?').get(workspaceId).count;

    const categories = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM documents 
      WHERE workspace_id = ?
      GROUP BY category
    `).all(workspaceId);

    const recentActivity = db.prepare(`
      SELECT * FROM activity_logs 
      WHERE workspace_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(workspaceId);

    res.json({
      totalDocuments: docCount,
      totalPages: pageCount,
      totalChunks: chunkCount,
      totalQueries: queryCount,
      categories,
      recentActivity,
      geminiStatus: isGeminiConfigured() ? 'Active (Gemini 2.5 Flash & text-embedding-004)' : 'Unconfigured (Local fallback mode)'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/logs - Audit Activity Logs
router.get('/logs', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
    const logs = db.prepare(`
      SELECT * FROM activity_logs 
      WHERE workspace_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all(workspaceId);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/clear - Purge workspace document knowledge base
router.post('/clear', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';

    db.prepare('DELETE FROM chunks WHERE workspace_id = ?').run(workspaceId);
    db.prepare('DELETE FROM document_pages WHERE document_id IN (SELECT id FROM documents WHERE workspace_id = ?)').run(workspaceId);
    db.prepare('DELETE FROM documents WHERE workspace_id = ?').run(workspaceId);

    // Record activity log
    db.prepare(`
      INSERT INTO activity_logs (id, action, details, workspace_id)
      VALUES (?, 'KNOWLEDGE_BASE_CLEARED', 'Purged all documents, pages, and chunk embeddings from workspace', ?)
    `).run(`act_${Date.now()}`, workspaceId);

    res.json({ success: true, message: 'Knowledge base completely reset.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
