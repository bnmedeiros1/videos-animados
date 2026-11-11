# Questionário: personagem e nicho

Faça as perguntas em blocos, na ordem abaixo, em conversa normal. Se a pessoa já respondeu alguma coisa antes, não pergunte de novo. Quando ela não souber, sugira 2 ou 3 opções concretas pra ela escolher.

## Bloco 1 · Marca e perfil

1. Qual é o nome do teu perfil ou da tua marca, do jeito que aparece no vídeo?
2. Qual é o @ do perfil?
3. Qual é a cor principal da marca? (código tipo #EC4899, ou o nome da cor, que eu escolho o tom)
4. Uma sigla de até 4 letras para o boné e o selo do vídeo (ex.: LU, MKT, DOC).

## Bloco 2 · Nicho e público

5. O que tu vende ou ensina, numa frase?
6. Quem é o teu cliente ideal? (idade, profissão, momento de vida)
7. Qual é a maior dor dele hoje, nas palavras dele?
8. O que ele quer conseguir? (o resultado que ele pagaria pra ter)
9. O que ele já tentou e não deu certo?
10. Que termos técnicos do teu nicho ele ouve e não entende? (eles viram as cenas de "traduz pra mim")

## Bloco 3 · Oferta e CTA

11. O que tu manda no direct quando a pessoa comenta? (guia, aula, cardápio, planilha, checklist, link de compra)
12. Tu fala "tu" ou "você" com teu público?
13. Tu quer vídeos de novela (personagens fixos, um capítulo por vídeo) ou de anúncio (um vídeo que vende sozinho)? Pode ser os dois.

## Bloco 4 · Personagens

14. Quem é o protagonista? Nome, idade, o que ele quer e qual é o defeito dele (o defeito gera a história).
15. Quem são os coadjuvantes (de 1 a 4)? Sugira papéis que funcionam bem:
    - o cético (duvida de tudo e no fim vira fã);
    - o especialista (fala o termo técnico);
    - o tradutor (explica em português simples);
    - o alívio cômico (quer tudo de graça, sempre atrapalha);
    - o rival (faz do jeito errado e se dá mal).
16. Para cada personagem, o visual:
    - cabelo: boné (com a sigla), curto, cacheado, crespo, maria-chiquinha, longo, coque ou careca;
    - cor do cabelo;
    - pele: clara, média, parda, morena ou negra;
    - roupa: camiseta, moletom ou vestido, com a cor;
    - acessórios: óculos, óculos escuros, fone, brinco, barba, bigode, corrente, cílios, batom;
    - criança ou adulto.

## Bloco 5 · Voz

17. Como tu quer narrar?
    - **Tua voz:** tu grava o texto no celular, numa tacada só, e me manda o áudio. Grátis e com a tua cara.
    - **ElevenLabs:** a voz mais natural em português. Precisa de conta, do ID da voz e da chave em `ELEVENLABS_API_KEY`.
    - **OpenAI:** boa e barata. Precisa da chave em `OPENAI_API_KEY`.
    - **Grátis no computador:** voz sintética (feminina `pf_dora`, masculinas `pm_alex` e `pm_santa`). Serve para testar; para publicar, as outras soam melhor.
    - **Outro gerador** (Higgsfield, CapCut, etc.): gera o texto inteiro numa geração só e me manda o arquivo.
18. Quer a voz um pouco mais rápida? (1,0 = normal; 1,1 = 10% mais rápida, bom para Reels)

## Bloco 6 · Temporada

19. Qual é a grande virada da temporada? (de onde o protagonista sai e aonde ele chega)
20. Que assuntos do teu nicho tu quer ensinar ao longo dos capítulos? Um por capítulo.

Com isso, proponha 10 títulos de capítulo, cada um com o assunto que ensina e a palavra do CTA, e peça para a pessoa aprovar.

## O que gravar

`perfil.json`:

```json
{
  "marca": {"nome": "Doce da Lu", "sigla": "LU", "perfil": "@seu.perfil", "cor": "#EC4899"},
  "nicho": "confeitaria caseira que vende pelo Instagram",
  "publico": "mulheres de 25 a 45 anos que fazem doce em casa",
  "dor": "posta foto de bolo todo dia e ninguém compra",
  "desejo": "agenda de sábado cheia sem gastar com anúncio",
  "tentou": "sorteio, promoção, pagar post de página",
  "termos": ["engajamento", "funil", "lead"],
  "oferta": "cardápio pronto + aulas de venda pelo direct",
  "tratamento": "tu",
  "formato": "novela",
  "cta": {"modelo": "Comenta {PALAVRA}, que eu te mando no direct, {ENTREGA}."},
  "voz": {"via": "elevenlabs", "voice_id": "ID_DA_VOZ", "tempo": 1.1},
  "idioma": "pt",
  "temporada": {"virada": "de geladeira cheia a agenda lotada", "capitulos": []}
}
```

- `voz.via`: `arquivo` (voz gravada ou de outro gerador), `elevenlabs`, `openai` ou `kokoro` (grátis).
- `voz.voice_id`: ID da voz na ElevenLabs; na OpenAI, o nome da voz (ex.: `ash`, `coral`); no grátis, `pf_dora`, `pm_alex` ou `pm_santa`.
- `voz.tempo`: aceleração aplicada no alinhamento, sem mudar o tom (1.0 a 1.2).
- `voz.referencia` (opcional): caminho de um áudio curto com a voz certa, relativo ao projeto. O `alinhar` compara cada trecho com ele.
- Nunca grave chave de API no `perfil.json`: ela fica só na variável de ambiente.

`elenco.json`: veja `exemplo/elenco.json`. O campo `funcao` vira o nome da função no código (ex.: `LU` → `LU(id,x,y,o)`), em maiúsculas e sem espaço. O personagem com `"papel": "protagonista"` vira o `PROTAGONISTA` da cartela final.
