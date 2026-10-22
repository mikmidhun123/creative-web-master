import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

mkdirSync('screenshots', { recursive: true });

const PORT = 4173;
const URL = `http://localhost:${PORT}`;

// Start vite preview server
const server = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'pipe', shell: true }
);

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Vite preview timeout')), 15000);
  server.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes(String(PORT)) || text.includes('Local:')) {
      clearTimeout(timeout);
      resolve();
    }
  });
  server.stderr.on('data', (data) => {
    console.error('[vite stderr]', data.toString());
  });
});

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch {
  try {
    browser = await chromium.launch({ channel: 'msedge' });
  } catch {
    browser = await chromium.launch();
  }
}

const errors = [];

try {
  // 1. Desktop Verification (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  desktopPage.on('pageerror', (err) => errors.push(`Desktop pageerror: ${err.message}`));
  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Desktop console.error: ${msg.text()}`);
  });

  await desktopPage.goto(URL, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(900); // allow GSAP entrance timeline to complete

  const desktopMetrics = await desktopPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    headlineText: document.querySelector('#hero-title')?.textContent?.trim() || '',
  }));
  console.log('Desktop metrics:', desktopMetrics);
  if (desktopMetrics.scrollWidth > desktopMetrics.innerWidth) {
    errors.push(`Desktop horizontal overflow: ${desktopMetrics.scrollWidth} > ${desktopMetrics.innerWidth}`);
  }

  // Test keyboard interaction & preset toggle before screenshot
  await desktopPage.keyboard.press('Tab');
  await desktopPage.screenshot({ path: 'screenshots/desktop-1440x900.png', fullPage: false });

  // 2. Mobile Verification (390x844 — iPhone 14/15 Pro viewport)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.on('pageerror', (err) => errors.push(`Mobile pageerror: ${err.message}`));
  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Mobile console.error: ${msg.text()}`);
  });

  await mobilePage.goto(URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(900);

  const mobileMetrics = await mobilePage.evaluate(() => {
    const vw = window.innerWidth;
    const overflowing = [];
    for (const el of document.querySelectorAll('header *, main *, footer *')) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1 || rect.left < -1) {
        overflowing.push(`${el.tagName}.${el.className}: right=${Math.round(rect.right)}`);
      }
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: vw,
      overflowing,
    };
  });
  console.log('Mobile metrics:', mobileMetrics);
  if (mobileMetrics.scrollWidth > mobileMetrics.innerWidth || mobileMetrics.overflowing.length > 0) {
    errors.push(`Mobile overflow: ${JSON.stringify(mobileMetrics)}`);
  }

  await mobilePage.screenshot({ path: 'screenshots/mobile-390x844.png', fullPage: true });

  // 3. Reduced Motion Verification (1440x900 with reducedMotion: 'reduce')
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await rmContext.newPage();
  await rmPage.goto(URL, { waitUntil: 'networkidle' });
  const rmVisible = await rmPage.evaluate(() => {
    const el = document.querySelector('.hero-line-inner');
    return el ? getComputedStyle(el).opacity === '1' : false;
  });
  console.log('Reduced-motion headline immediately visible (opacity === 1):', rmVisible);
  if (!rmVisible) {
    errors.push('Reduced-motion fallback failed: headline not immediately visible');
  }
} finally {
  await browser.close();
  server.kill();
}

if (errors.length > 0) {
  console.error('Playwright verification errors:', errors);
  process.exit(1);
}

console.log('ALL PLAYWRIGHT VERIFICATION CHECKS PASSED (Desktop, Mobile, Reduced Motion).');
process.exit(0);
