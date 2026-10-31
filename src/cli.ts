#!/usr/bin/env node
import chalk from 'chalk'
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { getApiKey, setApiKey, getApiUrl } from './config.js'

const args = process.argv.slice(2)
const command = args[0]

// ─── helpers ──────────────────────────────────────────────────────────────────

function claudeSettingsPath() {
  return join(homedir(), '.claude', 'settings.json')
}

function readSettings(): Record<string, unknown> {
  const p = claudeSettingsPath()
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    // Never overwrite a settings file we can't parse — that would wipe the user's config
    console.error(chalk.red(`\n✗ Could not parse ${p}: ${(e as Error).message}`))
    console.error(chalk.dim('  Fix the JSON by hand, then re-run. Nothing was changed.\n'))
    process.exit(1)
  }
}

function writeSettings(s: Record<string, unknown>) {
  const dir = join(homedir(), '.claude')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const p = claudeSettingsPath()
  if (existsSync(p)) copyFileSync(p, p + '.claudecash.bak')
  writeFileSync(claudeSettingsPath(), JSON.stringify(s, null, 2) + '\n')
}

const HOOK_COMMAND = 'claudecash-hook'
const HOOK_ENTRY = { type: 'command', command: HOOK_COMMAND, timeout: 5 }

function isInstalled(settings: Record<string, unknown>): boolean {
  const hooks = (settings as any)?.hooks?.UserPromptSubmit
  if (!Array.isArray(hooks)) return false
  return hooks.some((group: any) =>
    Array.isArray(group?.hooks) &&
    group.hooks.some((h: any) => h?.command === HOOK_COMMAND)
  )
}

// ─── commands ─────────────────────────────────────────────────────────────────

async function main() {

  // claudecash login --key <KEY>
  if (command === 'login') {
    const keyFlag = args.indexOf('--key')
    if (keyFlag === -1 || !args[keyFlag + 1]) {
      console.log(chalk.yellow('\nGet your API key from: ') + chalk.cyan.underline(`${getApiUrl()}/dashboard`))
      console.log(chalk.dim('\nUsage: claudecash login --key <YOUR_API_KEY>\n'))
      process.exit(0)
    }
    const key = args[keyFlag + 1]
    setApiKey(key)
    console.log(chalk.green('\n✓ API key saved.'))
    console.log(chalk.dim('  Now run: claudecash install\n'))
    process.exit(0)
  }

  // claudecash status
  if (command === 'status') {
    const key = getApiKey()
    const settings = readSettings()
    const installed = isInstalled(settings)

    console.log('')
    if (key) {
      console.log(chalk.green('✓ Logged in') + chalk.dim(`  (key: ${key.slice(0, 8)}…)`))
    } else {
      console.log(chalk.yellow('✗ No API key') + chalk.dim('  run: claudecash login --key <KEY>'))
    }

    if (installed) {
      console.log(chalk.green('✓ Hook installed') + chalk.dim('  firing on every Claude prompt'))
    } else {
      console.log(chalk.yellow('✗ Hook not installed') + chalk.dim('  run: claudecash install'))
    }

    console.log(chalk.dim(`\n  Dashboard: ${getApiUrl()}/dashboard\n`))
    process.exit(0)
  }

  // claudecash install
  if (command === 'install') {
    const settings = readSettings()

    if (isInstalled(settings)) {
      // Upgrade entries from <=0.2.x that lack a timeout
      let upgraded = false
      for (const group of (settings as any).hooks.UserPromptSubmit) {
        for (const h of Array.isArray(group?.hooks) ? group.hooks : []) {
          if (h?.command === HOOK_COMMAND && h.timeout === undefined) { h.timeout = HOOK_ENTRY.timeout; upgraded = true }
        }
      }
      if (upgraded) writeSettings(settings)
      console.log(chalk.green(`\n✓ Already installed${upgraded ? ' (hook upgraded)' : ''} — hook is active in ~/.claude/settings.json\n`))
      process.exit(0)
    }

    // Inject into UserPromptSubmit hooks array
    const s = settings as any
    if (!s.hooks) s.hooks = {}
    if (!Array.isArray(s.hooks.UserPromptSubmit)) s.hooks.UserPromptSubmit = []
    s.hooks.UserPromptSubmit.push({ hooks: [HOOK_ENTRY] })

    writeSettings(s)

    console.log(chalk.green('\n✓ ClaudeCash hook installed!'))
    console.log('')
    console.log('  Every time you submit a prompt in Claude Code, you see')
    console.log('  a one-line sponsored message — never delays your prompt.')
    console.log('')
    console.log(chalk.bold('  What this does (one-time notice):'))
    console.log('  • Shows one line labeled "Sponsored" above Claude\'s reply. It is not sent to Claude.')
    console.log('  • Sends to claudecash.co only: a single-use ad token, your API key, and platform "cli".')
    console.log('    Your prompts and code are never read or sent.')
    console.log('  • Details: ' + chalk.cyan.underline('https://claudecash.co/transparency'))
    console.log('  • Remove anytime: claudecash uninstall')
    console.log('')
    console.log(chalk.dim('  Hook written to: ~/.claude/settings.json'))
    console.log(chalk.dim(`  Dashboard: ${getApiUrl()}/dashboard`))
    console.log('')
    process.exit(0)
  }

  // claudecash uninstall
  if (command === 'uninstall') {
    const settings = readSettings() as any

    if (!isInstalled(settings)) {
      console.log(chalk.yellow('\nHook not found in ~/.claude/settings.json\n'))
      process.exit(0)
    }

    if (Array.isArray(settings?.hooks?.UserPromptSubmit)) {
      settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
        (group: any) =>
          !(Array.isArray(group?.hooks) &&
            group.hooks.some((h: any) => h?.command === HOOK_COMMAND))
      )
      if (settings.hooks.UserPromptSubmit.length === 0) {
        delete settings.hooks.UserPromptSubmit
      }
    }

    writeSettings(settings)
    console.log(chalk.green('\n✓ ClaudeCash hook removed from ~/.claude/settings.json\n'))
    process.exit(0)
  }

  // default — print help
  printHelp()
  process.exit(0)
}

function printHelp() {
  console.log(`
${chalk.bold.yellow('C$')} ${chalk.bold('ClaudeCash')} — earn money while Claude thinks

${chalk.bold('Setup (one time):')}
  claudecash login --key <KEY>   Save your API key
  claudecash install             Add hook to ~/.claude/settings.json

${chalk.bold('After setup — just use claude normally:')}
  claude                         Each prompt shows one sponsored line → you earn

${chalk.bold('Other commands:')}
  claudecash status              Show login + hook status
  claudecash uninstall           Remove the hook

${chalk.bold('Get your API key:')}
  ${chalk.cyan.underline('https://claudecash.co/dashboard')}

${chalk.dim('A one-line sponsored message — never delays your prompt. https://claudecash.co/transparency')}
`)
}

main().catch(console.error)
