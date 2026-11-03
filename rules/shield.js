// Shield - Blast Radius Zero - QuantOrb Shield inspired
function shieldCheck(agent){
  const lethal=agent.history?.filter(h=>h.verdict==="DANGER").length||0;
  const isSerial=lethal>=3;
  const block=isSerial;
  return {shouldBlockVM:block,blastRadius:block?0:"unknown",cost:block?0:1,
  msg:block?"SHIELD: Serial lethal - BLOCK VM":"SHIELD: OK"};
}
module.exports={shieldCheck};