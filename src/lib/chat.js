const API_BASE = import.meta.env.VITE_API_BASE || ''

function getSessionId() {
  try {
    const key = 'pfa_session_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

export async function sendChat(messages, { locale = 'ml-IN', endpoint = '/api/chat' } = {}) {
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, locale, sessionId: getSessionId() })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'Chat request failed');
  }
  return resp.json();
}

export function sendLocalChat(messages, options = {}) {
  return sendChat(messages, { ...options, endpoint: '/api/localchat' });
}
