import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import galaxyRouter from './routes/galaxy.js';
import adminRouter from './routes/admin.js';
import { isGeminiConfigured } from './services/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/galaxy', galaxyRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'KnowFlow AI',
    geminiConfigured: isGeminiConfigured(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production build mode
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('KnowFlow AI Backend Running. Please start Vite frontend dev server on port 3000.');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`
  =============================================================
  🚀 KnowFlow AI Server Running on http://localhost:${PORT}
  🔑 Gemini API Status: ${isGeminiConfigured() ? '✅ CONFIG_OK (Active)' : '⚠️ KEY_MISSING (Using local fallback)'}
  =============================================================
  `);
});
