const puppeteer = require('puppeteer');
const http = require('http');

const data = JSON.stringify({ email: 'karan9302451907@gmail.com', password: 'karanpassword123' });

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      if (!parsed.token) {
        console.log('Login failed:', parsed);
        process.exit(1);
      }
      const token = parsed.token;
      
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      page.on('console', msg => {
        if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
      });
      page.on('pageerror', err => console.log('PAGE UNCAUGHT ERROR:', err.toString()));
      
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
      await page.evaluate((t) => {
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
      }, token);
      
      console.log('Navigating to dashboard...');
      await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
      
      const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
      console.log('Dashboard content len:', content?.length);
      
      // Wait a bit to catch delayed errors
      await new Promise(r => setTimeout(r, 2000));
      
      await browser.close();
      process.exit(0);
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  });
});

req.on('error', e => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
