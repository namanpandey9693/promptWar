import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root BEFORE any other imports
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import generateRouter from './routes/generate.js';
import realityCheckRouter from './routes/reality-check.js';
import architectureRouter from './routes/architecture.js';
import roadmapRouter from './routes/roadmap.js';
import mentorRouter from './routes/mentor.js';
import vivaRouter from './routes/viva.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for dev
  crossOriginEmbedderPolicy: false,
}));

// ── CORS — restrict to known origins ─────────────────────────────────
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// ── Body parsing with size limit ─────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate Limiter — protect Gemini-backed endpoints ──────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1-minute window
  max: 30,                 // max 30 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again in a moment.' },
});
app.use('/api', apiLimiter);

// ── API routes ───────────────────────────────────────────────────────
app.use('/api/generate-projects', generateRouter);
app.use('/api/reality-check', realityCheckRouter);
app.use('/api/architecture', architectureRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/viva', vivaRouter);

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeySet: !!process.env.GEMINI_API_KEY,
  });
});

// ── 404 catch-all ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Global error handler ─────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🚀 ProjectPilot API running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY is not set! Add it to .env file.');
  }
});

