# ClaudeCash CLI

**Earn money while Claude Code thinks.**

Each time you submit a prompt in Claude Code, ClaudeCash shows a one-line sponsored message — never delays your prompt. You earn 60% of the gross ad revenue for each counted impression.

No workflow changes. No distraction. Just passive income from the tool you're already using.

---

## Install

```bash
npm install -g @claudecash/cli
```

Requires Node.js 18+.

---

## Setup (one time)

**1. Get your API key**

Sign up at [claudecash.co](https://claudecash.co) → Dashboard → copy your key.

**2. Link your account**

```bash
claudecash login --key cc_your_key_here
```

**3. Activate**

```bash
claudecash install
```

That's it. Open Claude Code and use it as you normally would.

---

## Commands

```bash
claudecash login --key <KEY>   # Link your account
claudecash install             # Activate earnings
claudecash uninstall           # Deactivate
claudecash status              # Check connection + activation status
```

---

## How it works

When you submit a prompt, Claude Code runs the `claudecash-hook` command (registered as a `UserPromptSubmit` hook with a 5-second timeout). The hook:

1. Fetches one ad (2-second timeout; if it fails, nothing is shown).
2. Prints a single line labeled **Sponsored** via the hook's `systemMessage` field. It is shown to you and is **not** added to Claude's context.
3. Starts a small detached process (`claudecash-report`) and exits right away, so your prompt goes to Claude without waiting.
4. About 10 seconds later, that background process reports the impression and exits.

**What is sent:** a single-use ad token, your API key, and the platform (`cli`). Your prompts, code and files are never read or sent. House ads (ClaudeCash's own messages) are never reported and earn nothing.

`claudecash install` backs up `~/.claude/settings.json` to `settings.json.claudecash.bak` before it writes, and it refuses to touch a settings file it can't parse.

Full details: [claudecash.co/transparency](https://claudecash.co/transparency)

Check your earnings anytime at [claudecash.co/dashboard](https://claudecash.co/dashboard).

---

## Payout

You earn 60% of gross ad revenue. Earnings accumulate in your [dashboard](https://claudecash.co/dashboard). Once you reach the payout threshold (shown in the dashboard), request a payout. Payouts are sent via **UPI (India)**, are reviewed manually, and are paid on request.

---

## Uninstall

```bash
claudecash uninstall
npm uninstall -g @claudecash/cli
```

---

## License

MIT © 2026 Shantanu Bose. See [LICENSE](LICENSE).
