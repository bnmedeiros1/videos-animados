# Biblioteca de componentes

Tudo abaixo já está carregado na página. Coordenadas em pixels numa tela de 1080x1920. Funções com `(id,x,y,…)` devolvem HTML para pôr no `html` da cena; as que terminam em `Up`, `In`, `Set` ou `Em` animam no `up(t)`.

Cores: use `COR.marca`, `COR.clara`, `COR.escura` (a cor do perfil) e `var(--or)` no CSS. `MARCA.nome`, `MARCA.sigla` e `MARCA.perfil` têm os dados do perfil. `CAP_N`, `CAP_T` e `CAP_W` são o número, o título e a palavra do CTA do capítulo.

## Personagens

O elenco do `elenco.json` vira uma função por personagem: `LU(id,x,y,o)`, `NEIDE(id,x,y,o)`… e `PROTAGONISTA(id,x,y,o)`.

Opções de `o` (todas opcionais):

| Opção | Valores |
|---|---|
| `w` | largura (300 = padrão; altura ≈ 1,9 × w) |
| `pose` | `idle`, `phone`, `wave`, `up` (braços pra cima), `hugR`, `point` (aponta à direita), `pointL` (à esquerda), `hold` (segura algo na frente), `down`, `hug`, `mug` |
| `mood` | `happy`, `smile`, `sad`, `wow`, `worried` |
| `prop` | `phone`, `wallet`, `mug`, `marker` (na mão) |
| `tear` | `true` = lágrima |
| `glasses`, `shades`, `headset`, `earrings`, `beard`, `mustache`, `chain` | acessórios por cena (os fixos vêm do elenco) |

Animação do personagem `id`:

| Função | Faz |
|---|---|
| `life(id,t,seed)` | respira e pisca (chame em todo quadro) |
| `setMood(id,'wow')` | troca a expressão |
| `setArm(id,'R',x,y,curva)` | posiciona a mão direita (ou `'L'`) num ponto do desenho (400 de largura) |
| `wave(id,t,a)` | acena a partir do segundo `a` |
| `headTilt(id,graus)` | inclina a cabeça |
| `walk(id,t,a,d,x0,x1)` | anda de `x0` a `x1` (deslocamento relativo) |
| `bracosCruzados(id)` | braços cruzados |

Plateia: `mini(id,x,y,escala,i,cinza)` desenha uma pessoa pequena (varie `i` para mudar cor de pele e roupa).

## Cenários (fundo inteiro, primeiro item do html)

| Função | Cena |
|---|---|
| `cozinha(p)` | cozinha com azulejo e bancada |
| `salaFundo(p,{led:'#A855F7'})` | sala de casa com TV e luz de LED |
| `living(p)` | sala com sofá e TV |
| `room(p,{night:true,desk:true})` + `roomUp(p,t,{night:true})` | quarto (noite com estrelas, mesa com computador) |
| `sky(p,corTopo,corBase)` | céu em degradê |

`p` é um prefixo único da cena (ex.: `'k2'`).

## Telas e aparelhos

| Função | O que é |
|---|---|
| `celular(id,x,y,w,html,fundo)` | celular com tela livre (o html vai dentro) |
| `phoneBox(id,x,y,w,h,html,fundo)` | celular com altura livre |
| `story(id,x,y,w,html)` + `stickerStory(w,'Participar')` | story com figurinha |
| `phoneFeed(id,x,y,w,{handle,post})` | celular com um post patrocinado genérico |
| `laptop(id,x,y,w,h,html)` / `monitor(id,x,y,w,h,html)` | notebook / monitor com tela livre |
| `gerUI(id,{rows})` | painel de anúncios genérico (para dentro de laptop/monitor) |
| `kpiL(rótulo,valor,cor,id)` / `kpiD(...)` | cartão de número (claro / escuro) para telas |
| `live(id,x,y,w,h,html,'42 mil')` | tela de live com "AO VIVO" e visualizações |
| `conversa(id,x,y,w,título,[[nome,cor,texto],…])` | conversa de chat (cada mensagem tem id `id+'m'+k`) |
| `notif(id,x,y,w,título,sub,ícone,cor)` | notificação no topo do celular |
| `dedo(id)` + `dedoEm(id,t,a,x,y)` | dedo tocando a tela no ponto (x,y) |
| `ctaAd(id,x,y,w,título)` + `ctaTap(id,t,a)` | botão "Saiba mais" de anúncio sendo tocado |

## Números, selos e cartões

| Função | O que é |
|---|---|
| `numeroGrande(id,x,y,w,'0','RÓTULO',cor,tam)` + `cnt(id+'n',t,a,d,0,120)` | número enorme contando |
| `bigTxt(id,x,y,'R$ 0',cor,tam,larguraCentralizada)` | texto gigante com brilho |
| `cardIcone(id,x,y,ícone,'texto',cor,tam)` | cartão com ícone e texto |
| `selo(id,x,y,tam)` + `stampIn(id,t,a)` | carimbo redondo com a sigla da marca batendo na tela |
| `marcaTag(id,x,y,tam)` | ícone da marca com o nome embaixo |
| `metaTag`, `igTag` `(id,x,y,tam)` | selos genéricos de anúncio e de rede social (sem logo oficial) |
| `evt(id,x,y,'Compra',cor,ícone)` | pílula de evento |
| `badge(id,x,y,true,tam)` | círculo verde com ✓ (ou vermelho com ✗ se `false`) |
| `pixCard(id,x,y,w,'gerado')` + `pixSet(id,'aprovado')` | cartão de PIX com QR (estados `gerado`, `aprovado`, `nunca`) |
| `canal(id,x,y,ícone,'Story',cor,'12',w)` | cartão de canal com contador |
| `cotas(id,x,y,w,0,'Progresso')` + `cotasSet(id,0.7)` | barra de progresso |
| `slider(id,x,y,w,'Verba diária','R$ 500')` + `sliderSet(id,p,valor)` | controle deslizante |
| `lineChart(id,x,y,w,h,[pontos 0-1],cor,título)` + `chartUp(id,t,a,d)` | gráfico de linha se desenhando |
| `flow(id,x1,y1,x2,y2,cor,curva)` + `flowUp(id,t,a)` | seta animada |
| `balloon(id,x,y,'texto',cor,tam)` | balão que infla |
| `bubble(id,x,y,w,'texto','bl')` | balão de fala (ponta `bl`, `br` ou nenhuma) |
| `relogio(id,x,y,tam)` | relógio (gire `id+'m'` para correr o tempo) |
| `avatar('A',cor,tam)` | bolinha com inicial |
| `boleto(id,x,y,w,'rótulo','R$ 90',cor)` | boleto "vence hoje" |
| `qrSVG(tam,semente,cor)` | QR code genérico |
| `receipt(id,x,y)` | notinha |

## Objetos e efeitos

| Função | O que é |
|---|---|
| `confetti(id,n)` + `confUp(id,n,t,a)` | chuva de confete |
| `hearts(id,n,x,y,cor,tam)` + `heartsUp(id,n,t,a,altura)` | corações subindo |
| `bills(id,n,x,y)` + `billsUp(id,n,t,a,dx,dy)` | notas de dinheiro voando |
| `presente(id,x,y,tam,cor)` + `presenteAbre(id,t,a)` | caixa de presente abrindo |
| `raspadinha(id,x,y,w,'prêmio')` + `raspadinhaUp(id,t,a,d)` | raspadinha sendo raspada |
| `escada(id,x,y,w,h,[rótulos])` + `escadaSet(id,n,w,h,degrau,aceso)` | escada de degraus |
| `wheelSVG(id,raio)` | roleta (gire o elemento) |
| `motoSVG(w,cor)`, `carroSVG(w,cor)`, `casaSVG(w,cor)`, `bulbSVG(id)` | moto, carro, casa, lâmpada |

## Ícones

`ic(nome,tam,cor)` desenha um ícone; `icb(nome,tam,cor,fundo)` desenha o ícone dentro de um quadrado arredondado.

Nomes: eye cursor chat check x link user chart pixel phone send cart megaphone bolt plug heart bell target ticket qr pause eyeoff clock trophy server globe wifi cal lock crown star sparkle live refresh win dollar down up story group bio fire.

## Classes CSS prontas

`card` (cartão escuro), `chip g|r|y|b|o|m` (pílula verde, vermelha, amarela, azul, laranja, cinza), `big` (número grande), `lbl` (rótulo cinza), `ttl` (título), `ticket` (papel claro), `stamp` (carimbo), `icbox`, `mono`, `abs` (posição absoluta).
