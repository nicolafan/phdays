/* ============================================================
   PhDays 2026 — presentation logic
   1) nav dots + progress + scroll reveal + keyboard
   2) ArtSeek static chat player
   3) IDMP multi-mask stepper
   4) TAMArt token-activation-map explorer (ported real demo)
   ============================================================ */
"use strict";
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const el = id => document.getElementById(id);

/* ---------------------------------------------------------------
   1 · NAVIGATION, PROGRESS, REVEAL
--------------------------------------------------------------- */
(function nav(){
  const sections = $$("[data-nav]");
  const dots = el("dots");
  const bar  = el("progress");

  sections.forEach((sec,i) => {
    const b = document.createElement("button");
    b.innerHTML = `<span class="lbl">${sec.dataset.nav}</span>`;
    b.setAttribute("aria-label", sec.dataset.nav);
    b.addEventListener("click", () => sec.scrollIntoView({behavior:"smooth", block:"start"}));
    dots.appendChild(b);
  });
  const btns = $$("button", dots);

  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max>0 ? (h.scrollTop/max*100) : 0) + "%";
  };
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  // active dot via IntersectionObserver (center of viewport)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const i = sections.indexOf(e.target);
        btns.forEach((b,j) => b.classList.toggle("on", j===i));
      }
    });
  }, {rootMargin:"-45% 0px -45% 0px", threshold:0});
  sections.forEach(s => io.observe(s));

  // reveal
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, {rootMargin:"0px 0px -10% 0px", threshold:.08});
  $$(".reveal").forEach(n => ro.observe(n));

  // keyboard: jump between sections (ignore when a form control is focused)
  document.addEventListener("keydown", ev => {
    const t = ev.target.tagName;
    if(t==="INPUT" || t==="TEXTAREA" || t==="SELECT") return;
    const dir = (ev.key==="ArrowDown"||ev.key==="PageDown") ? 1
              : (ev.key==="ArrowUp"||ev.key==="PageUp")   ? -1 : 0;
    if(!dir) return;
    ev.preventDefault();
    const mid = window.scrollY + window.innerHeight*0.5;
    let idx = sections.findIndex(s => s.offsetTop > mid - 4);
    if(dir>0){ idx = idx<0 ? sections.length-1 : idx; }
    else { idx = (idx<=0 ? 0 : idx-1); const cur = sections.findIndex(s=>s.offsetTop>mid-4); idx = Math.max(0,(cur<0?sections.length:cur)-1); }
    sections[Math.max(0,Math.min(sections.length-1, idx))].scrollIntoView({behavior:"smooth"});
  });
})();

/* ---------------------------------------------------------------
   2 · ARTSEEK CHAT PLAYER
--------------------------------------------------------------- */
(function chat(){
  const shell = el("artseek-chat"); if(!shell) return;
  const body = el("chat-body"), nextBtn = el("chat-next"),
        resetBtn = el("chat-reset"), prog = el("chat-prog");
  const steps = (window.ARTSEEK_CHAT||{}).steps || [];
  let i = 0;

  function esc(s){ return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  function render(step){
    const wrap = document.createElement("div");
    if(step.type==="user"){
      wrap.className = "msg msg-user";
      wrap.innerHTML = `<div class="who" style="text-align:right">You</div>
        <div class="bubble-user"><div class="uimg">
          ${step.image?`<img src="${step.image}" alt="uploaded artwork">`:""}
          <span>${esc(step.text)}</span></div></div>`;
    } else if(step.type==="artcard"){
      wrap.className = "msg msg-ai";
      const attrs = step.attrs.map(a=>`<span class="attr"><span class="k">${esc(a.k)}:</span> ${esc(a.v)} <span class="p">${esc(a.p)}</span></span>`).join("");
      const tags  = (step.tags||[]).map(t=>`<span class="attr">${esc(t)}</span>`).join("");
      wrap.innerHTML = `<div class="who">ArtSeek · classification</div>
        <div class="artcard"><div class="hd">◧ Artwork card</div>
          <div class="bd">${attrs}${tags}</div></div>`;
    } else if(step.type==="think"){
      wrap.className = "msg msg-ai";
      wrap.innerHTML = `<div class="think"><span class="tag">reasoning</span>${esc(step.text)}</div>`;
    } else if(step.type==="tool"){
      wrap.className = "msg msg-ai";
      wrap.innerHTML = `<div class="toolcall">${step.call}</div>`;
    } else if(step.type==="doc"){
      wrap.className = "msg msg-ai";
      wrap.innerHTML = `<div class="docret"><div class="hd">▤ retrieved · ${esc(step.title)}</div>
        <div class="bd">${esc(step.text)}</div></div>`;
    } else if(step.type==="answer"){
      wrap.className = "msg msg-ai";
      const rows = step.rows.map(r=>`<div class="arow"><div class="k">${esc(r.k)}</div><div class="v">${esc(r.v)}</div></div>`).join("");
      wrap.innerHTML = `<div class="who">ArtSeek · answer</div><div class="answer">${rows}</div>`;
    }
    body.appendChild(wrap);
    requestAnimationFrame(()=> wrap.classList.add("show"));
    wrap.scrollIntoView({behavior:"smooth", block:"nearest"});
  }

  function advance(){
    if(i>=steps.length) return;
    render(steps[i]); i++;
    update();
  }
  function update(){
    prog.textContent = `${Math.min(i,steps.length)} / ${steps.length}`;
    nextBtn.disabled = i>=steps.length;
    nextBtn.textContent = i>=steps.length ? "✓ Complete" : "▶ Advance";
  }
  function reset(){ body.innerHTML=""; i=0; update(); }

  nextBtn.addEventListener("click", advance);
  resetBtn.addEventListener("click", reset);
  reset();
  // reveal the first user turn automatically when the demo scrolls into view
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting && i===0){ advance(); io.disconnect(); } });
  }, {threshold:.4});
  io.observe(shell);
})();

/* ---------------------------------------------------------------
   3 · IDMP STEPPER
--------------------------------------------------------------- */
(function idmp(){
  const root = el("idmp-demo"); if(!root) return;
  const data = window.IDMP_DEMO || {steps:[],prompts:[]};
  const canvas = el("idmp-canvas"), stepsBox = el("idmp-steps"),
        titleEl = el("idmp-title"), descEl = el("idmp-desc"),
        promptsBox = el("idmp-prompts"), playBtn = el("idmp-play"), origBtn = el("idmp-orig");
  let cur = 0, timer = null, origOn = false;

  // image layers (dedup by src)
  const srcs = [...new Set(data.steps.map(s=>s.img))];
  const layers = {};
  srcs.forEach(src=>{
    const img = document.createElement("img");
    img.src = src; img.alt = "";
    canvas.appendChild(img); layers[src]=img;
  });
  // original-gif layer
  const gif = document.createElement("img");
  gif.src = "assets/idmp/task.gif"; gif.alt = "IDMP task animation";
  gif.style.objectFit = "contain"; gif.style.background = "#f4efe3";
  canvas.appendChild(gif); layers.__gif = gif;

  // steps
  data.steps.forEach((s,idx)=>{
    const b = document.createElement("button");
    b.className = "step"; b.type="button";
    b.innerHTML = `<span class="n">${idx+1}</span>
      <span><span class="st-t">${s.t}</span><span class="st-d">${s.d}</span></span>`;
    b.addEventListener("click", ()=>{ stopPlay(); go(idx); });
    stepsBox.appendChild(b);
  });
  const stepEls = $$(".step", stepsBox);

  // prompts
  data.prompts.forEach(p=>{
    const d = document.createElement("div");
    d.className="pr";
    d.innerHTML = `<span class="sw" style="background:${p.color}"></span><span>${p.text}</span>`;
    promptsBox.appendChild(d);
  });
  const prEls = $$(".pr", promptsBox);

  function go(idx){
    cur = idx; const s = data.steps[idx];
    if(origOn){ setOrig(false); }
    Object.values(layers).forEach(l=> l.classList.remove("on"));
    if(layers[s.img]) layers[s.img].classList.add("on");
    titleEl.textContent = s.t; descEl.textContent = s.d;
    stepEls.forEach((e,j)=>{ e.classList.toggle("active", j===idx); e.classList.toggle("done", j<idx); });
    // prompts: reveal progressively once we reach the prompt step, keep after
    prEls.forEach((e,k)=>{
      const show = idx>=1;
      setTimeout(()=> e.classList.toggle("show", show), show ? k*160 : 0);
    });
  }
  function setOrig(on){
    origOn = on;
    origBtn.textContent = on ? "◂ Back to steps" : "Show original animation";
    if(on){
      Object.values(layers).forEach(l=> l.classList.remove("on"));
      layers.__gif.classList.add("on");
      titleEl.textContent = "Original animation";
      descEl.textContent = "The full pipeline as shown on the project page.";
      stepEls.forEach(e=>{ e.classList.remove("active"); });
    } else { go(cur); }
  }
  function stopPlay(){ if(timer){ clearInterval(timer); timer=null; playBtn.textContent="▶ Auto-play"; } }
  playBtn.addEventListener("click", ()=>{
    if(timer){ stopPlay(); return; }
    if(origOn) setOrig(false);
    if(cur>=data.steps.length-1) go(0);
    playBtn.textContent="❚❚ Pause";
    timer = setInterval(()=>{
      if(cur>=data.steps.length-1){ stopPlay(); return; }
      go(cur+1);
    }, 1600);
  });
  origBtn.addEventListener("click", ()=>{ stopPlay(); setOrig(!origOn); });

  go(0);
})();

/* ---------------------------------------------------------------
   4 · TAMART TOKEN-ACTIVATION-MAP EXPLORER  (ported real demo)
--------------------------------------------------------------- */
(function tam(){
  const explorer = el("tam-explorer"); if(!explorer || !window.TAM) return;

  const CAT_COLORS = { CVO:"#1f77b4", ICON:"#9467bd", STYLE:"#2ca02c", AFFECT:"#d62728", META:"#e07b12", "?":"#7f7f7f" };
  const CAT_NAME   = { CVO:"Concrete object", ICON:"Named figure", STYLE:"Style", AFFECT:"Affect", META:"Metadata" };
  const SEG_CATS = new Set(["CVO","ICON"]);
  const overlay = el("overlay"), octx = overlay.getContext("2d"), painting = el("painting");

  const INDEX = window.TAM.index, DB = window.TAM.paintings;
  let cur=null, sel=-1, samImg=null;

  // inferno-ish colormap
  const CM=[[0,[0,0,4]],[.13,[31,12,72]],[.25,[85,15,109]],[.38,[136,34,106]],[.5,[186,54,85]],
            [.63,[227,89,51]],[.75,[249,140,10]],[.88,[249,201,50]],[1,[252,255,164]]];
  function cmap(t){ t=t<0?0:t>1?1:t;
    for(let i=1;i<CM.length;i++){ if(t<=CM[i][0]){ const [a,ca]=CM[i-1],[b,cb]=CM[i],f=(t-a)/(b-a||1);
      return [ca[0]+(cb[0]-ca[0])*f, ca[1]+(cb[1]-ca[1])*f, ca[2]+(cb[2]-ca[2])*f]; } } return CM[CM.length-1][1]; }
  function b64ToBytes(s){ const bin=atob(s),out=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i); return out; }
  function otsu(v){ const h=new Array(256).fill(0); for(let i=0;i<v.length;i++) h[v[i]]++; const tot=v.length;
    let sum=0; for(let i=0;i<256;i++) sum+=i*h[i]; let sB=0,wB=0,mx=-1,thr=0;
    for(let t=0;t<256;t++){ wB+=h[t]; if(!wB) continue; const wF=tot-wB; if(!wF) break; sB+=t*h[t];
      const mB=sB/wB,mF=(sum-sB)/wF,bt=wB*wF*(mB-mF)*(mB-mF); if(bt>mx){mx=bt;thr=t;} } return thr; }
  function esc(s){ return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

  function loadPainting(stem){
    cur = DB[stem]; sel=-1; samImg=null;
    el("np-title").textContent = cur.gt_title || stem;
    el("np-artist").textContent = [cur.gt_artist, cur.year].filter(Boolean).join(" · ");
    $$(".tam-thumb", el("tam-picker")).forEach(t=> t.classList.toggle("active", t.dataset.stem===stem));
    renderLegend(); renderCaption(); renderMetaCard();
    painting.onload = () => { sizeCanvas(); autoSelect(); };
    painting.src = cur.image;
    if(painting.complete && painting.naturalWidth){ sizeCanvas(); autoSelect(); }
  }
  function autoSelect(){
    let i = cur.spans.findIndex(s=>/village|town|woman|man|figure|boat|tree|house|star|hair|dress|face/i.test(s.word) && s.cat==="CVO");
    if(i<0) i=cur.spans.findIndex(s=>s.cat==="CVO");
    if(i<0) i=0; selectSpan(i);
  }
  function renderLegend(){
    const present={}; cur.spans.forEach(s=> present[s.cat]=(present[s.cat]||0)+1);
    el("legend").innerHTML = Object.keys(present).sort().map(c=>
      `<span class="lg"><span class="dot" style="background:${CAT_COLORS[c]}"></span>${CAT_NAME[c]||c} <span style="opacity:.55">(${present[c]})</span></span>`).join("");
  }
  function renderCaption(){
    let html="";
    for(const seg of cur.segments){
      if(seg.s<0){ html+=`<span class="plain">${esc(seg.t)}</span>`; continue; }
      const cat=(cur.spans[seg.s]||{}).cat||"?";
      html+=`<span class="sp" data-s="${seg.s}" style="background:${CAT_COLORS[cat]}">${esc(seg.t)}</span>`;
    }
    const c=el("caption"); c.innerHTML=html;
    $$(".sp",c).forEach(n=> n.addEventListener("click", ()=> selectSpan(parseInt(n.dataset.s,10))));
  }
  function selectSpan(i){
    sel=i; const span=cur.spans[i];
    $$(".caption .sp").forEach(n=> n.classList.toggle("active", parseInt(n.dataset.s,10)===i));
    el("span-hint").innerHTML = `Showing <b style="color:${CAT_COLORS[span.cat]}">${esc(span.word)}</b> — ${CAT_NAME[span.cat]||span.cat}`;
    const samCtl=el("ctl-sam"), samToggle=el("t-sam");
    if(span.sam){
      samCtl.classList.remove("disabled"); samToggle.disabled=false;
      el("sam-note").textContent=`SAM-3 found ${span.sam_n} instance${span.sam_n>1?"s":""} for “${span.word}”.`;
      samImg=new Image(); samImg.onload=renderOverlay; samImg.src=`assets/tamart/masks/${span.sam}`;
    } else {
      samCtl.classList.add("disabled"); samToggle.checked=false; samToggle.disabled=true; samImg=null;
      el("sam-note").textContent = SEG_CATS.has(span.cat)
        ? "SAM-3 returned no detection for this span."
        : "SAM-3 comparison applies to concrete objects and named figures only.";
    }
    renderOverlay();
  }
  function sizeCanvas(){ const w=painting.clientWidth,h=painting.clientHeight; if(!w||!h) return; overlay.width=w; overlay.height=h; }
  function renderOverlay(){
    octx.clearRect(0,0,overlay.width,overlay.height);
    if(sel<0||!cur) return;
    const W=overlay.width,H=overlay.height; if(!W||!H) return;
    const span=cur.spans[sel], gw=cur.grid_w, gh=cur.grid_h;
    const bytes=b64ToBytes(span.map), alpha=parseInt(el("alpha").value,10)/100;

    const grid=document.createElement("canvas"); grid.width=gw; grid.height=gh;
    const gctx=grid.getContext("2d"), gimg=gctx.createImageData(gw,gh);
    for(let i=0;i<gw*gh;i++){ const v=bytes[i]; gimg.data[i*4]=v; gimg.data[i*4+1]=v; gimg.data[i*4+2]=v; gimg.data[i*4+3]=255; }
    gctx.putImageData(gimg,0,0);

    const work=document.createElement("canvas"); work.width=W; work.height=H;
    const wctx=work.getContext("2d"); wctx.imageSmoothingEnabled=true; wctx.imageSmoothingQuality="high";
    wctx.drawImage(grid,0,0,W,H);
    const vals=wctx.getImageData(0,0,W,H).data;

    if(el("t-tam").checked){
      const out=octx.createImageData(W,H);
      for(let p=0;p<W*H;p++){ const v=vals[p*4]/255,[r,g,b]=cmap(v);
        out.data[p*4]=r; out.data[p*4+1]=g; out.data[p*4+2]=b; out.data[p*4+3]=Math.round(255*alpha*Math.pow(v,1.15)); }
      const tmp=document.createElement("canvas"); tmp.width=W; tmp.height=H; tmp.getContext("2d").putImageData(out,0,0); octx.drawImage(tmp,0,0);
    }
    if(el("t-otsu").checked){
      const samp=new Uint8ClampedArray(W*H); for(let p=0;p<W*H;p++) samp[p]=vals[p*4];
      const thr=otsu(samp), out=octx.createImageData(W,H);
      for(let p=0;p<W*H;p++){ if(samp[p]>=thr&&thr>0){ out.data[p*4]=255; out.data[p*4+1]=138; out.data[p*4+2]=61; out.data[p*4+3]=Math.round(150*alpha); } }
      const tmp=document.createElement("canvas"); tmp.width=W; tmp.height=H; tmp.getContext("2d").putImageData(out,0,0); octx.drawImage(tmp,0,0);
    }
    if(el("t-sam").checked && samImg && samImg.complete){
      octx.globalAlpha=Math.min(1,alpha+0.05); octx.drawImage(samImg,0,0,W,H); octx.globalAlpha=1;
    }
  }
  function renderMetaCard(){
    const m=cur.meta||{}, card=el("meta-card");
    if(!m.title_pred && !m.artist_pred){ card.classList.remove("show"); card.innerHTML=""; return; }
    const v=ok=> ok===true?'<span class="verdict ok">correct</span>':ok===false?'<span class="verdict no">wrong</span>':"";
    let rows="";
    if(m.title_pred)  rows+=`<div class="row"><span class="k">Predicted title</span><span>“${esc(m.title_pred)}” ${v(m.title_correct)}</span></div>`;
    if(m.artist_pred) rows+=`<div class="row"><span class="k">Predicted artist</span><span>${esc(m.artist_pred)} ${v(m.artist_correct)}</span></div>`;
    rows+=`<div class="row"><span class="k">Ground truth</span><span>${esc(cur.gt_title||"?")} — ${esc(cur.gt_artist||"?")}</span></div>`;
    card.innerHTML=rows; card.classList.add("show");
  }

  // picker thumbnails
  const picker=el("tam-picker");
  picker.innerHTML = INDEX.map(p=>{
    const flag = p.title_correct===false ? ' title="model got the title wrong"' : '';
    return `<div class="tam-thumb" data-stem="${p.stem}"${flag}><img src="${p.thumb}" alt="${esc(p.title||"")}"></div>`;
  }).join("");
  $$(".tam-thumb", picker).forEach(t=> t.addEventListener("click", ()=> loadPainting(t.dataset.stem)));

  ["t-tam","t-otsu","t-sam"].forEach(id=> el(id).addEventListener("change", renderOverlay));
  el("alpha").addEventListener("input", renderOverlay);
  let rt; window.addEventListener("resize", ()=>{ clearTimeout(rt); rt=setTimeout(()=>{ sizeCanvas(); renderOverlay(); },120); });

  // boot: Starry Night first (a clean, iconic map)
  loadPainting(INDEX[0].stem);
})();
