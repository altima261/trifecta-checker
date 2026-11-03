// Trifecta Scoring - QuantOrb inspired - Open Rules
const RULES = { privateData:35, untrusted:25, external:20, linked:10, fresh:10 };
function hasAllThree(t){
  const p=t.some(x=>["read_gmail","read_drive"].includes(x));
  const u=t.some(x=>["browse_web","read_upload"].includes(x));
  const e=t.some(x=>["send_email","http_request"].includes(x));
  return p&&u&&e;
}
function calculateScore(tools){
  let s=0; let flags=[];
  if(tools.some(t=>["read_gmail","read_drive"].includes(t))) s+=35;
  if(tools.some(t=>["browse_web"].includes(t))) s+=25;
  if(tools.some(t=>["send_email"].includes(t))) s+=20;
  if(hasAllThree(tools)){ s=100; flags.push("LETHAL_TRIFECTA"); }
  let verdict=s>80?"DANGER":s>50?"RISKY":s>20?"OK":"CLEAN";
  return {score:s,verdict,status:verdict==="DANGER"?403:200,flags,wallet:"3eLK...z44V"};
}
module.exports={calculateScore};