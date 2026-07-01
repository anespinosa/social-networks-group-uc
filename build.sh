#!/bin/bash
set -euo pipefail
export PATH="$HOME/.local/quarto/bin:$PATH"
cd "$(dirname "$0")"

rm -rf _site
cp shared/hero-network.js en/hero-network.js
cp shared/hero-network.js es/hero-network.js
cp shared/img/favicon.svg en/favicon.svg
cp shared/img/favicon.svg es/favicon.svg
mkdir -p en/img/team es/img/team
cp shared/img/team/*.jpg en/img/team/
cp shared/img/team/*.jpg es/img/team/

(cd en && quarto render && rm -f _quarto_internal_scss_error.scss)
(cd es && quarto render && rm -f _quarto_internal_scss_error.scss)
cp root-index.html _site/index.html

echo "Built site at $(pwd)/_site — open _site/index.html to preview."
