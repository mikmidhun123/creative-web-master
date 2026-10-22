# 3D WebGL, 2D Particles, Interactive Vector & Visual Effects

This reference covers when and how to integrate Three.js (`@react-three/fiber` + `@react-three/drei`), PixiJS, Rive, and Lottie without hurting mobile performance or accessibility.

---

## 1. Visual Engine Decision Table

| Visual Need | Engine | Key Packages | When NOT to Use |
| :--- | :--- | :--- | :--- |
| **3D objects, custom GLSL shaders, interactive lighting, `.glb` models** | **Three.js + R3F + Drei** | `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` | Simple 2D gradients, flat geometric shapes, or CSS 3D perspective tilts (`rotateX`/`rotateY`). |
| **Thousands of 2D particles, fluid 2D sprite fields, interactive 2D trails** | **PixiJS** | `pixi.js` | Under ~30 floating dots (use SVG or a lightweight 2D `<canvas>` instead) or full 3D scenes. |
| **State-machine vector illustrations, cursor-following characters, interactive icons** | **Rive** | `@rive-app/react-canvas` | Static SVG icons or simple CSS stroke animations (`stroke-dashoffset`). |
| **Pre-made After Effects vector animations provided by the user** | **Lottie** | `lottie-react` or `lottie-web` | **Never** use unless an existing `.json` / `.lottie` file is supplied. Never author Lottie JSON by hand. |

---

## 2. Three.js with React Three Fiber (`@react-three/fiber`) & Drei

### Architecture & Performance Guardrails
1. **React Version Compatibility Note**:
   - Before installing `@react-three/fiber`, check `react` version in `package.json`. If a project uses React 19 and `@react-three/fiber` reports peer dependency conflicts, either use `--legacy-peer-deps` with a verified R3F version, pin React 18, or mount Three.js cleanly inside a typed `useEffect` `<canvas>` wrapper with full `dispose()` cleanup.
2. **Cap Device Pixel Ratio (`dpr`)**:
   - Never render WebGL at `3x` or `4x` Retina resolution on mobile phones—it overheats the GPU and drops to 15fps. Always set `dpr={[1, 2]}` (or `dpr={[1, 1.5]}` on mobile).
3. **Never `setState` Inside `useFrame`**:
   - Mutate mesh refs directly (`meshRef.current.rotation.y += delta * 0.25`) inside `useFrame`. Triggering React state updates at 60fps destroys frame pacing.
4. **Respect `prefers-reduced-motion` in 3D**:
   - When reduced motion is enabled, render the 3D scene in a static resting pose (`frameloop="demand"`) or pause rotation deltas.
5. **Accessibility Isolation**:
   - Wrap decorative 3D canvases in `<div aria-hidden="true" inert>` so screen readers and keyboard `Tab` navigation skip the `<canvas>`.

### Example: Performant R3F Scene Shell
```tsx
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import type { Mesh } from 'three';

function SculpturalTorus({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_state, delta) => {
    if (!meshRef.current || reducedMotion) return;
    meshRef.current.rotation.x += delta * 0.18;
    meshRef.current.rotation.y += delta * 0.24;
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.1, 0.34, 128, 32]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
}

export function Hero3DCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 6, 4]} intensity={1.4} />
          <SculpturalTorus reducedMotion={reducedMotion} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

---

## 3. 2D Particles with PixiJS (`pixi.js`)

- **Lifecycle Hygiene**: In PixiJS v8, `await app.init({ ... })` is asynchronous. Always track an `isMounted` flag inside `useEffect` and call `app.destroy(true, { children: true, texture: true })` on cleanup so WebGL contexts never leak during hot reload or route changes.
- **Mobile Particle Scaling**: Scale particle count by viewport width (e.g., `250` particles on desktop `>= 1024px`, `90` particles on mobile `< 768px`).
- **Reduced Motion**: Freeze particle velocity (`vx = 0, vy = 0`) when `prefers-reduced-motion: reduce` is active.

---

## 4. Interactive Vector with Rive (`@rive-app/react-canvas`)

- Use `useRive({ src: '/animations/hero-rig.riv', stateMachines: 'MainState', autoplay: !reducedMotion })`.
- Expose state machine inputs (`useStateMachineInput`) to link pointer hover, focus, or form states directly to vector rig transitions.

---

## 5. Lottie Playback (`lottie-react`)

- **Strict Rule**: Only use Lottie when the user supplies an existing `.json` or `.lottie` asset file.
- Pass `autoplay={!reducedMotion}` and `loop={!reducedMotion}` so users with reduced motion see a crisp static illustration frame.
