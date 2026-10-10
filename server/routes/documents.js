import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import db from '../db.js';
import { extractPdfPages } from '../services/pdf.js';
import { chunkPages } from '../services/chunker.js';
import { getEmbedding } from '../services/gemini.js';

const router = express.Router();

// Memory storage for multer PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents (.pdf) are supported.'), false);
    }
  }
});

// Helper for activity log
function logActivity(action, details, workspaceId = 'knowflow-enterprise-demo') {
  try {
    const id = `act_${crypto.randomUUID()}`;
    const stmt = db.prepare(`
      INSERT INTO activity_logs (id, action, details, workspace_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, action, details, workspaceId);
  } catch (e) {
    console.error('[Activity Log] Error:', e.message);
  }
}

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const category = req.body.category || 'General';
  const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
  const docId = `doc_${crypto.randomUUID().slice(0, 8)}`;
  let originalName = 'document.pdf';
  let fileSize = 0;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    originalName = req.file.originalname;
    fileSize = req.file.size;

    console.log(`[Upload Pipeline] Processing "${originalName}" (${(fileSize / 1024).toFixed(1)} KB) in category [${category}]`);

    // Step 1: Insert initial pending document record
    const insertDocStmt = db.prepare(`
      INSERT INTO documents (id, filename, original_name, file_size, page_count, category, status, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?, 'processing', ?)
    `);
    insertDocStmt.run(docId, originalName, originalName, fileSize, 0, category, workspaceId);

    // Step 2: Extract text page by page
    const { pageCount, pages } = await extractPdfPages(req.file.buffer);

    // Save pages to DB
    const insertPageStmt = db.prepare(`
      INSERT INTO document_pages (id, document_id, page_number, text)
      VALUES (?, ?, ?, ?)
    `);

    for (const page of pages) {
      insertPageStmt.run(`page_${docId}_${page.pageNumber}`, docId, page.pageNumber, page.text);
    }

    // Step 3: Chunk text into overlapping passages
    const chunks = chunkPages(docId, pages, 500, 100);

    if (chunks.length === 0) {
      throw new Error('Could not extract searchable text passages from this PDF.');
    }

    // Step 4: Generate vector embeddings & save chunks
    const insertChunkStmt = db.prepare(`
      INSERT INTO chunks (id, document_id, page_number, chunk_index, text, embedding, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    console.log(`[Upload Pipeline] Indexing ${chunks.length} vector chunks for "${originalName}"...`);

    for (const chunk of chunks) {
      const embeddingVec = await getEmbedding(chunk.text);
      insertChunkStmt.run(
        chunk.id,
        docId,
        chunk.pageNumber,
        chunk.chunkIndex,
        chunk.text,
        JSON.stringify(embeddingVec),
        workspaceId
      );
    }

    // Step 5: Update document status to 'indexed'
    const updateDocStmt = db.prepare(`
      UPDATE documents
      SET status = 'indexed', page_count = ?
      WHERE id = ?
    `);
    updateDocStmt.run(pageCount, docId);

    logActivity('DOCUMENT_UPLOADED', `Indexed "${originalName}" (${pageCount} pages, ${chunks.length} chunks) in domain [${category}]`, workspaceId);

    res.json({
      success: true,
      document: {
        id: docId,
        filename: originalName,
        category,
        pageCount,
        chunkCount: chunks.length,
        status: 'indexed',
        fileSize
      }
    });

  } catch (err) {
    console.error('[Upload Pipeline Error]:', err.message);

    // Update document status to 'failed' if record was created
    try {
      db.prepare(`UPDATE documents SET status = 'failed' WHERE id = ?`).run(docId);
    } catch (e) {
      // Ignore if doc was not inserted
    }

    logActivity('DOCUMENT_UPLOAD_FAILED', `Failed upload for "${originalName}": ${err.message}`, workspaceId);

    res.status(400).json({ error: err.message || 'Document processing failed.' });
  }
});

// GET /api/documents - List all documents in workspace
router.get('/', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
    
    const docs = db.prepare(`
      SELECT d.*, 
             (SELECT COUNT(*) FROM chunks c WHERE c.document_id = d.id) as chunk_count
      FROM documents d
      WHERE d.workspace_id = ?
      ORDER BY d.created_at DESC
    `).all(workspaceId);

    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id - Retrieve document metadata, pages, and chunks
router.get('/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const pages = db.prepare('SELECT page_number, text FROM document_pages WHERE document_id = ? ORDER BY page_number ASC').all(req.params.id);
    const chunks = db.prepare('SELECT id, page_number, chunk_index, text FROM chunks WHERE document_id = ? ORDER BY chunk_index ASC').all(req.params.id);

    res.json({
      document: doc,
      pages,
      chunks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id - Delete document and all chunks
router.delete('/:id', (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
    const doc = db.prepare('SELECT original_name FROM documents WHERE id = ?').get(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    db.prepare('DELETE FROM chunks WHERE document_id = ?').run(req.params.id);
    db.prepare('DELETE FROM document_pages WHERE document_id = ?').run(req.params.id);
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);

    logActivity('DOCUMENT_DELETED', `Deleted document "${doc.original_name}"`, workspaceId);

    res.json({ success: true, message: `Document "${doc.original_name}" deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/seed-samples
router.post('/seed-samples', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] || 'knowflow-enterprise-demo';
    
    const sampleDocs = [
      {
        filename: 'HR_Employee_Policy_2026.pdf',
        category: 'HR',
        pages: [
          {
            pageNumber: 1,
            text: 'KnowFlow Technologies Employee Handbook 2026. SECTION 1: REMOTE WORK POLICY. Employees are eligible for hybrid work after completing 30 days of service. Remote working hours must align with core team hours (10:00 AM to 4:00 PM EST). Employees receive a $500 home office stipend upon onboarding.'
          },
          {
            pageNumber: 2,
            text: 'SECTION 2: PAID TIME OFF & LEAVE. All full-time employees receive 20 days of paid vacation per year, plus 10 company holidays. Sick leave is accrued at 1 day per month up to 12 days annually. Maternity leave is 16 weeks paid; paternity leave is 8 weeks paid.'
          },
          {
            pageNumber: 3,
            text: 'SECTION 3: HEALTH & WELLNESS BENEFITS. Premium medical, dental, and vision insurance are 100% employer covered for employees and 75% for dependents. Includes a $75/month stipend for mental health or gym memberships.'
          }
        ]
      },
      {
        filename: 'Finance_Travel_Expense_Guide.pdf',
        category: 'Finance',
        pages: [
          {
            pageNumber: 1,
            text: 'KnowFlow Financial Compliance Guidelines. EXPENSE REIMBURSEMENT POLICY. All business expenses must be submitted within 30 days via the expense portal. Receipts are mandatory for all transactions above $25. Daily meal allowance during business travel is $75 per day.'
          },
          {
            pageNumber: 2,
            text: 'FLIGHTS & ACCOMMODATION: Economy class flights must be booked at least 14 days in advance for domestic travel and 30 days for international. Hotel stays are capped at $250/night in standard cities and $350/night in tier-1 metro areas (NYC, SF, London).'
          }
        ]
      },
      {
        filename: 'IT_Security_Access_Standard.pdf',
        category: 'IT',
        pages: [
          {
            pageNumber: 1,
            text: 'KnowFlow IT Infrastructure Security Standard. PASSWORD POLICY: Passwords must be at least 16 characters long and contain uppercase, lowercase, numbers, and special symbols. Multi-Factor Authentication (MFA) is compulsory on all accounts using hardware keys or authenticator apps. SMS MFA is explicitly prohibited.'
          },
          {
            pageNumber: 2,
            text: 'DEVICE SECURITY: All corporate laptops must run full-disk encryption (BitLocker/FileVault). Operating system security updates must be installed within 72 hours of release. Unapproved third-party software installation requires IT ticket approval.'
          }
        ]
      },
      {
        filename: 'Engineering_API_Architecture.pdf',
        category: 'Engineering',
        pages: [
          {
            pageNumber: 1,
            text: 'KnowFlow Engineering Platform Blueprint. MICROSERVICE STANDARDS: Services communicate asynchronously via gRPC or REST over TLS 1.3. Service latency SLA must be below 100ms at p99. Database connections must use connection pooling with max idle connections capped at 20 per pod.'
          },
          {
            pageNumber: 2,
            text: 'DEPLOYMENT & CI/CD: All pull requests require at least two senior peer code reviews and 85% unit test coverage before merging to main branch. Production deployments occur automatically after passing integration test pipelines.'
          }
        ]
      }
    ];

    let createdCount = 0;

    for (const sample of sampleDocs) {
      const existing = db.prepare('SELECT id FROM documents WHERE filename = ? AND workspace_id = ?').get(sample.filename, workspaceId);
      if (existing) continue;

      const docId = `doc_sample_${crypto.randomUUID().slice(0, 6)}`;
      
      db.prepare(`
        INSERT INTO documents (id, filename, original_name, file_size, page_count, category, status, workspace_id)
        VALUES (?, ?, ?, 154200, ?, ?, 'indexed', ?)
      `).run(docId, sample.filename, sample.filename, sample.pages.length, sample.category, workspaceId);

      for (const page of sample.pages) {
        db.prepare(`
          INSERT INTO document_pages (id, document_id, page_number, text)
          VALUES (?, ?, ?, ?)
        `).run(`page_${docId}_${page.pageNumber}`, docId, page.pageNumber, page.text);
      }

      const chunks = chunkPages(docId, sample.pages, 500, 100);

      for (const chunk of chunks) {
        const embeddingVec = await getEmbedding(chunk.text);
        db.prepare(`
          INSERT INTO chunks (id, document_id, page_number, chunk_index, text, embedding, workspace_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          chunk.id,
          docId,
          chunk.pageNumber,
          chunk.chunkIndex,
          chunk.text,
          JSON.stringify(embeddingVec),
          workspaceId
        );
      }

      createdCount++;
    }

    logActivity('SAMPLE_DOCUMENTS_SEEDED', `Seeded ${createdCount} synthetic enterprise sample documents across HR, Finance, IT, Engineering categories.`, workspaceId);

    res.json({
      success: true,
      message: `Seeded ${createdCount} synthetic knowledge base documents.`
    });

  } catch (err) {
    console.error('[Seed Samples Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
