/* ---------- CAPÍTULO 1 · A geladeira cheia ----------
   Uma cena por fala do roteiro.json (mesma ordem) + a cartela final. Cada elemento entra na palavra falada: WW('palavra').
   Componentes próprios do episódio levam o prefixo e1 (pra não colidir com a biblioteca). */

/* bolo em camadas (SVG): e1bolo(largura, cor da massa) */
const e1bolo=(w,c='#F9A8D4')=>`<svg width="${w}" height="${Math.round(w*.9)}" viewBox="0 0 200 180" style="overflow:visible">
 <ellipse cx="100" cy="168" rx="92" ry="12" fill="rgba(0,0,0,.25)"/><rect x="14" y="150" width="172" height="14" rx="7" fill="#E5E7EB"/>
 <rect x="26" y="96" width="148" height="58" rx="14" fill="${c}"/><rect x="26" y="118" width="148" height="10" fill="rgba(255,255,255,.55)"/>
 <rect x="44" y="52" width="112" height="50" rx="14" fill="${c}"/><rect x="44" y="72" width="112" height="9" fill="rgba(255,255,255,.55)"/>
 <path d="M44 64 Q56 78 68 64 Q80 78 92 64 Q104 78 116 64 Q128 78 140 64 Q152 78 156 64 L156 56 Q100 40 44 56 Z" fill="#FFF7ED"/>
 <circle cx="100" cy="40" r="13" fill="#DC2626"/><path d="M100 28 Q106 14 116 10" stroke="#16A34A" stroke-width="4" fill="none"/></svg>`;
/* geladeira aberta, cheia de bolo */
const e1geladeira=(id,x,y)=>`<div class="abs" id="${id}" style="left:${x}px;top:${y}px;width:420px;height:560px;border-radius:34px;background:#E5E7EB;box-shadow:0 30px 70px rgba(0,0,0,.5);padding:26px">
 <div style="width:100%;height:100%;border-radius:20px;background:linear-gradient(#F8FAFC,#DBEAFE);display:grid;grid-template-rows:repeat(3,1fr);padding:10px 14px;gap:6px">
 ${[0,1,2].map(r=>`<div style="display:flex;justify-content:space-around;align-items:flex-end;border-bottom:6px solid #CBD5E1">${[0,1].map(c=>`<div id="${id}b${r*2+c}">${e1bolo(120,['#F9A8D4','#FDE68A','#C4B5FD'][(r+c)%3])}</div>`).join('')}</div>`).join('')}</div></div>`;
/* cartão do cardápio: e1menu(id,x,y,w) */
const e1menu=(id,x,y,w)=>`<div class="abs card" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;padding:26px 28px;background:#FFF7ED;border:none;color:#111827">
 <div style="font:900 34px Inter;color:${COR.marca};letter-spacing:2px">CARDÁPIO</div>
 ${[['Bolo de pote','Ninho com morango','R$ 15'],['Bolo inteiro','Chocolate belga','R$ 90'],['Docinhos','Cento sortido','R$ 120']].map((m,k)=>`<div id="${id}i${k}" style="display:flex;align-items:center;gap:18px;margin-top:18px">
 <div id="${id}f${k}" style="flex:none;width:88px;height:88px;border-radius:18px;background:#FCE7F3;display:flex;align-items:center;justify-content:center">${e1bolo(66,['#F9A8D4','#7C2D12','#FDE68A'][k])}</div>
 <div style="flex:1;min-width:0"><div style="font:800 30px Inter">${m[0]}</div><div id="${id}s${k}" style="font:600 24px Inter;color:#6B7280">${m[1]}</div></div>
 <div id="${id}p${k}" style="font:900 32px Inter;white-space:nowrap">${m[2]}</div></div>`).join('')}</div>`;
/* agenda de sábado com horários que vão lotando */
const e1agenda=(id,x,y,w)=>`<div class="abs card" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;padding:24px 28px">
 <div style="display:flex;align-items:center;gap:14px;font:900 34px Inter">${ic('cal',40,COR.marca)}Sábado</div>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px">${['8h','9h','10h','11h','13h','14h','15h','16h'].map((h,k)=>`<div id="${id}h${k}" style="border-radius:16px;padding:14px 0;text-align:center;font:800 28px Inter;background:#1B202B;color:#8C96AA;border:2px solid #2A3140">${h}</div>`).join('')}</div></div>`;
function e1agendaUp(id,t,a){for(let k=0;k<8;k++){const e=document.getElementById(id+'h'+k);if(!e)continue;const on=t>a+k*.12;
 e.style.background=on?'#16351F':'#1B202B';e.style.color=on?'#4ADE80':'#8C96AA';e.style.borderColor=on?'#22C55E':'#2A3140';e.style.transform=`scale(${on&&t<a+k*.12+.15?1.08:1})`}}
/* balão de comentário */
const e1cmt=(id,x,y,nome,txt,cor)=>`<div class="abs" id="${id}" style="left:${x}px;top:${y}px;display:flex;align-items:center;gap:16px;background:#fff;border-radius:999px;padding:14px 28px 14px 14px;box-shadow:0 14px 34px rgba(0,0,0,.35)">
 <div style="width:64px;height:64px;border-radius:50%;background:${cor};font:900 28px Inter;color:#fff;display:flex;align-items:center;justify-content:center">${nome[0]}</div>
 <div style="font:800 32px Inter;color:#111827;white-space:nowrap"><span style="color:#6B7280;font-weight:700">${nome}</span> ${txt}</div></div>`;

const S=[
/* 0  A Lu vendeu 37 bolos num sábado. */
SC(0,'marca',()=>capBadge('cb0',60,600)+numeroGrande('n0',120,690,840,'0','BOLOS','#fff',230)+cardIcone('sb0',330,1010,'cal','SÁBADO',COR.marca,42)
 +[0,1,2].map(k=>`<div class="abs" id="bl0${k}" style="left:${[90,820,770][k]}px;top:${[760,700,930][k]}px">${e1bolo(150,['#F9A8D4','#FDE68A','#C4B5FD'][k])}</div>`).join('')
 +LU('lu0',380,1110,{w:320,mood:'happy'})+confetti('cf0',24),
 t=>{capBadgeIn('cb0',t,.05);life('lu0',t);const a=WW('37')-.25;pop($('#n0'),t,a,.4);cnt('n0n',t,a,.6,0,37);
  for(let k=0;k<3;k++)pop($('#bl0'+k),t,WW('bolos')-.1+k*.1,.4,k?12:-12);pop($('#sb0'),t,WW('sábado')-.15,.4);
  if(t>WW('sábado')){wave('lu0',t,WW('sábado'),false)}confUp('cf0',24,t,WW('37'),560,1300)}),
/* 1  Sem gastar um real de anúncio. */
SC(1,'green',()=>`<div class="abs" id="mg1" style="left:340px;top:640px">${icb('megaphone',400,'#fff','linear-gradient(135deg,#2563EB,#7C3AED)')}</div>`
 +`<div class="abs strike" id="st1" style="left:300px;top:830px;width:480px;transform:rotate(-30deg) scaleX(0)"></div>`
 +bigTxt('r1',0,1060,'R$ 0','#4ADE80',150,1080)+LU('lu1',60,1160,{w:270,pose:'up',mood:'happy'})+RAFA('rf1',750,1160,{w:270,mood:'wow'}),
 t=>{life('lu1',t);life('rf1',t,1);pop($('#mg1'),t,.05,.4);const a=WW('sem')-.05;const s=$('#st1');if(s)s.style.transform=`rotate(-30deg) scaleX(${P(t,a,.3)})`;
  pop($('#r1'),t,WW('real')-.15,.45);window.SHK=t>a+.3&&t<a+.5?10:0}),
/* 2  Três meses antes, a geladeira dela tava cheia de bolo e o celular, mudo. */
SC(2,'blue',()=>cozinha('k2')+cardIcone('tm2',60,600,'clock','3 MESES ANTES','#7EB2FF',40)+e1geladeira('gl2',90,700)
 +celular('ph2',640,720,280,`<div style="padding:70px 20px;text-align:center;color:#6B7280;font:800 26px Inter">${ic('bell',90,'#CBD5E1')}<div style="margin-top:20px">Nenhuma<br>mensagem</div></div>`,'#F8FAFC')
 +LU('lu2',560,1150,{w:300,mood:'sad',pose:'phone',prop:'phone'}),
 t=>{life('lu2',t);slideX($('#tm2'),t,.05,.4,-500);const g=WW('geladeira')-.2;pop($('#gl2'),t,g,.45);for(let k=0;k<6;k++)pop($('#gl2b'+k),t,WW('cheia')-.1+k*.06,.3);
  const c=WW('celular')-.15;rise($('#ph2'),t,c,.45,120);if(t>WW('mudo')-.1){setMood('lu2','worried');headTilt('lu2',Math.sin(t*3)*4)}}),
/* 3  A Dona Neide, a mãe dela, já falava em vender a batedeira. */
SC(3,'purple',()=>cozinha('k3')+bubble('bb3',300,640,620,'Lu, bora vender essa batedeira?','bl')
 +`<div class="abs" id="tg3" style="left:120px;top:880px"><div class="ticket" style="padding:22px 30px;transform:rotate(-6deg)"><div class="lbl">Batedeira</div><div class="big" style="font-size:64px">VENDE-SE</div></div></div>`
 +NEIDE('ne3',160,1120,{w:320,pose:'point',mood:'worried'})+LU('lu3',620,1140,{w:290,mood:'sad'}),
 t=>{life('ne3',t);life('lu3',t,1);pop($('#bb3'),t,WW('neide')-.1,.4);drop($('#tg3'),t,WW('batedeira')-.25,.5,-600,-6);if(t>WW('vender'))headTilt('lu3',-6)}),
/* 4  Aí a Lu mudou uma coisa só. Parou de postar foto de bolo pronto. */
SC(4,'marca',()=>celular('ph4',330,640,300,`<div style="padding:24px 18px"><div style="font:800 26px Inter;color:#111827">Feed</div><div id="pf4" style="margin-top:14px;height:320px;border-radius:18px;background:#FCE7F3;display:flex;align-items:center;justify-content:center">${e1bolo(220)}</div><div style="font:700 22px Inter;color:#9CA3AF;margin-top:12px">3 curtidas</div></div>`,'#fff')
 +`<div class="abs" id="x4" style="left:345px;top:720px;opacity:0">${ic('x',260,'#F04444')}</div>`+cardIcone('um4',24,600,'bolt','1 coisa só','#FACC15',36)
 +LU('lu4',640,1150,{w:300,pose:'pointL',mood:'smile'}),
 t=>{life('lu4',t);pop($('#um4'),t,WW('coisa')-.2,.4);rise($('#ph4'),t,.05,.45,140);const a=WW('parou')-.1;pop($('#x4'),t,a,.35);if(t>a)setMood('lu4','happy')}),
/* 5  E começou a mostrar o bastidor. A massa, o forno, a entrega. */
SC(5,'orange',()=>cozinha('k5')+[['sparkle','A massa','#FDE68A'],['fire','O forno','#FB923C'],['send','A entrega','#7EB2FF']].map((c,k)=>cardIcone('c5'+k,90+k*40,620+k*150,c[0],c[1],c[2],46)).join('')
 +LU('lu5',640,1130,{w:300,pose:'hold',mood:'happy'})+RAFA('rf5',160,1150,{w:280,pose:'phone',prop:'phone',mood:'smile'}),
 t=>{life('lu5',t);life('rf5',t,1);['massa','forno','entrega'].forEach((w,k)=>slideX($('#c5'+k),t,WW(w)-.2,.4,-700))}),
/* 6  O Rafa, o irmão, filmava tudo com o celular na mão. */
SC(6,'blue',()=>salaFundo('s6',{led:'#EC4899'})+`<div class="abs" id="rec6" style="left:600px;top:640px"><span class="chip r" style="font-size:40px">${ic('live',30,'currentColor')}REC</span></div>`
 +celular('ph6',600,760,250,`<div style="position:absolute;inset:0;background:linear-gradient(160deg,#FBCFE8,#F9A8D4);display:flex;align-items:center;justify-content:center">${e1bolo(190,'#fff')}</div>`)
 +RAFA('rf6',190,1110,{w:340,pose:'phone',prop:'phone',mood:'happy'}),
 t=>{life('rf6',t);slideX($('#rf6W'),t,.02,.4,-500);pop($('#rec6'),t,WW('filmava')-.15,.35);const r=$('#rec6');if(r&&t>WW('filmava'))r.style.opacity=(Math.floor(t*2.5)%2)?1:.35;
  rise($('#ph6'),t,WW('celular')-.2,.45,120)}),
/* 7  No primeiro vídeo, 120 comentários. */
SC(7,'pink',()=>numeroGrande('n7',90,640,900,'0','COMENTÁRIOS','#fff',220)+hearts('h7',10,820,1180,'#F43F5E',60)+LU('lu7',390,1130,{w:300,pose:'up',mood:'wow'}),
 t=>{life('lu7',t);const a=WW('120')-.3;pop($('#n7'),t,a,.4);cnt('n7n',t,a,.8,0,120);heartsUp('h7',10,t,a,300);if(t>a+.6)setMood('lu7','happy')}),
/* 8  E todo mundo perguntando a mesma coisa: quanto custa? */
SC(8,'purple',()=>[['Ana','quanto custa?','#3D8BFF'],['Bia','qual o valor?','#22C55E'],['Carla','quanto custa?','#A855F7'],['Dani','faz pra sábado?','#F97316']].map((c,k)=>e1cmt('cm8'+k,[60,300,100,260][k],610+k*120,c[0],c[1],c[2])).join('')
 +LU('lu8',390,1150,{w:300,mood:'wow'}),
 t=>{life('lu8',t);for(let k=0;k<4;k++)slideX($('#cm8'+k),t,WW('perguntando')-.3+k*.25,.4,k%2?700:-700);headTilt('lu8',Math.sin(t*4)*5)}),
/* 9  A Lu respondeu com um cardápio no direct. Foto, sabor e preço. */
SC(9,'marca',()=>e1menu('mn9',150,600,780)+LU('lu9',650,1170,{w:280,pose:'phone',prop:'phone',mood:'happy'}),
 t=>{life('lu9',t);rise($('#mn9'),t,WW('cardápio')-.25,.45,160);
  const hl=(id,w)=>{const e=$(id);if(e)e.style.boxShadow=t>WW(w)-.1?'0 0 0 5px '+COR.marca:'none'};
  for(let k=0;k<3;k++){hl('#mn9f'+k,'foto');const s=$('#mn9s'+k);if(s)s.style.color=t>WW('sabor')-.1?COR.marca:'#6B7280';const p=$('#mn9p'+k);if(p)p.style.color=t>WW('preço')-.1?'#16A34A':'#111827'}}),
/* 10 Em uma semana, a agenda de sábado lotou. */
SC(10,'green',()=>e1agenda('ag10',120,620,840)+`<div class="abs" id="lt10" style="left:330px;top:960px"><span class="chip g" style="font-size:60px;padding:18px 40px">${ic('check',56,'currentColor')}LOTADO</span></div>`
 +LU('lu10',390,1160,{w:300,pose:'up',mood:'happy'})+confetti('cf10',26),
 t=>{life('lu10',t);rise($('#ag10'),t,.05,.45,120);e1agendaUp('ag10',t,WW('agenda'));const l=WW('lotou')-.1;pop($('#lt10'),t,l,.45,-4);confUp('cf10',26,t,l,560,1300)}),
/* 11 A Dona Neide parou de falar da batedeira. Agora ela cuida do caixa. */
SC(11,'orange',()=>pixCard('px11',600,640,380,'gerado')+bills('bi11',6,250,1000)+NEIDE('ne11',150,1110,{w:330,mood:'happy',pose:'hold',glasses:'#111827'}),
 t=>{life('ne11',t);const c=WW('agora')-.2;pop($('#px11'),t,c,.45);if(t>WW('caixa')-.1)pixSet('px11','aprovado');billsUp('bi11',6,t,WW('parou')-.1,420,-460)}),
/* 12 Comenta CARDÁPIO, que eu te mando no direct, o modelo de cardápio que a Lu usa. */
SC(12,'marca',()=>cmtBox('cm12',100,640,880)+e1menu('mn12',230,820,620)+LU('lu12',80,1180,{w:260,pose:'point',mood:'happy'}),
 t=>{life('lu12',t);rise($('#cm12'),t,.02,.35,60);cmtType('cm12',t,WW('cardápio'),CAP_W);rise($('#mn12'),t,WW('direct')-.1,.45,200)}),
/* 13 No próximo capítulo, chega uma encomenda de 200 docinhos. Pra amanhã. */
SC(13,'red',()=>notif('nt13',110,620,860,'Nova encomenda','200 docinhos · entrega amanhã','cart','#EC4899')+relogio('rl13',420,820,240)
 +LU('lu13',140,1130,{w:300,mood:'wow'})+NEIDE('ne13',640,1130,{w:300,mood:'worried'}),
 t=>{life('lu13',t);life('ne13',t,1);slideX($('#nt13'),t,WW('encomenda')-.25,.4,700);const a=WW('amanhã')-.2;pop($('#rl13'),t,a,.4);
  const m=$('#rl13m');if(m)m.setAttribute('transform',`rotate(${(t*360)%360})`);if(t>a)headTilt('ne13',Math.sin(t*5)*5)}),
/* 14 cartela final (sem fala) */
cartelaFinal(14)
];
