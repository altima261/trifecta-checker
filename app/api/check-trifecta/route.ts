import { NextRequest, NextResponse } from 'next/server'

type RiskLevel = 'SAFE' | 'WARNING' | 'LETHAL'

function analyzeTools(tools: string[]) {
  const privateData = ['read_gmail', 'read_email', 'read_db', 'read_docs', 'gmail', 'inbox', 'private_data']
  const untrusted = ['browse_web', 'read_web', 'fetch_url', 'untrusted', 'web_search']
  const external = ['send_email', 'send_webhook', 'http_post', 'external', 'exfiltration', 'post']

  const hasPrivate = tools.some(t => privateData.some(p => t.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(t.toLowerCase())))
  const hasUntrusted = tools.some(t => untrusted.some(u => t.toLowerCase().includes(u.toLowerCase()) || u.toLowerCase().includes(t.toLowerCase())))
  const hasExternal = tools.some(t => external.some(e => t.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(t.toLowerCase())))

  // More lenient matching for exact names
  const exactPrivate = tools.includes('read_gmail') || tools.includes('read_email') || tools.includes('read_db')
  const exactUntrusted = tools.includes('browse_web') || tools.includes('fetch_url')
  const exactExternal = tools.includes('send_email') || tools.includes('send_webhook')

  const p = exactPrivate || hasPrivate
  const u = exactUntrusted || hasUntrusted
  const e = exactExternal || hasExternal

  const count = [p, u, e].filter(Boolean).length

  let risk: RiskLevel = 'SAFE'
  if (count === 3) risk = 'LETHAL'
  else if (count === 2) risk = 'WARNING'

  return { hasPrivate: p, hasUntrusted: u, hasExternal: e, count, risk }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const tools = body.tools || []
    
    if (!Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json({ error: 'tools array required' }, { status: 400 })
    }

    const analysis = analyzeTools(tools)
    
    const response = {
      isLethal: analysis.risk === 'LETHAL',
      riskLevel: analysis.risk,
      riskScore: analysis.count,
      analysis,
      decision: analysis.risk === 'LETHAL' ? 'BLOCKED - Lethal Trifecta detected' : analysis.risk === 'WARNING' ? 'CAUTION - 2/3 detected' : 'SAFE',
      timestamp: new Date().toISOString(),
      traceId: Math.random().toString(36).substring(7),
      // New extensions info
      extensions: {
        concordium: 'sdk/concordium-extension.js - ZK + on-chain',
        vultr: 'sdk/vultr-sandbox.js - Blast Radius Zero',
        amd: 'sdk/amd-retrieval-extension.js - Trusted Source'
      }
    }

    const status = analysis.risk === 'LETHAL' ? 403 : 200
    return NextResponse.json(response, { status })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Trifecta Checker API',
    version: '2.0 - 2 Nov 2026',
    endpoint: 'POST /api/check-trifecta',
    example: { tools: ['read_gmail', 'browse_web', 'send_email'] },
    extensions: {
      concordium: 'POST /api/check-trifecta with agentProof for ZK verification',
      vultr: 'Containment-first sandbox - LETHAL = no VM spawned',
      amd: 'Trusted source scoring - .gov=100, .edu=90, unknown=20'
    },
    live: 'https://trifecta-checker.vercel.app',
    github: 'https://github.com/altima261/trifecta-checker'
  })
}
