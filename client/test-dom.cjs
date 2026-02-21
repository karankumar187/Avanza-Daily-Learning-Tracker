const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.jwt.token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log(content);
  
  await browser.close();
  process.exit(0);
})();
