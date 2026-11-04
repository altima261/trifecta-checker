# 🛡️ Trifecta Checker - Lethal Trifecta Safety Gate

**Built for 【entity-Meta¦canonical_name=Meta】 Global AI Hackathon Japan 2026 by altima261**
**From Jeddah, SA - Al-Ahsa roots - 【entity-Ministry of Education¦canonical_name=Ministry of Education】**

🔗 **Live:** https://trifecta-checker-v2-eta.vercel.app
🔗 **API:** https://trifecta-checker-v2-eta.vercel.app/api/check-trifecta
🔗 **GitHub:** https://github.com/altima261/trifecta-checker

---

## The Problem: Lethal Trifecta

Coined by Simon Willison, AI agent becomes data-theft tool when it has ALL THREE:

1. **Private Data Access** - inbox, DB, docs
2. **Untrusted Content** - web pages, emails, uploads
3. **External Communication** - HTTP, emails, webhooks

If agent has all three → prompt injection = data theft.

## Solution: Safety Gate

One API call blocks execution BEFORE it runs:

```bash
curl -X POST https://trifecta-checker-v2-eta.vercel.app/api/check-trifecta \
  -H "Content-Type: application/json" \
  -d '{"tools":["read_gmail","browse_web","send_email"]}'