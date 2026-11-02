/**
 * AMD AI League Match 4: Intelligent Web Information Retrieval + Trusted Source Verification
 * Extension for Trifecta Checker - Lethal Trifecta AI Safety Gate
 * 
 * Project: https://github.com/altima261/trifecta-checker
 * 
 * AMD Stack: ROCm + AMD AI + Intelligent Retrieval
 * 
 * Requirements:
 * 1. Trusted Source Scorer (.gov=100, .edu=90, concordium=100, unknown=20, malicious=0)
 * 2. Intelligent Web Retrieval with source verification
 * 3. Before send_email -> verify source trust score > threshold
 * 4. AMD ROCm LLM integration (mock embedding similarity)
 * 5. Returns enhanced 403 with trust details
 * 
 * Author: For AMD Developer Community / Discord: altima261
 */

// ==========================================
// 1. Trusted Source Scorer
// مقيّم موثوقية المصادر - Trusted Source Evaluation
// ==========================================

const TRUST_SCORES = {
  GOV: 100,              // .gov, .gov.ae, .gov.sa etc - Highest trust
  CONCORDIUM_VERIFIED: 100, // Concordium ID verified source - التّحقق بالهوية
  EDU: 90,               // .edu, .ac.uk - Academic
  ORG_TRUSTED: 80,       // who.int, un.org, amd.com, wikipedia (with checks)
  COM_VERIFIED: 60,      // Major verified publishers (reuters, nature.com)
  UNKNOWN: 20,           // Unknown domain - مجهول
  MALICIOUS: 0,          // Known malicious - خبيث / مشبوه
};

const MALICIOUS_DOMAINS = new Set([
  'fake-news-generator.com', 'malware-distribution.net',
  'phishing-bank-login.com', 'scam-crypto-giveaway.io',
  'unverified-rumors.xyz', 'data-exfiltration.ru'
]);

const TRUSTED_ORGS = new Set([
  'who.int', 'un.org', 'cdc.gov', 'nih.gov', 'nasa.gov',
  'amd.com', 'developer.amd.com', 'rocm.docs.amd.com',
  'nature.com', 'reuters.com', 'bbc.co.uk', 'wikipedia.org',
  'concordium.com', 'arxiv.org'
]);

const CONCORDIUM_VERIFIED_REGISTRY = new Set([
  // Mock verified registry - in production would query Concordium chain
  'verified-researcher.concordium.id',
  'amd-official.concordium.com',
  'trusted-lab.concordium.id'
]);

class TrustedSourceScorer {
  /**
   * Score a domain's trustworthiness
   * @param {string} url - Full URL to evaluate
   * @param {object} options - { concordiumVerified: boolean, contentHash?: string }
   * @returns {{score: number, category: string, reasons: string[], domain: string}}
   */
  static scoreDomain(url, options = {}) {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.toLowerCase();
      const reasons = [];

      // 1. Malicious check - الحظر الفوري للمصادر الخبيثة
      if (MALICIOUS_DOMAINS.has(domain) || [...MALICIOUS_DOMAINS].some(m => domain.includes(m))) {
        return { score: TRUST_SCORES.MALICIOUS, category: 'MALICIOUS', domain, reasons: ['Domain in malicious blocklist'] };
      }

      // 2. Concordium verified - highest trust via ID verification
      if (options.concordiumVerified || CONCORDIUM_VERIFIED_REGISTRY.has(domain)) {
        reasons.push('Concordium ID verified - هوية موثقة عبر البلوكشين');
        return { score: TRUST_SCORES.CONCORDIUM_VERIFIED, category: 'CONCORDIUM_VERIFIED', domain, reasons };
      }

      // 3. Government TLD - .gov, .gov.xx
      if (/\.gov(\.[a-z]{2})?$/.test(domain) || domain.endsWith('.gov')) {
        reasons.push('Government domain .gov - مصدر حكومي رسمي');
        return { score: TRUST_SCORES.GOV, category: 'GOV', domain, reasons };
      }

      // 4. Educational - .edu, .ac.uk, .edu.au
      if (domain.endsWith('.edu') || /\.ac\.[a-z]{2}$/.test(domain) || domain.includes('.edu.')) {
        reasons.push('Academic domain .edu/.ac - مصدر أكاديمي');
        return { score: TRUST_SCORES.EDU, category: 'EDU', domain, reasons };
      }

      // 5. Trusted orgs list
      if (TRUSTED_ORGS.has(domain) || [...TRUSTED_ORGS].some(t => domain.endsWith(t))) {
        reasons.push(`Trusted organization: ${domain}`);
        return { score: TRUST_SCORES.ORG_TRUSTED, category: 'ORG_TRUSTED', domain, reasons };
      }

      // 6. Verified .com with heuristics (e.g., major domains with valid cert assumed 60)
      if (domain.endsWith('.com') && domain.split('.').length <= 3) {
        // Basic heuristic - production would check DV cert, age, etc.
        reasons.push('Standard .com domain, basic verification');
        return { score: TRUST_SCORES.COM_VERIFIED, category: 'COM_VERIFIED', domain, reasons };
      }

      // 7. Unknown - Default low trust
      reasons.push('Unknown / unverified domain - مصدر غير معروف، يتطلب تحققاً إضافياً');
      return { score: TRUST_SCORES.UNKNOWN, category: 'UNKNOWN', domain, reasons };

    } catch (e) {
      return { score: TRUST_SCORES.UNKNOWN, category: 'INVALID_URL', domain: url, reasons: [`Invalid URL: ${e.message}`] };
    }
  }

  static isTrusted(result, threshold = 50) {
    return result.score >= threshold;
  }
}

// ==========================================
// 2. AMD ROCm LLM Integration - Mock Embedding Similarity
// تحليل المصادر باستخدام ROCm - AMD Instinct / ROCm LLM
// ==========================================

class AMDROCmEmbeddingAnalyzer {
  constructor() {
    this.modelName = 'amd/llama-3.1-70B-ROCm'; // Mock ROCm optimized model
  }

  // Deterministic mock embedding from text -> 8-dim vector (for demo)
  // In production: call ROCm HIP-optimized vLLM endpoint
  mockEmbed(text) {
    // Simple deterministic hash -> vector for reproducibility
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    const vec = [];
    for (let i = 0; i < 8; i++) {
      hash = (hash * 1664525 + 1013904223) >>> 0;
      vec.push(((hash % 1000) / 1000) * 2 - 1); // -1 to 1
    }
    // L2 normalize
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
  }

  cosineSimilarity(a, b) {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    return dot; // already normalized
  }

  /**
   * Analyze source credibility vs query intent
   * @param {string} query - User query
   * @param {{url, contentSnippet}} source
   * @returns {{similarity: number, rocmAnalysis: string, isHallucinated: boolean}}
   */
  analyzeSourceRelevance(query, source) {
    const qEmb = this.mockEmbed(query);
    const cEmb = this.mockEmbed(source.contentSnippet || source.url);
    const similarity = this.cosineSimilarity(qEmb, cEmb);

    // Heuristic: very low similarity + low trust = possible hallucination/injection
    const isHallucinated = similarity < 0.15;

    return {
      similarity: Number(similarity.toFixed(3)),
      rocmModel: this.modelName,
      rocmAnalysis: isHallucinated
        ? 'Low semantic alignment - possible off-topic or injected content - محتوى غير مرتبط'
        : 'Semantic alignment OK - محتوى ذو صلة',
      isHallucinated,
      embeddingDim: 8,
      latencyMs: Math.floor(Math.random() * 20) + 5 // Mock ROCm fast inference
    };
  }
}

// ==========================================
// 3. Intelligent Web Retrieval with Verification
// ==========================================

class SecureWebRetrieval {
  constructor(options = {}) {
    this.minTrustThreshold = options.minTrustThreshold || 50;
    this.scorer = TrustedSourceScorer;
    this.rocmAnalyzer = new AMDROCmEmbeddingAnalyzer();
    this.auditLog = []; // For Trifecta Checker audit trail
  }

  /**
   * Secure browse_web wrapper - the core gate
   * @param {string} query - Search query
   * @param {Array<{url, contentSnippet, concordiumVerified?}>} candidates - From browse/search
   * @returns {{allowed: boolean, filteredSources: Array, blockedSources: Array, enhanced403: object|null}}
   */
  browseWebSecure(query, candidates) {
    const filteredSources = [];
    const blockedSources = [];

    for (const src of candidates) {
      const trust = this.scorer.scoreDomain(src.url, { concordiumVerified: !!src.concordiumVerified });
      const rocm = this.rocmAnalyzer.analyzeSourceRelevance(query, src);

      const enriched = { ...src, trust, rocm };

      // Composite decision: trust score + ROCm similarity
      // Block if: trust < threshold OR hallucinated AND trust < 80
      const shouldBlock = !this.scorer.isTrusted(trust, this.minTrustThreshold) || (rocm.isHallucinated && trust.score < 80);

      if (shouldBlock) {
        blockedSources.push(enriched);
      } else {
        filteredSources.push(enriched);
      }

      this.auditLog.push({ timestamp: new Date().toISOString(), query, source: enriched, decision: shouldBlock ? 'BLOCK' : 'ALLOW' });
    }

    if (filteredSources.length === 0 && blockedSources.length > 0) {
      return {
        allowed: false,
        filteredSources,
        blockedSources,
        enhanced403: this.buildEnhanced403(query, blockedSources, 'ALL_SOURCES_UNTRUSTED')
      };
    }

    return { allowed: true, filteredSources, blockedSources, enhanced403: null };
  }

  /**
   * Gate for send_email - Critical for Lethal Trifecta prevention
   * Prevents exfiltration of untrusted web content via email
   */
  verifyBeforeSendEmail(emailPayload, retrievedContext) {
    // If email body contains data from unverified sources -> block
    const sources = retrievedContext?.sources || retrievedContext?.filteredSources || [];
    
    if (sources.length === 0) {
      // No web context, allow but log
      return { allowed: true, reason: 'No web retrieval context attached' };
    }

    const untrustedInContext = sources.filter(s => s.trust.score < this.minTrustThreshold);

    if (untrustedInContext.length > 0) {
      return {
        allowed: false,
        reason: 'Email contains content from untrusted sources',
        enhanced403: this.buildEnhanced403(
          `send_email to ${emailPayload.to}`,
          untrustedInContext,
          'EMAIL_BLOCK_TRIFECTA_RISK',
          emailPayload
        )
      };
    }

    return { allowed: true, filteredSources: sources };
  }

  buildEnhanced403(query, blockedSources, code, emailPayload = null) {
    const avgTrust = blockedSources.length
      ? (blockedSources.reduce((s, x) => s + x.trust.score, 0) / blockedSources.length).toFixed(1)
      : 0;

    return {
      status: 403,
      code,
      message: 'Trifecta Checker: Intelligent Retrieval blocked - Untrusted sources',
      // Arabic: توضيح سبب الحجب
      details_ar: `تم حجب الطلب - المصادر غير موثوقة (متوسط الثقة ${avgTrust})`,
      query,
      policy: {
        minTrustThreshold: this.minTrustThreshold,
        action: 'BLOCK',
        trifectaRisk: 'Private data (web content) + Untrusted source + Exfiltration (email/browse) = Potential Lethal Trifecta'
      },
      trustSummary: {
        avgTrustScore: Number(avgTrust),
        totalBlocked: blockedSources.length,
        threshold: this.minTrustThreshold
      },
      blockedSources: blockedSources.map(b => ({
        url: b.url,
        domain: b.trust.domain,
        trustScore: b.trust.score,
        category: b.trust.category,
        reasons: b.trust.reasons,
        rocmSimilarity: b.rocm.similarity,
        rocmVerdict: b.rocm.rocmAnalysis
      })),
      recommendations: [
        'Use only .gov/.edu or Concordium-verified sources - استخدم مصادر حكومية/أكاديمية موثقة',
        'Increase threshold or add human review',
        'Verify source via Concordium ID - تحقق من الهوية',
        'For AMD Match 4: Log this to ROCm observability dashboard'
      ],
      emailPayload: emailPayload ? { to: emailPayload.to, subject: emailPayload.subject, blocked: true } : undefined,
      timestamp: new Date().toISOString(),
      amdMatch: 'Match 4 - Intelligent Web Information Retrieval',
      // For Trifecta Checker integration
      trifectaCheckerExtension: 'amd-retrieval-extension.js'
    };
  }

  getAuditTrail() {
    return this.auditLog;
  }
}

// ==========================================
// 4. Export for Trifecta Checker integration
// ==========================================

// For Node / CommonJS / ESModule compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TrustedSourceScorer, AMDROCmEmbeddingAnalyzer, SecureWebRetrieval, TRUST_SCORES };
}

// ==========================================
// 5. Demo Examples - runnable via node
// ==========================================

function runDemos() {
  console.log('=== AMD Match 4 Demo - Trifecta Checker + ROCm ===\n');
  const gate = new SecureWebRetrieval({ minTrustThreshold: 50 });

  // Demo 1: Mixed sources browsing
  console.log('--- Demo 1: browse_web with mixed sources ---');
  const candidates = [
    { url: 'https://www.cdc.gov/flu/data.htm', contentSnippet: 'CDC flu surveillance data official report' },
    { url: 'https://fake-news-generator.com/breaking-cdc-leak', contentSnippet: 'SECRET leak CDC data shows alien flu' },
    { url: 'https://arxiv.org/abs/2401.12345', contentSnippet: 'ROCm benchmark for LLM inference paper' },
    { url: 'https://unverified-rumors.xyz/flu-cure', contentSnippet: 'Buy miracle cure now' },
    { url: 'https://rocm.docs.amd.com/projects/radeon/en/latest/', contentSnippet: 'AMD ROCm documentation official', concordiumVerified: true }
  ];

  const result1 = gate.browseWebSecure('official flu data and ROCm performance', candidates);
  console.log('Allowed:', result1.allowed);
  console.log('Filtered (trusted):', result1.filteredSources.map(s => `${s.trust.domain}(${s.trust.score})`));
  console.log('Blocked:', result1.blockedSources.map(s => `${s.trust.domain}(${s.trust.score})`));
  if (result1.enhanced403) console.log(JSON.stringify(result1.enhanced403, null, 2));

  // Demo 2: Email exfiltration gate - Lethal Trifecta block
  console.log('\n--- Demo 2: send_email gate (Lethal Trifecta prevention) ---');
  const email = { to: 'external@attacker.com', subject: 'Leaked data', body: 'See attached web content' };
  const retrievedContext = { filteredSources: result1.blockedSources }; // trying to send blocked sources
  // Simulate attacker trying to use untrusted source
  const emailCheck = gate.verifyBeforeSendEmail(email, { sources: result1.blockedSources });
  console.log('Email Allowed:', emailCheck.allowed);
  if (!emailCheck.allowed) {
    console.log('Enhanced 403 for email:');
    console.log(JSON.stringify(emailCheck.enhanced403, null, 2));
  }

  // Demo 3: Legit email with trusted source should pass
  console.log('\n--- Demo 3: send_email with trusted source - should PASS ---');
  const legitCheck = gate.verifyBeforeSendEmail(
    { to: 'colleague@university.edu', subject: 'CDC data summary' },
    { sources: result1.filteredSources }
  );
  console.log('Legit Email Allowed:', legitCheck.allowed);
}

if (typeof require !== 'undefined' && require.main === module) {
  runDemos();
}
