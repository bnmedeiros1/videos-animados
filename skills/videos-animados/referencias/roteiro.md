# Roteiro

Um vídeo tem de 280 a 320 palavras faladas (cerca de 1min30 com a voz a 1,1x). Um anúncio pode ser mais curto, de 150 a 220. Antes de escrever, releia o `perfil.json`: público, dor, desejo, termos do nicho, oferta e tratamento (tu ou você).

## A estrutura (AIDA)

**Atenção (as 2 primeiras frases, 3 segundos).** Comece pelo resultado ou pelo choque, com um número concreto e verdadeiro dentro da história: "A Lu vendeu trinta e sete bolos num sábado." Nada de "Oi, gente", nada de definição, nada de "neste vídeo".

**Interesse (o meio da história).** Volte para o problema em cena: o que o personagem fez, o que deu errado, quem duvidou. Mostre o mecanismo numa frase simples. Um termo técnico do nicho por capítulo, no máximo dois.

**Desejo.** Mostre a vida do personagem depois da virada, com detalhe visível (a agenda lotada, o caixa, a mãe que parou de reclamar). Termine com uma emoção: alívio, orgulho, vingança boa.

**Ação.** O CTA, sempre no formato do perfil: "Comenta PALAVRA, que eu te mando no direct, ENTREGA." Vírgula depois de "direct". Uma palavra por vídeo, sem repetir em outro vídeo. Na novela, feche com o gancho do próximo capítulo (uma frase que deixa uma pergunta aberta).

## O truque do termo técnico

Quando o assunto tem jargão, divida a explicação entre personagens:

1. o especialista fala o termo do jeito técnico ("Teu funil tem conversão baixa no topo.");
2. o protagonista pede "Português." (ou faz cara de quem não entendeu);
3. o tradutor explica com uma imagem do dia a dia ("Muita gente olha a vitrine e pouca entra na loja.").

Isso ensina sem aula e vira piada recorrente da temporada.

## Novela em capítulos

- Elenco fixo, mesmo visual em todos os capítulos.
- Cada capítulo ensina UMA coisa do nicho, dentro de uma cena da vida do personagem.
- O começo de cada capítulo retoma o gancho do anterior em uma frase.
- O conflito vem do defeito do protagonista ou do cético; a solução vem do que tu ensina.
- Arco de 10 capítulos: 1 a 3 o problema e as primeiras vitórias; 4 a 7 o método, cada capítulo uma peça; 8 e 9 a crise (algo dá errado e o método salva); 10 a virada pública.

## Anúncio

Mesmo motor, sem número de capítulo (`"numero": null`). A ordem é gancho com dor ou resultado → o problema em cena → o mecanismo → a prova em tela → o que muda → CTA. Sem gancho de próximo capítulo.

## Regras de escrita

- Frases curtas, jeito de fala. Uma cena = uma frase de 5 a 16 palavras. Frase longa vira duas cenas.
- Na fala, número por extenso ("cento e vinte comentários"); na tela, algarismo ("120 comentários"). Dinheiro: fala "noventa reais", tela "R$ 90".
- Nome da marca sempre escrito igual. Sigla que a voz pode ler errado (ex.: "MKT"), teste antes; se a voz soletrar em outro idioma, troque por uma palavra que ela lê bem.
- Sem aviso genérico ("isso pode variar", "não é garantia"), sem duração do vídeo, sem "comenta aí embaixo" fora do CTA.
- Se o perfil usa "tu", nada de "você", e vice-versa.
- Diálogo pode ("Fala português, Rafa."), mas lido pela mesma voz do narrador: nada de trocar de voz para cada personagem.
- Personagens e números da novela são ficção. Não use nome de cliente real e não apresente número inventado como resultado real da tua empresa.

## Formato do roteiro.json

```json
{
  "numero": 1,
  "titulo": "A geladeira cheia",
  "palavra": "CARDÁPIO",
  "entrega": "o modelo de cardápio que a Lu manda no direct",
  "cenas": [
    {"fala": "A Lu vendeu trinta e sete bolos num sábado.", "tela": "A Lu vendeu 37 bolos num sábado."},
    {"fala": "Sem gastar um real de anúncio."},
    {"fala": "Comenta cardápio, que eu te mando no direct, o modelo de cardápio que a Lu usa.",
     "tela": "Comenta CARDÁPIO, que eu te mando no direct, o modelo de cardápio que a Lu usa."}
  ]
}
```

- `fala` é o que a voz diz. `tela` (opcional) é a legenda, quando muda alguma coisa (número em algarismo, palavra do CTA em maiúsculas). Fora isso, as duas são iguais palavra por palavra.
- `titulo` aparece no selo do capítulo, então até 30 letras.
- A cartela final ("Comenta PALAVRA") é criada sozinha pelo motor. Não coloque no roteiro.
- `numero: null` para anúncio (o selo mostra só o título).

Mostre para a pessoa o texto corrido (o que vai em `texto_narracao.txt`) e espere ela aprovar antes de gerar a voz.
