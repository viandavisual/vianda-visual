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
      const url=x.url?`<a href="${esc(x.url)}" target="_blank">↗</a>`:'';
      return `<article class="entry">${img}<div class="entry-body"><div class="entry-top"><strong>${tx(x.title||x.name)}</strong><span class="period">${esc(x.period||'')}</span>${url}</div>${paragraph(x.body)}${paragraph(x.level)}</div></article>`;
    }).join('');}
    const skills=c.skills||{};
    const pills=xs=>(xs||[]).map(x=>`<span class="pill">${tx(x)}</span>`).join('');
    const bg=c.backgrounds?.hero?._imageSrc||c.backgrounds?.hero?.image||'';
    const links=Object.entries(c.links||{}).filter(([key,url])=>url).map(([key,url])=>`<a href="${esc(url)}">${esc(key.toUpperCase())} ↗</a>`).join('');
    const doc=`<!doctype html><html lang="${lang==='eng'?'en':lang==='cast'?'es':'ca'}"><head><meta charset="utf-8"><title>ViandaVisual_CV_${lang.toUpperCase()}</title>
<style>
@page{size:A4 landscape;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#080b0c;color:#f5f6f3;font-family:Arial,Helvetica,sans-serif}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:297mm;height:210mm;overflow:hidden;position:relative;background:#0d1012}
.page:before{content:'';position:absolute;top:0;left:0;right:0;height:47mm;background:linear-gradient(90deg,rgba(9,13,14,.68),rgba(9,13,14,.90)),var(--hero) center/cover no-repeat;opacity:.9}
.content{position:relative;width:281mm;margin:0 auto;padding-top:7mm;transform-origin:top left}
.top{display:grid;grid-template-columns:2.1fr 1fr;gap:7mm;border-bottom:1px solid #475256;padding:0 0 4mm;margin-bottom:4mm}
.kicker,.block h2{color:#d8ff34;font-weight:800;letter-spacing:1.2px;font-size:8px}
h1{font-size:24px;line-height:1.07;letter-spacing:-.7px;margin:3mm 0 1mm}.role{font-size:11px;font-weight:800;color:#fff}.summary{font-size:9px;line-height:1.42;color:#ebeeee;margin:3mm 0 0}
.contacts{font-size:9px;line-height:1.7;align-self:end;border:1px solid #61696b;background:#111719d9;border-radius:5px;padding:3mm 4mm;overflow-wrap:anywhere}.contacts a{color:#d8ff34}
.cols{display:grid;grid-template-columns:1.18fr 1fr .80fr;gap:5mm}.block{margin:0 0 3.6mm;break-inside:avoid}.block h2{margin:0 0 2mm;padding:0 0 1.5mm;border-bottom:1px solid #4d5455}
.entry{display:flex;gap:2mm;margin-bottom:2.4mm;break-inside:avoid}.entry-body{flex:1;min-width:0}.entry-top{display:flex;gap:2mm;flex-wrap:wrap;align-items:baseline}.entry strong{font-size:9px;line-height:1.15}.period{font-size:8px;font-weight:800;color:#d8ff34;white-space:nowrap}.entry p{font-size:8px;line-height:1.32;color:#d7dddc;margin:1mm 0 0;text-align:left}.entry a,.links a{color:#d8ff34;font-size:8px;text-decoration:none}.thumb{width:13mm;height:13mm;object-fit:cover;border:1px solid #465051;border-radius:2px;flex:none}.pills{display:flex;gap:1.3mm;flex-wrap:wrap}.pill{border:1px solid #485153;padding:1mm 1.7mm;border-radius:3mm;font-size:7.4px;line-height:1.2;color:#e4e8e9}.subtitle{color:#e8f4f4;font-size:8px;font-weight:800;margin:1.4mm 0}.links{display:flex;gap:2mm;flex-wrap:wrap}.links a{border:1px solid #44504f;padding:1mm 2mm}.bottom{position:absolute;bottom:3mm;left:8mm;right:8mm;color:#b1babb;font-size:7px;border-top:1px solid #30393a;padding-top:2mm;display:flex;justify-content:space-between}
.hint{position:fixed;top:9px;right:10px;z-index:10;background:#d8ff34;color:#141816;border:0;border-radius:5px;padding:9px 14px;font-weight:800;cursor:pointer;box-shadow:0 0 10px #000}
@media print{.hint{display:none!important}.page{break-after:avoid}.content{transform:scale(var(--fit,1))}}
</style></head><body><button class="hint" onclick="window.print()">GUARDAR COMO PDF / SAVE AS PDF</button><div class="page" id="sheet" style="--hero:url('${bg?esc(absolute(bg)):''}')"><div class="content" id="content">
<div class="top"><div><div class="kicker">VIANDA VISUAL · CURRICULUM VITAE</div><h1>${esc(c.profile?.name)}</h1><div class="role">${tx(c.profile?.role)}</div><div class="summary">${tx(c.profile?.summary)}</div></div><div class="contacts"><div>${esc(c.profile?.location)}</div><div><a href="mailto:${esc(c.profile?.email)}">${esc(c.profile?.email)}</a></div><div>${esc(c.profile?.phone)}</div><div><a href="https://viandavisual.com">viandavisual.com</a></div></div></div>
<div class="cols"><div><section class="block"><h2>${L.experience}</h2>${list('experience')}</section></div><div><section class="block"><h2>${L.projects}</h2>${list('projects')}</section><section class="block"><h2>${L.education}</h2>${list('education')}</section></div><div><section class="block"><h2>${L.skills}</h2><div class="subtitle">${tx(c.ui?.development)}</div><div class="pills">${pills(skills.development)}</div><div class="subtitle">${tx(c.ui?.creative)}</div><div class="pills">${pills(skills.creative)}</div></section><section class="block"><h2>${L.languages}</h2>${list('languages')}</section><section class="block"><h2>${L.links}</h2><div class="links">${links}</div></section></div></div>
</div><div class="bottom"><span>VIANDA VISUAL · ${esc(c.profile?.name)}</span><span>viandavisual.com</span></div></div>
<script>
function fit(){const page=document.getElementById('sheet'),content=document.getElementById('content');content.style.transform='none';const avail=page.clientHeight-(page.clientHeight*.035);const height=content.scrollHeight;const scale=Math.min(1,avail/height);content.style.setProperty('--fit',scale.toFixed(4));content.style.transform='scale('+scale.toFixed(4)+')';if(scale<.67){document.querySelector('.hint').textContent='CONTENIDO MUY EXTENSO · REVISAR ANTES DE GUARDAR';document.querySelector('.hint').style.background='#ffbb72';}}
window.addEventListener('load',()=>{fit();document.fonts?.ready?.then(fit);});window.addEventListener('beforeprint',fit);
<\/script></body></html>`;
    win.document.open();win.document.write(doc);win.document.close();
    win.focus();
  };
})();
