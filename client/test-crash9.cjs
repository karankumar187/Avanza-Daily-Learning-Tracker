const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE UNCAUGHT ERROR:', err.toString()));

  // Intercept API requests
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
    const url = interceptedRequest.url();
    if (url.includes('/api/auth/me')) {
      interceptedRequest.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { name: 'Test', email: 'test@test.com', id: '123' } })
      });
    } else if (url.includes('/api/notifications')) {
      interceptedRequest.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, count: 0, data: [] })
      });
    } else if (url.includes('/api/')) {
        interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [] })
        });
    } else {
      interceptedRequest.continue();
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake.jwt.token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });

  const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root content len:', content?.length);
  
  // Dump all errors found in the page body if any
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text Snippet:', bodyText.substring(0, 300).replace(/\n/g, ' '));
  
  if (bodyText.includes('Error')) {
      const errText = await page.evaluate(() => document.body.innerHTML);
      console.log("Found error text in body");
  }

  await browser.close();
  process.exit(0);
})();
