#!/bin/sh
# Erzeugt index.html (eigenständige Seite, z. B. für GitHub Pages)
# aus verkaufsgespraech.html (Inhalt der Claude-Artifact-Seite).
set -e
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%%}</style>\n</head>\n<body>\n'
  cat verkaufsgespraech.html
  printf '\n</body>\n</html>\n'
} > index.html
echo "index.html erzeugt"
