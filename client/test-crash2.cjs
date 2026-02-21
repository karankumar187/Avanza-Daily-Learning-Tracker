const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE UNCAUGHT ERROR:', err.toString()));

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.jwt.token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Dashboard content len:', content?.length);

  await page.goto('http://localhost:5173/notes', { waitUntil: 'networkidle2' });
  const notesContent = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Notes content len:', notesContent?.length);

  await browser.close();
  process.exit(0);
})();
