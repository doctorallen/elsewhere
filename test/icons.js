'use strict';
// Draws the PNG icons from icons/icon.svg in Chrome: 192, 512 and the touch
// icon. Run it when the icon changes (npm run icons) and commit what it makes.
const fs = require('fs'), path = require('path');
if (!process.env.CHROME && fs.existsSync('/Applications/Google Chrome.app')) process.env.CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tk = require('../vendor/tycho/dist/testkit.cjs');
const ICONS = path.join(__dirname, '..', 'icons');
tk.run('icons', async () => {
  const kit = await tk.launch({});
  try {
    const page = await kit.page({ width: 600, height: 600 });
    const svg = fs.readFileSync(path.join(ICONS, 'icon.svg'), 'utf8');
    for (const n of [192, 512]) {
      await page.setContent(`<html><body style="margin:0;background:#17131c">${svg.replace('<svg ', `<svg width="${n}" height="${n}" `)}</body></html>`);
      const b64 = await page.evaluate(async (n) => { const svg = document.querySelector('svg'); const img = new Image(); img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg)); await img.decode(); const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); g.fillStyle = '#17131c'; g.fillRect(0, 0, n, n); g.drawImage(img, 0, 0, n, n); return c.toDataURL('image/png').split(',')[1]; }, n);
      fs.writeFileSync(path.join(ICONS, `icon-${n}.png`), Buffer.from(b64, 'base64'));
    }
  } finally { await kit.close(); }
  return [];
});
