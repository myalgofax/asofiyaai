const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const OUT = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

function makeSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a4d3e"/>
      <stop offset="100%" stop-color="#2d7a62"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <rect width="1024" height="600" rx="200" fill="url(#sheen)"/>

  <!-- Speech bubble body -->
  <rect x="130" y="185" width="620" height="400" rx="90" fill="#ffffff" fill-opacity="0.14"/>
  <rect x="130" y="185" width="620" height="400" rx="90" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="5"/>
  <!-- Bubble tail -->
  <path d="M240 585 L195 675 L355 608 Z" fill="#ffffff" fill-opacity="0.14"/>
  <path d="M240 585 L195 675 L355 608 Z" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="5" stroke-linejoin="round"/>

  <!-- Voice waveform bars (5 bars, tallest in center) -->
  <rect x="210" y="348" width="64" height="88"  rx="32" fill="#7fffd4" fill-opacity="0.85"/>
  <rect x="306" y="295" width="64" height="194" rx="32" fill="#7fffd4"/>
  <rect x="402" y="248" width="64" height="288" rx="32" fill="#c8f5e8"/>
  <rect x="498" y="295" width="64" height="194" rx="32" fill="#7fffd4"/>
  <rect x="594" y="348" width="64" height="88"  rx="32" fill="#7fffd4" fill-opacity="0.85"/>

  <!-- Gold accent dot (top-right of bubble) -->
  <circle cx="700" cy="228" r="32" fill="#c58e52"/>
  <circle cx="700" cy="228" r="18" fill="#f0b96a"/>

  <!-- Wordmark -->
  <text x="512" y="800"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="96" font-weight="700"
        fill="#ffffff" fill-opacity="0.93"
        text-anchor="middle" letter-spacing="-2">sofiya</text>
  <text x="512" y="876"
        font-family="Arial, Helvetica, sans-serif"
        font-size="40" font-weight="400"
        fill="#7fffd4" fill-opacity="0.72"
        text-anchor="middle" letter-spacing="8">LANGUAGE</text>
</svg>`;
}

function render(svgStr, outFile) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'original' } });
  const png = resvg.render();
  fs.writeFileSync(outFile, png.asPng());
  console.log('Wrote', outFile);
}

render(makeSvg(1024), path.join(OUT, 'icon.png'));
render(makeSvg(1024), path.join(OUT, 'adaptive-icon.png'));

// Splash: same icon centered on a dark background, 2048x2048
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="2048" height="2048">
  <rect width="2048" height="2048" fill="#1a4d3e"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(makeSvg(800)).toString('base64')}" x="624" y="624" width="800" height="800"/>
</svg>`;
render(splashSvg, path.join(OUT, 'splash.png'));
