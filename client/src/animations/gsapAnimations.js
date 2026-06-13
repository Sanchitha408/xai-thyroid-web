// animations/gsapAnimations.js — All GSAP timeline functions for XAI Thyroid
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ─── Reduced Motion Check ────────────────────────────────────────────────────
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Navbar ──────────────────────────────────────────────────────────────────
export function initNavbarAnimation(navRef) {
  if (!navRef?.current || prefersReducedMotion()) return;
  gsap.fromTo(
    navRef.current,
    { y: -80, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export function initHeroAnimation(containerRef) {
  if (!containerRef?.current || prefersReducedMotion()) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.hero-eyebrow',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
    .fromTo('.hero-word',     { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 0.7)
    .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.3)
    .fromTo('.hero-btn',      { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 1.6);

  return tl;
}

// ─── Scroll Animations ───────────────────────────────────────────────────────
export function initScrollAnimations() {
  if (prefersReducedMotion()) return;

  // Problem section — stat cards
  gsap.fromTo('.section-heading-anim', { opacity: 0, x: -60 }, {
    opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.section-heading-anim', start: 'top 80%', toggleActions: 'play none none none' },
  });

  ScrollTrigger.batch('.stat-card', {
    onEnter: (els) =>
      gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.6, ease: 'power3.out' }),
    start: 'top 85%',
  });

  // Pipeline steps
  ScrollTrigger.batch('.pipeline-step', {
    onEnter: (els) =>
      gsap.fromTo(els, { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.15, duration: 0.5, ease: 'power3.out' }),
    start: 'top 85%',
  });

  // Condition cards
  ScrollTrigger.batch('.condition-card', {
    onEnter: (els) =>
      gsap.fromTo(els,
        { opacity: 0, rotateY: 90 },
        { opacity: 1, rotateY: 0, stagger: 0.2, duration: 0.7, ease: 'back.out(1.7)' }
      ),
    start: 'top 85%',
  });

  // Feature grid
  ScrollTrigger.batch('.feature-item', {
    onEnter: (els) =>
      gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.5, ease: 'back.out(1.5)' }),
    start: 'top 85%',
  });

  // CTA section
  gsap.fromTo('.cta-section-content', { opacity: 0, scale: 0.95 }, {
    opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.cta-section-content', start: 'top 80%', toggleActions: 'play none none none' },
  });

  // Demo section
  gsap.fromTo('.demo-section', { opacity: 0, y: 60 }, {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.demo-section', start: 'top 80%', toggleActions: 'play none none none' },
  });
}

// ─── Result Panel Animation ──────────────────────────────────────────────────
export function initResultAnimation(resultRef) {
  if (!resultRef?.current || prefersReducedMotion()) return;

  gsap.fromTo(
    resultRef.current,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
  );

  // SHAP bars stagger in
  gsap.fromTo('.shap-bar',
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.3 }
  );
}

// ─── Confidence Ring Tween ───────────────────────────────────────────────────
export function animateConfidenceRing(setProgress, targetValue) {
  if (prefersReducedMotion()) { setProgress(targetValue); return; }
  const obj = { value: 0 };
  gsap.to(obj, {
    value: targetValue,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => setProgress(Math.round(obj.value)),
  });
}

// ─── Page Transition ─────────────────────────────────────────────────────────
export function initPageTransition() {
  if (prefersReducedMotion()) return;
  gsap.fromTo('#root', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
}

// ─── Slider Populate (demo patients) ─────────────────────────────────────────
export function animateSliderPopulate(onChange, targetValues, delay = 0) {
  if (prefersReducedMotion()) { onChange(targetValues); return; }
  const obj = { ...targetValues };
  // We just call onChange after a brief stagger; GSAP tweens the visual slider
  Object.keys(targetValues).forEach((key, i) => {
    const start = { v: 0 };
    gsap.to(start, {
      v: targetValues[key],
      duration: 0.6,
      delay: delay + i * 0.05,
      ease: 'power2.out',
      onUpdate: () => {
        obj[key] = start.v;
        onChange({ ...obj });
      },
    });
  });
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────
export function animateChatOpen(panelRef) {
  if (!panelRef?.current || prefersReducedMotion()) return;
  gsap.fromTo(
    panelRef.current,
    { opacity: 0, y: 20, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
  );
}
