import { getApiUrl } from './config.js';
export async function fetchAd(apiKey) {
    try {
        const res = await fetch(`${getApiUrl()}/api/ad`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(2000),
        });
        const data = await res.json();
        return data.ad ?? null;
    }
    catch {
        return null;
    }
}
export async function reportImpression(token, apiKey) {
    try {
        const res = await fetch(`${getApiUrl()}/api/impression`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, platform: 'cli' }),
            signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        return res.ok ? data.earned ?? 0 : 0;
    }
    catch {
        return 0;
    }
}
