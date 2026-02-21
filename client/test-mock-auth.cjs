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

    // Setup localStorage to mock a valid logged in state based on typical React Auth contexts
    // If the backend refuses, we'll see the API error, but React shouldn't crash with a blank page.
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
        localStorage.setItem('token', 'fake.jwt.token');
        localStorage.setItem('user', JSON.stringify({ name: 'Test', email: 'test@test.com' }));
    });

    // Also intercept API requests and mock them so we don't get booted back to /login
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('/api/auth/me')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { name: 'Test', email: 'test@test.com' } })
            });
        } else if (request.url().includes('/api/notifications')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, count: 0, data: [] })
            });
        } else if (request.url().includes('/api/')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [] })
            });
        } else {
            request.continue();
        }
    });

    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });

    const content = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    console.log('Dashboard content len:', content?.length);

    await browser.close();
    process.exit(0);
})();
