export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    const url = new URL(request.url)
    if (url.pathname === '/api/health') {
      return json({ ok: true })
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages = [], locale = env.LOCALE || 'ml-IN', sessionId } = await request.json()
        if (!Array.isArray(messages) || messages.length === 0) {
          return json({ error: 'messages array required' }, 400)
        }

        const apiKey = env.API_KEY
        if (!apiKey) {
          return json({ error: 'Server not configured: API_KEY missing' }, 500)
        }

        const model = env.MODEL && String(env.MODEL).trim()
        if (!model) {
          return json({ error: 'Server not configured: MODEL missing' }, 500)
        }

  const sysPrompt = (env.SYSTEM_PROMPT && String(env.SYSTEM_PROMPT).trim()) || ''

        const contentsClient = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))

        let memorySummary = ''
        let recentTurns = []

        if (sessionId && env.SESSION_MEMORY) {
          const id = env.SESSION_MEMORY.idFromName(sessionId)
          const stub = env.SESSION_MEMORY.get(id)
          const mem = await (await stub.fetch('https://do/session', {
            method: 'POST',
            body: JSON.stringify({ op: 'get' })
          })).json()
          memorySummary = mem.summary || ''
          recentTurns = Array.isArray(mem.recent) ? mem.recent : []

          const lastUser = messages[messages.length - 1]
          if (lastUser && lastUser.sender === 'user') {
            await stub.fetch('https://do/session', {
              method: 'POST',
              body: JSON.stringify({ op: 'append', turn: lastUser })
            })
          }
        }

        const summaryInstruction = memorySummary ? `\n\nSession summary (context): ${memorySummary}` : ''
        const seen = new Set()
        const dedup = arr => arr.filter(t => {
          const key = `${t.role}:${t.parts?.[0]?.text || ''}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        const contents = dedup([ ...recentTurns, ...contentsClient ])

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { role: 'system', parts: [{ text: `${sysPrompt}\n\nLocale: ${locale}${summaryInstruction}`.trim() }] },
              contents
            })
          }
        )

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          return json({ error: err.error?.message || 'API request failed' }, 500)
        }

        const data = await resp.json()
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'ക്ഷമിക്കണം, ഇപ്പോൾ മറുപടി നൽകാൻ കഴിഞ്ഞില്ല.'

        if (sessionId && env.SESSION_MEMORY) {
          const id = env.SESSION_MEMORY.idFromName(sessionId)
          const stub = env.SESSION_MEMORY.get(id)
          await stub.fetch('https://do/session', { method: 'POST', body: JSON.stringify({ op: 'append', turn: { sender: 'bot', text: reply } }) })
          if (Math.floor(Math.random() * 4) === 0) {
            await stub.fetch('https://do/session', { method: 'POST', body: JSON.stringify({ op: 'summarize' }) })
          }
        }

        return json({ reply })
      } catch (e) {
        return json({ error: 'Failed to generate response' }, 500)
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders() })
  }
}

// Durable Object for session memory
export class SessionMemory {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.storage = state.storage
  }

  async fetch(request) {
    const { pathname } = new URL(request.url)
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
    const { op, turn } = await request.json().catch(() => ({}))
    const data = await this.storage.get('data') || { summary: '', recent: [] }

    if (op === 'get') {
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    }

    if (op === 'append' && turn && turn.text) {
      const role = turn.sender === 'user' ? 'user' : 'model'
      const entry = { role, parts: [{ text: String(turn.text) }] }
      data.recent.push(entry)
      if (data.recent.length > 12) data.recent = data.recent.slice(-12)
      await this.storage.put('data', data)
      return new Response(JSON.stringify({ ok: true }))
    }

    if (op === 'summarize') {
      const texts = data.recent.map(r => `${r.role === 'user' ? 'User' : 'Assistant'}: ${r.parts?.[0]?.text || ''}`).join('\n')
      const compact = texts.length > 800 ? texts.slice(-800) : texts
      const combined = `${data.summary ? data.summary + '\n' : ''}${compact}`
      data.summary = combined.length > 2000 ? combined.slice(-2000) : combined
      if (data.recent.length > 6) data.recent = data.recent.slice(-6)
      await this.storage.put('data', data)
      return new Response(JSON.stringify({ ok: true }))
    }

    return new Response(JSON.stringify({ error: 'bad op' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}

// Utility helpers
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
}

// no default system prompt; env.SYSTEM_PROMPT should be set as a wrangler secret; empty by default
