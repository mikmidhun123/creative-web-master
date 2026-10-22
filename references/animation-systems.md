# Animation Systems, Single-Engine Architecture & Accessibility

Read `animate`, `emil-design-eng`, and `motion-design` alongside this reference when implementing web animations.

---

## 1. The Single-Engine Rule (No Duplicate Engines)

Choose **one** animation system per job based on what the interface actually needs:

| Requirement | Pick | Do NOT Also Install |
| :--- | :--- | :--- |
| Hover states, button press (`:active`), simple mount fades | **Plain CSS / WAAPI** | GSAP or Motion |
| Scroll-linked timelines, pinned storytelling, SVG path drawing, kinetic split-text choreography | **GSAP** (`gsap` + `@gsap/react`) | Motion (`motion`) |
| React component mount/unmount (`AnimatePresence`), shared layout morphs (`layoutId`), gesture/drag springs | **Motion** (`motion`) | GSAP (`gsap`) |

---

## 2. GSAP Architecture (`gsap` + `@gsap/react`)

Use GSAP for choreographed hero entrances, kinetic typography, SVG morph/stroke drawing, and scroll-triggered storytelling.

### Rules for GSAP in React
1. **Always use `useGSAP()`** (from `@gsap/react`) instead of raw `useEffect()` so all tweens, timelines, and `ScrollTrigger` instances automatically revert on unmount and React StrictMode double-invocation.
2. **Scope selectors to a container ref** (`{ scope: containerRef }`) so class selectors (`".hero-word"`) never leak across components.
3. **Use `gsap.matchMedia()`** to handle `prefers-reduced-motion` and responsive breakpoints cleanly inside a single hook.

### Pattern: Accessible GSAP Hero & Kinetic Type Choreography
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Full motion for users with no reduced-motion preference
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          '.hero-eyebrow',
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.55 }
        )
          .fromTo(
            '.hero-char-line',
            { yPercent: 105, rotateX: -20, autoAlpha: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              autoAlpha: 1,
              duration: 0.75,
              stagger: 0.09,
            },
            '-=0.35'
          )
          .fromTo(
            '.hero-sub, .hero-cta',
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08 },
            '-=0.45'
          );
      });

      // Reduced motion fallback: instant or gentle opacity reveal, zero translation
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.hero-eyebrow, .hero-char-line, .hero-sub, .hero-cta', {
          y: 0,
          yPercent: 0,
          rotateX: 0,
          autoAlpha: 1,
        });
      });
    },
    { scope: containerRef }
  );

  return <section ref={containerRef}>{/* ... */}</section>;
}
```

---

## 3. Motion (`motion/react`) Architecture

Use `motion` (formerly Framer Motion) when building interactive React UI components, layout transitions, modals/drawers, or spring-driven gestures.

### Rules for Motion
1. **Respect `useReducedMotion()`**: Read `const shouldReduceMotion = useReducedMotion();` and set `transition={{ duration: 0 }}` or disable `y`/`scale` offsets when `true`.
2. **Hardware-Accelerated Transforms**: For animations running during page load or navigation, animate the full `transform` string (`animate={{ transform: "translateY(0px) scale(1)" }}`) so Motion can hand off to WAAPI off the main thread.
3. **Never Animate from `scale(0)`**: Start entrances from `scale(0.94)`–`scale(0.97)` with `opacity: 0`.
4. **Critically Damped Springs by Default**: Use `{ type: "spring", duration: 0.45, bounce: 0 }` for clean UI transitions; add `bounce: 0.15–0.25` only for momentum/flick gestures.

---

## 4. Lenis Smooth Scroll (Strictly Opt-In Only)

- **Do NOT install or enable Lenis unless the user explicitly asks for smooth scrolling.**
- When requested and paired with GSAP `ScrollTrigger`, synchronize Lenis with `gsap.ticker` and disable lag smoothing:
  ```tsx
  const lenis = new Lenis({ autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- Always bypass Lenis when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`!

---

## 5. Mandatory CSS Curves, Hover Gating & Reduced Motion

Include these baseline tokens and guards in every project's root stylesheet:

```css
:root {
  --ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
}

html {
  -webkit-tap-highlight-color: transparent;
}

/* Gate hover effects so touch devices never get stuck in :hover */
@media (hover: hover) and (pointer: fine) {
  .interactive-btn:hover {
    transform: translateY(-1px);
  }
}

/* Tactile press feedback on all input types */
.interactive-btn:active {
  transform: scale(0.97);
  transition: transform 100ms var(--ease-out-quart);
}

/* Global reduced-motion safety net */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
