---
name: gsap-skills
description: The gold standard for fluid web motion, GreenSock ScrollTrigger pinning, scrub dampening, and kinetic typography. Eliminates stutter & memory leaks; provides silky 60fps animations.
---

# Official GSAP AI Skills Architecture

The gold standard for fluid web motion, ScrollTrigger pinning, and kinetic typography.

## Core Rules & Architecture

1. **No More Buggy Timelines**:
   AI models often forget timeline context cleanup in React/Next.js/Vue, causing memory leaks on page navigation. This skill forces proper use of `useGSAP()` and `gsap.context()` with clean scope refs:
   ```tsx
   import { useGSAP } from "@gsap/react";
   import gsap from "gsap";
   import { ScrollTrigger } from "gsap/ScrollTrigger";

   gsap.registerPlugin(ScrollTrigger);

   useGSAP(() => {
     gsap.from(".hero-card", {
       y: 40,
       opacity: 0,
       stagger: 0.1,
       duration: 1,
       ease: "power3.out"
     });
   }, { scope: containerRef });
   ```

2. **ScrollTrigger Mastery**:
   Exact calculations for pin triggers, scrub dampening, markers, and responsive coordinate recalculation on window resize.
   - Use `scrub: 1` or `scrub: 1.2` for smooth inertial dampening.
   - Always call `ScrollTrigger.refresh()` after dynamic content or asset loads.

3. **Hardware Acceleration Rules**:
   - Strictly isolate hardware transforms: `translate3d`, `matrix3d`, `scale`, `rotation`.
   - Never animate layout properties like CSS `top`, `left`, `margin`, or `padding`.
   - Use `will-change: transform` on animated elements.

4. **Kinetic Typography & Staggered Ensembles**:
   - Character and word reveals with subtle 3D perspective (`rotateX(-60deg)` + `translateY(120%)`).
   - Staggered timeline sequences for maximum cinematic appeal.
