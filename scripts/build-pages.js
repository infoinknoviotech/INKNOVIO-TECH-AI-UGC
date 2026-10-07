const fs = require('node:fs');
const path = require('node:path');
const seoHead = require('../seo');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist');
const publicFiles = [
  'app.js',
  'code.html',
  'screen.png',
  'favicon.ico',
  'favicon.png',
  'apple-touch-icon.png',
  'googled744b3e4033ba80c.html',
  'sitemap.xml',
  'robots.txt'
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const fileName of publicFiles) {
  const source = path.join(projectRoot, fileName);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(outputDirectory, fileName));
}

const homepage = fs.readFileSync(path.join(projectRoot, 'code.html'), 'utf8');
if (!homepage.includes('<head>')) throw new Error('Could not find the homepage head element.');
fs.writeFileSync(path.join(outputDirectory, 'index.html'), homepage.replace('<head>', `<head>${seoHead}`));
fs.cpSync(path.join(projectRoot, 'assets'), path.join(outputDirectory, 'assets'), { recursive: true });
fs.writeFileSync(path.join(outputDirectory, '_routes.json'), JSON.stringify({
  version: 1,
  include: ['/api/*', '/uploads/*'],
  exclude: []
}, null, 2));
