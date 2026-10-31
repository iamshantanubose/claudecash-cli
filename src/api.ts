import { getApiUrl } from './config.js'

export interface Ad {
  id: string
  text: string
  url: string
  brand: string | null
  color?: string
  letter?: string
  bid: number
  /** Signed single-use impression token; null for house ads (never reported). */
  token: string | null
  house?: boolean
}

export async function fetchAd(apiKey: string): Promise<Ad | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/ad`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(2000),
    })
    const data = await res.json() as { ad: Ad | null }
    return data.ad ?? null
  } catch {
    return null
  }
}

export async function reportImpression(token: string, apiKey: string): Promise<number> {
  try {
    const res = await fetch(`${getApiUrl()}/api/impression`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: 'cli' }),
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json() as { earned?: number }
    return res.ok ? data.earned ?? 0 : 0
  } catch {
    return 0
  }
}
