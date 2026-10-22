# Art Direction, Typography, Color Systems & Anti-Slop Checklist

Read `frontend-design` and `emil-design-eng` alongside this reference before designing any page or component.

---

## 1. Mandatory Art Direction Brief (Define Before Coding)

Never write HTML/JSX before writing a concrete **Art Direction Brief** tailored to the subject matter:

```markdown
### Art Direction Brief
- **Domain & Aesthetic Point of View**: [e.g., Precision acoustic hardware studio — tactile Swiss technical grid, oscilloscope telemetry, warm anodized aluminum & phosphor amber]
- **Typography**:
  - Display: `[Font Family]` (`weight`, `tracking`, fluid `clamp()` scale)
  - Body: `[Font Family]` (`weight`, `line-height: 1.55`, max measure `65ch`)
  - Mono (if applicable): `[Font Family]` (`font-variant-numeric: tabular-nums`)
- **Color Palette (4–6 Named Tokens)**:
  - `--bg-canvas`: `#...`
  - `--bg-surface`: `#...`
  - `--text-primary`: `#...`
  - `--text-muted`: `#...`
  - `--accent-primary`: `#...`
  - `--border-hairline`: `rgba(..., ...)`
- **Spacing & Layout Structure**: [e.g., Asymmetric 12-column architectural grid, 100svh hero, left-anchored kinetic headline with live interactive instrument panel on the right]
- **Motion Signature**: [Engine choice + 1 orchestrated hero entrance + tactile micro-interactions; reduced-motion behavior]
```

---

## 2. The Anti-AI-Slop Checklist (Reject on Sight)

Before building, audit your design plan against these overused AI defaults and replace any that aren't explicitly requested by the user:

1. **No Unsolicited Cliché Palettes**:
   - Avoid defaulting to `#F4F1EA` warm cream + `#D97757` terracotta clay unless the brand specifically calls for it.
   - Avoid generic purple-to-blue neon SaaS gradients on `#0B0B0B` backgrounds with random blurred floating orbs that have no connection to the product.
2. **No Generic Typographic Tells**:
   - Do **not** italicize or gradient-highlight a single random word in the middle of every headline unless it carries structural meaning.
   - Do **not** put a tracked-out ALL-CAPS eyebrow string joined with middle dots (`"A · B · C"`) or `"WORD — fragment"` above every single section.
   - Do **not** add `01 / 02 / 03` numbering to cards unless the content is genuinely a sequential step-by-step process.
   - Do **not** append a literal `"→"` character to every button and link.
3. **No Uniform Card Soup**:
   - Avoid chopping every piece of content into 3 identical rounded cards with the same padding, same border-radius, and same `rgba(0,0,0,0.1)` shadow. Vary visual weight: let one hero interactive artifact dominate while supporting details sit in a disciplined structural grid or table.
4. **No Scattered Motion Noise**:
   - One orchestrated page-load moment + responsive user-triggered feedback beats 15 separate scroll fade-ups on every paragraph.

---

## 3. Typography & Fluid Scale Rules

- **Distinctive Font Pairings**: Load purposeful Google Fonts or local variable fonts in `index.html` with `<link rel="preconnect" href="https://fonts.googleapis.com">` and `display=swap` (e.g., *Syne* + *Plus Jakarta Sans*, *Instrument Serif* + *Inter*, *Space Grotesk* + *IBM Plex Mono*, *Fraunces* + *DM Sans*).
- **Fluid Display Sizing**: Use `clamp()` so headlines scale seamlessly from `390px` mobile to `1440px` desktop without overflowing:
  ```css
  .hero-display {
    font-size: clamp(2.5rem, 5.6vw + 0.75rem, 5.25rem);
    line-height: 0.98;
    letter-spacing: -0.035em;
    text-wrap: balance;
  }
  ```
- **Measure & Numeric Discipline**:
  - Keep body copy between `55ch` and `72ch` (`text-wrap: pretty`).
  - Apply `font-variant-numeric: tabular-nums` to all counters, coordinates, prices, and live metrics so numbers never jitter horizontally when updating.

---

## 4. Spatial Composition, Surfaces & Borders

- **Hairline Borders Over Muddy Shadows**: Use semi-transparent borders (`1px solid rgba(255, 255, 255, 0.09)` on dark themes or `1px solid rgba(15, 23, 42, 0.09)` on light themes) or `box-shadow: 0 0 0 1px ...` instead of heavy opaque borders.
- **Concentric Border Radii**: When nesting a pill or inner card inside a container with padding $P$ and outer radius $R_{\text{outer}}$, set the inner radius to $R_{\text{inner}} = \max(0, R_{\text{outer}} - P)$ so curves align optically.
- **Mobile Viewport Integrity (`390×844`)**:
  - Use `min-height: 100svh` for full-height heroes.
  - Collapse multi-column desktop grids cleanly to a single column below `900px` with adjusted padding (`clamp(1.25rem, 4vw, 4rem)`), and verify zero horizontal scrollbar (`overflow-x: clip` on root only as a safeguard, never to hide clipped text).
