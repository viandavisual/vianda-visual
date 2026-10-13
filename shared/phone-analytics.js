/* v1.1: public phone-reveal analytics; requires Cloudflare Worker + D1 deployment. */
'use strict';
const VV_PHONE_STATS_ENDPOINT='https://cv.viandavisual.com/api/phone-reveal';
async function vvPhoneTrackReveal(){
  // Do not count local previews as public clicks.
  if(['localhost','127.0.0.1'].includes(location.hostname))return;
  try{await fetch(VV_PHONE_STATS_ENDPOINT,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:'reveal'});}catch(e){console.warn('Phone analytics unavailable',e)}
}
async function vvPhoneLoadCount(){
  try{
    const r=await fetch(VV_PHONE_STATS_ENDPOINT,{method:'GET',mode:'cors',cache:'no-store'});
    if(!r.ok)return null;
    const d=await r.json();
    return Number.isSafeInteger(d.total)&&d.total>=0?d.total:null;
  }catch(e){return null}
}
