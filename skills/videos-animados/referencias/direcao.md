# Direção de cena (cenas.js)

O `cenas.js` define `const S=[...]` com exatamente uma cena por fala do `roteiro.json`, na mesma ordem, mais a cartela final. O motor junta tudo numa página de 1080x1920 e grava cada cena quadro a quadro.

## Como uma cena funciona

```js
SC(i, tom, () => html, t => { ... })
```

- `i`: o número da cena (0, 1, 2…). Tem que bater com a posição no array.
- `tom`: o fundo (degradê + ícones flutuando): `'marca'` (cor da marca), `'blue'`, `'pink'`, `'orange'`, `'red'`, `'green'`, `'purple'`. Varie o tom de cena para cena; use vermelho para problema, verde para resultado, a cor da marca para abertura e CTA.
- `html`: uma string com os elementos da cena, cada um com `class="abs"` (posição absoluta) e `left/top` em pixels, ou montados com os componentes de `componentes.md`.
- `up(t)`: roda a cada quadro, com `t` = segundos desde o começo da cena. É aqui que tudo se mexe.

`WW('palavra')` devolve o segundo em que a palavra é falada nessa cena. Amarre cada entrada a uma palavra: `pop($('#n0'),t,WW('37')-.15,.4)`. Sem acento, maiúscula ou pontuação faz diferença. Palavra repetida: `WW('bolo',1)` é a segunda vez. Número na tela é algarismo, então `WW('120')`, não `WW('cento')`.

`$('#id')` busca um elemento. Os ids têm que ser únicos na cena: use o número da cena no id (`n0`, `bl02`, `lu7`).

## Obrigatório

- Cena 0: o selo do capítulo, `capBadge('cb0',60,600)` no html e `capBadgeIn('cb0',t,.05)` no up.
- Cena do CTA: `cmtBox('cm12',100,640,880)` + `cmtType('cm12',t,WW('palavra-do-cta'),CAP_W)`, com o protagonista apontando ou comemorando, e o que tu entrega aparecendo na palavra "direct".
- Última cena: `cartelaFinal(i)`, sem mais nada.
- Todo personagem na cena chama `life(id,t)` no up (respira e pisca). Para dois personagens, `life('a',t)` e `life('b',t,1)` (o terceiro número desencontra a piscada).

## Onde cada coisa fica

- **0 a 560 px (topo):** a legenda. Não ponha nada importante aqui.
- **600 a 1100 px:** o conteúdo da cena: número grande, celular, cartão, gráfico, balão.
- **1100 px para baixo:** os personagens, em pé. Um personagem com `w:300` mede 570 px de altura, então `y` entre 1100 e 1180. Dois lado a lado: `x` 140 e 640 com `w:300`; três: `w:260` em `x` 40, 400, 760.
- Nada pode sair dos 1080 px de largura.

Ids reservados do molde, que tu não pode usar: `bg`, `grid`, `g1`, `g2`, `vig`, `stage`, `tag`, `cap`, `vis`, `capbg`.

## Direção

- É novela: cada cena mostra quem está agindo na frase. Quem fala ou faz fica no centro; os outros reagem (humor e pose mudam com a fala: `setMood`, `setArm`, `headTilt`, `wave`).
- Os 3 primeiros segundos são os mais fortes: personagem grande, o número da frase bem grande, ação clara.
- O visual muda a cada cena e cada elemento entra na palavra. Nenhuma cena parada, nenhuma metade de cena vazia: se a palavra-chave vem no fim da frase, ponha outra coisa entrando no começo.
- Quando a história fica no mesmo lugar (cozinha, sala), repita o cenário nas cenas seguidas, mudando enquadramento e elementos.
- Telas (celular, notebook, painel) com dados redondos e genéricos, nome de pessoa mascarado ("Jo•••") quando for comprador.
- Texto na tela: curto, em português, sem frase longa (a frase longa já está na legenda).
- Proibido na tela: duração do vídeo, "assiste com o som", "exemplo", "dados fictícios", rodapé de aviso, logo oficial de qualquer marca, nome de cliente real.
- Componente que não existe na biblioteca: crie dentro do `cenas.js` com o prefixo do episódio (`e1bolo`, `e3painel`) para não colidir.

## Animações prontas

| Função | Efeito |
|---|---|
| `pop(el,t,a,d,r)` | aparece crescendo (com leve quique) no segundo `a`, durando `d` |
| `rise(el,t,a,d,dist)` | sobe `dist` px aparecendo |
| `drop(el,t,a,d,dist)` | cai de cima |
| `slideX(el,t,a,d,dist)` | entra pela lateral (dist negativa = esquerda) |
| `show(id,t,a,d,modo)` / `hide(id,t,a,d)` | atalhos por id (modo 'pop' ou 'rise') |
| `cnt(id+'n',t,a,d,de,ate,suf,pre)` | número contando (use com `numeroGrande`, que cria o id `id+'n'`) |
| `fly(id,t,a,d,x0,y0,x1,y1,arco)` | voa de um ponto a outro em arco |
| `walk(id,t,a,d,x0,x1)` | personagem anda na horizontal |
| `shakeEl(id,t,a,d,amp)` / `window.SHK=10` | treme o elemento / a tela inteira |
| `P(t,a,d,EZ.out)` | progresso de 0 a 1 entre `a` e `a+d`, para animações próprias |
| `T(el,{x,y,s,r,o})` | aplica posição, escala, rotação e opacidade |

## Conferir

1. `video.py folha EP 0.85` e `video.py folha EP 0.35`: abra as imagens e olhe cada quadro.
2. A folha imprime `ERROS NA PÁGINA`, `IDS REPETIDOS` e `PALAVRAS QUE NÃO ESTÃO NA LEGENDA`: zere tudo.
3. `video.py quadro EP CENA 0.6` para ver uma cena em tamanho real.
4. Depois do `alinhar`, rode a folha de novo: agora cada cena tem a duração e a legenda reais.

Problemas comuns: elemento que só aparece no último instante (amarre numa palavra do começo); personagem cortado embaixo (`y` maior que 1200); texto do card estourando a largura (`white-space:nowrap` com card estreito); dois elementos no mesmo lugar ao mesmo tempo.
