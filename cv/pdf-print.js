/* VIANDA VISUAL v1.4 - printable one-page CV, data-driven, no static PDF.
   Browser's Save as PDF retains selectable text and working links. */
(function(){
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function text(value,lang){return typeof value==='object'&&value!==null&&!Array.isArray(value)?(value[lang]||value.eng||value.cast||value.cat||''):value||'';}
  function absolute(src){try{return new URL(src,location.href).href}catch{return ''}}
  const labels={
    eng:{profile:'PROFILE',experience:'EXPERIENCE',projects:'SELECTED PROJECTS',skills:'SKILLS',education:'EDUCATION',languages:'LANGUAGES',links:'LINKS',contact:'CONTACT'},
    cast:{profile:'PERFIL',experience:'EXPERIENCIA',projects:'PROYECTOS',skills:'HABILIDADES',education:'FORMACIÓN',languages:'IDIOMAS',links:'ENLACES',contact:'CONTACTO'},
    cat:{profile:'PERFIL',experience:'EXPERIÈNCIA',projects:'PROJECTES',skills:'HABILITATS',education:'FORMACIÓ',languages:'IDIOMES',links:'ENLLAÇOS',contact:'CONTACTE'}
  };
  window.vvOpenPrintableCV=function(win,c,lang){
    const tx=v=>esc(text(v,lang));
    const L=labels[lang]||labels.eng;
    const paragraph=v=>text(v,lang)?`<p>${tx(v)}</p>`:'';
    function list(group){
      let entries=[...(c[group]||[])];
      if(group==='languages'){
        const target={eng:'english',cast:'spanish',cat:'catalan'}[lang]||'english';
        const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
        const found=entries.findIndex(x=>Object.values(typeof x.name==='object'?x.name:{eng:x.name}).some(v=>norm(v)===target));
        if(found>0)entries.unshift(...entries.splice(found,1));
      }
      return entries.map(x=>{
      const src=x._imageSrc||x.image||'';
      const img=src?`<img class="thumb" src="${esc(absolute(src))}" alt="">`:'';
      const url=''; // v1.16: no diagonal link arrows in the PDF
      return `<article class="entry">${img}<div class="entry-body"><div class="entry-top"><strong>${tx(x.title||x.name)}</strong><span class="period">${esc(x.period||'')}</span>${url}</div>${paragraph(x.body)}${paragraph(x.level)}</div></article>`;
    }).join('');}
    const skills=c.skills||{};
    const pills=xs=>(xs||[]).map(x=>`<span class="pill">${tx(x)}</span>`).join('');
    const bg=c.backgrounds?.hero?._imageSrc||c.backgrounds?.hero?.image||'';
    // Detect the originating CV viewport BEFORE opening the separate print window.
    // The print window itself has desktop-sized dimensions, even on phones.
    const mobilePrint=window.matchMedia('(max-width:760px)').matches ||
      (window.matchMedia('(pointer:coarse)').matches && Math.min(screen.width,screen.height)<=760);
    const doc=`<!doctype html><html lang="${lang==='eng'?'en':lang==='cast'?'es':'ca'}"><head><meta charset="utf-8"><title>ViandaVisual_CV_${lang.toUpperCase()}</title>
<style>
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#080b0c;color:#f5f6f3;font-family:Arial,Helvetica,sans-serif}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:297mm;height:210mm;overflow:hidden;position:relative;background:#0d1012}
.page:before{content:none}
.hero-print-image{position:absolute;right:6mm;bottom:11mm;width:78mm;height:47mm;object-fit:cover;object-position:center;opacity:.92;z-index:0;pointer-events:none}
.content{position:relative;width:281mm;margin:0 auto;padding-top:7mm;transform-origin:top left}
.top{display:grid;grid-template-columns:2.1fr 1fr;gap:7mm;border-bottom:1px solid #475256;padding:0 0 4mm;margin-bottom:4mm}
.kicker,.block h2{color:#d8ff34;font-weight:800;letter-spacing:1.2px;font-size:8px}
h1{font-size:27px;line-height:1.07;letter-spacing:-.7px;margin:3mm 0 1mm}.role{font-size:12px;font-weight:800;color:#fff}.summary{font-size:10px;line-height:1.42;color:#ebeeee;margin:3mm 0 0}
.contacts{font-size:10px;line-height:1.7;align-self:end;border:1px solid #61696b;background:#111719d9;border-radius:5px;padding:3mm 4mm;overflow-wrap:anywhere}.contacts a{color:inherit;text-decoration:none;pointer-events:none}
.cols{display:grid;grid-template-columns:1.18fr 1fr .80fr;gap:5mm}.block{margin:0 0 3.6mm;break-inside:avoid}.block h2{margin:0 0 2mm;padding:0 0 1.5mm;border-bottom:1px solid #4d5455}
.entry{display:flex;gap:2mm;margin-bottom:2.4mm;break-inside:avoid}.entry-body{flex:1;min-width:0}.entry-top{display:flex;gap:2mm;flex-wrap:wrap;align-items:baseline}.entry strong{font-size:10px;line-height:1.15}.period{font-size:9px;font-weight:800;color:#d8ff34;white-space:nowrap}.entry p{font-size:9px;line-height:1.32;color:#d7dddc;margin:1mm 0 0;text-align:left}.entry a,.links a{color:#d8ff34;font-size:8px;text-decoration:none}.thumb{width:13mm;height:13mm;object-fit:cover;border:1px solid #465051;border-radius:2px;flex:none}.pills{display:flex;gap:1.3mm;flex-wrap:wrap}.pill{border:1px solid #485153;padding:1mm 1.7mm;border-radius:3mm;font-size:8.2px;line-height:1.2;color:#e4e8e9}.subtitle{color:#e8f4f4;font-size:8px;font-weight:800;margin:1.4mm 0}.links{display:flex;gap:2mm;flex-wrap:wrap}.links a{border:1px solid #44504f;padding:1mm 2mm}.bottom{position:absolute;bottom:3mm;left:8mm;right:8mm;color:#b1babb;font-size:7px;border-top:1px solid #30393a;padding-top:2mm;display:flex;justify-content:space-between}
.page.portrait{width:210mm;height:297mm}
.portrait .content{width:198mm;padding-top:6mm}
.portrait .top{grid-template-columns:1.4fr .85fr;gap:4mm}
.portrait .cols{grid-template-columns:1.04fr .96fr;gap:4mm}.portrait .col-skills{grid-column:2;grid-row:2}.portrait .col-right{grid-column:2;grid-row:1}.portrait .cols>div:first-child{grid-column:1;grid-row:1 / span 2}
.portrait .col-skills{display:block}.portrait .col-skills .block{margin-top:3mm}
.portrait .hero-print-image{width:96mm;height:54mm;right:5mm;bottom:11mm}
.portrait .entry{margin-bottom:3.1mm}
.portrait .entry strong{font-size:10.5px}
.portrait .entry p{font-size:9.4px}
.portrait .block h2{font-size:10px}
.hint{position:fixed;top:9px;right:10px;z-index:10;background:#d8ff34;color:#141816;border:0;border-radius:5px;padding:9px 14px;font-weight:800;cursor:pointer;box-shadow:0 0 10px #000}
@media print{.hint{display:none!important}.page{break-after:avoid}.content{transform:scale(var(--fit,1))}}
</style><style>${mobilePrint?'@page{size:A4 portrait;margin:0}':'@page{size:A4 landscape;margin:0}'}</style></head><body><button class="hint" onclick="window.print()">GUARDAR COMO PDF / SAVE AS PDF</button><div class="page ${mobilePrint?'portrait':''}" id="sheet" style="--hero:url('${bg?esc(absolute(bg)):''}')"><div class="content" id="content">
<div class="top"><div><div class="kicker">VIANDA VISUAL · CURRICULUM VITAE</div><h1>${esc(c.profile?.name)}</h1><div class="role">${tx(c.profile?.role)}</div><div class="summary">${tx(c.profile?.summary)}</div></div><div class="contacts"><div>${esc(c.profile?.location)}</div><div>${esc(c.profile?.email)}</div><div>${esc(c.profile?.phone)}</div><div>viandavisual.com</div></div></div>
<div class="cols"><div><section class="block"><h2>${L.experience}</h2>${list('experience')}</section></div><div class="col-right"><section class="block"><h2>${L.projects}</h2>${list('projects')}</section><section class="block"><h2>${L.education}</h2>${list('education')}</section></div><div class="col-skills"><section class="block"><h2>${L.skills}</h2><div class="subtitle">${tx(c.ui?.development)}</div><div class="pills">${pills(skills.development)}</div><div class="subtitle">${tx(c.ui?.creative)}</div><div class="pills">${pills(skills.creative)}</div></section><section class="block"><h2>${L.languages}</h2>${list('languages')}</section></div></div>
</div>${bg?`<img class="hero-print-image" src="${esc(absolute(bg))}" alt="">`:''}<div class="bottom"><span>VIANDA VISUAL · ${esc(c.profile?.name)}</span><span>viandavisual.com</span></div></div>
<script>
function fit(){const page=document.getElementById('sheet'),content=document.getElementById('content');content.style.transform='none';const avail=page.clientHeight-(page.clientHeight*.035);const height=content.scrollHeight;const scale=Math.min(1,avail/height,(page.clientWidth-12)/content.scrollWidth);content.style.setProperty('--fit',scale.toFixed(4));content.style.transform='scale('+scale.toFixed(4)+')';if(scale<.67){document.querySelector('.hint').textContent='CONTENIDO MUY EXTENSO · REVISAR ANTES DE GUARDAR';document.querySelector('.hint').style.background='#ffbb72';}}
function avoidOverlap(){
 const page=document.getElementById('sheet'), photo=page.querySelector('.hero-print-image'), content=document.getElementById('content');
 if(!photo)return;
 // Use the bottom of occupied text in the photo's horizontal area, taking scaling into account.
 photo.style.display='block';
 const pageRect=page.getBoundingClientRect(), photoRect=photo.getBoundingClientRect();
 const blocks=[...content.querySelectorAll('.entry,.block,.top')];
 let last=pageRect.top;
 for(const b of blocks){const r=b.getBoundingClientRect();if(r.left < photoRect.right && r.right > photoRect.left)last=Math.max(last,r.bottom);}
 const free=pageRect.bottom-pageRect.height*.045-last;
 if(free<pageRect.height*.09){photo.style.display='none';return;}
 const height=Math.min(photoRect.height,free-4);
 photo.style.height=height+'px';
 photo.style.bottom=Math.max(12,pageRect.bottom-last-height+4)+'px';
 // A second check after adjustment: when the layout cannot fit, hide rather than cover education/languages.
 const pr=photo.getBoundingClientRect();
 if(blocks.some(b=>{const r=b.getBoundingClientRect();return r.left<pr.right&&r.right>pr.left&&r.top<pr.bottom&&r.bottom>pr.top}))photo.style.display='none';
}
 function layout(){fit();requestAnimationFrame(avoidOverlap)}
 window.addEventListener('load',()=>{layout();document.fonts?.ready?.then(layout);});window.addEventListener('beforeprint',layout);
<\/script></body></html>`;
    win.document.open();win.document.write(doc);win.document.close();
    win.focus();
  };
})();
