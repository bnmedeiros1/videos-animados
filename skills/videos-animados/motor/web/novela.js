/* ---------- NOVELA: selo do capítulo, caixa de comentário do CTA e cartela final ----------
   Variáveis globais (vêm do roteiro.json): CAP_N (número), CAP_T (título), CAP_W (palavra do CTA).
   PROTAGONISTA(id,x,y,o) = o personagem principal do teu elenco (elenco.json). */

/* selo "CAPÍTULO N · título": vai na cena 0, logo abaixo da legenda. capBadgeIn(id,t,a) anima. */
const capBadge=(id,x=60,y=600)=>`<div class="abs" id="${id}" style="left:${x}px;top:${y}px;display:flex;align-items:center;border-radius:999px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);font-family:Inter;max-width:960px">
 ${CAP_N!==null&&CAP_N!==undefined?`<div style="background:#FF6A2B;color:#fff;font-weight:900;font-size:30px;letter-spacing:3px;padding:14px 24px;white-space:nowrap">CAPÍTULO ${CAP_N}</div>`:''}
 <div style="background:#0E1117;color:#fff;font-weight:800;font-size:30px;padding:14px 26px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${CAP_T}</div></div>`;
function capBadgeIn(id,t,a=.05){slideX(document.getElementById(id),t,a,.4,-120)}

/* caixa de comentário genérica: cmtBox(id,x,y,w) + cmtType(id,t,a,palavra) digita a palavra e aperta enviar.
   Use na cena do CTA: cmtType('cm3',t,WW('palavra-do-cta'),CAP_W) */
const cmtBox=(id,x,y,w=760)=>`<div class="abs" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;display:flex;align-items:center;gap:20px;background:#fff;border-radius:999px;padding:20px 22px 20px 34px;box-shadow:0 16px 40px rgba(0,0,0,.35);font-family:Inter">
 <div style="flex:1;font-weight:800;font-size:46px;color:#111827;white-space:nowrap;overflow:hidden"><span id="${id}t" style="color:#9CA3AF;font-weight:600">Adicione um comentário…</span><span id="${id}c" style="display:inline-block;width:4px;height:46px;background:#FF6A2B;vertical-align:middle;margin-left:4px"></span></div>
 <div id="${id}s" style="width:84px;height:84px;border-radius:50%;background:#FF6A2B;display:flex;align-items:center;justify-content:center">${ic('send',44,'#fff')}</div></div>`;
function cmtType(id,t,a,w){const e=document.getElementById(id+'t'),cu=document.getElementById(id+'c'),s=document.getElementById(id+'s');if(!e)return;
 const n=Math.floor(Math.max(0,Math.min(1,(t-a)/(.09*w.length)))*w.length);
 if(t<a){e.textContent='Adicione um comentário…';e.style.color='#9CA3AF';e.style.fontWeight=600}else{e.textContent=w.slice(0,n);e.style.color='#111827';e.style.fontWeight=900}
 if(cu)cu.style.opacity=(Math.floor(t*2.4)%2)?1:0;
 const ts=a+.09*w.length+.15;if(s)s.style.transform=t>ts&&t<ts+.25?'scale(.86)':'scale(1)'}

/* cartela final (última cena, sem fala): selo da marca + palavra do CTA bem grande + protagonista acenando */
function cartelaFinal(i){return SC(i,'marca',()=>selo('fs'+i,415,640,250)+
 `<div class="abs big" id="fw${i}" style="left:0;top:930px;width:1080px;text-align:center;font-size:${CAP_W.length>9?120:CAP_W.length>7?150:180}px;color:#FF6A2B;text-shadow:0 0 70px rgba(255,106,43,.45)">${CAP_W}</div>`+
 PROTAGONISTA('m'+i,390,1180,{pose:'wave',mood:'happy',w:300})+confetti('cf'+i,30),
 t=>{stampIn('fs'+i,t,.05);pop(document.getElementById('fw'+i),t,.35,.5);life('m'+i,t);wave('m'+i,t,.2,false);confUp('cf'+i,30,t,.3,560,1300)})}
