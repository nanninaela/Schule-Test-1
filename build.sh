#!/bin/sh
# Erzeugt eigenständige Seiten (z. B. für GitHub Pages) aus den
# Quellen der Claude-Artifact-Seiten:
#   verkaufsgespraech.html          -> index.html
#   lf10-kundenvielfalt/uebung.html -> lf10-kundenvielfalt/index.html
set -e
cd "$(dirname "$0")"
build() {
  {
    printf '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%%}</style>\n</head>\n<body>\n'
    printf '<noscript><div style="margin:16px;padding:16px;border:2px solid #b5352a;border-radius:12px;font:16px/1.5 system-ui,sans-serif;background:#fff;color:#18202b"><b>Die Übung läuft hier nicht.</b> Diese Vorschau führt keine Programme aus. Bitte den Link zur Übung in Safari öffnen (z.&nbsp;B. per AirDrop von der Lehrkraft) oder die Datei über „Teilen“ in einem Browser öffnen.</div></noscript>\n'
    cat "$1"
    printf '\n</body>\n</html>\n'
  } > "$2"
  echo "$2 erzeugt"
}
build verkaufsgespraech.html index.html
build lf10-kundenvielfalt/uebung.html lf10-kundenvielfalt/index.html
