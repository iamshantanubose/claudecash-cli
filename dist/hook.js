#!/usr/bin/env node
/**
 * claudecash-hook — called by Claude Code's UserPromptSubmit hook.
 * Prints one JSON line with `systemMessage` (shown to the user, not added to
 * Claude's context), hands the impression token to a detached reporter, and
 * exits immediately so the prompt is never delayed.
 * Never prints plain text to stdout: on UserPromptSubmit that becomes context.
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { getApiKey } from './config.js';
import { fetchAd } from './api.js';
async function main() {
    // Drain stdin — Claude Code sends hook event JSON; we don't need it
    if (!process.stdin.isTTY) {
        for await (const _ of process.stdin) { /* drain */ }
    }
    const apiKey = getApiKey();
    if (!apiKey)
        process.exit(0);
    try {
        const ad = await fetchAd(apiKey);
        if (!ad)
            process.exit(0);
        const brand = ad.brand ? `${ad.brand} — ` : '';
        process.stdout.write(JSON.stringify({ systemMessage: `Sponsored · ${brand}${ad.text} · ${ad.url}` }) + '\n');
        if (ad.token) {
            const reporterPath = fileURLToPath(new URL('./report.js', import.meta.url));
            spawn(process.execPath, [reporterPath, ad.token], { detached: true, stdio: 'ignore' }).unref();
        }
    }
    catch {
        // Never block Claude Code on ad errors
    }
    process.exit(0);
}
main();
