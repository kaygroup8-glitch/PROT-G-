import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { processTeachingTurn, reconstructConceptUnderstanding, evaluateSecondAttemptDiff, generatePersonalizedRoadmap } from './server/geminiService';
import { transcribeWithAssemblyAI, generateNeuralSpeech } from './server/voiceService';

// Load .env.local first (common for Codespaces & local dev), then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.raw({ type: ['audio/*', 'application/octet-stream'], limit: '15mb' }));

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PROTÉGÉ Server',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasAssemblyAIKey: Boolean(process.env.ASSEMBLYAI_API_KEY),
    });
  });

  // Handle teaching turn
  app.post('/api/teach', async (req, res) => {
    try {
      const { concept, history, message } = req.body;
      if (!concept || !message) {
        return res.status(400).json({ error: 'Concept and message are required.' });
      }

      const result = await processTeachingTurn(concept, history || [], message);
      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/teach:', err);
      const errMsg = err instanceof Error ? err.message : 'Internal error processing teaching turn.';
      res.status(500).json({ error: errMsg });
    }
  });

  // Handle concept reconstruction and evidence gap analysis
  app.post('/api/reconstruct', async (req, res) => {
    try {
      const { concept, history } = req.body;
      if (!concept || !history) {
        return res.status(400).json({ error: 'Concept and session history are required.' });
      }

      const report = await reconstructConceptUnderstanding(concept, history);
      res.json(report);
    } catch (err: unknown) {
      console.error('Error in /api/reconstruct:', err);
      const errMsg = err instanceof Error ? err.message : 'Internal error reconstructing understanding.';
      res.status(500).json({ error: errMsg });
    }
  });

  // Handle second-attempt diff evaluation (verifying missing connection repair)
  app.post('/api/diff', async (req, res) => {
    try {
      const { concept, targetRelationship, attempt1Transcript, attempt2Transcript } = req.body;
      if (!concept || !targetRelationship || !attempt2Transcript) {
        return res.status(400).json({ error: 'concept, targetRelationship, and attempt2Transcript are required.' });
      }

      const diffResult = await evaluateSecondAttemptDiff(
        concept,
        targetRelationship,
        attempt1Transcript || '',
        attempt2Transcript
      );
      res.json(diffResult);
    } catch (err: unknown) {
      console.error('Error in /api/diff:', err);
      const errMsg = err instanceof Error ? err.message : 'Internal error evaluating second attempt diff.';
      res.status(500).json({ error: errMsg });
    }
  });

  // Handle AssemblyAI voice transcription proxy
  app.post('/api/voice/transcribe', async (req, res) => {
    try {
      let buffer: Buffer | null = null;
      let mimeType = (req.headers['content-type'] as string) || 'audio/webm';

      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        buffer = req.body;
      } else if (req.body && typeof req.body === 'object' && req.body.audioBase64) {
        buffer = Buffer.from(req.body.audioBase64, 'base64');
        if (req.body.mimeType) mimeType = req.body.mimeType;
      }

      if (buffer && buffer.length > 0) {
        const result = await transcribeWithAssemblyAI(buffer, mimeType);
        return res.json(result);
      }
      return res.status(400).json({ error: 'Audio data is required.' });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'AssemblyAI voice transcription failed.';
      console.error('AssemblyAI transcription failed:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  // Handle Neural AI Voice synthesis (replacing robotic Web Speech with natural audio)
  app.post('/api/voice/speak', async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required for voice synthesis.' });
      }

      const wavBuffer = await generateNeuralSpeech(text.trim(), voice || 'Kore');
      res.set({
        'Content-Type': 'audio/wav',
        'Content-Length': wavBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      });
      res.send(wavBuffer);
    } catch (err: unknown) {
      console.error('Error generating neural voice:', err);
      const errMsg = err instanceof Error ? err.message : 'Speech generation failed.';
      res.status(500).json({ error: errMsg });
    }
  });

  // Handle Dynamic Personalized Roadmap Generation
  app.post('/api/roadmap/generate', async (req, res) => {
    try {
      const { profile } = req.body;
      const concepts = await generatePersonalizedRoadmap(profile || {});
      res.json({ concepts });
    } catch (err: unknown) {
      console.error('Error generating personalized roadmap:', err);
      const errMsg = err instanceof Error ? err.message : 'Roadmap generation failed.';
      res.status(500).json({ error: errMsg });
    }
  });

  // --- Vite / Static Files Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PROTÉGÉ server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
