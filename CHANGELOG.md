# Changelog

All notable changes to **`creative-web-master`** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-22

### Added
- **`SKILL.md` Master Router**:
  - Framework preservation rules (keep existing Next.js/Astro/SvelteKit/Vite setup; default new greenfield projects to React 19 + TypeScript + Vite).
  - Single Animation Engine Rule routing cleanly between **GSAP (`gsap` + `@gsap/react`)**, **Motion (`motion/react`)**, **Three.js + React Three Fiber + Drei**, **PixiJS (`pixi.js`)**, **Rive (`@rive-app/react-canvas`)**, **DotLottie (`@lottiefiles/dotlottie-react`, playback only)**, and **Lenis (`lenis`, opt-in only)**.
  - Automatic Sub-Skill Dispatcher Table mapping user intents to 14 specialized supporting skills (`frontend-design`, `emil-design-eng`, `motion-design`, `animate`, `apple-design`, `animation-performance`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `ask-sonner`, `break-ui`, `prototype`, `research`).
  - Strict 5-Gate Creative Engineering Workflow: Written Art Direction Brief → Stack & License Check → Accessible Implementation (`prefers-reduced-motion` + keyboard `:focus-visible`) → Production Build (`npm run build`) → Playwright Desktop (`1440×900`) & Mobile (`390×844`) Verification.
- **Reference Documentation (`references/`)**:
  - `references/frontend-selection.md`: Framework inspection protocol, React + TypeScript + Vite scaffold commands, Next.js App/Pages Router boundaries, and the animation/3D library license table.
  - `references/animation-systems.md`: Single-engine decision tree, `useGSAP()` scoped cleanup patterns, `motion/react` layout springs, Rive vs. Lottie usage, Lenis integration, and mandatory `prefers-reduced-motion` code patterns.
  - `references/3d-and-visual-effects.md`: Three.js + `@react-three/fiber` + `@react-three/drei` patterns, `dpr={[1, 2]}` performance caps, geometry/material disposal, and PixiJS v8 2D WebGL canvas setup.
  - `references/art-direction.md`: Pre-code Art Direction Brief template, fluid `clamp()` typography scale, purposeful surface/accent color contrast, spatial grid rhythm, and banned generic SaaS visual tropes.
- **Verified Examples & QA Script (`examples/`)**:
  - `examples/ART_DIRECTION_BRIEF.md`: Sample Gate 1 Art Direction Brief (`AETHER // 01`).
  - `examples/verify-ui.mjs`: Reusable Playwright script verifying Desktop (`1440×900`), Mobile (`390×844` zero horizontal overflow), and `prefers-reduced-motion: reduce`.
  - `examples/screenshots/desktop-1440x900.png` & `mobile-390x844.png`: Verified Playwright screenshots.
- **Release Packages**:
  - `creative-web-master-v1.0.0.zip`: Standalone master skill package.
  - `creative-web-master-full-bundle-v1.0.0.zip`: Complete 15-skill ecosystem bundle (master skill + 14 supporting skills + Playwright QA script & screenshots).
