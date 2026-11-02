
/**
 * deploy-vultr.js - Deploy Trifecta Checker sandbox to Vultr
 * Uses Vultr API v2
 * Usage: VULTR_API_KEY=xxx node deploy-vultr.js
 */
const API_KEY = process.env.VULTR_API_KEY;
if(!API_KEY){ console.error("Set VULTR_API_KEY env"); process.exit(1); }

async function vultr(path, method="GET", body=null){
  const res = await fetch(`https://api.vultr.com/v2${path}`, {
    method,
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type":"application/json" },
    body: body?JSON.stringify(body):null
  });
  const text = await res.text();
  try{ return JSON.parse(text); } catch{ console.log(text); return text; }
}

(async()=>{
  console.log("Creating firewall to isolate sandbox VMs...");
  const fw = await vultr("/firewalls", "POST", {
    description: "trifecta-zero-trust",
    rules: [
      { ip_type:"v4", protocol:"tcp", port:"22", subnet:"0.0.0.0", subnet_size:0 }, // SSH only from your IP ideally
      { ip_type:"v4", protocol:"tcp", port:"443", subnet:"0.0.0.0", subnet_size:0 }, // outbound https for tools
    ]
  });
  console.log("Firewall:", fw);

  console.log("\nCreating startup instance for Trifecta gateway...");
  const instance = await vultr("/instances","POST",{
    region:"ewr",
    plan:"vc2-1c-2gb",
    os_id:1743,
    label:"trifecta-gateway",
    tags:["trifecta-checker","gateway"],
    user_data: Buffer.from(`#!/bin/bash
apt update && apt install -y nodejs npm docker.io
git clone https://github.com/altima261/trifecta-checker /opt/trifecta
cd /opt/trifecta && npm install
echo "Gateway ready"
`).toString("base64")
  });
  console.log("Instance:", instance);

  console.log("\nDone. Gateway IP:", instance.instance?.main_ip);
})();
