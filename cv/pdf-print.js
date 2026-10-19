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
      const img=group==='languages'?'':src?`<img class="thumb" src="${esc(absolute(src))}" alt="">`:'';
      const url=''; // v1.16: no diagonal link arrows in the PDF
      return `<article class="entry${group==='languages'?' language-entry':''}">${img}<div class="entry-body"><div class="entry-top"><strong>${tx(x.title||x.name)}</strong><span class="period">${esc(x.period||'')}</span>${url}</div>${paragraph(x.body)}${paragraph(x.level)}</div></article>`;
    }).join('');}
    const skills=c.skills||{};
    const pills=xs=>(xs||[]).map(x=>`<span class="pill">${tx(x)}</span>`).join('');
    const desktopImage=c.backgrounds?.pdfDesktop?._imageSrc||c.backgrounds?.pdfDesktop?.image||'';
    const mobileImage=c.backgrounds?.pdfMobile?._imageSrc||c.backgrounds?.pdfMobile?.image||'';
    const photoHTML=(src,cls,bg={})=>{
      if(!src)return '';
      const x=Math.max(0,Math.min(100,Number(bg.posX??50)));
      const y=Math.max(0,Math.min(100,Number(bg.posY??50)));
      const zoom=Math.max(.5,Math.min(2.2,Number(bg.scale??100)/100));
      return `<div class="pdf-photo ${cls}"><img src="${esc(absolute(src))}" alt="" style="object-position:${x}% ${y}%;transform:scale(${zoom});transform-origin:${x}% ${y}%"></div>`;
    };
    // Detect the originating CV viewport BEFORE opening the separate print window.
    // The print window itself has desktop-sized dimensions, even on phones.
    const mobilePrint=window.matchMedia('(max-width:760px)').matches ||
      (window.matchMedia('(pointer:coarse)').matches && Math.min(screen.width,screen.height)<=760);
    const printName=String(c.profile?.name||'').replace(/\s+/g,' ').trim();
    const doc=`<!doctype html><html lang="${lang==='eng'?'en':lang==='cast'?'es':'ca'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ViandaVisual_CV_${lang.toUpperCase()}</title>
<style>
@page{size:A4 ${mobilePrint?'portrait':'landscape'};margin:0}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#080b0c;color:#f5f6f3;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{display:flex;flex-direction:column;align-items:center;min-height:100vh}
.toolbar{width:100%;display:flex;justify-content:center;padding:18px 10px 14px;flex:none}
.hint{background:#d8ff34;color:#141816;border:0;border-radius:6px;padding:13px 22px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 0 10px #0007}
.print-viewport{width:100%;display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
.page{width:297mm;height:210mm;flex:none;overflow:hidden;position:relative;background:#0d1012;transform-origin:top center}
.page.portrait{width:210mm;height:297mm}
.content{position:relative;width:281mm;margin:0 auto;padding-top:7mm;transform-origin:top left}
.portrait .content{width:198mm;padding-top:6mm}
.top{display:grid;grid-template-columns:minmax(0,2.5fr) minmax(0,1.15fr);gap:4mm;border-bottom:1px solid #475256;padding:0 0 4mm;margin-bottom:4mm}
.portrait .top{grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:4mm}
.kicker,.block h2{color:#d8ff34;font-weight:800;letter-spacing:1.15px;font-size:16px}
.kicker{font-size:13px}.block h2{font-size:16px}.portrait .block h2{font-size:12px}.h1fix{} h1{font-size:clamp(28px,3.3vw,42px);line-height:1.02;letter-spacing:-1px;margin:2.2mm 0 1.4mm;white-space:nowrap;word-break:normal;overflow:visible}.portrait h1{font-size:34px;letter-spacing:-1px}.role{font-size:19px;font-weight:800;color:#fff;line-height:1.1}.portrait .role{font-size:22px}.summary{font-size:14px;line-height:1.5;color:#ebeeee;margin:3.2mm 0 0;text-align:justify;text-justify:inter-word;hyphens:auto}
.top-aside{display:flex;min-width:0;align-self:stretch;gap:0;min-height:42mm}.contacts{flex:1;min-width:0;font-size:12px;line-height:1.18;align-self:stretch;display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:center;border:1px solid #61696b;background:#111719;border-radius:5px;padding:2.2mm 2.2mm;overflow:hidden;color:#f5f6f3}.contacts > div{white-space:nowrap}.top-aside:has(.photo-top) .contacts{border-radius:5px 0 0 5px}.photo-top{flex:0 0 49%;min-width:0;height:auto;align-self:stretch;max-height:100%;overflow:hidden}.photo-top img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.portrait .top-aside{min-height:44mm}.portrait .top-aside .contacts{font-size:17px;line-height:1.28;padding:2.2mm 2mm}
.contacts div,.contacts a,.contacts span{color:#f5f6f3!important;text-decoration:none!important;-webkit-text-fill-color:#f5f6f3!important}
.cols{display:grid;grid-template-columns:1.18fr 1fr .80fr;gap:5mm;align-items:start}
.col-experience{grid-column:1;grid-row:1 / span 2}
.col-right{grid-column:2;grid-row:1}.col-skills{grid-column:3;grid-row:1}
.photo-desktop{display:none}
.photo-mobile{display:none}
.block{margin:0 0 3.6mm;break-inside:avoid}.block h2{margin:0 0 2mm;padding:0 0 1.5mm;border-bottom:1px solid #4d5455}
.entry{display:flex;gap:2mm;margin-bottom:2.4mm;break-inside:avoid}.entry-body{flex:1;min-width:0}.entry-top{display:flex;gap:2mm;flex-wrap:wrap;align-items:baseline}
.entry strong{font-size:10px;line-height:1.15}.period{font-size:9px;font-weight:800;color:#d8ff34;white-space:nowrap}.entry p{font-size:9px;line-height:1.32;color:#d7dddc;margin:1mm 0 0;text-align:left}
.thumb{width:13mm;height:13mm;object-fit:cover;border:1px solid #465051;border-radius:2px;flex:none}
.pills{display:flex;gap:1.3mm;flex-wrap:wrap}.pill{border:1px solid #485153;padding:1mm 1.7mm;border-radius:3mm;font-size:8.2px;line-height:1.2;color:#e4e8e9}
.col-skills .pill{font-size:16.4px;padding:1.5mm 2.2mm;line-height:1.12}.subtitle{color:#e8f4f4;font-size:10px;font-weight:800;margin:2.1mm 0 1.3mm}
.language-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1mm;align-items:start;min-height:16mm;padding-bottom:2mm}.language-list .language-entry{margin:0;min-width:0;display:block}.language-list .entry-body{min-width:0}.language-list .entry-top{display:block}.language-list .entry strong{font-size:10px;overflow-wrap:anywhere}.language-list .entry p{font-size:9px;white-space:normal}.portrait .language-list{grid-template-columns:repeat(3,minmax(0,1fr));gap:1.5mm;min-height:20mm}.pdf-photo{overflow:hidden;position:relative;background:#0d1012;min-height:20mm;line-height:0}.pdf-photo img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.photo-desktop{height:42mm}
.bottom{position:absolute;bottom:3mm;left:8mm;right:8mm;color:#b1babb;font-size:7px;border-top:1px solid #30393a;padding-top:2mm;display:flex;justify-content:space-between}
.portrait .cols{grid-template-columns:1.04fr .96fr;gap:4mm;align-items:start}
.portrait .col-experience{grid-column:1;grid-row:1}
.portrait .col-right{grid-column:2;grid-row:1}
.portrait .col-skills{grid-column:auto;grid-row:auto}
.portrait .col-skills.desktop-skills{display:none}
.portrait .col-right .mobile-skills{display:block;margin-top:2mm}
.mobile-skills{display:none}
.portrait .cols{grid-template-rows:auto auto}

.portrait .photo-desktop{display:none}
.portrait .photo-mobile{display:block;grid-column:1;grid-row:2;align-self:start;margin-top:2mm;height:auto;aspect-ratio:1/1;min-height:0;width:100%;max-width:100%}
.portrait .entry{margin-bottom:3.1mm}.portrait .entry strong{font-size:10.5px}.portrait .entry p{font-size:9.4px}.portrait .block h2{font-size:12px}.portrait .contacts{font-size:17px;padding:2mm;line-height:1.40}.portrait .pill{font-size:16.4px;padding:1.5mm 2.2mm;border-radius:4mm;line-height:1.12}
.portrait .pills{gap:1.8mm}.portrait .subtitle{margin:2.2mm 0}
@media screen{.page{box-shadow:0 8px 28px #0009;margin:0 auto}}
@media print{html,body{display:block;background:#0d1012;width:auto;min-height:0}.toolbar{display:none!important}.print-viewport{display:block;overflow:visible;width:auto}.page{transform:none!important;margin:0!important;box-shadow:none!important;break-after:avoid}.content{transform:scale(var(--fit,1))!important}}
</style></head><body><div class="toolbar"><button class="hint" onclick="window.print()">GUARDAR COMO PDF / SAVE AS PDF</button></div><div class="print-viewport"><div class="page ${mobilePrint?'portrait':''}" id="sheet"><div class="content" id="content">
<div class="top"><div><div class="kicker">VIANDA VISUAL · CURRICULUM VITAE</div><h1>${esc(printName)}</h1><div class="role">${tx(c.profile?.role)}</div><div class="summary">${tx(c.profile?.summary)}</div></div><div class="top-aside"><div class="contacts"><div>${esc(c.profile?.location)}</div><div>${esc(c.profile?.email)}</div><div>${esc(c.profile?.phone)}</div><div>viandavisual.com</div></div>${mobilePrint?'':photoHTML(desktopImage,'photo-top',c.backgrounds?.pdfDesktop)}</div></div>
<div class="cols"><div class="col-experience"><section class="block"><h2>${L.experience}</h2>${list('experience')}</section></div><div class="col-right"><section class="block"><h2>${L.projects}</h2>${list('projects')}</section><section class="block"><h2>${L.education}</h2>${list('education')}</section><div class="col-skills mobile-skills"><section class="block"><h2>${L.skills}</h2><div class="subtitle">${tx(c.ui?.development)}</div><div class="pills">${pills(skills.development)}</div><div class="subtitle">${tx(c.ui?.creative)}</div><div class="pills">${pills(skills.creative)}</div></section><section class="block"><h2>${L.languages}</h2><div class="language-list">${list('languages')}</div></section></div></div><div class="col-skills desktop-skills"><section class="block"><h2>${L.skills}</h2><div class="subtitle">${tx(c.ui?.development)}</div><div class="pills">${pills(skills.development)}</div><div class="subtitle">${tx(c.ui?.creative)}</div><div class="pills">${pills(skills.creative)}</div></section><section class="block"><h2>${L.languages}</h2><div class="language-list">${list('languages')}</div></section></div>${photoHTML((mobileImage||desktopImage),'photo-mobile',(mobileImage?c.backgrounds?.pdfMobile:c.backgrounds?.pdfDesktop))}</div>
</div><div class="bottom"><span>VIANDA VISUAL · ${esc(printName)}</span><span>viandavisual.com</span></div></div></div>
<script>
const page=document.getElementById('sheet'),content=document.getElementById('content');
function fit(){content.style.transform='none';const avail=page.clientHeight-36;const h=content.scrollHeight;const width=content.scrollWidth;const scale=Math.min(1,avail/h,(page.clientWidth-12)/width);content.style.setProperty('--fit',scale.toFixed(4));}
function screenScale(){if(matchMedia('print').matches)return;page.style.transform='none';const vw=document.documentElement.clientWidth;const s=Math.min(1,(vw-4)/page.offsetWidth);page.style.transform='scale('+s+')';page.parentElement.style.height=(page.offsetHeight*s)+'px';}
function layout(){fit();screenScale()}
window.addEventListener('load',()=>{layout();document.fonts?.ready?.then(layout);});window.addEventListener('resize',screenScale);window.addEventListener('beforeprint',()=>{page.style.transform='none';page.parentElement.style.height='auto';fit()});window.addEventListener('afterprint',screenScale);
<\/script></body></html>`;
    win.document.open();win.document.write(doc);win.document.close();
    win.focus();
  };
})();
