#!/usr/bin/env bash
# Instala o que o motor dos vídeos animados precisa (Mac e Linux).
#   bash instalar.sh               -> ambiente Python, navegador de render e modelos de fala (~750 MB, uma vez só)
#   bash instalar.sh --voz-gratis  -> o mesmo + a voz grátis no computador (Kokoro, ~120 MB)
set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DADOS="${VIDEOS_ANIMADOS_HOME:-$HOME/.videos-animados}"
MOD="$DADOS/modelos"
VENV="$DADOS/venv"
VOZ_GRATIS=0
for a in "$@"; do [ "$a" = "--voz-gratis" ] && VOZ_GRATIS=1; done
mkdir -p "$MOD"

echo "== Python"
PY="$(command -v python3 || true)"
if [ -z "$PY" ]; then
  echo "Falta o Python 3. Mac: brew install python | Linux: sudo apt install python3 python3-venv"; exit 1
fi
"$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' || { echo "Precisa do Python 3.10 ou mais novo."; exit 1; }

echo "== ffmpeg"
if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install ffmpeg
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get install -y ffmpeg
  else echo "Instale o ffmpeg e rode de novo (https://ffmpeg.org/download.html)."; exit 1; fi
fi

echo "== ambiente Python em $VENV"
[ -x "$VENV/bin/python" ] || "$PY" -m venv "$VENV"
"$VENV/bin/python" -m pip install -q --upgrade pip
"$VENV/bin/python" -m pip install -q numpy soundfile pillow sherpa-onnx playwright
[ "$VOZ_GRATIS" = 1 ] && "$VENV/bin/python" -m pip install -q kokoro-onnx

echo "== navegador de render"
if ! "$VENV/bin/python" -m playwright install chromium; then
  echo "AVISO: não consegui baixar o navegador do Playwright. O motor usa o Google Chrome do computador, se tiver."
fi
# Linux sem as bibliotecas do navegador: rode uma vez  sudo "$VENV/bin/python" -m playwright install-deps chromium

baixa() {  # baixa(url, destino): retoma se cair, só troca o arquivo quando termina
  local url="$1" dest="$2"
  [ -s "$dest" ] && return 0
  echo "baixando $(basename "$dest")…"
  curl -fL --retry 3 -C - --progress-bar -o "$dest.parcial" "$url"
  mv "$dest.parcial" "$dest"
}
R=https://github.com/k2-fsa/sherpa-onnx/releases/download

echo "== modelos de fala em $MOD"
if [ ! -f "$MOD/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/encoder.int8.onnx" ]; then
  baixa "$R/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2" "$MOD/parakeet.tar.bz2"
  tar -xjf "$MOD/parakeet.tar.bz2" -C "$MOD" && rm -f "$MOD/parakeet.tar.bz2"
fi
if [ ! -f "$MOD/sherpa-onnx-whisper-base/base-encoder.int8.onnx" ]; then
  baixa "$R/asr-models/sherpa-onnx-whisper-base.tar.bz2" "$MOD/whisper.tar.bz2"
  tar -xjf "$MOD/whisper.tar.bz2" -C "$MOD" && rm -f "$MOD/whisper.tar.bz2"
  find "$MOD/sherpa-onnx-whisper-base" -type f ! -name 'base-encoder.int8.onnx' ! -name 'base-decoder.int8.onnx' ! -name 'base-tokens.txt' -delete 2>/dev/null || true
fi
baixa "$R/speaker-recongition-models/wespeaker_en_voxceleb_resnet34.onnx" "$MOD/wespeaker_en_voxceleb_resnet34.onnx"

if [ "$VOZ_GRATIS" = 1 ]; then
  echo "== voz grátis (Kokoro)"
  mkdir -p "$MOD/kokoro"
  K=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
  baixa "$K/kokoro-v1.0.int8.onnx" "$MOD/kokoro/kokoro-v1.0.int8.onnx"
  baixa "$K/voices-v1.0.bin" "$MOD/kokoro/voices-v1.0.bin"
fi

echo "== conferindo"
"$VENV/bin/python" "$AQUI/video.py" verificar
