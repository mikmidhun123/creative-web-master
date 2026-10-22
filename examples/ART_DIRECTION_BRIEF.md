# Art Direction & Technical Architecture Brief — `creative-web-master` Demo

## 1. Domain & Aesthetic Point of View
- **Subject**: **KRONOS-09 // Field-Calibrated Spatial Acoustic Synthesizer & Reference Monitor**
- **Aesthetic Direction**: Precision acoustic laboratory hardware and studio telemetry (inspired by Braun, Rohde & Schwarz, and modern modular synthesis hardware).
- **Anti-Slop Verification**:
  - Rejects warm cream (`#F4F1EA`) + terracotta (`#D97757`) AI defaults and generic purple SaaS gradients.
  - Rejects uniform 3-card SaaS grids, middle-dot eyebrows (`A · B · C`), and `"→"` button suffixes.
  - Uses an **asymmetric 12-column architectural grid** pairing kinetic display typography on the left with a live, keyboard-accessible **Harmonic Phase Oscilloscope** on the right.

---

## 2. Design Tokens

### Color Palette (6 Named Tokens)
- `--bg-canvas`: `#090C10` (Obsidian anodized chassis)
- `--bg-surface`: `#11161F` (Machined slate instrument bay)
- `--bg-elevated`: `#171E2B` (Tactile keycap surface)
- `--text-primary`: `#F0F4F8` (Crisp alabaster)
- `--text-muted`: `#8B95A5` (Calibrated steel grey)
- `--accent-primary`: `#FF6B2B` (International signal orange)
- `--accent-Phosphor`: `#2DD4BF` (Oscilloscope phosphor teal)
- `--border-hairline`: `rgba(240, 244, 248, 0.09)`

### Typography System
- **Display Headline**: `'Space Grotesk', system-ui, sans-serif` (`700`, `clamp(2.35rem, 4.6vw + 0.6rem, 4.5rem)`, `line-height: 0.98`, `letter-spacing: -0.035em`)
- **Body Copy**: `'Plus Jakarta Sans', system-ui, sans-serif` (`400/500`, `line-height: 1.6`, max measure `58ch`)
- **Telemetry / Mono**: `'JetBrains Mono', monospace` (`500/600`, `font-variant-numeric: tabular-nums`)

---

## 3. Stack, Single Animation Engine & License Audit

| Layer | Choice | Version | License | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Framework & Bundler** | React + TypeScript + Vite | React `19.3.1` / Vite `8.3.4` | MIT | Greenfield default |
| **Primary Animation Engine** | **GSAP** (`gsap` + `@gsap/react`) | `3.15.0` / `2.1.2` | GSAP Standard "No Charge" License | Single engine for hero reveal, SVG waveform morph, and sweep trigger |
| **Micro-Interactions** | Native CSS Transitions | W3C | Public | `:active` scale (`0.97`), `@media (hover: hover) and (pointer: fine)` |
| **Browser QA** | Playwright (`chromium`, `channel: 'chrome'`) | `1.64.1` | Apache-2.0 | Desktop (`1440×900`) & Mobile (`390×844`) screenshots + overflow/console assertions |
