#!/usr/bin/env bash
# Liga a skill "videos-animados" no Claude Code e no Codex e instala o motor.
#   bash install.sh               -> skill + motor
#   bash install.sh --voz-gratis  -> skill + motor + voz grátis no computador
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL="$REPO/skills/videos-animados"

for destino in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  mkdir -p "$destino"
  alvo="$destino/videos-animados"
  if [ -L "$alvo" ] || [ ! -e "$alvo" ]; then
    ln -sfn "$SKILL" "$alvo"
  else
    echo "Já existe uma pasta $alvo que não é desta instalação. Renomeie ou apague e rode de novo."; exit 1
  fi
  echo "skill ligada em $alvo"
done

bash "$SKILL/motor/instalar.sh" "$@"

echo
echo "Pronto. Feche e abra de novo o Claude Code e o Codex."
echo "Depois, numa pasta vazia, peça: \"quero criar meus vídeos animados\"."
