/* ---------- PESSOAS E CENÁRIOS: personagem, plateia, efeitos, cenários, objetos ----------
   person(id,o) / P6(id,x,y,o) desenham um personagem. Opções de o:
     w (largura, ~300), pose (idle phone wave up hugR point pointL hold down hug mug), mood (happy smile sad wow worried),
     prop (phone wallet mug marker), tear, kid (criança),
     hairStyle: undefined = boné com a sigla da marca | 'short' | 'curly' | 'pigtails' | 'long' | 'bun' | 'bald'
     hair, browC, skin, skin2, top ('hoodie' | 'tee' | 'dress'), topC, topC2, armC, star (estampa da camiseta), pants, shoe,
     glasses (cor da armação), shades (óculos escuros), headset, earrings, lashes, lips, beard, mustache, chain, capText.
   Anime com life(id,t), wave, headTilt, setMood, setArm, walk. Os personagens do teu elenco já vêm prontos em elenco.js. */
(function(){const st=document.createElement('style');st.textContent=`
#vis{left:0!important;top:0!important;width:1080px!important;height:1920px!important;z-index:1;overflow:hidden}
#capbg{position:absolute;left:0;top:0;width:1080px;height:860px;background:linear-gradient(180deg,rgba(9,10,16,.93) 0%,rgba(9,10,16,.82) 40%,rgba(9,10,16,0) 100%);z-index:9;pointer-events:none}
#cap,#tag{z-index:10}#cap{text-shadow:0 6px 26px rgba(0,0,0,.55)}
.ph{border-radius:56px;background:#0E1117;border:14px solid #262B36;box-shadow:0 40px 90px rgba(0,0,0,.6);overflow:hidden}
.note{border-radius:10px;box-shadow:0 18px 40px rgba(0,0,0,.35);padding:26px;color:#14161C}
.bub{border-radius:30px;padding:20px 28px;font:700 32px Inter;line-height:1.25}
`;document.head.appendChild(st);const d=document.createElement('div');d.id='capbg';const sg=document.getElementById('stage');sg.insertBefore(d,document.getElementById('tag'))})();

Object.assign(IC,{
 wifi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 crown:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"/></svg>',
 sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z"/></svg>',
 live:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>'
});

/* ---------- personagem ---------- */
const PAL={skin:'#D99A6C',skin2:'#BD7D53',hair:'#3A2316',cap:'#FF6A2B',cap2:'#D9541E',hood:'#2B3F78',hood2:'#1F2E5E',pants:'#1E2433'};
const armD=(sx,sy,hx,hy,b)=>{const mx=(sx+hx)/2,my=(sy+hy)/2,dx=hx-sx,dy=hy-sy,l=Math.hypot(dx,dy)||1;return `M${sx} ${sy} Q${(mx-dy/l*b).toFixed(1)} ${(my+dx/l*b).toFixed(1)} ${hx} ${hy}`};
const POSE={idle:{L:[112,528,-16],R:[288,528,16]},phone:{L:[184,440,-48],R:[288,528,16]},wave:{L:[112,528,-16],R:[334,188,-40]},
 up:{L:[58,112,40],R:[342,112,-40]},hugR:{L:[58,112,40],R:[432,392,-24]},point:{L:[112,528,-16],R:[398,250,-30]},pointL:{L:[2,250,30],R:[288,528,16]},
 hold:{L:[172,452,-42],R:[228,452,42]},down:{L:[128,534,-6],R:[272,534,6]},hug:{L:[30,410,34],R:[370,410,-34]},mug:{L:[112,528,-16],R:[250,430,40]}};
const KPOSE={idle:{L:[118,450,-14],R:[282,450,14]},wave:{L:[118,450,-14],R:[324,206,-34]},up:{L:[66,118,30],R:[334,118,-30]},hold:{L:[172,410,-34],R:[228,410,34]}};
const PROP={
 phone:`<g transform="rotate(-8)"><rect x="-27" y="-62" width="54" height="100" rx="11" fill="#111827"/><rect x="-22" y="-56" width="44" height="84" rx="7" fill="#3D8BFF"/><circle cx="0" cy="-16" r="11" fill="#fff" opacity=".9"/><path d="M-4 -22 L7 -16 L-4 -10Z" fill="#3D8BFF"/></g>`,
 wallet:`<g transform="translate(28 -4)"><rect x="-58" y="-38" width="116" height="72" rx="12" fill="#8B5E3C"/><rect x="-52" y="-46" width="104" height="22" rx="7" fill="#6B4528"/><rect x="-42" y="-36" width="84" height="12" rx="5" fill="#3A2416"/><circle cx="40" cy="4" r="8" fill="#C9A26B"/></g>`,
 mug:`<g><rect x="-24" y="-46" width="48" height="58" rx="9" fill="#fff"/><path d="M24 -36 Q46 -28 24 -6" stroke="#fff" stroke-width="9" fill="none"/><rect x="-24" y="-46" width="48" height="14" rx="4" fill="#FF6A2B"/><path d="M-8 -58 Q-15 -70 -6 -82 M8 -60 Q1 -72 9 -84" stroke="rgba(255,255,255,.7)" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
 marker:`<g transform="rotate(35)"><rect x="-9" y="-66" width="18" height="74" rx="7" fill="#FF6A2B"/><rect x="-9" y="-80" width="18" height="18" rx="5" fill="#2A2D36"/></g>`
};
function person(id,o={}){
 const kid=!!o.kid,sk=o.skin||PAL.skin,sk2=o.skin2||PAL.skin2,hc=o.hair||PAL.hair;
 const H=kid?620:760,hip=kid?455:548,foot=kid?600:740,sh=kid?330:342,top=o.top||'hoodie';
 const tc=o.topC||PAL.hood,tc2=o.topC2||PAL.hood2,ac=o.armC||tc;
 const P=(kid?KPOSE:POSE)[o.pose||'idle'];const SX=[kid?140:136,kid?260:264];
 const w=o.w||400,ph=o.ph||'L';
 let s=`<svg id="${id}" data-kid="${kid?1:0}" data-sh="${sh}" data-ph="${o.prop?ph:''}" width="${w}" height="${Math.round(w*H/400)}" viewBox="0 0 400 ${H}" style="overflow:visible">`;
 s+=`<ellipse cx="200" cy="${foot+4}" rx="128" ry="16" fill="rgba(0,0,0,.25)"/>`;
 if(top==='dress')s+=`<rect x="154" y="${hip}" width="34" height="${foot-hip-18}" rx="16" fill="${sk}"/><rect x="212" y="${hip}" width="34" height="${foot-hip-18}" rx="16" fill="${sk}"/>`;
 else s+=`<rect x="142" y="${hip-18}" width="56" height="${foot-hip}" rx="24" fill="${o.pants||PAL.pants}"/><rect x="202" y="${hip-18}" width="56" height="${foot-hip}" rx="24" fill="${o.pants||PAL.pants}"/><rect x="194" y="${hip-6}" width="12" height="${(foot-hip)*.55}" fill="rgba(0,0,0,.18)"/>`;
 const sc=o.shoe||'#F4F4F2';
 s+=`<rect x="118" y="${foot-36}" width="86" height="40" rx="20" fill="${sc}"/><rect x="196" y="${foot-36}" width="86" height="40" rx="20" fill="${sc}"/><rect x="132" y="${foot-22}" width="54" height="9" rx="4.5" fill="#FF6A2B"/><rect x="214" y="${foot-22}" width="54" height="9" rx="4.5" fill="#FF6A2B"/><rect x="118" y="${foot-4}" width="86" height="8" rx="4" fill="rgba(0,0,0,.15)"/><rect x="196" y="${foot-4}" width="86" height="8" rx="4" fill="rgba(0,0,0,.15)"/>`;
 if(top==='dress')s+=`<path d="M138 ${sh-10} Q200 ${sh-28} 262 ${sh-10} Q290 ${hip-40} 314 ${hip+44} Q200 ${hip+74} 86 ${hip+44} Q110 ${hip-40} 138 ${sh-10} Z" fill="${tc}"/><path d="M262 ${sh-10} Q290 ${hip-40} 314 ${hip+44} Q290 ${hip+56} 262 ${hip+60} Q262 ${hip-20} 240 ${sh} Z" fill="rgba(0,0,0,.12)"/><rect x="130" y="${hip-72}" width="140" height="14" rx="7" fill="${tc2}"/>`;
 else s+=`<path d="M134 ${sh-12} Q200 ${sh-30} 266 ${sh-12} Q290 ${(sh+hip)/2} 294 ${hip} Q200 ${hip+28} 106 ${hip} Q110 ${(sh+hip)/2} 134 ${sh-12} Z" fill="${tc}"/><path d="M266 ${sh-12} Q290 ${(sh+hip)/2} 294 ${hip} Q272 ${hip+14} 252 ${hip+18} Q262 ${(sh+hip)/2} 244 ${sh-4} Z" fill="rgba(0,0,0,.14)"/>`;
 if(top==='hoodie')s+=`<path d="M148 ${sh-14} Q200 ${sh+34} 252 ${sh-14} Q230 ${sh-36} 200 ${sh-36} Q170 ${sh-36} 148 ${sh-14} Z" fill="${tc2}"/><path d="M186 ${sh+8} L182 ${sh+80}" stroke="#FF8A50" stroke-width="6" stroke-linecap="round"/><path d="M214 ${sh+8} L218 ${sh+80}" stroke="#FF8A50" stroke-width="6" stroke-linecap="round"/><circle cx="182" cy="${sh+84}" r="6" fill="#FF8A50"/><circle cx="218" cy="${sh+84}" r="6" fill="#FF8A50"/><rect x="144" y="${hip-110}" width="112" height="66" rx="22" fill="${tc2}"/>`;
 if(top==='tee')s+=`<path d="M200 ${sh+30} l13 27 30 3 -22 20 6 29 -27 -15 -27 15 6 -29 -22 -20 30 -3z" fill="${o.star||'#FF6A2B'}"/>`;
 s+=`<rect x="180" y="${sh-48}" width="40" height="42" rx="12" fill="${sk2}"/>`;
 const hy=215;
 if(o.chain)s+=`<path d="M150 330 Q200 392 250 330" stroke="#FACC15" stroke-width="7" fill="none"/><circle cx="200" cy="372" r="12" fill="#FACC15"/>`;
 s+=`<g id="${id}-hd" style="transform-box:view-box;transform-origin:200px ${sh-20}px">`;
 if(o.hairStyle==='curly')[[118,152,60],[200,116,68],[282,152,60],[96,228,50],[304,228,50],[146,104,44],[254,104,44],[104,296,38],[296,296,38]].forEach(c=>s+=`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}"/>`);
 if(o.hairStyle==='long')s+=`<path d="M104 200 Q98 290 116 342 L284 342 Q302 290 296 200 Q296 120 200 112 Q104 120 104 200 Z" fill="${hc}"/>`;
 if(o.hairStyle==='bun')s+=`<circle cx="200" cy="96" r="46" fill="${hc}"/>`;
 if(o.hairStyle==='pigtails')s+=`<circle cx="90" cy="204" r="42" fill="${hc}"/><circle cx="310" cy="204" r="42" fill="${hc}"/><rect x="110" y="188" width="18" height="32" rx="7" fill="#FF6A2B"/><rect x="272" y="188" width="18" height="32" rx="7" fill="#FF6A2B"/>`;
 s+=`<circle cx="108" cy="${hy+14}" r="21" fill="${sk}"/><circle cx="292" cy="${hy+14}" r="21" fill="${sk}"/><circle cx="111" cy="${hy+14}" r="9" fill="${sk2}"/><circle cx="289" cy="${hy+14}" r="9" fill="${sk2}"/>`;
 if(o.earrings)s+=`<circle cx="103" cy="${hy+44}" r="9" fill="#FACC15"/><circle cx="297" cy="${hy+44}" r="9" fill="#FACC15"/>`;
 s+=`<ellipse cx="200" cy="${hy}" rx="93" ry="101" fill="${sk}"/><path d="M118 ${hy+40} Q200 ${hy+128} 282 ${hy+40} Q262 ${hy+96} 200 ${hy+101} Q138 ${hy+96} 118 ${hy+40} Z" fill="rgba(0,0,0,.06)"/>`;
 if(!o.hairStyle){
  s+=`<circle cx="113" cy="182" r="17" fill="${hc}"/><circle cx="287" cy="182" r="17" fill="${hc}"/><circle cx="118" cy="204" r="11" fill="${hc}"/><circle cx="282" cy="204" r="11" fill="${hc}"/>`;
  s+=`<path d="M104 178 C106 80 294 80 296 178 Q200 158 104 178 Z" fill="${PAL.cap}"/><path d="M226 92 C276 104 296 140 296 178 Q270 168 244 164 Q246 120 226 92 Z" fill="rgba(0,0,0,.1)"/><path d="M200 94 L200 165" stroke="${PAL.cap2}" stroke-width="5"/><path d="M150 106 Q160 140 156 170" stroke="${PAL.cap2}" stroke-width="4" fill="none"/><path d="M250 106 Q240 140 244 170" stroke="${PAL.cap2}" stroke-width="4" fill="none"/><circle cx="200" cy="92" r="9" fill="${PAL.cap2}"/>`;
  if((o.capText!==undefined?o.capText:MARCA.sigla))s+=`<rect x="${200-Math.max(34,7*(o.capText!==undefined?o.capText:MARCA.sigla).length+14)}" y="118" width="${2*Math.max(34,7*(o.capText!==undefined?o.capText:MARCA.sigla).length+14)}" height="34" rx="10" fill="#fff"/><text x="200" y="142" text-anchor="middle" font-family="Inter" font-weight="900" font-size="21" fill="${PAL.cap2}">${o.capText!==undefined?o.capText:MARCA.sigla}</text>`;
  s+=`<path d="M106 196 Q200 214 294 196 L294 204 Q200 222 106 204 Z" fill="rgba(0,0,0,.12)"/><path d="M90 176 Q200 144 310 176 Q308 202 200 200 Q92 202 90 176 Z" fill="${PAL.cap2}"/><path d="M96 180 Q200 154 304 180" stroke="rgba(255,255,255,.25)" stroke-width="4" fill="none"/>`;
 }else if(o.hairStyle==='bald'){}
 else if(o.hairStyle==='curly')s+=`<path d="M112 172 Q130 98 200 94 Q270 98 288 172 Q252 138 200 140 Q148 138 112 172 Z" fill="${hc}"/>`;
 else s+=`<path d="M106 196 Q108 102 200 98 Q292 102 294 196 Q266 148 200 150 Q134 148 106 196 Z" fill="${hc}"/>`;
 if(o.beard)s+=`<path d="M112 236 Q114 336 200 342 Q286 336 288 236 Q282 300 246 310 Q200 322 154 310 Q118 300 112 236 Z" fill="${o.beard===true?hc:o.beard}"/>`;
 const B={n:['M146 206 Q164 196 182 204','M218 204 Q236 196 254 206'],sad:['M146 208 Q166 206 182 196','M218 196 Q234 206 254 208'],wow:['M146 196 Q164 182 182 190','M218 190 Q236 182 254 196']};
 for(const k in B)s+=`<g id="${id}-b-${k}" style="display:${k==='n'?'inline':'none'}">${B[k].map(d=>`<path d="${d}" stroke="${o.browC||hc}" stroke-width="8" stroke-linecap="round" fill="none"/>`).join('')}</g>`;
 s+=`<g id="${id}-ey" style="transform-box:view-box;transform-origin:200px 238px"><ellipse cx="163" cy="238" rx="19" ry="23" fill="#fff"/><ellipse cx="237" cy="238" rx="19" ry="23" fill="#fff"/><circle cx="166" cy="242" r="11.5" fill="#2A1A12"/><circle cx="234" cy="242" r="11.5" fill="#2A1A12"/><circle cx="170" cy="237" r="4.5" fill="#fff"/><circle cx="238" cy="237" r="4.5" fill="#fff"/></g>`;
 if(o.lashes)s+=`<path d="M146 224 l-8 -6 M152 218 l-5 -8 M228 218 l5 -8 M254 224 l8 -6" stroke="#2A1A12" stroke-width="4" stroke-linecap="round"/>`;
 s+=`<path d="M195 258 Q201 270 208 261" stroke="${sk2}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
 s+=`<circle cx="138" cy="274" r="16" fill="#FF7B6B" opacity=".32"/><circle cx="262" cy="274" r="16" fill="#FF7B6B" opacity=".32"/>`;
 const lip=o.lips?'#B23A48':'#6B2222';
 const M={happy:`<path d="M166 278 Q200 324 234 278 Z" fill="#6B2222"/><path d="M172 280 Q200 289 228 280 L226 287 Q200 295 174 287 Z" fill="#fff"/><ellipse cx="200" cy="304" rx="13" ry="7" fill="#FF7B7B"/>`,
  smile:`<path d="M172 284 Q200 306 228 284" stroke="${lip}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  sad:`<path d="M176 302 Q200 282 224 302" stroke="${lip}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  wow:`<ellipse cx="200" cy="294" rx="14" ry="18" fill="#6B2222"/>`,
  worried:`<path d="M174 296 Q187 286 200 296 Q213 306 226 296" stroke="${lip}" stroke-width="7" fill="none" stroke-linecap="round"/>`};
 const mood=o.mood||'smile';
 for(const k in M)s+=`<g id="${id}-m-${k}" style="display:${k===mood?'inline':'none'}">${M[k]}</g>`;
 if(o.mustache)s+=`<path d="M154 272 Q176 252 200 266 Q224 252 246 272 Q226 286 200 276 Q174 286 154 272 Z" fill="${o.mustache===true?hc:o.mustache}"/>`;
 s+=`<path id="${id}-sw" d="M302 194 Q316 214 307 226 Q295 231 292 217 Q294 206 302 194 Z" fill="#8FD0FF" style="display:${mood==='worried'?'inline':'none'}"/>`;
 s+=`<path id="${id}-tr" d="M150 262 Q158 278 152 288 Q144 290 143 280 Q144 270 150 262 Z" fill="#8FD0FF" style="display:${o.tear?'inline':'none'}"/>`;
 if(o.shades&&!o.glasses)o.glasses='#0A0A0A';
 if(o.glasses)s+=`<rect x="134" y="212" width="58" height="50" rx="16" fill="${o.shades?'#0A0A0A':'rgba(170,215,255,.16)'}" stroke="${o.glasses}" stroke-width="7"/><rect x="208" y="212" width="58" height="50" rx="16" fill="${o.shades?'#0A0A0A':'rgba(170,215,255,.16)'}" stroke="${o.glasses}" stroke-width="7"/><path d="M192 234 h16" stroke="${o.glasses}" stroke-width="6"/>`;
 if(o.headset)s+=`<path d="M98 214 Q104 96 200 92 Q296 96 302 214" stroke="#1F2937" stroke-width="15" fill="none" stroke-linecap="round"/><rect x="82" y="200" width="40" height="64" rx="16" fill="#111827"/><rect x="278" y="200" width="40" height="64" rx="16" fill="#111827"/><path d="M100 262 Q112 306 160 304" stroke="#111827" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="164" cy="304" r="10" fill="#FF6A2B"/>`;
 if(o.tie)s+=``;
 s+=`</g>`;
 const sw=kid?38:44;
 ['L','R'].forEach((k,i)=>{const a=P[k];s+=`<path id="${id}-a${k}" d="${armD(SX[i],sh,a[0],a[1],a[2])}" stroke="${ac}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="${armD(SX[i],sh,a[0],a[1],a[2])}" stroke="rgba(0,0,0,.0)" fill="none"/>`});
 const pa=o.prop?P[ph]:[0,0];
 s+=`<g id="${id}-pr" transform="translate(${pa[0]} ${pa[1]})">${o.prop?PROP[o.prop]:''}</g>`;
 ['L','R'].forEach(k=>{const a=P[k];s+=`<circle id="${id}-h${k}" cx="${a[0]}" cy="${a[1]}" r="${kid?19:23}" fill="${sk}"/>`});
 return s+'</svg>';
}
const P6=(id,x,y,o)=>`<div class="abs" id="${id}W" style="left:${x}px;top:${y}px">${person(id,o)}</div>`;
function setArm(id,k,hx,hy,b){const sv=document.getElementById(id);if(!sv)return;const kid=sv.dataset.kid==='1',sh=+sv.dataset.sh;const sx=k==='L'?(kid?140:136):(kid?260:264);
 document.getElementById(id+'-a'+k).setAttribute('d',armD(sx,sh,hx,hy,b));const h=document.getElementById(id+'-h'+k);h.setAttribute('cx',hx);h.setAttribute('cy',hy);
 if(sv.dataset.ph===k)document.getElementById(id+'-pr').setAttribute('transform',`translate(${hx} ${hy})`)}
function setMood(id,m){['happy','smile','sad','wow','worried'].forEach(k=>{const e=document.getElementById(`${id}-m-${k}`);if(e)e.style.display=k===m?'inline':'none'});
 const b=(m==='sad'||m==='worried')?'sad':m==='wow'?'wow':'n';['n','sad','wow'].forEach(k=>{const e=document.getElementById(`${id}-b-${k}`);if(e)e.style.display=k===b?'inline':'none'});
 const sw=document.getElementById(id+'-sw');if(sw)sw.style.display=m==='worried'?'inline':'none'}
function life(id,t,seed=0,bobA=5){const e=document.getElementById(id+'-ey');if(e){const ph=(t+seed)%2.8;const b=ph>2.62?Math.sin((ph-2.62)/.18*Math.PI):0;e.style.transform=`scaleY(${1-.92*Math.max(0,b)})`}
 const sv=document.getElementById(id);if(sv&&bobA)sv.style.transform=`translateY(${(Math.sin(t*2.6+seed)*bobA).toFixed(2)}px)`}
function headTilt(id,r,y=0){const h=document.getElementById(id+'-hd');if(h)h.style.transform=`translateY(${y}px) rotate(${r}deg)`}
function wave(id,t,a,kid){const s=Math.sin((t-a)*9)*(t>a?1:0);if(kid)setArm(id,'R',324+s*22,206-Math.abs(s)*8,-34);else setArm(id,'R',334+s*26,188-Math.abs(s)*10,-40)}

/* ---------- gente pequena (plateia) ---------- */
const SKS=['#F2C3A0','#D99A6C','#A86B4C','#7A4A33','#E8B48F'],HRS=['#2A1810','#3A2316','#7A4A2A','#111111','#C98B3B'],SHS=['#FF6A2B','#3D8BFF','#22C55E','#A855F7','#FACC15','#EC4899','#14B8A6'];
const mini=(id,x,y,s,i,grey)=>{const sk=grey?'#8C93A3':SKS[i%5],hr=grey?'#5B6170':HRS[(i*3)%5],sh=grey?'#3A4252':SHS[(i*5)%7];
 return `<div class="abs" id="${id}" style="left:${x}px;top:${y}px;width:${Math.round(60*s)}px;height:${Math.round(70*s)}px"><svg viewBox="0 0 60 70" width="${Math.round(60*s)}" height="${Math.round(70*s)}"><path d="M5 70 Q7 45 30 43 Q53 45 55 70 Z" fill="${sh}"/><circle cx="30" cy="25" r="17" fill="${sk}"/><path d="M13 24 Q14 6 30 6 Q46 6 47 24 Q39 15 30 15 Q21 15 13 24 Z" fill="${hr}"/><circle cx="24" cy="27" r="2.5" fill="#2A1A12"/><circle cx="36" cy="27" r="2.5" fill="#2A1A12"/>${grey?'<path d="M24 34 h12" stroke="#2A1A12" stroke-width="2"/>':'<path d="M23 33 Q30 39 37 33" stroke="#2A1A12" stroke-width="2.2" fill="none" stroke-linecap="round"/>'}</svg></div>`};

/* ---------- efeitos ---------- */
const hearts=(id,n,x,y,col='#F43F5E',sz=54)=>Array.from({length:n},(_,i)=>`<div class="abs" id="${id}${i}" style="left:${x+((i*53)%120)-60}px;top:${y}px;color:${col};opacity:0">${ic('heart',sz-(i%3)*10,'currentColor')}</div>`).join('');
function heartsUp(id,n,t,a,h=360){for(let i=0;i<n;i++){const e=document.getElementById(id+i);if(!e)continue;const ph=((t-a)*.75+i/n)%1;if(t<a){e.style.opacity=0;continue}
 e.style.transform=`translate(${Math.sin(ph*6+i)*26}px,${-h*ph}px) scale(${.7+.5*ph})`;e.style.opacity=Math.sin(ph*Math.PI).toFixed(2)}}
const CF=['#FF6A2B','#FACC15','#22C55E','#3D8BFF','#EC4899','#A855F7','#fff'];
const confetti=(id,n,x0=0,w=1080)=>Array.from({length:n},(_,i)=>`<div class="abs" id="${id}${i}" style="left:${x0+((i*97)%w)}px;top:-40px;width:${14+(i%3)*6}px;height:${24+(i%4)*5}px;border-radius:4px;background:${CF[i%7]};opacity:0"></div>`).join('');
function confUp(id,n,t,a,top=560,fall=1500){for(let i=0;i<n;i++){const e=document.getElementById(id+i);if(!e)continue;const d=(i*0.037)%0.6;const p=(t-a-d)/2.2;if(p<0){e.style.opacity=0;continue}
 const y=top+fall*Math.min(1.2,p)+Math.sin(p*8+i)*20;e.style.transform=`translate(${Math.sin(p*5+i*1.7)*60}px,${y}px) rotate(${p*540+i*40}deg)`;e.style.opacity=p>1.1?0:1}}
function popIn(id,t,a,d=.45,r=0){pop(document.getElementById(id),t,a,d,r)}

/* ---------- cenários ---------- */
function room(p,o={}){const n=o.night,sd=o.sad;
 const w1=sd?'#4A4E5E':n?'#2C2558':'#FFE7D1',w2=sd?'#363A46':n?'#40336F':'#FFD3B0';
 const s1=sd?'#5B6170':n?'#0E1638':'#7CC8FF',s2=sd?'#3B3F4A':n?'#28306A':'#CDEEFF';
 const fr=(n||sd)?'#4A3F7A':'#F6EEE6';
 let s=`<svg class="abs" style="left:0;top:0" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w1}"/><stop offset="1" stop-color="${w2}"/></linearGradient><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient><radialGradient id="${p}g"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".6"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient><radialGradient id="${p}l"><stop offset="0" stop-color="#FFD27A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>`;
 s+=`<rect width="1080" height="1590" fill="url(#${p}w)"/>`;
 for(let i=0;i<46;i++){const x=(i*137)%1080,y=420+((i*251)%1120);s+=`<path d="M${x} ${y} l6 10 -6 10 -6 -10z" fill="#fff" opacity="${n||sd?0.05:0.22}"/>`}
 if(n&&!sd)s+=`<circle cx="300" cy="1150" r="420" fill="url(#${p}l)"/>`;
 s+=`<rect x="596" y="650" width="400" height="440" rx="22" fill="${fr}"/><rect x="618" y="672" width="356" height="396" rx="12" fill="url(#${p}s)"/>`;
 if(n&&!sd){for(let i=0;i<16;i++)s+=`<circle id="${p}st${i}" cx="${640+((i*71)%320)}" cy="${690+((i*113)%340)}" r="${2+(i%3)}" fill="#fff"/>`;
  s+=`<circle cx="900" cy="745" r="40" fill="#FFF3C4"/><circle cx="886" cy="736" r="8" fill="#F2E2A6"/><circle cx="910" cy="760" r="6" fill="#F2E2A6"/><path d="M640 1068 L640 1010 L690 1010 L690 980 L740 980 L740 1030 L790 1030 L790 960 L850 960 L850 1000 L900 1000 L900 1068 Z" fill="#141A35"/>`;
  for(let i=0;i<10;i++)s+=`<rect x="${650+((i*37)%240)}" y="${990+((i*29)%60)}" width="10" height="12" fill="#FFD27A" opacity=".8"/>`}
 else if(!sd)s+=`<circle cx="900" cy="745" r="42" fill="#FFD25A"/><g fill="#fff" opacity=".95"><ellipse cx="700" cy="800" rx="58" ry="26"/><ellipse cx="740" cy="784" rx="40" ry="28"/><ellipse cx="860" cy="900" rx="64" ry="24"/><ellipse cx="900" cy="886" rx="38" ry="24"/></g><path d="M618 1000 Q700 960 790 990 Q880 1020 974 980 L974 1068 L618 1068 Z" fill="#7BC77E"/>`;
 if(sd)for(let i=0;i<22;i++)s+=`<line id="${p}rn${i}" x1="${632+((i*29)%330)}" y1="${684+((i*67)%300)}" x2="${624+((i*29)%330)}" y2="${724+((i*67)%300)}" stroke="#C9D3E6" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>`;
 s+=`<rect x="790" y="672" width="12" height="396" fill="${fr}"/><rect x="618" y="864" width="356" height="12" fill="${fr}"/>`;
 const cu=n?'#6D5BD0':sd?'#5E6272':'#FF8A50';
 s+=`<path d="M572 632 Q602 860 576 1112 L644 1112 Q626 860 644 632 Z" fill="${cu}"/><path d="M1020 632 Q990 860 1016 1112 L948 1112 Q966 860 948 632 Z" fill="${cu}"/><rect x="556" y="618" width="484" height="18" rx="9" fill="#5A3E2E"/>`;
 s+=`<g transform="rotate(-4 190 830)"><rect x="90" y="700" width="200" height="250" rx="14" fill="#fff"/><path d="M190 762 l20 42 46 6 -34 32 9 46 -41 -22 -41 22 9 -46 -34 -32 46 -6z" fill="#FF6A2B"/><rect x="168" y="688" width="44" height="20" rx="4" fill="#FFE08A" opacity=".9"/></g>`;
 s+=`<g transform="rotate(5 405 860)"><rect x="330" y="770" width="150" height="180" rx="14" fill="#3D8BFF"/><circle cx="405" cy="860" r="44" fill="#fff"/><path d="M392 838 L428 860 L392 882 Z" fill="#3D8BFF"/></g>`;
 s+=`<rect x="80" y="1040" width="300" height="18" rx="6" fill="#7A4E33"/><rect x="110" y="980" width="60" height="62" rx="10" fill="#C2410C"/><path d="M140 980 Q110 930 126 900 Q146 940 140 980 Q150 920 180 908 Q170 950 140 980" fill="#22A35A"/><rect x="200" y="1000" width="34" height="42" rx="4" fill="#3D8BFF"/><rect x="238" y="992" width="30" height="50" rx="4" fill="#FACC15"/><rect x="272" y="1004" width="36" height="38" rx="4" fill="#EC4899"/>`;
 s+=`<rect y="1590" width="1080" height="330" fill="${n?'#4A3426':sd?'#3E3530':'#B9825A'}"/>`;
 for(let i=0;i<5;i++)s+=`<path d="M0 ${1650+i*62} H1080" stroke="rgba(0,0,0,.14)" stroke-width="3"/>`;
 s+=`<rect y="1580" width="1080" height="18" fill="${n?'#3A281D':'#9C6A45'}"/>`;
 if(o.bed!==false)s+=`<rect x="-30" y="1260" width="370" height="240" rx="34" fill="#7A4E33"/><rect x="-30" y="1430" width="430" height="190" rx="30" fill="#F3EDE4"/><path d="M-30 1478 Q180 1446 400 1478 L400 1620 L-30 1620 Z" fill="#1F8A8A"/><path d="M30 1512 h330" stroke="#2BB3B3" stroke-width="10" stroke-dasharray="26 18"/><ellipse cx="110" cy="1428" rx="96" ry="38" fill="#fff"/>`;
 s+=`<ellipse cx="600" cy="1800" rx="400" ry="72" fill="${n?'#7C3AED':sd?'#4B4F5E':'#FF6A2B'}" opacity=".45"/>`;
 if(o.ring!==false)s+=`<circle id="${p}rg" cx="960" cy="1160" r="170" fill="url(#${p}g)" opacity="${o.ringOn?1:0}"/><path d="M960 1250 L960 1700 M960 1700 L900 1782 M960 1700 L1020 1782 M960 1700 L960 1792" stroke="#2A2D36" stroke-width="10" stroke-linecap="round"/><circle cx="960" cy="1160" r="80" fill="none" stroke="${o.ringOn?'#FFF6E0':'#9AA0AE'}" stroke-width="20"/><rect x="938" y="1138" width="44" height="80" rx="9" fill="#111827"/>`;
 if(o.desk)s+=`<rect x="40" y="1330" width="560" height="26" rx="10" fill="#8B5E3C"/><rect x="70" y="1356" width="22" height="240" fill="#6B4528"/><rect x="548" y="1356" width="22" height="240" fill="#6B4528"/>`;
 return s+'</svg>'}
function roomUp(p,t,o={}){if(o.night)for(let i=0;i<16;i++){const e=document.getElementById(p+'st'+i);if(e)e.setAttribute('opacity',(.45+.55*Math.abs(Math.sin(t*1.7+i))).toFixed(2))}
 if(o.sad)for(let i=0;i<22;i++){const e=document.getElementById(p+'rn'+i);if(!e)continue;const off=((t*520+i*67)%330);e.setAttribute('transform',`translate(0 ${off-((i*67)%300)})`)}
 if(o.ringOn){const e=document.getElementById(p+'rg');if(e)e.setAttribute('opacity',(.85+.15*Math.sin(t*5)).toFixed(2))}}
function living(p){let s=`<svg class="abs" style="left:0;top:0" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE6C9"/><stop offset="1" stop-color="#FFC59A"/></linearGradient></defs><rect width="1080" height="1600" fill="url(#${p}w)"/>`;
 for(let i=0;i<8;i++)s+=`<rect x="${i*140}" y="380" width="70" height="1220" fill="#fff" opacity=".08"/>`;
 s+=`<rect x="236" y="690" width="520" height="330" rx="26" fill="#14161C"/><rect x="250" y="1020" width="490" height="16" rx="8" fill="#2A2D36"/><rect x="470" y="1036" width="50" height="40" fill="#2A2D36"/>`;
 s+=`<g transform="rotate(3 900 850)"><rect x="810" y="720" width="190" height="230" rx="12" fill="#fff"/><rect x="826" y="736" width="158" height="170" rx="6" fill="#9BD5FF"/><circle cx="905" cy="840" r="38" fill="#D99A6C"/><path d="M866 830 C866 780 944 780 944 830 Z" fill="#FF6A2B"/><path d="M858 830 Q905 816 952 830 L952 838 Q905 826 858 838 Z" fill="#D9541E"/><circle cx="892" cy="846" r="4" fill="#2A1A12"/><circle cx="918" cy="846" r="4" fill="#2A1A12"/><path d="M890 860 Q905 872 920 860" stroke="#6B2222" stroke-width="3" fill="none"/><rect x="826" y="910" width="158" height="30" fill="#fff"/><text x="905" y="932" text-anchor="middle" font-family="Inter" font-weight="800" font-size="18" fill="#5B6170">o começo</text></g>`;
 s+=`<rect x="70" y="1380" width="130" height="170" rx="18" fill="#C2410C"/><path d="M135 1380 Q70 1290 90 1210 Q130 1290 135 1380 Q120 1260 160 1180 Q180 1290 135 1380 Q170 1290 220 1250 Q200 1330 135 1380" fill="#22A35A"/>`;
 s+=`<rect x="934" y="1050" width="10" height="440" fill="#2A2D36"/><path d="M890 1050 L988 1050 L968 980 L910 980 Z" fill="#FACC15"/>`;
 s+=`<rect x="80" y="1250" width="920" height="240" rx="70" fill="#1F8A8A"/><rect x="50" y="1420" width="980" height="180" rx="60" fill="#27A3A3"/><rect x="30" y="1330" width="120" height="270" rx="50" fill="#1F8A8A"/><rect x="930" y="1330" width="120" height="270" rx="50" fill="#1F8A8A"/><rect x="200" y="1300" width="200" height="130" rx="40" fill="#FACC15" transform="rotate(-6 300 1365)"/><rect x="680" y="1300" width="200" height="130" rx="40" fill="#FF8A50" transform="rotate(6 780 1365)"/>`;
 s+=`<rect y="1600" width="1080" height="320" fill="#C98B5E"/>`;for(let i=0;i<5;i++)s+=`<path d="M0 ${1660+i*60} H1080" stroke="rgba(0,0,0,.12)" stroke-width="3"/>`;
 s+=`<ellipse cx="540" cy="1810" rx="440" ry="80" fill="#FF6A2B" opacity=".4"/>`;
 return s+'</svg>'}
const sky=(p,a,b)=>`<svg class="abs" style="left:0;top:0" width="1080" height="1920"><defs><linearGradient id="${p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#${p}k)"/></svg>`;
const motoSVG=(w,c='#FF6A2B')=>`<svg width="${w}" height="${Math.round(w*.62)}" viewBox="0 0 260 160"><circle cx="58" cy="120" r="34" fill="#1B1F2B"/><circle cx="58" cy="120" r="14" fill="#C9CED8"/><circle cx="204" cy="120" r="34" fill="#1B1F2B"/><circle cx="204" cy="120" r="14" fill="#C9CED8"/><path d="M58 120 L104 74 L170 74 L204 120" stroke="#2A2D36" stroke-width="11" fill="none" stroke-linejoin="round"/><path d="M90 80 Q120 40 170 54 L190 86 Q140 98 98 94 Z" fill="${c}"/><path d="M182 42 L198 28 L218 34" stroke="#2A2D36" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="104" y="46" width="60" height="16" rx="8" fill="#2A2D36"/><circle cx="214" cy="60" r="9" fill="#FFE08A"/></svg>`;
const bulbSVG=(id)=>`<svg id="${id}" width="200" height="260" viewBox="0 0 200 260" style="overflow:visible"><circle cx="100" cy="95" r="120" fill="#FFE27A" opacity=".25"/><path d="M100 18 C150 18 178 56 178 96 C178 130 152 148 140 172 L60 172 C48 148 22 130 22 96 C22 56 50 18 100 18 Z" fill="#FFD84D"/><path d="M78 120 Q100 90 122 120 M100 104 L100 170" stroke="#E0A800" stroke-width="7" fill="none"/><rect x="62" y="176" width="76" height="22" rx="8" fill="#9AA0AE"/><rect x="66" y="200" width="68" height="20" rx="8" fill="#8A909E"/><rect x="78" y="222" width="44" height="14" rx="6" fill="#6B7280"/><path d="M60 50 Q72 34 92 30" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/></svg>`;
const wheelSVG=(id,r)=>{let s=`<svg id="${id}" width="${2*r}" height="${2*r}" viewBox="-100 -100 200 200">`;const c=['#FF6A2B','#FACC15','#22C55E','#3D8BFF','#A855F7','#EC4899','#14B8A6','#F97316'];
 for(let i=0;i<8;i++){const a0=i*Math.PI/4,a1=(i+1)*Math.PI/4;s+=`<path d="M0 0 L${(96*Math.cos(a0)).toFixed(1)} ${(96*Math.sin(a0)).toFixed(1)} A96 96 0 0 1 ${(96*Math.cos(a1)).toFixed(1)} ${(96*Math.sin(a1)).toFixed(1)} Z" fill="${c[i]}"/>`}
 return s+`<circle r="96" fill="none" stroke="#fff" stroke-width="6"/><circle r="16" fill="#fff"/></svg>`};
const receipt=(id,x,y)=>`<div class="abs" id="${id}" style="left:${x}px;top:${y}px;width:130px;height:160px;background:#fff;border-radius:10px;box-shadow:0 10px 24px rgba(0,0,0,.35);padding:14px;opacity:0"><div style="font:900 22px Inter;color:#14B8A6">PIX</div><div style="height:8px;background:#E5E7EB;border-radius:4px;margin-top:12px"></div><div style="height:8px;width:70%;background:#E5E7EB;border-radius:4px;margin-top:10px"></div><div style="font:900 24px 'Inter Display';color:#14161C;margin-top:16px">R$ 2,00</div><div style="height:8px;width:50%;background:#E5E7EB;border-radius:4px;margin-top:12px"></div></div>`;
const phoneBox=(id,x,y,w,h,inner,bg='#0E1117')=>`<div class="abs ph" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${bg}"><div style="position:absolute;left:50%;top:14px;width:110px;height:28px;margin-left:-55px;border-radius:14px;background:#000;z-index:3"></div>${inner}</div>`;
