const API_BASE = import.meta.env.VITE_API_BASE || ''

async function fetchClientIp() {
  try {
    const resp = await fetch(`${API_BASE}/api/ip`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    })

    if (!resp.ok) {
      throw new Error(`Failed to resolve IP (status ${resp.status})`)
    }

    const { ip } = await resp.json().catch(() => ({}))
    return typeof ip === 'string' ? ip.trim() : ''
  } catch (error) {
    console.warn('[weather] Failed to obtain client IP, falling back to auto:ip', error)
    return ''
  }
}

export async function fetchWeatherForClient() {
  const ip = await fetchClientIp()
  console.log('The IP is ', ip)
  const effectiveQuery = ip || 'auto:ip'
  const search = ip ? `?ip=${encodeURIComponent(ip)}` : ''

  const resp = await fetch(`${API_BASE}/api/weather${search}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    const message = err?.error || 'Unable to fetch weather data'
    throw new Error(message)
  }
  const data = await resp.json()
  return { data, ip: effectiveQuery }
}
