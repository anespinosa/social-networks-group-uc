#!/bin/bash
set -euo pipefail
export PATH="$HOME/.local/quarto/bin:$PATH"
cd "$(dirname "$0")"

rm -rf _site
cp shared/hero-network.js en/hero-network.js
cp shared/hero-network.js es/hero-network.js
cp shared/nav-drawer.js en/nav-drawer.js
cp shared/nav-drawer.js es/nav-drawer.js
cp shared/diplomado-network-animated.js en/diplomado-network-animated.js
cp shared/diplomado-network-animated.js es/diplomado-network-animated.js
cp shared/consultancy-network-animated.js en/consultancy-network-animated.js
cp shared/consultancy-network-animated.js es/consultancy-network-animated.js
cp shared/ux-enhance.js en/ux-enhance.js
cp shared/ux-enhance.js es/ux-enhance.js
cp shared/publications.js en/publications.js
cp shared/publications.js es/publications.js
cp shared/img/favicon.svg en/favicon.svg
cp shared/img/favicon.svg es/favicon.svg
cp shared/img/og-image.png en/og-image.png
cp shared/img/og-image.png es/og-image.png
mkdir -p en/img/team es/img/team en/img/partners es/img/partners en/img/brand es/img/brand
cp shared/img/team/*.jpg en/img/team/
cp shared/img/team/*.jpg es/img/team/
cp shared/img/partners/*.svg en/img/partners/
cp shared/img/partners/*.svg es/img/partners/
cp shared/img/brand/*.png en/img/brand/
cp shared/img/brand/*.png es/img/brand/
cp shared/img/*-network.svg en/img/
cp shared/img/*-network.svg es/img/

(cd en && quarto render && rm -f _quarto_internal_scss_error.scss)
(cd es && quarto render && rm -f _quarto_internal_scss_error.scss)
cp root-index.html _site/index.html

echo "Built site at $(pwd)/_site — open _site/index.html to preview."
