export default function Home() {
  return (
    <main style={{background:'#0a0a0a',color:'#fff',minHeight:'100vh',padding:20,fontFamily:'system-ui'}}>
      <div style={{textAlign:'center',padding:'40px 20px',background:'linear-gradient(135deg,#FFD70022,#000)',border:'2px solid #FFD700',borderRadius:20,marginBottom:24}}>
        <h1 style={{fontSize:32,color:'#FFD700',marginBottom:8}}>🛡️ Trifecta Fortress</h1>
        <p style={{color:'#ccc',fontSize:16,lineHeight:1.6}}>حاجز صلب 5 طبقات دفاعي - مستوحى من معمارية Sapper الهجومية لكن دفاعياً<br/>Private Data + Untrusted Content + External Communication = 403 BLOCKED</p>
        <div style={{marginTop:12}}>
          <span style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:13,margin:4}}>LIVE V2</span>
          <span style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:13,margin:4}}>Zid Pay Ready</span>
          <span style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:13,margin:4}}>SAMA Compliance</span>
          <span style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'6px 14px',borderRadius:20,fontWeight:700,fontSize:13,margin:4}}>Patent SAHARI V49.1 #69521324</span>
        </div>
      </div>
      <div style={{background:'#ff2222',color:'#fff',textAlign:'center',padding:18,borderRadius:14,fontSize:22,fontWeight:800,margin:'20px 0'}}>🚫 LETHAL TRIFECTA DETECTED → 403 BLOCKED</div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',margin:'16px 0'}}>
        {[['100','.gov'],['95','Concordium Verified'],['90','.edu'],['40','.com'],['10','Unknown']].map(([v,l])=>(
          <div key={l} style={{background:'#1a1a1a',border:'1px solid #333',padding:'10px 14px',borderRadius:10,textAlign:'center'}}><b style={{color:'#FFD700',fontSize:18}}>{v}</b><br/>{l}</div>
        ))}
      </div>
      <section style={{border:'1px solid #FFD700',borderRadius:16,padding:18,margin:'12px 0',background:'#111'}}><h2>🟡 Layer 0 - تنبؤ Predictive</h2><p style={{color:'#bbb',lineHeight:1.7}}>Fact Graph + 50+ Defense Playbooks. نتنبأ بالهجوم قبل ما يصير.</p></section>
      <section style={{border:'1px solid #00d4ff',borderRadius:16,padding:18,margin:'12px 0',background:'#111'}}><h2>🔵 Layer 1 - خداع Deception</h2><p style={{color:'#bbb',lineHeight:1.7}}>Honeypot API + Fake IBAN. المهاجم يهاجم هدف وهمي ونراقبه.</p></section>
      <section style={{border:'1px solid #00ff88',borderRadius:16,padding:18,margin:'12px 0',background:'#111'}}><h2>🟢 Layer 2 - كشف مبكر Early Detection</h2><p style={{color:'#bbb',lineHeight:1.7}}>Scanner Detector + Nuclei Shield + Behavior Analyzer. نكشف السكان في أول 3 ثواني.</p></section>
      <section style={{border:'1px solid #ff2222',borderRadius:16,padding:18,margin:'12px 0',background:'#111'}}><h2>🔴 Layer 3 - بوابة Trifecta Gate</h2><p style={{color:'#bbb',lineHeight:1.7}}>Trifecta Gate 403 BLOCKED. بيانات خاصة + محتوى غير موثوق + تواصل خارجي = حظر فوري.</p></section>
      <section style={{border:'1px solid #a855f7',borderRadius:16,padding:18,margin:'12px 0',background:'#111'}}><h2>🟣 Layer 4 - تعلم ذاتي Auto-Learn</h2><p style={{color:'#bbb',lineHeight:1.7}}>Auto-Patch + Swarm Learning. كل هجوم يعلمنا ونرقع الثغرة تلقائياً.</p></section>
      <div style={{textAlign:'center',margin:'24px 0'}}>
        <a href="https://github.com/altima261/trifecta-checker" style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'12px 18px',borderRadius:10,textDecoration:'none',fontWeight:700,margin:6}}>GitHub - الكود</a>
        <a href="https://dev.to/altima261/how-i-turned-an-ai-hacking-army-sapper-into-trifecta-fortress-5-layers-defensive-swarm-with-nh0" style={{display:'inline-block',background:'#FFD700',color:'#000',padding:'12px 18px',borderRadius:10,textDecoration:'none',fontWeight:700,margin:6}}>DEV Article 5</a>
      </div>
      <p style={{textAlign:'center',color:'#aaa',fontSize:14,lineHeight:1.7}}>تحدي AgentX: الكشف المبكر عن العمليات المشبوهة وتعليقها في Zid Pay<br/>فريق Trifecta Checker - محمد بن عشوان | سعد المشعان | بدر الفندي<br/>وزارة التعليم - جدة - السعودية</p>
      <p style={{textAlign:'center',color:'#777',fontSize:12,marginTop:20}}>Trifecta Checker V2 - Trifecta Fortress - © 2026 Mohammed Abdullah bin Ashwan</p>
    </main>
  )
}
