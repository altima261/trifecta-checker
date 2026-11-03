# Trifecta Scoring - Open Rules (QuantOrb inspired)

Score 0-100, like QuantOrb. Every weight written here, not black box.

## Checks

| Check | Weight | QuantOrb Analogy |
|-------|--------|------------------|
| privateData | 35 | Holders - top 20 wallets |
| untrusted | 25 | Fresh wallets |
| external | 20 | Liquidity control |
| linked | 10 | Linked wallets |
| fresh | 10 | Unsold snipers |

## Thresholds

- 0-20 CLEAN
- 21-50 OK  
- 51-80 RISKY
- 81-100 DANGER → 403 LETHAL BLOCKED

## Red Flags (force DANGER)

- lethal_trifecta: private + untrusted + external = 100 pts
- gmail_browse_send: read_gmail + browse_web + send_email = 95 pts
- single_operator_lethal: single operator holds trifecta = 90 pts

## Scenario

Like QuantOrb sell scenario: If linked tools sold 100% float into external channel, privacy falls 100%.

## Example

tools: [read_gmail, browse_web, send_email] → Score 100 → DANGER → 403
wallet: 3eLK...z44V on-chain log
rules: rules/trifecta-scoring.js - server's own function