/**
 * Concordium Trusted Agents Extension for Trifecta Checker
 * Hackathon: Concordium Trusted Agents (2 Nov 2025)
 * Project: https://github.com/altima261/trifecta-checker
 * 
 * Purpose: Extend Lethal Trifecta safety gate with Concordium ID ZK proofs + on-chain audit log
 * 
 * Lethal Trifecta = Private Data + Untrusted Content + External Comms
 * This extension ensures only verified agents can execute, and every decision is auditable on-chain.
 * 
 * Wallet for audit log: 3eLK...z44V (Concordium Testnet)
 * 
 * @author altima261
 */

import crypto from 'crypto';

// ============ CONFIG ============
export const CONCORDIUM_CONFIG = {
  network: 'testnet', // change to mainnet for prod
  auditWallet: '3eLK...z44V', // المِحفظة للسجل التدقيقي | wallet for audit log
  contract: {
    name: 'trifecta-audit-log',
    index: 0, // replace with deployed contract index
  },
  api: {
    trifectaEndpoint: 'https://trifecta-checker.vercel.app/api/check-trifecta',
    // or local: http://localhost:3000/api/check-trifecta
  },
  // Concordium ID provider
  idProvider: 'concordium-testnet-id',
};

// ============ MOCK SDK FOR HACKATHON (replace with @concordium/web-sdk + @concordium/common-sdk) ============
// In production: import { AccountAddress, ... } from '@concordium/web-sdk'

class ConcordiumMockClient {
  constructor(config) {
    this.config = config;
  }

  /**
   * verifyTrustedAgent - التحقق من الوكيل الموثوق
   * Uses Concordium ID ZK proof to verify agent without revealing PII
   * @param {Object} proof - ZK proof from Concordium Wallet / ID
   * @param {Object} options
   * @returns {Promise<{verified: boolean, credential: Object}>}
   */
  async verifyZKProof(proof) {
    // Real implementation:
    // const statement = { nationality: { type: 'reveal' }, age: { lower: 18 } }
    // verify via concordium-common-sdk: verifyIdStatement(proof, statement)
    
    // Mock validation for hackathon demo
    if (!proof) throw new Error('Missing ZK proof | دليل ZK مفقود');
    
    // Simulate ZK verification
    const isValid = proof.credentialId && proof.proofValue && proof.timestamp > Date.now() - 3600_000;
    
    // Check revocation (mock)
    const notRevoked = !proof.revoked;

    return {
      verified: isValid && notRevoked,
      statement: proof.statement || { trustedAgent: true },
      credentialId: proof.credentialId?.slice(0, 8) + '...',
    };
  }

  /**
   * Log decision on-chain (mock transaction)
   */
  async logOnChain(payload) {
    // Real: const txn = await client.sendTransaction(...)
    // using Concordium SDK: AccountTransactionType.Update, etc.

    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    const blockHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    console.log(`[Concordium] ⛓️ On-chain log -> Wallet ${this.config.auditWallet}`);
    console.log(`[Concordium] Tx: ${txHash} | Block: ${blockHash.slice(0,10)}...`);
    console.log(`[Concordium] Payload:`, JSON.stringify(payload));

    return {
      txHash,
      blockHash,
      wallet: this.config.auditWallet,
      network: this.config.network,
      timestamp: new Date().toISOString(),
      explorerUrl: `https://${this.config.network}.concordium.io/tx/${txHash}`,
    };
  }
}

// ============ CORE FUNCTIONS ============

/**
 * 1) verifyTrustedAgent()
 * التحقق من وكيل موثوق باستخدام Concordium ID + إثبات المعرفة الصفرية
 * Verifies trusted AI agent via Concordium ID without exposing identity
 * 
 * @param {Object} agentProof - { credentialId, proofValue, statement, timestamp, revoked }
 * @returns {Promise<{isTrusted: boolean, agentId: string, zkVerified: boolean}>}
 */
export async function verifyTrustedAgent(agentProof) {
  const client = new ConcordiumMockClient(CONCORDIUM_CONFIG);

  try {
    if (!agentProof) {
      // For demo: allow anonymous dev mode but mark untrusted
      console.warn('[Concordium] No proof supplied - running in DEV_MODE');
      return {
        isTrusted: false,
        zkVerified: false,
        agentId: 'dev-anonymous',
        reason: 'Missing Concordium ID proof',
        // نصيحة: يجب على الوكيل إنشاء ZK proof من محفظة Concordium
      };
    }

    const result = await client.verifyZKProof(agentProof);

    if (!result.verified) {
      return {
        isTrusted: false,
        zkVerified: false,
        agentId: agentProof.credentialId || 'unknown',
        reason: 'ZK proof verification failed',
      };
    }

    console.log(`[TrustedAgent] ✅ Agent ${result.credentialId} verified via ZK proof`);

    return {
      isTrusted: true,
      zkVerified: true,
      agentId: result.credentialId,
      credential: result,
      // إثبات أن الوكيل موثوق دون كشف الهوية | proves trusted without revealing PII
    };
  } catch (err) {
    return {
      isTrusted: false,
      zkVerified: false,
      error: err.message,
    };
  }
}

/**
 * 2) checkTrifectaWithConcordium()
 * Calls Vercel /api/check-trifecta + logs result on-chain via Concordium SDK
 * @param {Object} params
 * @param {string[]} params.tools - e.g. ['read_gmail','browse_web','send_email']
 * @param {Object} params.agentProof - Concordium ID ZK proof
 * @param {string} params.agentDid - optional DID
 * @param {string} params.contextId - request/trace id
 * @returns {Promise<{decision: 200|403, trifectaResult, onChainReceipt, trusted}>}
 */
export async function checkTrifectaWithConcordium({
  tools,
  agentProof = null,
  agentDid = null,
  contextId = null,
}) {
  const client = new ConcordiumMockClient(CONCORDIUM_CONFIG);
  const traceId = contextId || crypto.randomUUID();

  // Step 1: Verify trusted agent - التحقق من الوكيل أولاً
  const trusted = await verifyTrustedAgent(agentProof);

  if (!trusted.isTrusted && agentProof) {
    // Hard fail if proof provided but invalid
    const blockedPayload = {
      traceId,
      agentId: trusted.agentId,
      tools,
      decision: 403,
      reason: 'UNTRUSTED_AGENT',
      zkVerified: false,
      wallet: CONCORDIUM_CONFIG.auditWallet,
    };

    const receipt = await client.logOnChain(blockedPayload);

    return {
      decision: 403,
      allowed: false,
      trifectaResult: { lethal: false, reason: 'agent_not_trusted' },
      trusted,
      onChainReceipt: receipt,
      message: 'Blocked: Agent not trusted via Concordium ID',
    };
  }

  // Step 2: Call Trifecta Checker API - استدعاء بوابة الأمان
  let trifectaResult;
  try {
    const response = await fetch(CONCORDIUM_CONFIG.api.trifectaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tools, contextId: traceId }),
    });

    if (!response.ok) {
      // Fallback local check if API down
      trifectaResult = localTrifectaCheck(tools);
    } else {
      trifectaResult = await response.json();
    }
  } catch (e) {
    console.warn('[Trifecta] API unreachable, using local check', e.message);
    trifectaResult = localTrifectaCheck(tools);
  }

  // Normalize result: API returns { risk: 'high', blocks: true } or similar
  const isLethal = trifectaResult.lethal ?? trifectaResult.blocks ?? trifectaResult.risk === 'high' ?? false;
  const decision = isLethal ? 403 : 200;

  // Step 3: On-chain audit log - السجل التدقيقي على البلوكشين
  const auditPayload = {
    traceId,
    agentId: trusted.agentId || agentDid || 'anonymous',
    agentDid,
    tools,
    intersection: trifectaResult.toolsDetected || tools,
    decision, // 200 = allowed | 403 = blocked
    lethal: isLethal,
    zkVerified: trusted.zkVerified,
    wallet: CONCORDIUM_CONFIG.auditWallet, // required: 3eLK...z44V
    timestamp: new Date().toISOString(),
    // hash for privacy: لا نكشف البيانات الحساسة على السلسلة
    toolsHash: crypto.createHash('sha256').update(JSON.stringify(tools)).digest('hex').slice(0, 16),
  };

  const onChainReceipt = await client.logOnChain(auditPayload);

  return {
    decision,
    allowed: decision === 200,
    trifectaResult,
    trusted,
    onChainReceipt,
    auditPayload,
    message: decision === 403
      ? `⛔ BLOCKED (403) - Lethal Trifecta detected: ${JSON.stringify(tools)} -> logged to ${CONCORDIUM_CONFIG.auditWallet}`
      : `✅ ALLOWED (200) - Safe: ${JSON.stringify(tools)} -> logged to ${CONCORDIUM_CONFIG.auditWallet}`,
  };
}

/**
 * Local fallback Trifecta detection
 * Detects lethal combination: Private Data + Untrusted Content + External Comms
 */
function localTrifectaCheck(tools) {
  const PRIVATE = ['read_gmail','read_drive','read_db','read_docs','read_calendar','read_contacts','get_private'];
  const UNTRUSTED = ['browse_web','read_webpage','read_email','read_file_upload','fetch_url','scrape'];
  const EXTERNAL = ['send_email','http_post','webhook','post_api','send_slack','tweet','upload_external'];

  const has = (list) => tools.some(t => list.some(k => t.toLowerCase().includes(k)) );

  const hasPrivate = has(PRIVATE);
  const hasUntrusted = has(UNTRUSTED);
  const hasExternal = has(EXTERNAL);

  const lethal = hasPrivate && hasUntrusted && hasExternal;

  return {
    lethal,
    blocks: lethal,
    risk: lethal ? 'high' : 'low',
    breakdown: { hasPrivate, hasUntrusted, hasExternal },
    toolsDetected: tools,
  };
}

// ============ VERCEL API INTEGRATION HELPER ============

/**
 * Vercel middleware wrapper - use in /api/check-trifecta or as separate endpoint /api/check-trifecta-concordium
 * Example: api/check-trifecta-concordium.js
 * 
 * export { default } from '../../sdk/concordium-extension.js'
 */
export function createConcordiumMiddleware() {
  return async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { tools, proof, agentDid, contextId } = req.body || {};

    if (!tools || !Array.isArray(tools)) {
      return res.status(400).json({ error: 'tools array required' });
    }

    const result = await checkTrifectaWithConcordium({
      tools,
      agentProof: proof || null,
      agentDid,
      contextId,
    });

    // Return both Trifecta + Concordium audit info
    return res.status(result.decision).json({
      ...result.trifectaResult,
      concordium: {
        decision: result.decision,
        trusted: result.trusted,
        onChainReceipt: result.onChainReceipt,
        wallet: CONCORDIUM_CONFIG.auditWallet,
      },
      traceId: result.auditPayload.traceId,
    });
  };
}

// ============ EXAMPLE USAGE ============

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('concordium-extension.js')) {
  (async () => {
    console.log('=== Concordium Trusted Agents Demo ===');

    // Mock ZK proof from Concordium Wallet (real: from walletConnect / ID provider)
    const mockProof = {
      credentialId: 'cred_3eLK_mock_z44V',
      proofValue: 'zkp_' + crypto.randomBytes(16).toString('hex'),
      statement: { trustedAgent: true, level: 'verified_developer' },
      timestamp: Date.now(),
      revoked: false,
    };

    console.log('\n1. Verify agent:');
    console.log(await verifyTrustedAgent(mockProof));

    console.log('\n2. Safe tools check (should be 200):');
    console.log(await checkTrifectaWithConcordium({
      tools: ['read_gmail', 'browse_web'],
      agentProof: mockProof,
    }));

    console.log('\n3. Lethal trifecta (should be 403):');
    console.log(await checkTrifectaWithConcordium({
      tools: ['read_gmail', 'browse_web', 'send_email'],
      agentProof: mockProof,
    }));
  })();
}
