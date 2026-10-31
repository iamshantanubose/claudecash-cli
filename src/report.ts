#!/usr/bin/env node
/**
 * claudecash-report <token> — spawned detached by claudecash-hook.
 * Waits 10s (server accepts tokens >= 9.5s after issue), reports once, exits.
 */
import { getApiKey } from './config.js'
import { reportImpression } from './api.js'

const token = process.argv[2]
const apiKey = getApiKey()

if (token && apiKey) {
  setTimeout(() => { reportImpression(token, apiKey).finally(() => process.exit(0)) }, 10_000)
}
