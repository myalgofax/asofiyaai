const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const BASE = '/asofiyaai';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace absolute asset paths with subfolder-prefixed paths
  const fixed = content
    .replace(/href="\/_expo\//g, `href="${BASE}/_expo/`)
    .replace(/src="\/_expo\//g, `src="${BASE}/_expo/`)
    .replace(/href="\/assets\//g, `href="${BASE}/assets/`)
    .replace(/src="\/assets\//g, `src="${BASE}/assets/`);
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log('Fixed:', path.relative(DIST, filePath));
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) fixFile(full);
  }
}

walk(DIST);

// Ensure .nojekyll exists so GitHub Pages serves _expo/ folder
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

console.log('Done — asset paths fixed for GitHub Pages.');
