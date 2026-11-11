/* ---------- BASE: tempo, animação, ícones ---------- */
const EZ={out:x=>1-Math.pow(1-x,3),back:x=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)},
 inout:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,lin:x=>x,inq:x=>x*x*x};
const P=(t,a,d=.35,e=EZ.out)=>t<=a?0:t>=a+d?1:e((t-a)/d);
const $=s=>document.querySelector(s);
function T(el,{x=0,y=0,s=1,r=0,o=1}){if(!el)return;el.style.transform=`translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`;el.style.opacity=o}
function pop(el,t,a,d=.45,r=0){const p=P(t,a,d,EZ.back);T(el,{s:.5+.5*p,o:P(t,a,.18),r})}
function rise(el,t,a,d=.42,dist=90,r=0){const p=P(t,a,d);T(el,{y:dist*(1-p),o:p,r})}
function drop(el,t,a,d=.55,dist=-900,r=0){const p=P(t,a,d,EZ.back);T(el,{y:dist*(1-p),r:r,o:P(t,a,.1)})}
function slideX(el,t,a,d=.45,dist=-700,r=0){const p=P(t,a,d,EZ.back);T(el,{x:dist*(1-p),o:P(t,a,.15),r})}
const br=n=>Math.round(n).toLocaleString('pt-BR');
function count(el,t,a,d,from,to,fmt=br){const p=P(t,a,d,EZ.out);el.textContent=fmt(from+(to-from)*p)}
const money=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const money0=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');
const IC={
 eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3.2"/></svg>',
 cursor:'<svg viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#0A0C10" stroke-width="1.2"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6 2 11c0 2.4 1 4.6 2.8 6.2L4 22l4.9-2.2c1 .3 2 .4 3.1.4 5.5 0 10-4 10-9S17.5 2 12 2z"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.5"/><path d="M3 21c0-4.5 4-7.5 9-7.5s9 3 9 7.5z"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 pixel:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5" opacity=".55"/><rect x="3" y="13" width="8" height="8" rx="1.5" opacity=".55"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18.5h4"/><path d="M8.5 5.5h2M8.5 5.5v2M15.5 5.5h-2M15.5 5.5v2M8.5 15h2M8.5 15v-2M15.5 15h-2M15.5 15v-2" stroke-width="1.4"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
 cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.5L22 8H6"/></svg>',
 megaphone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v3a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
 bolt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
 plug:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5"/></svg>'
};
const ic=(n,sz,col)=>`<div class="ic" style="width:${sz}px;height:${sz}px;color:${col}">${IC[n]}</div>`;
const icb=(n,sz,col,bg)=>`<div class="icbox" style="width:${sz}px;height:${sz}px;background:${bg}">${ic(n,sz*.56,col)}</div>`;
function boleto(id,l,t,w,lab,val,stripe,fs=74){return `<div class="boleto abs" id="${id}" style="left:${l}px;top:${t}px;width:${w}px"><div class="stripe" style="background:${stripe}"></div><div class="due">VENCE HOJE</div><div class="lbl">${lab}</div><div class="big" style="font-size:${fs}px;margin-top:8px">${val}</div><div class="bar"></div></div>`}


Object.assign(IC,{
 heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4 6.4 4c2.2 0 3.7 1.2 4.6 2.6l1 1.5 1-1.5C13.9 5.2 15.4 4 17.6 4c4.1 0 6 4.4 4.4 7.7C19.5 16.4 12 21 12 21z"/></svg>',
 bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
 target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>',
 ticket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2.2"/></svg>',
 qr:'<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M3 3h7v7H3zM5 5v3h3V5zM14 3h7v7h-7zM16 5v3h3V5zM3 14h7v7H3zM5 16v3h3v-3zM14 14h3v3h-3zM18 14h3v3h-3zM14 18h3v3h-3zM18 18h3v3h-3z"/></svg>',
 pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.2"/><rect x="14" y="4" width="4" height="16" rx="1.2"/></svg>',
 eyeoff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8c2.2 0 4.1.8 5.7 1.9M23 12s-4 8-11 8c-2.2 0-4.1-.8-5.7-1.9"/><circle cx="12" cy="12" r="3.2"/><path d="M3 3l18 18"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8.5"/><path d="M12 8.5V13l3 2M9 2h6"/></svg>',
 trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
 server:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/></svg>',
 globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19"/></svg>'
});

const avatar=(txt,bg,sz=120)=>`<div class="avatar" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.36)}px;background:${bg}">${txt}</div>`;

const qrSVG=(sz,seed=7,col='#0A0C10')=>{const n=25,m=sz/n;let s=seed,r='';const rnd=()=>(s=(s*1103515245+12345)%2147483648)/2147483648;
 const fin=(x,y)=>`<rect x="${x*m}" y="${y*m}" width="${7*m}" height="${7*m}" fill="${col}"/><rect x="${(x+1)*m}" y="${(y+1)*m}" width="${5*m}" height="${5*m}" fill="#fff"/><rect x="${(x+2)*m}" y="${(y+2)*m}" width="${3*m}" height="${3*m}" fill="${col}"/>`;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const inF=(x<8&&y<8)||(x>n-9&&y<8)||(x<8&&y>n-9);if(!inF&&rnd()<.48)r+=`<rect x="${x*m}" y="${y*m}" width="${m+.3}" height="${m+.3}" fill="${col}"/>`}
 return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${r}${fin(0,0)}${fin(n-7,0)}${fin(0,n-7)}</svg>`};

/* ---------- palavra falada ----------
   WW('palavra')   -> segundo (dentro da cena) em que a palavra é dita. Use para amarrar cada elemento à fala.
   WW('palavra',1) -> a 2ª ocorrência da palavra na legenda da cena.
   Sem acento, sem pontuação e sem diferença de maiúscula. Palavra que não existe na legenda vai pra window.WWMISS
   (a folha de conferência mostra) e devolve o começo da cena. */
window.WWMISS=window.WWMISS||[];
const _nw=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[*.,?!:;"“”()]/g,'').toLowerCase();
const WW=(w,k=0)=>{const ws=cur.cap.split(/\s+/).map(_nw);const q=_nw(w);let c=0;
 for(let j=0;j<ws.length;j++){if(ws[j]===q){if(c===k)return W(j);c++}}
 const m=`cena ${S.indexOf(cur)}: palavra "${w}"${k?` (ocorrência ${k+1})`:''} não está em "${cur.cap}"`;if(!window.WWMISS.includes(m))window.WWMISS.push(m);return W(0)};
