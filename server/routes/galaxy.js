import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/galaxy - Interactive Knowledge Galaxy Graph Data
router.get('/', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';

    const docs = db.prepare(`
      SELECT d.id, d.original_name, d.category, d.page_count, d.created_at,
             (SELECT COUNT(*) FROM chunks c WHERE c.document_id = d.id) as chunk_count
      FROM documents d
      WHERE d.workspace_id = ?
    `).all(workspaceId);

    const categories = ['HR', 'Finance', 'IT', 'Engineering', 'Product'];
    
    const nodes = [];
    const links = [];

    // 1. Root Central Knowledge Hub Node
    nodes.push({
      id: 'root-hub',
      label: 'KnowFlow Galaxy Hub',
      type: 'root',
      category: 'System',
      size: 40,
      color: '#8B5CF6' // Violet
    });

    // 2. Category Hub Nodes
    categories.forEach((cat, idx) => {
      const catNodeId = `cat-${cat}`;
      const catDocs = docs.filter(d => d.category === cat);
      
      nodes.push({
        id: catNodeId,
        label: `${cat} Knowledge`,
        type: 'category',
        category: cat,
        docCount: catDocs.length,
        size: 28,
        color: cat === 'HR' ? '#EC4899' :
               cat === 'Finance' ? '#10B981' :
               cat === 'IT' ? '#3B82F6' :
               cat === 'Engineering' ? '#F59E0B' : '#6366F1'
      });

      links.push({
        source: 'root-hub',
        target: catNodeId,
        strength: 0.8
      });
    });

    // 3. Document Nodes & Chunk Subnodes
    docs.forEach(doc => {
      const docNodeId = `doc-${doc.id}`;
      const catNodeId = `cat-${doc.category}`;

      nodes.push({
        id: docNodeId,
        label: doc.original_name,
        type: 'document',
        category: doc.category,
        pageCount: doc.page_count,
        chunkCount: doc.chunk_count,
        size: 20,
        color: '#06B6D4' // Cyan
      });

      // Link document to category
      links.push({
        source: catNodeId,
        target: docNodeId,
        strength: 0.6
      });

      // Fetch top 3 chunks for galaxy visual preview
      const chunks = db.prepare(`
        SELECT id, page_number, chunk_index, text 
        FROM chunks 
        WHERE document_id = ? 
        LIMIT 3
      `).all(doc.id);

      chunks.forEach((chunk, cIdx) => {
        const chunkNodeId = `chunk-${chunk.id}`;
        nodes.push({
          id: chunkNodeId,
          label: `Pg ${chunk.page_number} Snippet`,
          type: 'chunk',
          category: doc.category,
          docName: doc.original_name,
          pageNumber: chunk.page_number,
          snippet: chunk.text.slice(0, 120) + '...',
          size: 10,
          color: '#94A3B8'
        });

        links.push({
          source: docNodeId,
          target: chunkNodeId,
          strength: 0.3
        });
      });
    });

    res.json({
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        documentsCount: docs.length
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
