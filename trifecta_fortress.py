from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import re, json

@dataclass
class ThreatIntel:
    ip: str
    tool: str
    playbook_id: int
    confidence: float
    timestamp: datetime = field(default_factory=datetime.now)
    details: str = ""

@dataclass
class ZidPayRequest:
    ip: str
    email: str
    note: str
    path: str
    user_agent: str = ""
    rate: int = 1
    amount: float = 0.0

@dataclass
class FortressResult:
    decision: str
    layer: int
    agent: str
    lethal: bool = False
    trust_score: int = 50
    reason: str = ""
    fact_graph_updated: bool = False

class FactGraph:
    def __init__(self):
        self.threats: List[ThreatIntel] = []
        self.blocked_ips: set = set()
        self.attacker_tools: Dict[str, List[str]] = {}
        self.defense_playbooks: Dict[int, str] = {23: "Nmap->Nuclei->IBAN", 999: "Lethal Trifecta"}
        self.sapper_playbooks = {i: f"Attack #{i}" for i in range(1, 51)}
    def predict_next_attack(self, req: ZidPayRequest) -> Optional[ThreatIntel]:
        for threat in self.threats:
            if threat.ip == req.ip and (datetime.now() - threat.timestamp).seconds < 86400:
                return ThreatIntel(ip=req.ip, tool=f"Predicted was {threat.tool}", playbook_id=threat.playbook_id, confidence=0.9, details=f"IP {req.ip} attacked before")
        if "tor" in req.user_agent.lower() or req.rate > 5:
            return ThreatIntel(ip=req.ip, tool="Anomaly", playbook_id=1, confidence=0.85)
        return None
    def add_threat(self, threat: ThreatIntel):
        self.threats.append(threat)
        if threat.confidence > 0.8:
            self.blocked_ips.add(threat.ip)
        print(f"[FactGraph] {threat.ip} - {threat.tool} - P{threat.playbook_id} - {threat.confidence}")
    def log_attacker_tool(self, ip: str, tool: str):
        if ip not in self.attacker_tools:
            self.attacker_tools[ip] = []
        self.attacker_tools[ip].append(tool)

class ScannerDetectorAgent:
    name = "ScannerDetector"
    def scan(self, req: ZidPayRequest) -> Optional[ThreatIntel]:
        ua = req.user_agent.lower()
        if "nmap" in ua or "masscan" in ua or "nuclei" in ua or req.rate > 10:
            return ThreatIntel(ip=req.ip, tool="Nmap/Masscan", playbook_id=23, confidence=0.95, details=f"Rate {req.rate}/s")
        return None

class NucleiShieldAgent:
    name = "NucleiShield"
    def scan(self, req: ZidPayRequest) -> Optional[ThreatIntel]:
        if "v1-old" in req.path or "debug" in req.path:
            return ThreatIntel(ip=req.ip, tool="Nuclei Old API", playbook_id=24, confidence=0.9, details=f"Path {req.path}")
        return None

class BehaviorAnalyzerAgent:
    name = "BehaviorAnalyzer"
    def __init__(self):
        self.ip_attempts: Dict[str, List[datetime]] = {}
    def scan(self, req: ZidPayRequest) -> Optional[ThreatIntel]:
        now = datetime.now()
        if req.ip not in self.ip_attempts:
            self.ip_attempts[req.ip] = []
        self.ip_attempts[req.ip].append(now)
        self.ip_attempts[req.ip] = [t for t in self.ip_attempts[req.ip] if (now - t).seconds < 60]
        if len(self.ip_attempts[req.ip]) >= 5:
            return ThreatIntel(ip=req.ip, tool="Behavior 5 fails/min", playbook_id=7, confidence=0.92, details="Card testing")
        return None

class HoneypotAgent:
    name = "HoneypotAgent"
    def __init__(self, fact_graph: FactGraph):
        self.fact_graph = fact_graph
        self.honeypot_paths = ["/api/zid-pay-v1-old", "/api/pay-debug", "/api/zid-old", "/backup.zip"]
    def is_honeypot(self, req: ZidPayRequest) -> bool:
        return req.path in self.honeypot_paths
    def log_attacker_tools(self, req: ZidPayRequest):
        self.fact_graph.log_attacker_tool(req.ip, f"Hit honeypot {req.path}")

class TrifectaGateAgent:
    name = "TrifectaGate"
    def detect_private(self, text: str) -> bool:
        return any(re.search(p, text) for p in [r"SA\d{2}", r"\b10\d{8}\b", r"IBAN", r"\b4\d{15}\b"])
    def detect_untrusted(self, text: str) -> bool:
        return any(re.search(p, text, re.I) for p in [r"bit\.ly", r"tinyurl", r"paste:", r"telegram"])
    def detect_external(self, text: str) -> bool:
        return any(re.search(p, text, re.I) for p in [r"api\.evil\.com", r"evil\.com", r"telegram\.org"])
    def quantorb_score(self, email: str) -> int:
        if ".gov.sa" in email or ".gov" in email: return 100
        if ".edu.sa" in email or ".edu" in email: return 90
        if "concordium_verified" in email: return 95
        return 10
    def check(self, req: ZidPayRequest) -> Dict:
        text = f"{req.note} {req.path} {req.email}"
        private = self.detect_private(text)
        untrusted = self.detect_untrusted(text)
        external = self.detect_external(text)
        lethal = private and untrusted and external
        trust = self.quantorb_score(req.email)
        return {"lethal": lethal, "private": private, "untrusted": untrusted, "external": external, "trust": trust}

class DefensiveCommander:
    def __init__(self, fact_graph: FactGraph):
        self.fact_graph = fact_graph
        self.scanner = ScannerDetectorAgent()
        self.nuclei_shield = NucleiShieldAgent()
        self.behavior = BehaviorAnalyzerAgent()
        self.honeypot = HoneypotAgent(fact_graph)
        self.trifecta = TrifectaGateAgent()
    def handle_request(self, req: ZidPayRequest) -> FortressResult:
        pred = self.fact_graph.predict_next_attack(req)
        if pred and pred.confidence > 0.8:
            self.fact_graph.add_threat(pred)
            return FortressResult(decision="BLOCK_PREEMPTIVE", layer=0, agent="FactGraph", reason=pred.details, trust_score=10)
        if self.honeypot.is_honeypot(req):
            self.honeypot.log_attacker_tools(req)
            self.fact_graph.add_threat(ThreatIntel(ip=req.ip, tool="Honeypot Hit", playbook_id=99, confidence=1.0, details=f"Hit {req.path}"))
            return FortressResult(decision="DECEIVE", layer=1, agent=self.honeypot.name, reason=f"Honeypot {req.path}", trust_score=10)
        for agent in [self.scanner, self.nuclei_shield, self.behavior]:
            threat = agent.scan(req)
            if threat:
                self.fact_graph.add_threat(threat)
                return FortressResult(decision="BLOCK_EARLY", layer=2, agent=agent.name, reason=threat.details, trust_score=15)
        tri = self.trifecta.check(req)
        if tri["lethal"]:
            threat = ThreatIntel(ip=req.ip, tool="LethalTrifecta", playbook_id=999, confidence=1.0, details=f"P={tri['private']} U={tri['untrusted']} E={tri['external']}")
            self.fact_graph.add_threat(threat)
            return FortressResult(decision="403 BLOCKED", layer=3, agent=self.trifecta.name, lethal=True, trust_score=tri["trust"], reason=f"Lethal True Trust {tri['trust']}", fact_graph_updated=True)
        return FortressResult(decision="200 CLEAN", layer=3, agent=self.trifecta.name, lethal=False, trust_score=tri["trust"], reason="No Lethal")

def demo_fortress():
    print("="*60)
    print("Trifecta Fortress - 5 Layers - AgentX Demo")
    print("="*60)
    fg = FactGraph()
    commander = DefensiveCommander(fg)
    tests = [
        ZidPayRequest(ip="1.2.3.4", email="attacker@evil.com", note="IBAN SA12 + bit.ly/xyz + api.evil.com", path="/api/pay", user_agent="Nmap", rate=20),
        ZidPayRequest(ip="1.2.3.4", email="attacker@evil.com", note="IBAN SA12 + bit.ly/xyz + api.evil.com", path="/api/pay", user_agent="Nmap", rate=20),
        ZidPayRequest(ip="5.6.7.8", email="test@tor.com", note="normal", path="/api/zid-pay-v1-old", user_agent="Nuclei", rate=1),
        ZidPayRequest(ip="9.9.9.9", email="merchant@gov.sa", note="راتب", path="/api/pay", user_agent="Chrome", rate=1),
        ZidPayRequest(ip="10.0.0.1", email="hacker@evil.com", note="test", path="/api/pay", user_agent="Mozilla", rate=1),
        ZidPayRequest(ip="10.0.0.1", email="hacker@evil.com", note="test", path="/api/pay", user_agent="Mozilla", rate=1),
        ZidPayRequest(ip="10.0.0.1", email="hacker@evil.com", note="test", path="/api/pay", user_agent="Mozilla", rate=1),
        ZidPayRequest(ip="10.0.0.1", email="hacker@evil.com", note="test", path="/api/pay", user_agent="Mozilla", rate=1),
        ZidPayRequest(ip="10.0.0.1", email="hacker@evil.com", note="test", path="/api/pay", user_agent="Mozilla", rate=1),
    ]
    for i, req in enumerate(tests, 1):
        res = commander.handle_request(req)
        print(f"Test {i}: IP {req.ip} Path {req.path} -> {res.decision} Layer {res.layer} Agent {res.agent} Trust {res.trust_score} Reason {res.reason}")
    print("="*60)
    print(f"Fact Graph: {len(fg.threats)} threats, Blocked: {fg.blocked_ips}")
    print(f"Tools Logged: {fg.attacker_tools}")
    print("Demo complete - 5 steps ahead!")

if __name__ == "__main__":
    demo_fortress()


# ===== Trifecta Fortress V3 - Reasoning Levels + TrifectaFact =====
# From nvwabase - History Pillar - Defensive Only

from enum import Enum

class ReasoningLevel(Enum):
    L0_FAST = 0
    L1_CHECK = 1
    L2_DEEP = 2
    L3_FORK = 3

class TrifectaFact:
    def __init__(self, claim: str, source: str, verified: bool = False, fact_type: str = "claim"):
        self.claim = claim
        self.source = source
        self.verified = verified
        self.fact_type = fact_type  # claim / source / verification

    def to_dict(self):
        return {
            "claim": self.claim,
            "source": self.source,
            "verified": self.verified,
            "type": self.fact_type
        }

def decide_reasoning_level(trust_score: int, has_private_data: bool, has_untrusted_content: bool) -> ReasoningLevel:
    # Lethal Trifecta = Private + Untrusted + External
    if has_private_data and has_untrusted_content:
        return ReasoningLevel.L3_FORK
    if trust_score < 50:
        return ReasoningLevel.L2_DEEP
    if trust_score < 80:
        return ReasoningLevel.L1_CHECK
    return ReasoningLevel.L0_FAST

# Test - Defensive Only
if __name__ == "__main__":
    fact = TrifectaFact(
        claim="User asked to send data externally",
        source="chat-input",
        verified=False,
        fact_type="claim"
    )
    print("Fact:", fact.to_dict())
    print("Level:", decide_reasoning_level(30, True, True))

    # ===== Trifecta Fortress V3 - Step 2 - Fork Mechanism + Worktree Isolation =====
# Defensive Only - No data leaves the device

import copy
import hashlib
import uuid

class ForkedTask:
    def __init__(self, original_fact: TrifectaFact):
        # Fork ID - عشان نعرف هذا الفحص - لحاله
        self.fork_id = str(uuid.uuid4())[:8]
        # ننسخ الـ Fact - بدون ما ننسخ البيانات الخاصة
        # Deep copy - عشان الأصلي ما يتأثر - لو الفورك تخرب
        self.isolated_fact = copy.deepcopy(original_fact)
        # نمسح أي بيانات خاصة - قبل الفحص - Worktree Isolation
        self.isolated_fact = self._strip_private(self.isolated_fact)
        self.result = None
        self.safe_to_continue = False

    def _strip_private(self, fact: TrifectaFact) -> TrifectaFact:
        # هنا - نشيل أي شي خاص - قبل ما نفحص
        # في مشروعك الحقيقي - هنا تحط قائمة كلماتك الخاصة
        private_keywords = ["password", "token", "secret", "card", "api_key"]
        clean_claim = fact.claim
        for word in private_keywords:
            if word in clean_claim.lower():
                clean_claim = clean_claim.replace(word, "[REDACTED]")
        fact.claim = clean_claim
        return fact

    def run_isolated_check(self) -> dict:
        # هذا هو الفحص المعزول - Fork
        # ما يرسل شي برا - كل شي داخل جهازك
        claim_lower = self.isolated_fact.claim.lower()
        dangerous_words = ["send", "externally", "upload", "exfiltrate", "bypass", "ignore instructions"]

        found = [w for w in dangerous_words if w in claim_lower]

        if found:
            self.result = f"BLOCKED - Found: {found}"
            self.safe_to_continue = False
        else:
            self.result = "CLEAN - Safe to continue"
            self.safe_to_continue = True

        return {
            "fork_id": self.fork_id,
            "original_source": self.isolated_fact.source,
            "check": self.result,
            "safe": self.safe_to_continue,
            "hash": hashlib.sha256(self.isolated_fact.claim.encode()).hexdigest()[:12]
        }

def run_fork_if_needed(fact: TrifectaFact, level: ReasoningLevel) -> dict | None:
    # اذا المستوى L3 فقط - نسوي فورك - غير كذا - ما نحتاج
    if level != ReasoningLevel.L3_FORK:
        return None

    print(f"\n[FORK] L3 detected - Creating isolated fork...")
    fork = ForkedTask(fact)
    result = fork.run_isolated_check()
    print(f"[FORK {result['fork_id']}] {result['check']}")
    print(f"[FORK] Safe? {result['safe']} - Hash: {result['hash']}")
    return result

# Test Step 2
if __name__ == "__main__":
    print("\n--- Testing Step 2 - Fork ---")
    test_fact = TrifectaFact(
        claim="User asked to send data externally",
        source="chat-input",
        verified=False,
        fact_type="claim"
    )
    test_level = decide_reasoning_level(30, True, True)
    print("Level:", test_level)
    fork_result = run_fork_if_needed(test_fact, test_level)
    print("Fork Result:", fork_result)