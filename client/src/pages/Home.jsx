import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParticleSphere from '../components/ParticleSphere';
import { 
  Play, 
  Globe, 
  AlertTriangle, 
  Users, 
  Database, 
  Filter, 
  Brain, 
  Search, 
  FileText, 
  TrendingDown, 
  Activity, 
  TrendingUp, 
  Eye, 
  ShieldCheck, 
  Lock, 
  GitBranch 
} from 'lucide-react';

// ParticleField sub-component
function ParticleField() {
  const count = 40;
  const particles = Array.from({ length: count });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-40px) translateX(20px); opacity: 0.8; }
        }
        @media (max-w: 640px) {
          .hero-particle:nth-child(n+16) {
            display: none;
          }
        }
      `}</style>
      {particles.map((_, i) => {
        const size = Math.random() > 0.5 ? '4px' : '2px';
        const bg = Math.random() > 0.4 ? 'bg-xai-accent/20' : 'bg-white/10';
        const style = {
          position: 'absolute',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: size,
          height: size,
          borderRadius: '50%',
          animation: 'float 12s infinite ease-in-out',
          animationDuration: `${8 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 6}s`,
        };
        return <div key={i} className={`hero-particle ${bg}`} style={style} />;
      })}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  // Register GSAP plugins inside the component before any useEffect
  gsap.registerPlugin(ScrollTrigger);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const pipelineRef = useRef(null);
  const conditionsRef = useRef(null);
  const demoRef = useRef(null);
  const trustRef = useRef(null);
  const ctaRef = useRef(null);

  // Live Demo preset selection state
  const [activePreset, setActivePreset] = useState(0);

  const presets = [
    {
      name: t('demo.preset_healthy'),
      data: [
        { name: t('diagnose.tsh'), val: '2.4 mIU/L' },
        { name: t('diagnose.t3'), val: '1.8 ng/dL' },
        { name: t('diagnose.tt4'), val: '7.2 μg/dL' },
        { name: t('diagnose.age'), val: '34' },
        { name: t('diagnose.sex'), val: t('diagnose.female') }
      ],
      prediction: t('predictions.Normal'),
      confidence: '94.2%',
      statusColor: 'text-xai-success',
      bulletColor: 'bg-xai-success',
      importance: [
        { label: t('diagnose.tsh_label'), value: 85, color: 'bg-xai-accent' },
        { label: t('diagnose.tt4_label'), value: 62, color: 'bg-xai-accent' },
        { label: t('diagnose.age_label'), value: 34, color: 'bg-xai-muted' }
      ]
    },
    {
      name: t('demo.preset_hypo'),
      data: [
        { name: t('diagnose.tsh'), val: '12.8 mIU/L' },
        { name: t('diagnose.t3'), val: '0.9 ng/dL' },
        { name: t('diagnose.tt4'), val: '4.1 μg/dL' },
        { name: t('diagnose.age'), val: '52' },
        { name: t('diagnose.sex'), val: t('diagnose.male') }
      ],
      prediction: t('predictions.Hypothyroid'),
      confidence: '89.5%',
      statusColor: 'text-xai-warning',
      bulletColor: 'bg-xai-warning',
      importance: [
        { label: t('diagnose.tsh_label'), value: 95, color: 'bg-xai-accent' },
        { label: t('diagnose.tt4_label'), value: 78, color: 'bg-xai-accent' },
        { label: t('diagnose.age_label'), value: 12, color: 'bg-xai-muted' }
      ]
    },
    {
      name: t('demo.preset_hyper'),
      data: [
        { name: t('diagnose.tsh'), val: '0.1 mIU/L' },
        { name: t('diagnose.t3'), val: '3.5 ng/dL' },
        { name: t('diagnose.tt4'), val: '15.4 μg/dL' },
        { name: t('diagnose.age'), val: '28' },
        { name: t('diagnose.sex'), val: t('diagnose.female') }
      ],
      prediction: t('predictions.Hyperthyroid'),
      confidence: '91.8%',
      statusColor: 'text-xai-danger',
      bulletColor: 'bg-xai-danger',
      importance: [
        { label: t('diagnose.tsh_label'), value: 92, color: 'bg-xai-accent' },
        { label: t('diagnose.t3_label'), value: 88, color: 'bg-xai-accent' },
        { label: t('diagnose.tt4_label'), value: 74, color: 'bg-xai-accent' }
      ]
    }
  ];

  useEffect(() => {
    let ctx;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // Hero word-by-word reveal
        gsap.fromTo('.hero-word', 
          { y: 100, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.2, 
            stagger: 0.25, 
            ease: 'power4.out',
            delay: 0.3 
          }
        );
        gsap.to('.hero-eyebrow', { opacity: 1, duration: 1, delay: 0.1 });
        gsap.fromTo('.hero-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'power3.out' });
        gsap.fromTo('.hero-buttons', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 1.5, ease: 'power3.out' });

        // Stats section ScrollTrigger
        gsap.from('.stat-card', {
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // Pipeline section ScrollTrigger
        gsap.from('.step-card', {
          y: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: pipelineRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // Conditions section ScrollTrigger
        gsap.from('.condition-card', {
          rotateX: 15,
          y: 80,
          opacity: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: conditionsRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // Demo section ScrollTrigger
        gsap.from('.demo-panel', {
          scale: 0.95,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: demoRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // Trust section ScrollTrigger
        gsap.from('.trust-card', {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: trustRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // CTA section ScrollTrigger
        gsap.from('.cta-section-anim', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          }
        });

        // Fallback: ensure all elements are visible after 2 seconds
        setTimeout(() => {
          gsap.set([
            '.stat-card', '.step-card', '.condition-card', 
            '.trust-card', '.demo-panel', '.cta-section-anim', '.cta-section > div > *'
          ], { opacity: 1, y: 0, x: 0, scale: 1 });
          ScrollTrigger.refresh();
        }, 2000);
      });
    }, 100);

    // ScrollTrigger refresh call after a short delay
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(refreshTimer);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-xai-bg text-xai-text overflow-hidden font-poppins">
      
      {/* ─── SECTION 1: HERO ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-xai-bg py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <ParticleSphere /> {/* ← behind everything */}

        {/* Radial ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)] pointer-events-none z-[1]" />
        
        {/* Floating Particle field */}
        <ParticleField />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <p className="font-poppins text-xai-accent text-sm md:text-base tracking-[0.3em] uppercase mb-6 opacity-0 hero-eyebrow">
            {t('hero.eyebrow')}
          </p>

          <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="inline-block overflow-hidden">
              <span className="hero-word inline-block">{t('hero.headline1')}</span>
            </span>{' '}
            <span className="inline-block overflow-hidden">
              <span className="hero-word inline-block text-xai-accent">{t('hero.headline2')}</span>
            </span>{' '}
            <span className="inline-block overflow-hidden">
              <span className="hero-word inline-block">{t('hero.headline3')}</span>
            </span>
          </h1>

          <p className="hero-sub font-poppins text-lg md:text-xl text-xai-muted max-w-2xl mx-auto mb-12 leading-relaxed opacity-0">
            {t('hero.subtitle')}
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0">
            <Link 
              to="/diagnose" 
              className="relative overflow-hidden bg-xai-accent text-white font-poppins font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 text-center w-full sm:w-auto"
            >
              {t('hero.cta1')}
            </Link>
            <button 
              className="relative overflow-hidden bg-transparent border border-xai-border text-white font-poppins font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:border-xai-accent hover:text-xai-accent hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Play size={18} /> {t('hero.cta2')}
            </button>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: THE SILENT EPIDEMIC ─────────────────── */}
      <section
        ref={statsRef}
        className="stats-section bg-xai-bgAlt py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              {t('epidemic.title')} <span className="text-xai-accent">{t('epidemic.titleAccent')}</span>
            </h2>
            <p className="font-poppins text-xai-muted text-lg max-w-2xl mx-auto">
              {t('epidemic.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="stat-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <Globe className="absolute top-6 right-6 text-xai-accent/30" size={36} />
              <div className="font-orbitron text-5xl md:text-6xl font-bold text-xai-accent mb-4">{t('epidemic.stat1Number')}</div>
              <div className="font-poppins text-xai-muted text-lg font-medium">{t('epidemic.stat1Label')}</div>
            </div>

            {/* Card 2 */}
            <div className="stat-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <AlertTriangle className="absolute top-6 right-6 text-xai-warning/30" size={36} />
              <div className="font-orbitron text-5xl md:text-6xl font-bold text-xai-warning mb-4">{t('epidemic.stat2Number')}</div>
              <div className="font-poppins text-xai-muted text-lg font-medium">{t('epidemic.stat2Label')}</div>
            </div>

            {/* Card 3 */}
            <div className="stat-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <Users className="absolute top-6 right-6 text-xai-danger/30" size={36} />
              <div className="font-orbitron text-5xl md:text-6xl font-bold text-xai-danger mb-4">{t('epidemic.stat3Number')}</div>
              <div className="font-poppins text-xai-muted text-lg font-medium">{t('epidemic.stat3Label')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: HOW XAI THYROID WORKS ───────────────── */}
      <section
        ref={pipelineRef}
        className="pipeline-section bg-xai-bg py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="font-poppins text-xai-muted text-lg max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-xai-accent/30 to-transparent -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Step 1 */}
              <div className="step-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 text-center relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mx-auto mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                  <Database size={28} />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('howItWorks.step1')}</h3>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-xai-bg border border-xai-accent text-xai-accent font-orbitron text-xs flex items-center justify-center font-bold">
                  1
                </div>
              </div>

              {/* Step 2 */}
              <div className="step-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 text-center relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mx-auto mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                  <Filter size={28} />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('howItWorks.step2')}</h3>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-xai-bg border border-xai-accent text-xai-accent font-orbitron text-xs flex items-center justify-center font-bold">
                  2
                </div>
              </div>

              {/* Step 3 */}
              <div className="step-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 text-center relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mx-auto mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                  <Brain size={28} />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('howItWorks.step3')}</h3>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-xai-bg border border-xai-accent text-xai-accent font-orbitron text-xs flex items-center justify-center font-bold">
                  3
                </div>
              </div>

              {/* Step 4 */}
              <div className="step-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 text-center relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mx-auto mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                  <Search size={28} />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('howItWorks.step4')}</h3>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-xai-bg border border-xai-accent text-xai-accent font-orbitron text-xs flex items-center justify-center font-bold">
                  4
                </div>
              </div>

              {/* Step 5 */}
              <div className="step-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 text-center relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mx-auto mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                  <FileText size={28} />
                </div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('howItWorks.step5')}</h3>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-xai-bg border border-xai-accent text-xai-accent font-orbitron text-xs flex items-center justify-center font-bold">
                  5
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: THREE CONDITIONS ───────────────────── */}
      <section
        ref={conditionsRef}
        className="conditions-section bg-xai-bgAlt py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              {t('conditions.title')} <span className="text-xai-accent">{t('conditions.titleAccent')}</span>
            </h2>
            <p className="font-poppins text-xai-muted text-lg max-w-2xl mx-auto">
              {t('conditions.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Hypothyroid */}
            <div className="condition-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl border-t-4 border-t-xai-warning p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-orbitron text-2xl font-bold text-white">{t('conditions.hypo')}</h3>
                  <TrendingDown className="text-xai-warning" size={28} />
                </div>
                <p className="font-poppins text-xai-muted text-sm leading-relaxed mb-6">
                  {t('conditions.hypoDesc')}
                </p>
              </div>
              <span className="bg-xai-warning/10 text-xai-warning border border-xai-warning/20 px-3 py-1 rounded-full text-xs font-poppins font-medium inline-block w-fit">
                {t('conditions.hypo')}
              </span>
            </div>

            {/* Normal */}
            <div className="condition-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl border-t-4 border-t-xai-success p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-orbitron text-2xl font-bold text-white">{t('conditions.normal')}</h3>
                  <Activity className="text-xai-success" size={28} />
                </div>
                <p className="font-poppins text-xai-muted text-sm leading-relaxed mb-6">
                  {t('conditions.normalDesc')}
                </p>
              </div>
              <span className="bg-xai-success/10 text-xai-success border border-xai-success/20 px-3 py-1 rounded-full text-xs font-poppins font-medium inline-block w-fit">
                {t('conditions.normal')}
              </span>
            </div>

            {/* Hyperthyroid */}
            <div className="condition-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl border-t-4 border-t-xai-danger p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-orbitron text-2xl font-bold text-white">{t('conditions.hyper')}</h3>
                  <TrendingUp className="text-xai-danger" size={28} />
                </div>
                <p className="font-poppins text-xai-muted text-sm leading-relaxed mb-6">
                  {t('conditions.hyperDesc')}
                </p>
              </div>
              <span className="bg-xai-danger/10 text-xai-danger border border-xai-danger/20 px-3 py-1 rounded-full text-xs font-poppins font-medium inline-block w-fit">
                {t('conditions.hyper')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: LIVE DEMO PREVIEW ───────────────────── */}
      <section
        ref={demoRef}
        className="demo-section bg-xai-bg py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              {t('demo.heading')}
            </h2>
            <p className="font-poppins text-xai-muted text-center text-lg max-w-2xl mx-auto">
              {t('demo.subheading')}
            </p>
          </div>

          <div className="demo-panel max-w-5xl mx-auto bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 md:p-12 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Top bar tabs */}
            <div className="flex flex-wrap gap-4 mb-10">
              {presets.map((patient, i) => (
                <button 
                  key={i} 
                  onClick={() => setActivePreset(i)}
                  className={`relative overflow-hidden text-sm py-2 px-6 rounded-full transition-all duration-300 font-poppins font-semibold active:scale-95 ${
                    activePreset === i 
                      ? 'bg-xai-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                      : 'bg-transparent border border-xai-border text-xai-muted hover:border-xai-accent hover:text-white'
                  }`}
                >
                  {patient.name}
                </button>
              ))}
            </div>
            
            {/* Mock interface grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input panel */}
              <div className="lg:col-span-1 bg-xai-card rounded-xl p-6 border border-xai-border">
                <h4 className="font-orbitron text-white font-bold mb-4">{t('diagnose.demo_patients')}</h4>
                <div className="space-y-3">
                  {presets[activePreset].data.map((item, i) => (
                    <div key={i} className="flex justify-between font-poppins text-sm border-b border-white/5 pb-2">
                      <span className="text-xai-muted">{item.name}</span>
                      <span className="text-white font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Prediction panel */}
              <div className="lg:col-span-2 bg-xai-card rounded-xl p-6 border border-xai-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-xai-accent/5 rounded-full blur-3xl pointer-events-none" />
                <h4 className="font-orbitron text-white font-bold mb-6">{t('diagnose.result')}</h4>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-3 h-3 rounded-full ${presets[activePreset].bulletColor} animate-pulse`} />
                  <span className={`font-orbitron text-2xl font-bold ${presets[activePreset].statusColor}`}>
                    {presets[activePreset].prediction}
                  </span>
                  <span className="font-poppins text-xai-muted text-sm">
                    {t('diagnose.confidence')}: <span className="text-white font-semibold">{presets[activePreset].confidence}</span>
                  </span>
                </div>

                {/* Mock feature importance bars */}
                <div className="space-y-4">
                  {presets[activePreset].importance.map((feat, i) => (
                    <div key={i}>
                      <div className="flex justify-between font-poppins text-sm mb-1">
                        <span className="text-xai-muted">{feat.label}</span>
                        <span className="text-white font-medium">{feat.value}%</span>
                      </div>
                      <div className="h-2 bg-xai-bg rounded-full overflow-hidden">
                        <div className={`h-full ${feat.color} rounded-full transition-all duration-500`} style={{ width: `${feat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5.5: ULTRASOUND IMAGE XAI FEATURE ───────── */}
      <section
        className="ultrasound-feature bg-xai-bgAlt py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border relative overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <span className="eyebrow flex items-center gap-2 text-xai-accent uppercase tracking-widest text-xs font-bold font-orbitron">
              <span className="w-2 h-2 rounded-full bg-xai-accent animate-ping" />
              New Feature
            </span>
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white leading-tight">
              Thyroid Ultrasound <br/>
              <span className="text-xai-accent">Image XAI Analysis</span>
            </h2>
            <p className="font-poppins text-xai-muted text-base md:text-lg leading-relaxed">
              Experience the future of diagnostic transparency. Upload thyroid ultrasound scans (JPG/PNG) to instantly highlight candidate nodule regions. Our Explainable AI engine superimposes four distinct attention overlays: <strong>Grad-CAM</strong>, <strong>Grad-CAM++</strong>, <strong>LIME</strong>, and <strong>RISE</strong>.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                to="/ultrasound" 
                className="relative overflow-hidden bg-xai-accent text-white font-poppins font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 text-center"
              >
                Analyze Ultrasound Scan
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="glass-card p-4 bg-xai-glass border border-xai-border rounded-2xl relative overflow-hidden group hover:border-xai-accent/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/5 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-black flex items-center justify-center text-zinc-700 select-none">
                  <div className="w-4/5 h-4/5 rounded-full border-4 border-dashed border-zinc-800/60 animate-[spin_40s_linear_infinite] absolute" />
                  <div className="w-2/3 h-2/3 rounded-full border border-dashed border-zinc-800/40 animate-[spin_20s_linear_infinite_reverse] absolute" />
                  <span className="font-orbitron font-semibold text-xs tracking-wider opacity-30 uppercase">Thyroid Ultrasound Scan Simulation</span>
                </div>
                
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-red-500/60 bg-red-500/10 blur-[2px] flex items-center justify-center animate-pulse">
                  <span className="font-orbitron font-bold text-[9px] text-red-400 tracking-widest uppercase">Nodule 87.2%</span>
                </div>
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.25)_0%,_rgba(245,158,11,0.15)_30%,_rgba(59,130,246,0.05)_60%,_transparent_80%)] pointer-events-none mix-blend-screen" />
              </div>
              <div className="mt-4 flex justify-between items-center text-xs font-mono text-xai-muted">
                <span>MODEL: Ultrasound ResNetXAI</span>
                <span>METHOD: Grad-CAM++</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: WHY TRUST THIS TOOL ─────────────────── */}
      <section
        ref={trustRef}
        className="trust-section bg-xai-bgAlt py-24 px-6 md:px-12 lg:px-20 xl:px-32 border-b border-xai-border"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-white mb-4">
              {t('trust.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="trust-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 md:p-10 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-xl bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                <Eye size={26} />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('trust.feat1_title')}</h3>
              <p className="font-poppins text-xai-muted text-sm leading-relaxed">
                {t('trust.feat1_desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="trust-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 md:p-10 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-xl bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                <ShieldCheck size={26} />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('trust.feat2_title')}</h3>
              <p className="font-poppins text-xai-muted text-sm leading-relaxed">
                {t('trust.feat2_desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="trust-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 md:p-10 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-xl bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                <Lock size={26} />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('trust.feat3_title')}</h3>
              <p className="font-poppins text-xai-muted text-sm leading-relaxed">
                {t('trust.feat3_desc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="trust-card bg-xai-glass backdrop-blur-[12px] border border-xai-border rounded-2xl p-8 md:p-10 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div className="w-14 h-14 rounded-xl bg-xai-accent/10 border border-xai-accent/20 flex items-center justify-center mb-6 text-xai-accent group-hover:bg-xai-accent group-hover:text-white transition-all duration-500">
                <GitBranch size={26} />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3">{t('trust.feat4_title')}</h3>
              <p className="font-poppins text-xai-muted text-sm leading-relaxed">
                {t('trust.feat4_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: FINAL CTA ───────────────────────────── */}
      <section
        ref={ctaRef}
        className="cta-section bg-gradient-to-b from-xai-bg to-xai-bgAlt py-32 px-6 md:px-12 lg:px-20 xl:px-32 relative overflow-hidden"
      >
        {/* Radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-xai-accent/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.1)_0%,_transparent_60%)] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10 cta-section-anim">
          <h2 className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('cta_section.heading')}
          </h2>
          
          <p className="font-poppins text-xai-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('cta_section.subheading')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/diagnose" 
              className="relative overflow-hidden bg-xai-accent text-white font-poppins font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 text-lg text-center w-full sm:w-auto"
            >
              {t('hero.cta_diagnose')}
            </Link>
            <Link 
              to="/about" 
              className="relative overflow-hidden bg-transparent border border-xai-border text-white font-poppins font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:border-xai-accent hover:text-xai-accent hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-lg text-center w-full sm:w-auto"
            >
              {t('nav.about')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
