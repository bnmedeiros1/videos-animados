---
name: videos-animados
description: Cria vídeos animados narrados para Reels (1080x1920, ~1min30) com personagens fixos, legenda sincronizada e CTA de comentário, no formato novela em capítulos ou anúncio. Use quando a pessoa pedir vídeo animado, novela, capítulo, Reels narrado com bonequinhos, ou quiser configurar os personagens e o nicho dela.
---

# Vídeos animados narrados

Esta skill faz vídeos verticais para Reels e TikTok em que ninguém aparece na câmera. Uma voz narra uma história curta, os personagens e as telas mudam a cada frase, e a legenda acompanha a palavra que está sendo falada. O vídeo fecha com um CTA de comentário ("Comenta PALAVRA, que eu te mando no direct…").

Responda sempre em português do Brasil. Fale com a pessoa em linguagem simples: ela não precisa saber o que é Playwright, JSON ou ffmpeg. Mostre o roteiro, a folha de cenas e o vídeo final; o resto é bastidor.

`SKILL` abaixo é a pasta onde está este arquivo. O motor fica em `SKILL/motor/video.py`.

## 0. Instalação (uma vez por computador)

1. Rode `python3 SKILL/motor/video.py verificar`.
2. Se faltar algo, rode `bash SKILL/motor/instalar.sh` (Mac e Linux). Ele cria um ambiente próprio em `~/.videos-animados`, instala o navegador de render e baixa os modelos de fala (cerca de 750 MB, uma vez só). Avise a pessoa que o download demora alguns minutos.
3. Sem ffmpeg: no Mac, `brew install ffmpeg`; no Windows, `winget install ffmpeg`; no Linux, `sudo apt install ffmpeg`.
4. Voz grátis no computador (opcional): `bash SKILL/motor/instalar.sh --voz-gratis`.

No Windows, use o WSL (Ubuntu) ou peça para a pessoa instalar Python 3.10+ e ffmpeg e rode os mesmos passos do `instalar.sh` à mão.

## 1. Projeto

Os vídeos da pessoa ficam numa pasta de projeto. O padrão é `videos-animados/` dentro da pasta em que ela está trabalhando; use outra só se ela pedir.

```
videos-animados/
  perfil.json          marca, nicho, público, oferta, CTA e voz (sai do questionário)
  elenco.json          os personagens (sai do questionário)
  elenco.jpg           prévia do elenco
  episodios/
    01-titulo-curto/
      roteiro.json     a fala de cada cena (você escreve)
      cenas.js         a animação de cada cena (você escreve)
      narracao_bruta.* a narração inteira, numa gravação só
      build/           tudo que o motor gera (página, folhas, legenda, conferência)
  prontos/             os MP4 finais
```

Se a pasta ainda não tem `perfil.json`, comece pelo questionário.

## 2. Questionário (primeira vez)

Siga `SKILL/questionario.md`. Pergunte em blocos curtos, não tudo de uma vez. Com as respostas, escreva `perfil.json` e `elenco.json` no formato de `SKILL/exemplo/` e rode:

```
python3 SKILL/motor/video.py elenco videos-animados
```

Abra `videos-animados/elenco.jpg`, olhe cada personagem e mostre a imagem para a pessoa aprovar o visual antes do primeiro capítulo. Ajuste cor, cabelo e acessórios até ela gostar.

## 3. Cada vídeo

1. **Roteiro.** Leia `SKILL/referencias/roteiro.md` e escreva `episodios/NN-titulo/roteiro.json`. Mostre o texto corrido para a pessoa aprovar antes de gastar voz. Depois rode `video.py preparar EP` e resolva todo `AVISO:`.
2. **Cenas.** Leia `SKILL/referencias/direcao.md` e `SKILL/referencias/componentes.md` e escreva `cenas.js`, uma cena por fala, mais a cartela final. Use `SKILL/exemplo/episodios/01-a-primeira-encomenda/cenas.js` como modelo.
3. **Conferir as cenas.** Rode `video.py folha EP 0.85` e `video.py folha EP 0.35`. Abra as duas folhas (imagens) e olhe quadro por quadro: nada cortado na borda, nada em cima do rosto, personagem certo, texto legível, cena coerente com a fala. Corrija e repita. A folha também lista erros de JavaScript, ids repetidos e palavras de `WW()` que não existem na legenda: tudo isso tem que zerar.
4. **Voz.** Leia `SKILL/referencias/voz.md`. Gere ou receba a narração inteira numa gravação só:
   - voz da ElevenLabs, OpenAI ou grátis: `video.py voz EP`;
   - voz gravada pela pessoa, ou de qualquer outro gerador: `video.py voz EP --arquivo caminho/do/audio`.
5. **Alinhar.** `video.py alinhar EP` corta os silêncios, mede cada cena pela fala, faz a legenda e confere a narração (texto, idioma, mesma voz, pausas). Leia `build/conferencia.txt`. Com `ATENÇÃO`, resolva antes de seguir: regravar, gerar de novo ou corrigir a fala da cena apontada. Nunca entregue vídeo com voz trocando de idioma ou de voz no meio.
6. **Conferir de novo.** Com a narração pronta, rode a folha mais uma vez (agora com a legenda real) e um `video.py quadro EP CENA 0.5` nas cenas mais cheias.
7. **Render.** `video.py render EP` grava `prontos/CapNN_Titulo.mp4` e valida o arquivo (1080x1920, H.264, 30 fps, AAC 48 kHz, faststart). Entregue o caminho do MP4 para a pessoa.

`video.py tudo EP` faz montar, alinhar, folha e render de uma vez, e para se a conferência pedir atenção.

## Regras que não mudam

- Uma voz só e um idioma só do começo ao fim de cada vídeo. A narração é gerada ou gravada inteira, de uma vez.
- Na fala, número vai por extenso ("trinta e sete"); na tela, em algarismo ("37"). O nome da marca é escrito sempre igual.
- Cada frase falada é uma cena, e cada elemento da cena entra na palavra falada (`WW('palavra')`). O visual muda a cada 2,5 a 3 segundos.
- Nada de texto de apoio na tela ou na fala: duração do vídeo, "assiste com o som ligado", "exemplo", "dados fictícios", rodapé explicando número.
- Sem logo oficial de Meta, Instagram, WhatsApp, Apple ou qualquer marca de terceiros: use os ícones genéricos da biblioteca.
- Sem nome de cliente real e sem depoimento inventado apresentado como real. A novela é ficção assumida: os personagens são inventados.
- CTA com uma palavra por vídeo, nunca repetida em outro vídeo do mesmo perfil.

## Comandos

| Comando | O que faz |
|---|---|
| `video.py verificar` | confere ffmpeg, pacotes, navegador e modelos |
| `video.py elenco PROJETO` | prévia de cada personagem (`PROJETO/elenco.jpg`) |
| `video.py preparar EP` | lê `roteiro.json`, avisa problemas, escreve `texto_narracao.txt` |
| `video.py montar EP` | gera `build/pagina.html` (feito automaticamente pelos outros comandos) |
| `video.py folha EP [frac]` | folha com todas as cenas no ponto `frac` (0 a 1) + erros |
| `video.py quadro EP CENA FRAC` | um quadro grande de uma cena |
| `video.py voz EP [--arquivo A]` | gera a narração com a voz do perfil, ou usa um áudio pronto |
| `video.py alinhar EP [--tempo 1.1]` | silêncios, duração das cenas, legenda e conferência da voz |
| `video.py render EP` | renderiza e exporta o MP4 para Reels |
| `video.py tudo EP` | montar + alinhar + folha + render |

`EP` é a pasta do episódio (ex.: `videos-animados/episodios/01-a-geladeira-cheia`). Tempo de render: de 2 a 6 minutos por minuto de vídeo, dependendo do computador.
