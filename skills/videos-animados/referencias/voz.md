# Voz

A narração é sempre uma gravação só, do texto inteiro (`texto_narracao.txt`, gerado pelo `preparar`). Gerar frase por frase faz a voz, o ritmo e às vezes o idioma mudarem no meio. O `alinhar` corta a gravação em cenas depois.

## Os caminhos

**Voz da própria pessoa (`"via": "arquivo"`).** Ela grava no celular e te passa o arquivo (m4a, mp3, wav). Dicas para mandar junto do texto:
- lugar silencioso, celular a um palmo da boca, sem fone com microfone;
- ler tudo de uma vez, no ritmo de quem conta uma fofoca boa, sem pausa longa entre as frases (as pausas longas o motor corta, mas o ritmo fica melhor);
- errou? Volta pro começo da frase e repete; depois avise, porque a frase repetida aparece na conferência e precisa ser cortada (ou grave de novo).

Depois: `video.py voz EP --arquivo caminho/do/audio`.

**ElevenLabs (`"via": "elevenlabs"`).** A pessoa cria a chave em elevenlabs.io e deixa na variável `ELEVENLABS_API_KEY` (nunca no `perfil.json`). No perfil vai o `voice_id` da voz escolhida. Modelo padrão `eleven_multilingual_v2`; mude em `voz.modelo` se ela preferir outro.

**OpenAI (`"via": "openai"`).** Chave em `OPENAI_API_KEY`. Modelo padrão `gpt-4o-mini-tts`, voz em `voice_id` (ex.: `ash`, `coral`, `sage`). A instrução de estilo pode ir em `voz.instrucoes` (o padrão já pede português do Brasil, animado).

**Grátis no computador (`"via": "kokoro"`).** Instale com `bash motor/instalar.sh --voz-gratis`. Vozes em português: `pf_dora` (feminina), `pm_alex` e `pm_santa` (masculinas). `voz.velocidade` de 1.0 a 1.2. Sotaque sintético: bom para testar o vídeo antes de pagar voz, fraco para publicar.

**Outro gerador (Higgsfield, CapCut, qualquer app).** Gere o texto inteiro numa geração só, com a mesma voz, baixe o arquivo e use `--arquivo`.

## Antes de gerar

- Confira se o texto está aprovado: voz paga gasta crédito a cada geração.
- Vírgula depois de "direct" no CTA.
- Números por extenso no texto (o `preparar` avisa se sobrou algarismo).
- Palavra estrangeira ou sigla que a voz pode ler em outro idioma: teste uma frase curta antes de gerar o capítulo inteiro.

## Conferência (o `alinhar` faz sozinho)

- **Texto:** transcreve cada cena e compara com o roteiro. Cena com menos de 80% de semelhança ou com palavras a mais (frase repetida) aparece como `REVER`.
- **Idioma:** confere o idioma de cada cena e de cada trecho de 8 segundos. Um trecho fora de português é motivo para gerar de novo (às vezes só a frase do CTA escorrega; gere de novo só ela com a mesma voz, troque o pedaço no áudio inteiro e rode o `alinhar` de novo).
- **Mesma voz:** compara a voz de cada trecho com o primeiro (e com `voz.referencia`, se o perfil tiver). Abaixo de 0,6 a voz mudou no meio.
- **Pausas:** dentro da fala, nenhuma pausa passa de 0,16 s; entre cenas, só um respiro curto. A cartela final fica muda por 1,5 s.

Com `ATENÇÃO`, não renderize: resolva e rode o `alinhar` de novo.

## Velocidade

`voz.tempo` no perfil (ou `video.py alinhar EP --tempo 1.1`) acelera a narração sem mudar o tom. Para Reels, 1.1 costuma ficar no ponto; acima de 1.2 fica corrido.
