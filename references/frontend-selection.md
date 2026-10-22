# Frontend Selection, License Matrix & Playwright Verification

This reference governs framework detection, project scaffolding, dependency licensing, and mandatory Playwright build verification.

---

## 1. Framework Selection Rules

1. **Always Inspect First**: Check `package.json`, lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `bun.lockb`), and framework configs (`vite.config.*`, `next.config.*`, `astro.config.*`) before proposing or installing anything.
2. **Existing Project $\rightarrow$ Keep Existing Framework**:
   - If the project uses **Next.js**, stay on Next.js. Put client-side animation hooks (`useGSAP`, `motion`, `<Canvas>`, `PixiJS`, `Rive`) inside components marked with `"use client"` at line 1.
   - If the project uses **Vite**, **Astro**, **Remix**, or **SvelteKit**, stay within that framework's idioms.
3. **New Greenfield Site $\rightarrow$ React + TypeScript + Vite**:
   Scaffold directly with Vite's official `react-ts` template:
   ```powershell
   npm.cmd create vite@latest my-site -- --template react-ts
   Set-Location my-site
   npm.cmd install
   ```
4. **Never Install Animation Libraries Globally**:
   Install only the single animation/visual library required by the current project into its local `package.json` `dependencies`.

---

## 2. Library License & Usage Matrix

Always verify library license compatibility before adding a dependency to a project:

| Library | npm Packages | License | Commercial & Usage Notes |
| :--- | :--- | :--- | :--- |
| **CSS / WAAPI** | Native Browser APIs | **W3C / Public** | Zero bundle size (`0 KB`). Default choice for hover, press (`:active`), and simple mount transitions. |
| **Motion** | `motion` | **MIT** | Free for all commercial and open-source projects. Best for React UI state transitions, layout animations, and interruptible springs. |
| **GSAP** | `gsap`, `@gsap/react` | **GSAP Standard "No Charge" License** | Free for standard websites, apps, and client work (following Webflow's acquisition of GreenSock, core + plugins like `ScrollTrigger` and `SplitText` are included; always review GreenSock's current license terms if embedding in a paid authoring tool). |
| **Three.js + R3F + Drei** | `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` | **MIT** | Free for all commercial and open-source use. Check React 18/19 peer dependency compatibility when installing `@react-three/fiber`. |
| **PixiJS** | `pixi.js` | **MIT** | Free for all commercial and open-source use. High-performance 2D WebGL/WebGPU renderer for particles and 2D effects. |
| **Rive** | `@rive-app/react-canvas` or `@rive-app/canvas` | **MIT** (Runtime) | The Rive web runtime is MIT-licensed. Requires `.riv` binary files exported from the Rive editor. |
| **Lottie** | `lottie-react` or `lottie-web` | **MIT** | Use **only** when the user provides existing `.json` or `.lottie` assets. Never generate raw Lottie JSON by hand. |
| **Lenis** | `lenis` | **MIT** | Use **only** when smooth scrolling is explicitly requested by the user. |

---

## 3. Windows / PowerShell Command Hygiene

- On Windows systems where PowerShell execution policy blocks `.ps1` shims, invoke `npm.cmd` and `npx.cmd` explicitly.
- Ensure Node.js is on `$env:Path` before running build or Playwright scripts.

---

## 4. Mandatory Verification Protocol (Build + Playwright Desktop & Mobile)

Every creative web task must pass **two automated gates** before completion:

### Gate A: Production Build Must Pass
```powershell
npm.cmd run build
```
- Must exit with code `0` (`tsc -b && vite build` or `next build`).
- Fix all TypeScript unused-variable, prop-type, or bundler resolution errors immediately.

### Gate B: Playwright Desktop (`1440×900`) & Mobile (`390×844`) Verification
Use Playwright (`playwright` installed as a local `devDependency` or existing browser binary) to render the built production bundle (`vite preview`) or dev server, check for runtime/console errors, check for horizontal layout overflow, and capture full screenshots at both viewports.

#### browser Launch Tip (Managed Chromium vs. System Chrome)
- If Playwright's managed Chromium is installed in `ms-playwright`, `chromium.launch()` works directly.
- If `ms-playwright` is not downloaded, pass `channel: 'chrome'` (or `channel: 'msedge'`) to `chromium.launch({ channel: 'chrome' })` to use the machine's installed Google Chrome without a separate 160 MB download.

#### Reusable Verification Script (`verify-ui.mjs`)
```javascript
import { chromium } from 'playwright';

const URL = process.env.VERIFY_URL || 'http://localhost:4173';

const browser = await chromium.launch({ channel: 'chrome' }).catch(() =>
  chromium.launch()
);

const errors = [];

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
await desktopPage.waitForTimeout(800); // allow entrance animations to settle
const desktopOverflow = await desktopPage.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth
);
if (desktopOverflow) errors.push('Desktop horizontal overflow detected');
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
await mobilePage.waitForTimeout(800);
const mobileOverflow = await mobilePage.evaluate(() => {
  const vw = window.innerWidth;
  if (document.documentElement.scrollWidth > vw) return true;
  for (const el of document.querySelectorAll('header *, main *, footer *')) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) return true;
  }
  return false;
});
if (mobileOverflow) errors.push('Mobile horizontal overflow or child clipping detected');
await mobilePage.screenshot({ path: 'screenshots/mobile-390x844.png', fullPage: true });

await browser.close();

if (errors.length > 0) {
  console.error('Verification failures:', errors);
  process.exit(1);
}
console.log('Playwright desktop & mobile verification passed with 0 errors.');
```

After running the script, **always inspect both `screenshots/desktop-1440x900.png` and `screenshots/mobile-390x844.png` with `read_file`** to visually confirm typography alignment, contrast, spacing, and mobile responsiveness.
