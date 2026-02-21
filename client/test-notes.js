const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  // login
  await page.type('input[type="email"]', 'testuser@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  console.log('Navigating to notes...');
  await page.goto('http://localhost:5173/notes', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
