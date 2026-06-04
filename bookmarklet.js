/**
 * ⚡ Speedtest Faker — Bookmarklet
 *
 * Drag to bookmarks bar, then click on speedtest.net.
 * Runs same-origin → no CORS, no rate limits, your IP.
 *
 * Loader: javascript:void((function(){var s=document.createElement('script');s.src='https://deadboy18.github.io/speedtest-faker/bookmarklet.js?'+Date.now();document.head.appendChild(s)})())
 */
(function(){
'use strict';

// Prevent double-injection
if(document.getElementById('stf-panel')){
  const p=document.getElementById('stf-panel');
  p.style.display=p.style.display==='none'?'':'none';
  return;
}

/* ===== MD5 ===== */
function md5hex(str){
  const bytes=new TextEncoder().encode(str);
  const bits=bytes.length*8;
  const padLen=(Math.floor((bytes.length+8)/64)+1)*64;
  const padded=new Uint8Array(padLen);
  padded.set(bytes);padded[bytes.length]=0x80;
  new DataView(padded.buffer).setUint32(padded.length-8,bits,true);
  let a0=0x67452301,b0=0xefcdab89,c0=0x98badcfe,d0=0x10325476;
  const S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K=new Uint32Array(64);
  for(let i=0;i<64;i++)K[i]=Math.floor(Math.abs(Math.sin(i+1))*0x100000000);
  const view=new DataView(padded.buffer);
  for(let off=0;off<padded.length;off+=64){
    const M=new Uint32Array(16);
    for(let j=0;j<16;j++)M[j]=view.getUint32(off+j*4,true);
    let A=a0,B=b0,C=c0,D=d0;
    for(let i=0;i<64;i++){
      let F,g;
      if(i<16){F=(B&C)|(~B&D);g=i}
      else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)%16}
      else if(i<48){F=B^C^D;g=(3*i+5)%16}
      else{F=C^(B|~D);g=(7*i)%16}
      F=((F>>>0)+(A>>>0)+(K[i]>>>0)+(M[g]>>>0))>>>0;
      A=D;D=C;C=B;B=(B+(((F<<S[i])|(F>>>(32-S[i])))>>>0))>>>0;
    }
    a0=(a0+A)>>>0;b0=(b0+B)>>>0;c0=(c0+C)>>>0;d0=(d0+D)>>>0;
  }
  function hex(n){let s='';for(let i=0;i<4;i++)s+=((n>>>(i*8))&0xff).toString(16).padStart(2,'0');return s}
  return hex(a0)+hex(b0)+hex(c0)+hex(d0);
}

/* ===== ESCAPE HTML ===== */
function esc(s){if(!s)return'';const d=document.createElement('div');d.textContent=String(s);return d.innerHTML}

/* ===== BUILD PANEL ===== */
const panel=document.createElement('div');
panel.id='stf-panel';
panel.innerHTML=`
<style>
#stf-panel{position:fixed;top:20px;right:20px;width:380px;max-width:calc(100vw - 24px);max-height:calc(100vh - 40px);overflow-y:auto;background:#1b1d23;border:1px solid #353840;border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,0.6);z-index:2147483647;font-family:'Segoe UI',system-ui,sans-serif;color:#d4d7de;font-size:13px;line-height:1.4}
#stf-panel *{box-sizing:border-box}
#stf-panel a{color:#5b9aff;text-decoration:none}
.stf-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#22252c;border-radius:14px 14px 0 0;cursor:move;border-bottom:1px solid #353840;user-select:none;-webkit-user-select:none}
.stf-hdr-left{display:flex;align-items:center;gap:8px}
.stf-hdr svg{flex-shrink:0}
.stf-title{font-size:14px;font-weight:700;color:#fff}
.stf-sub{font-size:10px;color:#6b7080;letter-spacing:0.5px;text-transform:uppercase;font-weight:600}
.stf-close{width:28px;height:28px;background:#272a33;border:1px solid #353840;border-radius:6px;color:#9ea3ad;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1}
.stf-close:hover{background:#f06060;color:#fff;border-color:#f06060}
.stf-body{padding:14px 16px}
.stf-field{margin-bottom:10px}
.stf-label{display:block;font-size:10px;font-weight:700;color:#6b7080;margin-bottom:4px;letter-spacing:0.4px;text-transform:uppercase}
.stf-input{width:100%;padding:8px 10px;background:#272a33;border:1px solid #353840;border-radius:6px;font-family:inherit;font-size:13px;color:#d4d7de;outline:none;transition:border-color .2s}
.stf-input:focus{border-color:#5b9aff}
.stf-input::placeholder{color:#6b7080}
.stf-row{display:flex;gap:8px}
.stf-row>*{flex:1}
.stf-presets{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}
.stf-preset{padding:4px 10px;background:#272a33;border:1px solid #353840;border-radius:100px;font-family:inherit;font-size:11px;color:#9ea3ad;cursor:pointer;transition:all .12s;white-space:nowrap}
.stf-preset:hover{background:rgba(91,154,255,0.08);border-color:rgba(91,154,255,0.18);color:#5b9aff}
.stf-preset.fun{color:#a78bfa;border-color:rgba(167,139,250,0.18);background:rgba(167,139,250,0.08)}
.stf-gen{width:100%;padding:10px 16px;background:#5b9aff;border:none;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:all .15s;letter-spacing:0.2px}
.stf-gen:hover{background:#4080e8;transform:translateY(-1px);box-shadow:0 4px 16px rgba(91,154,255,0.3)}
.stf-gen:disabled{background:#353840;color:#6b7080;cursor:not-allowed;transform:none;box-shadow:none}
.stf-result{margin-top:12px;padding:12px;background:rgba(69,212,131,0.06);border:1px solid rgba(69,212,131,0.15);border-radius:8px}
.stf-result-title{font-size:10px;font-weight:700;color:#45d483;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.stf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.stf-stat{padding:6px;background:#272a33;border-radius:6px;text-align:center;border:1px solid #353840}
.stf-stat-label{font-size:9px;color:#6b7080}
.stf-stat-val{font-size:18px;font-weight:900}
.stf-stat-dl .stf-stat-val{color:#5b9aff}
.stf-stat-ul .stf-stat-val{color:#a78bfa}
.stf-stat-pi .stf-stat-val{color:#45d483}
.stf-stat-unit{font-size:9px;color:#6b7080}
.stf-links{background:#272a33;border:1px solid #353840;border-radius:6px;padding:8px 10px;margin-bottom:8px}
.stf-links a{display:block;font-size:11.5px;word-break:break-all;margin-bottom:4px}
.stf-links-label{font-size:9px;font-weight:700;color:#6b7080;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px}
.stf-copy-row{display:flex;gap:6px}
.stf-copy{flex:1;padding:6px 10px;background:rgba(91,154,255,0.08);border:1px solid rgba(91,154,255,0.18);border-radius:6px;font-family:inherit;font-size:11px;font-weight:600;color:#5b9aff;cursor:pointer;transition:all .12s;text-align:center}
.stf-copy:hover{background:rgba(91,154,255,0.15)}
.stf-err{margin-top:8px;padding:8px 10px;background:rgba(240,96,96,0.08);border:1px solid rgba(240,96,96,0.18);border-radius:6px;font-size:11.5px;color:#f06060}
.stf-badge{display:inline-block;padding:3px 10px;background:rgba(69,212,131,0.08);border:1px solid rgba(69,212,131,0.15);border-radius:100px;font-size:10px;font-weight:600;color:#45d483;margin-bottom:10px}
.stf-server-info{padding:8px 10px;background:#272a33;border:1px solid #353840;border-radius:6px;margin-bottom:10px;font-size:11px;color:#9ea3ad}
.stf-server-info strong{color:#fff}
@media(max-width:420px){
  #stf-panel{width:calc(100vw - 16px);right:8px;top:8px;max-height:calc(100vh - 16px);border-radius:10px}
  .stf-hdr{border-radius:10px 10px 0 0}
}
</style>

<div class="stf-hdr" id="stf-drag">
  <div class="stf-hdr-left">
    <svg width="22" height="22" viewBox="0 0 56 56" fill="none"><rect width="56" height="56" rx="14" fill="#22252c"/><path d="M32 8L15 32h11L22 48l17-24H28z" fill="url(#stfG)"/><defs><linearGradient id="stfG" x1="18" y1="8" x2="36" y2="48"><stop stop-color="#5b9aff"/><stop offset=".5" stop-color="#a78bfa"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs></svg>
    <div>
      <div class="stf-title">Speedtest Faker</div>
      <div class="stf-sub">Bookmarklet · Same-origin · No limits</div>
    </div>
  </div>
  <button class="stf-close" id="stf-close-btn">×</button>
</div>
<div class="stf-body">
  <div class="stf-badge">✅ Running on speedtest.net — no CORS, no rate limits</div>

  <div class="stf-field">
    <label class="stf-label">Server ID</label>
    <input class="stf-input" id="stf-srv" placeholder="e.g. 15028 (auto-detected if possible)" type="text">
  </div>
  <div id="stf-srv-info" class="stf-server-info" style="display:none"></div>

  <div class="stf-row">
    <div class="stf-field"><label class="stf-label">⬇️ Download (Mbps)</label><input class="stf-input" id="stf-dl" type="number" placeholder="0–10000" step="0.01"></div>
    <div class="stf-field"><label class="stf-label">⬆️ Upload (Mbps)</label><input class="stf-input" id="stf-ul" type="number" placeholder="0–10000" step="0.01"></div>
    <div class="stf-field"><label class="stf-label">📡 Ping (ms)</label><input class="stf-input" id="stf-ping" type="number" placeholder="1–9999"></div>
  </div>

  <div class="stf-label" style="margin-bottom:4px">PRESETS</div>
  <div class="stf-presets">
    <button class="stf-preset" onclick="stfPre(940,880,3)">1 Gbps</button>
    <button class="stf-preset" onclick="stfPre(2500,2500,2)">2.5G</button>
    <button class="stf-preset" onclick="stfPre(5000,5000,1)">5G</button>
    <button class="stf-preset" onclick="stfPre(9400,9200,1)">10G</button>
    <button class="stf-preset" onclick="stfPre(500,500,5)">Fiber</button>
    <button class="stf-preset" onclick="stfPre(100,20,28)">Cable</button>
    <button class="stf-preset" onclick="stfPre(2.4,0.8,847)">Trash 🗑️</button>
    <button class="stf-preset fun" onclick="stfPre(9999,9999,0)">⚡ GOD</button>
    <button class="stf-preset fun" onclick="stfPre(6969,6969,1)">😏 Nice</button>
    <button class="stf-preset fun" onclick="stfPre(0.05,0.01,9999)">🐌 Dial-up</button>
  </div>

  <button class="stf-gen" id="stf-gen-btn" onclick="stfGenerate()">⚡ Generate Fake Speedtest</button>
  <div id="stf-err"></div>
  <div id="stf-result"></div>
</div>
`;

document.body.appendChild(panel);

/* ===== CLOSE ===== */
document.getElementById('stf-close-btn').onclick=function(){panel.style.display='none'};

/* ===== DRAG ===== */
(function(){
  const hdr=document.getElementById('stf-drag');
  let dragging=false,ox,oy;
  hdr.addEventListener('mousedown',function(e){
    if(e.target.closest('.stf-close'))return;
    dragging=true;ox=e.clientX-panel.offsetLeft;oy=e.clientY-panel.offsetTop;
    panel.style.transition='none';
  });
  document.addEventListener('mousemove',function(e){
    if(!dragging)return;
    panel.style.left=(e.clientX-ox)+'px';panel.style.top=(e.clientY-oy)+'px';
    panel.style.right='auto';
  });
  document.addEventListener('mouseup',function(){dragging=false;panel.style.transition=''});
  // Touch support
  hdr.addEventListener('touchstart',function(e){
    if(e.target.closest('.stf-close'))return;
    const t=e.touches[0];dragging=true;ox=t.clientX-panel.offsetLeft;oy=t.clientY-panel.offsetTop;
    panel.style.transition='none';
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(!dragging)return;const t=e.touches[0];
    panel.style.left=(t.clientX-ox)+'px';panel.style.top=(t.clientY-oy)+'px';
    panel.style.right='auto';
  },{passive:true});
  document.addEventListener('touchend',function(){dragging=false;panel.style.transition=''});
})();

/* ===== AUTO-DETECT SERVER ===== */
(function(){
  try{
    // Try to find server ID from speedtest.net's own state
    const srvInput=document.getElementById('stf-srv');
    const srvInfo=document.getElementById('stf-srv-info');

    // Method 1: Check URL hash (speedtest.net sometimes stores server in hash)
    const hashMatch=location.hash.match(/server[_-]?id[=:](\d+)/i);
    if(hashMatch){srvInput.value=hashMatch[1]}

    // Method 2: Look for server info in the page's JavaScript state
    if(window.__NEXT_DATA__&&window.__NEXT_DATA__.props){
      try{
        const p=JSON.stringify(window.__NEXT_DATA__.props);
        const m=p.match(/"id":(\d{4,6})/);
        if(m)srvInput.value=m[1];
      }catch(e){}
    }

    // Method 3: Look for server elements in the DOM
    if(!srvInput.value){
      const el=document.querySelector('[data-server-id]');
      if(el)srvInput.value=el.getAttribute('data-server-id');
    }

    // Method 4: Check for sponsor/server name in page
    if(!srvInput.value){
      const sponsorEl=document.querySelector('.server-name, .hostUrl, [class*="ServerName"]');
      if(sponsorEl)srvInfo.innerHTML=`Detected: <strong>${esc(sponsorEl.textContent.trim())}</strong> — enter its ID above`;
      srvInfo.style.display='block';
    }

    if(srvInput.value){
      srvInfo.innerHTML=`Auto-detected server ID: <strong>${esc(srvInput.value)}</strong>`;
      srvInfo.style.display='block';
    }
  }catch(e){}
})();

/* ===== PRESETS ===== */
window.stfPre=function(d,u,p){
  document.getElementById('stf-dl').value=d;
  document.getElementById('stf-ul').value=u;
  document.getElementById('stf-ping').value=p;
};

/* ===== GENERATE ===== */
window.stfGenerate=async function(){
  const srv=document.getElementById('stf-srv').value.trim();
  const dl=parseFloat(document.getElementById('stf-dl').value);
  const ul=parseFloat(document.getElementById('stf-ul').value);
  const ping=parseInt(document.getElementById('stf-ping').value);
  const errEl=document.getElementById('stf-err');
  const resEl=document.getElementById('stf-result');
  errEl.innerHTML='';resEl.innerHTML='';

  if(!srv){errEl.innerHTML='<div class="stf-err">Enter a server ID. Find one at speedtest.net/speedtest-servers-static.php or use the main site\'s search.</div>';return}
  if(isNaN(dl)||isNaN(ul)||isNaN(ping)){errEl.innerHTML='<div class="stf-err">Fill in download, upload, and ping.</div>';return}

  const btn=document.getElementById('stf-gen-btn');
  btn.disabled=true;btn.textContent='⏳ Generating...';

  const dlRaw=Math.round(dl*1000),ulRaw=Math.round(ul*1000);
  const hash=md5hex(`${ping}-${ulRaw}-${dlRaw}-297aae72`);

  const body=new URLSearchParams({
    startmode:'recommendedselect',promo:'',
    upload:ulRaw,accuracy:8,
    recommendedserverid:srv,serverid:srv,
    ping:ping,hash:hash,download:dlRaw
  });

  try{
    const r=await fetch('https://www.speedtest.net/api/api.php',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:body.toString()
    });
    const text=await r.text();

    if(text.includes('<html')){
      if(text.includes('429'))errEl.innerHTML='<div class="stf-err">Rate limited (429). Wait a minute and try again.</div>';
      else errEl.innerHTML='<div class="stf-err">Ookla returned an error. Try again.</div>';
      btn.disabled=false;btn.textContent='⚡ Generate Fake Speedtest';
      return;
    }

    const params=Object.fromEntries(new URLSearchParams(text));
    const rid=params.resultid||'';

    if(rid){
      const rUrl=`https://www.speedtest.net/result/${rid}`;
      const iUrl=`${rUrl}.png`;
      resEl.innerHTML=`
        <div class="stf-result">
          <div class="stf-result-title">✅ Result Generated</div>
          <div class="stf-stats">
            <div class="stf-stat stf-stat-dl"><div class="stf-stat-label">Download</div><div class="stf-stat-val">${dl}</div><div class="stf-stat-unit">Mbps</div></div>
            <div class="stf-stat stf-stat-ul"><div class="stf-stat-label">Upload</div><div class="stf-stat-val">${ul}</div><div class="stf-stat-unit">Mbps</div></div>
            <div class="stf-stat stf-stat-pi"><div class="stf-stat-label">Ping</div><div class="stf-stat-val">${ping}</div><div class="stf-stat-unit">ms</div></div>
          </div>
          <div class="stf-links">
            <div class="stf-links-label">Result Link</div>
            <a href="${esc(rUrl)}" target="_blank">${esc(rUrl)}</a>
            <div class="stf-links-label">Image Link</div>
            <a href="${esc(iUrl)}" target="_blank">${esc(iUrl)}</a>
          </div>
          <div class="stf-copy-row">
            <button class="stf-copy" onclick="navigator.clipboard.writeText('${esc(rUrl)}');this.textContent='✓ Copied!';setTimeout(()=>this.textContent='📋 Copy Link',1200)">📋 Copy Link</button>
            <button class="stf-copy" onclick="navigator.clipboard.writeText('${esc(iUrl)}');this.textContent='✓ Copied!';setTimeout(()=>this.textContent='🖼️ Copy Image',1200)">🖼️ Copy Image</button>
          </div>
        </div>`;
    }else{
      errEl.innerHTML=`<div class="stf-err">No result ID. Raw: ${esc(text.slice(0,200))}</div>`;
    }
  }catch(e){
    errEl.innerHTML=`<div class="stf-err">Error: ${esc(e.message)}</div>`;
  }

  btn.disabled=false;btn.textContent='⚡ Generate Fake Speedtest';
};

console.log('%c⚡ Speedtest Faker bookmarklet loaded','background:#5b9aff;color:#fff;padding:4px 10px;border-radius:4px;font-weight:700');

})();
