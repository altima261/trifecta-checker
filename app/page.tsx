export default function Home() {
  return (
    <main style={{padding: '40px', fontFamily: 'system-ui'}}>
      <h1>🛡️ Trifecta Checker - AI Safety Gate</h1>
      <p>One API call to block Lethal Trifecta (Private Data + Untrusted Content + External Communication)</p>
      <h2>Live API</h2>
      <pre style={{background:'#f5f5f5', padding:'15px', borderRadius:'8px'}}>
POST /api/check-trifecta
{`{
  "tools": ["read_gmail", "browse_web", "send_email"]
}`}
→ 403 LETHAL BLOCKED

{`{
  "tools": ["browse_web"]
}`}
→ 200 SAFE
      </pre>
      <h2>Links</h2>
      <ul>
        <li><a href="https://github.com/altima261/trifecta-checker">GitHub</a></li>
        <li><a href="/api/check-trifecta">API Endpoint</a></li>
      </ul>
      <h2>Extensions (New - 2 Nov 2026)</h2>
      <ul>
        <li>✅ Concordium - ZK Proof + On-chain audit (Wallet 3eLK...z44V)</li>
        <li>✅ Vultr - Blast Radius Zero sandbox</li>
        <li>✅ AMD - Trusted Source Verification (.gov, .edu, Concordium verified)</li>
      </ul>
      <p>Built by Mohammed Binashwan | altima261 - Jeddah 🇸🇦 to Global 🌍</p>
    </main>
  )
}
