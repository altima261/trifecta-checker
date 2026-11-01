# 🛡️ Trifecta Checker - Lethal Trifecta Safety Gate

**Built for Meta Global AI Developer Hackathon 2026 - Japan 🇯🇵**
**by altima261 - https://github.com/altima261**

[[Live Demo](https://img.shields.io/badge/Live%20Demo-vercel.app-black?style=for-the-badge)](https://trifecta-checker.vercel.app/)
[[API](https://img.shields.io/badge/API-Ready-green?style=for-the-badge)](#api)

### The Problem: The Lethal Trifecta

Coined by Simon Willison, an AI agent becomes a data-theft tool when it has ALL THREE:

1. **Private Data Access** - inbox, DB, docs, internal APIs
2. **Untrusted Content** - web pages, emails, file uploads, third-party APIs
3. **External Communication** - HTTP calls, emails, webhooks

> If an agent can read private data + read untrusted content + send data out, anyone who can put text in front of it can steal your data.

### The Solution: Safety Gate

Trifecta Checker blocks execution BEFORE the agent runs.

**Live API:** `https://trifecta-checker.vercel.app/api/check-trifecta`

```bash
curl -X POST https://trifecta-checker.vercel.app/api/check-trifecta \
  -H "Content-Type: application/json" \
  -d '{"tools":["read_gmail","browse_web","send_email"],"agentName":"my-agent"}'
```

### Tested Results - All 3 Levels Verified ✅

#### 1. LETHAL - Score 3/3 🚨 - BLOCKED (403)
```json
Tools: ["read_gmail", "browse_web", "send_email"]
Result: { "isLethal": true, "riskLevel": "lethal", "score": 3 }
Action: 403 Forbidden - Blocked by gate
Fix: Split agent into Reader (no exfil) + Sender (no private)
```

#### 2. WARNING - Score 2/3 ⚠️ - Allowed with warning
```json
Tools: ["read_gmail", "browse_web"]
Result: { "isLethal": false, "riskLevel": "warning", "score": 2 }
Action: 200 OK - Proceed with caution
```

#### 3. SAFE - Score 1/3 ✅ - Allowed
```json
Tools: ["browse_web"]
Result: { "isLethal": false, "riskLevel": "safe", "score": 1 }
Action: 200 OK - Safe to proceed
```

### Integration - Works with ANY Agent

**Python:**
```python
from trifecta_checker import TrifectaGate

gate = TrifectaGate(api_url="https://trifecta-checker.vercel.app/api/check-trifecta")
result = gate.check(tools=["read_gmail","browse_web","send_http"])

if result.is_lethal:
    raise Exception(f"Blocked: {result.fixes}")
```

**JavaScript / Vercel AI SDK / Muse:**
```javascript
import { TrifectaGate } from './sdk/js/trifecta.js'
const gate = new TrifectaGate('https://trifecta-checker.vercel.app/api/check-trifecta')
const res = await gate.check({ tools: agentTools })
if (res.isLethal) throw new Error('Lethal Trifecta')
```

### Architecture

```
User Query -> Trifecta Gate -> Check manifest -> [LETHAL?] -> BLOCK + Fix
                                   |
                                   +-> [SAFE] -> Execute Agent
```

### Tech Stack

- Next.js 14 + TypeScript
- Vercel Deployment
- Python + JS SDK
- Meta Muse Spark compatible

### Links

- **Live Demo:** https://trifecta-checker.vercel.app/
- **GitHub:** https://github.com/altima261/trifecta-checker
- **Dev.to:** dev.to/moruku36/...

### Author

Built by **altima261** from Japan for Meta Global AI Hackathon.

GitHub: https://github.com/altima261
Vercel: altima261
