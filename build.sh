#!/bin/sh
# Erzeugt index.html (eigenständige Seite, z. B. für GitHub Pages)
# aus verkaufsgespraech.html (Inhalt der Claude-Artifact-Seite).
set -e
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%%}</style>\n</head>\n<body>\n'
  printf '<noscript><div style="margin:16px;padding:16px;border:2px solid #b5352a;border-radius:12px;font:16px/1.5 system-ui,sans-serif;background:#fff;color:#18202b"><b>Die Übung läuft hier nicht.</b> Diese Vorschau führt keine Programme aus. Bitte den Link zur Übung in Safari öffnen (z.&nbsp;B. per AirDrop von der Lehrkraft) oder die Datei über „Teilen“ in einem Browser öffnen.</div></noscript>\n'
  cat verkaufsgespraech.html
  printf '\n</body>\n</html>\n'
} > index.html
echo "index.html erzeugt"
