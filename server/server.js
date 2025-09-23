import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;

if (!API_KEY) {
  console.warn('[WARN] API_KEY not set. /api/chat will return 500 until it is configured.');
}
if (!MODEL) {
  console.warn('[WARN] MODEL not set. /api/chat will return 500 until it is configured.');
}

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || '';

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, locale = 'ml-IN' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured: API_KEY missing' });
    if (!MODEL) return res.status(500).json({ error: 'Server not configured: MODEL missing' });

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

    // Convert messages to a single prompt with system instruction
    const userTranscript = messages
      .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

  const prompt = `${SYSTEM_PROMPT}\n\nLocale: ${locale}\n\nConversation so far:\n${userTranscript}\n\nAssistant:`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ reply: text });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Chat backend listening on http://localhost:${PORT}`);
});
