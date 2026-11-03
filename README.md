## 🆕 Nov 3 Update: QuantOrb-inspired Open Scoring

> Inspired by [QuantumOrb/QuantOrb](https://github.com/QuantumOrb/QuantOrb) (56⭐ Solana holder scanner) - Open rules, not black box!

**What's New:**
- ✅ **Open Scoring 0-100:** `rules/trifecta-scoring.js` - Like QuantOrb's `rules/` 
- ✅ **Operator Clustering:** 20 tools → N operators (like 20 wallets → 13 operators)
- ✅ **Transparent Docs:** `docs/scoring.md` - Every weight, threshold, red flag written down
- ✅ **Shield - Blast Radius Zero:** `rules/shield.js` - Blocks VM before spawn if serial lethal creator
- ✅ **Scenarios:** Privacy impact -67% if linked tools sell (like QuantOrb sell scenario)

**Score System:**
- 0-20 CLEAN, 21-50 OK, 51-80 RISKY, 81-100 DANGER → 403 LETHAL BLOCKED
- RED FLAGS force DANGER: `lethal_trifecta`, `gmail_browse_send`, `single_operator_lethal`
- Example: `["read_gmail","browse_web","send_email"]` → Score 100 → DANGER → 403 + wallet 3eLK...z44V

**Links:**
- QuantOrb: https://github.com/QuantumOrb/QuantOrb
- Our Rules: [/rules/trifecta-scoring.js](/rules/trifecta-scoring.js) + [/docs/scoring.md](/docs/scoring.md)
- Live V2: https://trifecta-checker-v2-eta.vercel.app

---
# Trifecta Checker 🛡️ - Making AI Agents Trustworthy

> One API call to stop data theft before it happens + Concordium ID for Verifiable Trusted Agents

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://trifecta-checker.vercel.app/)
[![API](https://img.shields.io/badge/API-Live-blue?style=for-the-badge)](https://trifecta-checker.vercel.app/api/check-trifecta)
[![Concordium](https://img.shields.io/badge/Concordium-Trusted_Agents-0D7DFF?style=for-the-badge)](https://www.encode.club/hackathons/concordium)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live Demo:** https://trifecta-checker.vercel.app/  
**API Endpoint:** https://trifecta-checker.vercel.app/api/check-trifecta  
**Dev.to Article:** https://dev.[STRIPPED 84 bytes]  
**Concordium Hackathon:** https://www.encode.club/hackathons/concordium - ✅ Registered, Awaiting Start Nov 2, 2026

Built by [@altima261](https://【entity-github¦canonical_name=GitHub】.com/altima261) | Tokyo / Jeddah

---

## 🚨 Problem: Why AI Agents Can't Be Trusted

Simon Willison's **Lethal Trifecta** - When an AI agent has all 3, it becomes a data-theft weapon:

1. **Private Data Access** - Gmail, DB, docs, files
2. **Untrusted Content** - Web pages, emails, user uploads
3. **External Communication** - HTTP requests, send_email, webhooks

> If all 3 exist, anyone who can put text in front of the agent can steal private data via prompt injection.

**Current agents check permissions, not combinations. No safety gate.**

---

## ✅ Solution: Trifecta Safety Gate
