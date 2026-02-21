const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'] });
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
  
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/auth/me')) {
      request.respond({
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Test', email: 'test@test.com' }})
      });
    } else if (url.includes('/api/')) {
        request.respond({
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [], count: 0 })
        });
    } else {
      request.continue();
    }
  });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Dashboard content len:', content?.length);
  if (content.includes('Sign In')) {
      console.log('Still seeing Sign In form...');
  } else {
      console.log('Successfully rendered protected content!');
  }
  
  await browser.close();
  process.exit(0);
})();
