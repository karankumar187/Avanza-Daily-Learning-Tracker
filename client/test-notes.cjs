const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.jwt.token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
  });
  
  await page.goto('http://localhost:5173/notes', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root content starts with:', content?.substring(0, 100));
  
  // also get error logs
  const logs = await page.evaluate(() => window.errors || []);
  console.log('Window errors:', logs);
  
  await browser.close();
  process.exit(0);
})();
