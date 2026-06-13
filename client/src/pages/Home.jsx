import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Zap, Globe, ArrowRight, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { initHeroAnimation, initScrollAnimations } from '../animations/gsapAnimations';

export default function Home() {
  const { t } = useTranslation();
  const heroRef = useRef(null);

  useEffect(() => {
    // Run premium animations
    initHeroAnimation(heroRef);
    initScrollAnimations();
  }, []);

  // Generate simple particles array for background hero animation
  const particles = Array.from({ length: 15 });

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-secondary overflow-hidden font-poppins">
      
      {/* ─── SECTION 1: HERO (Cinematic Welcome) ─────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center pt-24 px-6 overflow-hidden border-b border-border"
      >
        {/* Floating Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--dur': `${8 + Math.random() * 8}s`,
                '--delay': `${Math.random() * 5}s`,
                left: `${Math.random() * 100}%`,
                transform: `scale(${0.3 + Math.random() * 0.8})`
              }}
            />
          ))}
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6 z-10">
          <span className="hero-eyebrow eyebrow px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs">
            {t('hero.eyebrow')}
          </span>

          <h1 className="hero-title font-orbitron font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.15] text-white">
            <span className="hero-word inline-block mr-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              {t('hero.tagline1')}
            </span>
            <span className="hero-word inline-block mr-4">
              {t('hero.tagline2')}
            </span>
            <span className="hero-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-success to-emerald-400">
              {t('hero.tagline3')}
            </span>
          </h1>

          <p className="hero-subtitle text-base md:text-xl text-muted max-w-2xl leading-relaxed mt-4">
            {t('hero.subtitle')}
          </p>

          <div className="hero-btn flex flex-col sm:flex-row gap-4 mt-6">
            <Link to="/diagnose" className="btn-primary flex items-center gap-2">
              <span>{t('hero.cta_diagnose')}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-secondary">
              {t('hero.cta_learn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: PROBLEM STATS (Scroll Triggered) ─────────────────────────── */}
      <section className="py-24 px-6 section-container border-b border-border">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow">{t('problem.heading')}</span>
          <h2 className="section-heading-anim section-heading">{t('problem.subheading')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="stat-card glass-card p-8 flex flex-col gap-4 text-center">
            <span className="font-orbitron font-extrabold text-5xl text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {t('problem.stat1_num')}
            </span>
            <p className="font-poppins text-sm text-muted leading-relaxed">
              {t('problem.stat1_desc')}
            </p>
          </div>

          <div className="stat-card glass-card p-8 flex flex-col gap-4 text-center">
            <span className="font-orbitron font-extrabold text-5xl text-warning drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {t('problem.stat2_num')}
            </span>
            <p className="font-poppins text-sm text-muted leading-relaxed">
              {t('problem.stat2_desc')}
            </p>
          </div>

          <div className="stat-card glass-card p-8 flex flex-col gap-4 text-center">
            <span className="font-orbitron font-extrabold text-5xl text-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              {t('problem.stat3_num')}
            </span>
            <p className="font-poppins text-sm text-muted leading-relaxed">
              {t('problem.stat3_desc')}
            </p>
          </div>
        </div>

        <p className="font-poppins text-sm md:text-base text-muted text-center max-w-3xl mx-auto leading-relaxed mt-12">
          {t('problem.para')}
        </p>
      </section>

      {/* ─── SECTION 3: PIPELINE (Step-by-Step Flow) ──────────────────────────────── */}
      <section className="py-24 bg-bg-card/30 border-b border-border">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="eyebrow">DIAGNOSTIC PIPELINE</span>
            <h2 className="section-heading">{t('how_it_works.heading')}</h2>
            <p className="section-subheading">{t('how_it_works.subheading')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
            {/* Step 1 */}
            <div className="pipeline-step glass-card p-6 flex flex-col gap-4">
              <span className="font-orbitron font-black text-2xl text-primary/30">01</span>
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('how_it_works.step1')}
              </h4>
            </div>
            {/* Step 2 */}
            <div className="pipeline-step glass-card p-6 flex flex-col gap-4">
              <span className="font-orbitron font-black text-2xl text-primary/30">02</span>
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('how_it_works.step2')}
              </h4>
            </div>
            {/* Step 3 */}
            <div className="pipeline-step glass-card p-6 flex flex-col gap-4">
              <span className="font-orbitron font-black text-2xl text-primary/30">03</span>
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('how_it_works.step3')}
              </h4>
            </div>
            {/* Step 4 */}
            <div className="pipeline-step glass-card p-6 flex flex-col gap-4">
              <span className="font-orbitron font-black text-2xl text-primary/30">04</span>
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('how_it_works.step4')}
              </h4>
            </div>
            {/* Step 5 */}
            <div className="pipeline-step glass-card p-6 flex flex-col gap-4">
              <span className="font-orbitron font-black text-2xl text-primary/30">05</span>
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('how_it_works.step5')}
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: CONDITIONS (3 Outcomes) ─────────────────────────────────── */}
      <section className="py-24 px-6 section-container border-b border-border">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow">DIAGNOSTIC OUTCOMES</span>
          <h2 className="section-heading">{t('conditions.heading')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hypothyroid */}
          <div className="condition-card glass-card p-8 flex flex-col gap-5 border-l-4 border-l-danger">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-lg text-danger">
                {t('conditions.hypo_title')}
              </h3>
              <AlertOctagon size={24} className="text-danger" />
            </div>
            <div className="flex flex-col gap-2.5 font-poppins text-sm">
              <p className="text-secondary font-medium">{t('conditions.hypo_tsh')}</p>
              <p className="text-muted leading-relaxed">{t('conditions.hypo_symptoms')}</p>
            </div>
          </div>

          {/* Normal */}
          <div className="condition-card glass-card p-8 flex flex-col gap-5 border-l-4 border-l-success">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-lg text-success">
                {t('conditions.normal_title')}
              </h3>
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <div className="flex flex-col gap-2.5 font-poppins text-sm">
              <p className="text-secondary font-medium">{t('conditions.normal_tsh')}</p>
              <p className="text-muted leading-relaxed">{t('conditions.normal_note')}</p>
            </div>
          </div>

          {/* Hyperthyroid */}
          <div className="condition-card glass-card p-8 flex flex-col gap-5 border-l-4 border-l-warning">
            <div className="flex justify-between items-center">
              <h3 className="font-orbitron font-bold text-lg text-warning">
                {t('conditions.hyper_title')}
              </h3>
              <Activity size={24} className="text-warning" />
            </div>
            <div className="flex flex-col gap-2.5 font-poppins text-sm">
              <p className="text-secondary font-medium">{t('conditions.hyper_tsh')}</p>
              <p className="text-muted leading-relaxed">{t('conditions.hyper_symptoms')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: TRUST FEATURES (Secure & Transparent) ────────────────────── */}
      <section className="py-24 bg-bg-card/20 border-b border-border">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="eyebrow">WHY CHOOSE XAI THYROID</span>
            <h2 className="section-heading">{t('trust.heading')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-item glass-card p-6 flex flex-col gap-4">
              <Zap className="text-primary" size={28} />
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('trust.feat1_title')}
              </h4>
              <p className="font-poppins text-xs text-muted leading-relaxed">
                {t('trust.feat1_desc')}
              </p>
            </div>

            <div className="feature-item glass-card p-6 flex flex-col gap-4">
              <Heart className="text-primary" size={28} />
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('trust.feat2_title')}
              </h4>
              <p className="font-poppins text-xs text-muted leading-relaxed">
                {t('trust.feat2_desc')}
              </p>
            </div>

            <div className="feature-item glass-card p-6 flex flex-col gap-4">
              <Globe className="text-primary" size={28} />
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('trust.feat3_title')}
              </h4>
              <p className="font-poppins text-xs text-muted leading-relaxed">
                {t('trust.feat3_desc')}
              </p>
            </div>

            <div className="feature-item glass-card p-6 flex flex-col gap-4">
              <ShieldCheck className="text-primary" size={28} />
              <h4 className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('trust.feat4_title')}
              </h4>
              <p className="font-poppins text-xs text-muted leading-relaxed">
                {t('trust.feat4_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: CALL TO ACTION (CTA Signup Promo) ────────────────────────── */}
      <section className="py-28 px-6 section-container text-center">
        <div className="cta-section-content glass-card max-w-4xl mx-auto p-12 md:p-16 flex flex-col items-center gap-6 relative overflow-hidden">
          {/* Accent light glow */}
          <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
          
          <h2 className="font-orbitron font-extrabold text-3xl md:text-5xl text-white">
            {t('cta_section.heading')}
          </h2>
          <p className="font-poppins text-sm md:text-base text-muted max-w-xl leading-relaxed">
            {t('cta_section.subheading')}
          </p>

          <Link to="/auth?mode=register" className="btn-primary mt-4 py-3 px-8 flex items-center gap-2">
            <span>{t('cta_section.btn')}</span>
            <ArrowRight size={18} />
          </Link>

          <p className="font-poppins text-xs text-muted mt-2">
            {t('cta_section.login_prompt')}{' '}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              {t('cta_section.login_link')}
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}
