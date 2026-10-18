const VV_KEY = 'viandaVisualContentV01';
const VV_DB = 'viandaVisualAssetsV03';
const VV_STORE = 'images';

async function vvDefaults(){
  const r = await fetch((window.VV_PUBLIC_BUILD?(window.VV_PUBLIC_PREFIX||'')+'shared/':'../shared/')+'default-content.json');
  return await r.json();
}

function vvStripTransient(value){
  if(Array.isArray(value)) return value.map(vvStripTransient);
  if(value && typeof value==='object'){
    const out={};
    for(const [k,v] of Object.entries(value)){
      if(k.startsWith('_')) continue;
      out[k]=vvStripTransient(v);
    }
    return out;
  }
  return value;
}
function vvDeepMerge(defaultValue,savedValue){
  if(Array.isArray(defaultValue)){
    if(!Array.isArray(savedValue)) return defaultValue;
    // Saved collections have their own identity and ordering. Never merge
    // their entries with defaults by index: moving an entry would otherwise
    // inherit unrelated fields from the original entry in that position.
    return savedValue;
  }
  if(defaultValue && typeof defaultValue==='object'){
    const out={...defaultValue};
    if(savedValue && typeof savedValue==='object' && !Array.isArray(savedValue)){
      for(const [k,v] of Object.entries(savedValue)){
        if(k in defaultValue) out[k]=vvDeepMerge(defaultValue[k],v);
        else out[k]=v;
      }
    }
    return out;
  }
  return savedValue===undefined ? defaultValue : savedValue;
}

async function vvLoad(){
  const defaults = await vvDefaults();
  if(window.VV_PUBLIC_BUILD){
    const res=await fetch((window.VV_PUBLIC_PREFIX||'')+'shared/published-content.json',{cache:'no-store'});
    if(!res.ok) throw new Error('Published content not found');
    return vvDeepMerge(defaults,await res.json());
  }
  try{
    const raw = localStorage.getItem(VV_KEY);
    if(!raw) return defaults;
    const saved = vvStripTransient(JSON.parse(raw));
    return vvDeepMerge(defaults,saved);
  }catch(e){
    console.error('Content load failed, using defaults',e);
    return defaults;
  }
}
function vvSave(data){
  const clean=JSON.stringify(data,(key,value)=>{
    if(key && key.startsWith('_')) return undefined;
    return value;
  });
  localStorage.setItem(VV_KEY,clean);
}
function vvReset(){
  localStorage.removeItem(VV_KEY);
}
function vvEsc(v=''){
  return String(v).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function vvOpenDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(VV_DB,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(VV_STORE)) db.createObjectStore(VV_STORE);
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function vvAssetPut(id,file){
  const db=await vvOpenDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(VV_STORE,'readwrite');
    tx.objectStore(VV_STORE).put(file,id);
    tx.oncomplete=()=>{db.close();resolve(id)};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function vvAssetGet(id){
  if(!id) return null;
  const db=await vvOpenDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(VV_STORE,'readonly');
    const req=tx.objectStore(VV_STORE).get(id);
    req.onsuccess=()=>{const v=req.result||null;db.close();resolve(v)};
    req.onerror=()=>{db.close();reject(req.error)};
  });
}
async function vvAssetDelete(id){
  if(!id) return;
  const db=await vvOpenDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(VV_STORE,'readwrite');
    tx.objectStore(VV_STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function vvAssetClear(){
  const db=await vvOpenDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(VV_STORE,'readwrite');
    tx.objectStore(VV_STORE).clear();
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
function vvBlobToDataURL(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
async function vvResolveImage(item){
  if(window.VV_PUBLIC_BUILD && item.imageAssetId){
    const media=window.VV_PUBLISHED_ASSETS||{};
    return media[item.imageAssetId] ? (window.VV_PUBLIC_PREFIX||'')+media[item.imageAssetId] : (item.image||'');
  }
  if(item.imageAssetId){
    try{
      const blob=await vvAssetGet(item.imageAssetId);
      if(blob) return await vvBlobToDataURL(blob);
    }catch(e){ console.error('Image resolve error', e); }
  }
  return item.image||'';
}
async function vvPrepareMedia(items=[]){
  await Promise.all(items.map(async item=>{ item._imageSrc=await vvResolveImage(item); }));
  return items;
}
function vvMedia(item,lang='eng',mediaLabel='MEDIA'){
  const src=item._imageSrc || item.image || '';
  const x=Number.isFinite(Number(item.imagePosX))?Number(item.imagePosX):50;
  const y=Number.isFinite(Number(item.imagePosY))?Number(item.imagePosY):50;
  const scale=Number.isFinite(Number(item.imageScale))?Number(item.imageScale):100;
  const alt=vvText(item.title ?? item.name ?? '',lang)||'';
  if(src) return `<div class="vv-media-frame"><img src="${vvEsc(src)}" alt="${vvEsc(alt)}" loading="lazy" style="object-position:${x}% ${y}%;transform:scale(${scale/100});transform-origin:${x}% ${y}%"></div>`;
  return `<div class="vv-media-frame"><div class="media-placeholder"><span>${vvEsc(mediaLabel)}</span></div></div>`;
}
function vvVideoEmbed(url=''){
  if(!url) return '';
  let embed='';
  try{
    const u=new URL(url);
    if(u.hostname.includes('youtube.com')){
      const id=u.searchParams.get('v');
      if(id) embed=`https://www.youtube.com/embed/${id}`;
    }else if(u.hostname==='youtu.be'){
      embed=`https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }else if(u.hostname.includes('vimeo.com')){
      const id=u.pathname.split('/').filter(Boolean).pop();
      if(id) embed=`https://player.vimeo.com/video/${id}`;
    }
  }catch(e){}
  return embed ? `<div class="video"><iframe src="${embed}" title="Video" allowfullscreen loading="lazy"></iframe></div>` : '';
}


function vvSectionStyle(bg){
  const src = bg ? (bg._imageSrc || bg.image || '') : '';
  if(!src) return '';
  const overlay = typeof bg.overlay === 'number' ? bg.overlay : 0.62;
  const x = Number.isFinite(Number(bg.posX)) ? Number(bg.posX) : 50;
  const y = Number.isFinite(Number(bg.posY)) ? Number(bg.posY) : 50;
  return `style="--section-bg:url('${String(src).replace(/'/g,"\'")}');--section-overlay:${overlay};--section-pos:${x}% ${y}%"`;
}


async function vvPrepareBackgrounds(backgrounds={}){
  for(const bg of Object.values(backgrounds||{})){
    bg._imageSrc = bg.image || '';
    bg._isVideo = /\.webm(?:[?#]|$)/i.test(bg._imageSrc) || /^data:video\/webm/i.test(bg._imageSrc) || bg.mediaType==='video/webm';
    if(bg.imageAssetId){
      if(window.VV_PUBLIC_BUILD){
        // Public sites cannot access the editor's private IndexedDB.
        // Use the same published media manifest as project/CV images.
        const media=window.VV_PUBLISHED_ASSETS||{};
        if(media[bg.imageAssetId]){
          bg._imageSrc=(window.VV_PUBLIC_PREFIX||'')+media[bg.imageAssetId];
          bg._isVideo=/\.webm(?:[?#]|$)/i.test(bg._imageSrc);
        }else{
          console.error('Published background is missing from media manifest:',bg.imageAssetId);
        }
      }else{
        try{
          const blob=await vvAssetGet(bg.imageAssetId);
          if(blob){bg._imageSrc=await vvBlobToDataURL(blob);bg._isVideo=blob.type==='video/webm';}
        }catch(e){ console.error('Background resolve error',e); }
      }
    }
  }
  return backgrounds;
}


function vvSectionBackground(bg){
  if(!bg) return '';
  const src=bg._imageSrc || bg.image || '';
  if(!src) return '';
  const x=Number.isFinite(Number(bg.posX))?Number(bg.posX):50;
  const y=Number.isFinite(Number(bg.posY))?Number(bg.posY):50;
  const scale=Number.isFinite(Number(bg.scale))?Number(bg.scale):100;
  const overlay=typeof bg.overlay==='number'?bg.overlay:0.62;
  return `<div class="section-bg" aria-hidden="true">
    ${bg._isVideo ? `<video src="${vvEsc(src)}" autoplay muted loop playsinline preload="metadata" aria-hidden="true" style="object-position:${x}% ${y}%;transform:scale(${scale/100});transform-origin:${x}% ${y}%"></video>` : `<img src="${vvEsc(src)}" alt="" decoding="async" fetchpriority="high" style="object-position:${x}% ${y}%;transform:scale(${scale/100});transform-origin:${x}% ${y}%">`}
    <span class="section-bg-overlay" style="opacity:${overlay}"></span>
  </div>`;
}

function vvText(value,lang='eng'){ if(value==null)return ''; if(typeof value==='string')return value; return value[lang] ?? value.eng ?? value.cast ?? value.cat ?? ''; }
function vvGetLang(){ const v=localStorage.getItem('vvLang')||'eng'; return ['eng','cast','cat'].includes(v)?v:'eng'; }
function vvSetLang(lang){ if(['eng','cast','cat'].includes(lang))localStorage.setItem('vvLang',lang); }


// Shared locale helpers. An explicit URL always overrides a previously saved language.
const VV_LANG_URL = {eng:'en',cast:'es',cat:'ca'};
const VV_LANG_INTERNAL = {en:'eng',eng:'eng',es:'cast',cast:'cast',ca:'cat',cat:'cat'};
function vvLanguageFromURL(){
  const param=new URLSearchParams(location.search).get('lang');
  return param ? (VV_LANG_INTERNAL[param.toLowerCase()]||null) : null;
}
function vvPageLanguage(){return vvLanguageFromURL()||vvGetLang();}
function vvUpdateLanguageURL(lang){
  const url=new URL(location.href);
  url.searchParams.set('lang',VV_LANG_URL[lang]||'en');
  history.replaceState(null,'',url.pathname+url.search+url.hash);
}
// Cancel animations before a language change so old frames cannot rewrite new translations.
let vvTypingCycle=null;
function vvStopTyping(){
  if(!vvTypingCycle)return;
  vvTypingCycle.observer?.disconnect();
  vvTypingCycle.frames.forEach(id=>cancelAnimationFrame(id));
  vvTypingCycle.nodes.forEach(({el,final})=>{if(el.isConnected)el.textContent=final});
  vvTypingCycle=null;
}
function vvTypeText(root=document.body,opts={}){
  vvStopTyping();
  if(!root)return;
  const selector=opts.selector||'h1,h2,h3,p,.eyebrow,.kicker,.role,.tagline,.intro,.sub,.tags,.pill,.pills span,.links a,.cta,.brand,.sitever,.navlinks a,.cvbrand strong,.cvbrand span,.period,.contactline span,.portfolio-link,.cvtemp,.video-link,.inline-link,footer';
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const targets=[...new Set(root.querySelectorAll(selector))].filter(el=>
    !el.children.length && !el.closest('[data-no-type]') && (el.textContent||'').trim()
  );
  const cycle={observer:null,frames:new Set(),nodes:targets.map(el=>({el,final:el.textContent}))};
  vvTypingCycle=cycle;
  function animate(el){
    const entry=cycle.nodes.find(x=>x.el===el);
    if(!entry||!el.isConnected||vvTypingCycle!==cycle)return;
    const final=entry.final,chars=Array.from(final),count=chars.length,start=performance.now();
    el.setAttribute('aria-label',final);
    function frame(now){
      if(vvTypingCycle!==cycle || !el.isConnected)return;
      const n=Math.min(count,Math.ceil((now-start)/1000*count));
      el.textContent=chars.slice(0,n).join('');
      if(n<count){const id=requestAnimationFrame(t=>{cycle.frames.delete(id);frame(t)});cycle.frames.add(id)}
      else el.textContent=final;
    }
    el.textContent='';
    const id=requestAnimationFrame(t=>{cycle.frames.delete(id);frame(t)});cycle.frames.add(id);
  }
  if('IntersectionObserver' in window){
    cycle.observer=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){cycle.observer.unobserve(e.target);animate(e.target)}
    }),{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(el=>cycle.observer.observe(el));
  }else targets.forEach(animate);
}
