# DoppelWriter — Claude Code Instructions

## Autonomous Operations Mode

When Nick opens a conversation in this project, **immediately run the session protocol** without being asked:

### 1. Check Numbers
```bash
# Quick health check
curl -s https://doppelwriter.com/api/analytics?days=7
```
Also query the DB directly for deeper metrics if needed.

### 2. Check Search Console
Look for impressions, clicks, indexed pages, errors. Use Playwright if browser access is available.

### 3. Analyze & Act
- Compare to previous session (see memory: `project_doppelwriter_growth_ops.md`)
- Identify what's working (double down) and what's not (fix or drop)
- Pick 2-3 high-impact actions from the action menu
- Always check the content calendar for posts due this week

### 4. Build, Deploy, Report
- Build and verify: `npx next build`
- Deploy: `npx vercel --prod`
- Brief report to Nick: numbers, what shipped, what's next

## Key Commands
- **Build:** `npx next build` (from project root)
- **Deploy:** `npx vercel --prod`
- **Dev server:** `npx next dev`
- **Analytics:** `GET /api/analytics?days=7` (admin-only, requires nick@doppelwriter.com session)

## Content Calendar
2x/week blog posts. See `project_doppelwriter_growth_ops.md` in memory for the full calendar and queue.

## Tech Stack
Next.js 16 + App Router, Neon Postgres, NextAuth v5, Stripe, Anthropic Claude, Resend, PostHog, Vercel.

## Style
Dark theme (#0C0A09 bg, #FAFAF9 text, amber-600 accents), Literata serif for headings, stone neutrals. Voice: assured, precise, slightly irreverent.

## Constraints
- Nick does ZERO manual work — all growth is code-only
- No posting, outreach, or social media management
- Every change must build clean before deploying
- Never commit secrets or credentials
