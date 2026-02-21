const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE UNCAUGHT ERROR:', err.toString()));

  await page.setRequestInterception(true);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  page.on('request', interceptedRequest => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    const url = interceptedRequest.url();
    
    if (interceptedRequest.method() === 'OPTIONS') {
        interceptedRequest.respond({
            status: 204,
            headers: corsHeaders
        });
        return;
    }

    if (url.includes('/api/auth/me')) {
      interceptedRequest.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: { name: 'Test', email: 'test@test.com', _id: '123' } })
      });
    } else if (url.includes('/api/notifications')) {
      interceptedRequest.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, count: 0, data: [] })
      });
    } else if (url.includes('/api/')) {
        interceptedRequest.respond({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders,
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
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text Snippet:', bodyText.substring(0, 300).replace(/\n/g, ' '));
  
  const errText = await page.evaluate(() => document.body.innerHTML);
  if (errText.includes('Error')) {
      console.log("Found error text in body");
  }

  await browser.close();
  process.exit(0);
})();
