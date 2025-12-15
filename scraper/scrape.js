const { chromium } = require('playwright');
const fs = require('fs');

const GUILD_NAME = 'Panq Alliance';
const URL = 'https://rubinot.com.br/?GuildName=Panq+Alliance&page=view&subtopic=guilds';

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
  });

  console.log('Abrindo página...');
  await page.goto(URL, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  console.log('Salvando HTML para debug...');

const html = await page.content();
require('fs').writeFileSync('debug.html', html);

console.log('HTML salvo (debug.html)');


  // Aguarda a tabela da guild aparecer
  await page.waitForSelector('table', { timeout: 60000 });

  const onlineChars = await page.evaluate(() => {
    const online = [];

    document.querySelectorAll('tr').forEach(row => {
      const text = row.innerText.toLowerCase();

      // ajuste se necessário
      if (text.includes('online')) {
        const name = row.querySelector('td')?.innerText?.trim();
        if (name) online.push(name);
      }
    });

    return online;
  });

  await browser.close();

  const output = {
    guild: GUILD_NAME,
    updatedAt: new Date().toISOString(),
    online: onlineChars
  };

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/status.json', JSON.stringify(output, null, 2));

  console.log('Status salvo:', output);
})();
