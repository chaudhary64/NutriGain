"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Home() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const containerRef = useRef(null);

  useGSAP(() => {
    // Nav elements reveal
    gsap.fromTo(".nav-element", 
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
    );

    // Hero timeline for sequential majestic reveal
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(".hero-badge",
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8 }
    )
    .fromTo(".hero-title-word",
      { y: 100, opacity: 0, rotationX: 45 },
      { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.15 },
      "-=0.5"
    )
    .fromTo(".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.7"
    )
    .fromTo(".hero-desc",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    )
    .fromTo(".hero-buttons",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      "-=0.8"
    );

    // Scroll Animations for sections
    const scrollElements = gsap.utils.toArray('.scroll-reveal');
    scrollElements.forEach((el) => {
      gsap.fromTo(el, 
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
          }
        }
      );
    });

    // Scroll Animations with staggering
    const staggerContainers = gsap.utils.toArray('.scroll-stagger-container');
    staggerContainers.forEach((container) => {
      const children = container.querySelectorAll('.scroll-stagger-item');
      gsap.fromTo(children, 
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true
          }
        }
      );
    });

    // Dynamic background mouse move effect (Glow spotlight)
    const cursorBg = document.querySelector(".glow-bg");
    if (cursorBg) {
      // Hide cursor glow on mobile logic handled in tailwind (hidden md:block)
      if(window.innerWidth > 768) {
        // Use quickTo for buttery smooth 60fps tracking without memory leaks or staggering instances
        const xTo = gsap.quickTo(cursorBg, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(cursorBg, "y", { duration: 0.4, ease: "power3" });

        const moveGlow = (e) => {
          xTo(e.clientX);
          yTo(e.clientY);
        };
        window.addEventListener("mousemove", moveGlow);
        return () => window.removeEventListener("mousemove", moveGlow);
      }
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#020202] text-white selection:bg-lime-500 selection:text-black font-sans overflow-hidden">
      
      {/* Dynamic Cursor Glow Background */}
      <div className="glow-bg fixed top-0 left-0 w-[800px] h-[800px] bg-lime-500/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 hidden md:block"></div>
      
      {/* Deep Space Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #666 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#020202] via-[#020202]/80 to-transparent z-0"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#020202]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="nav-element flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)] group-hover:shadow-[0_0_30px_rgba(132,204,22,0.6)] group-hover:scale-105 transition-all duration-500">
                <span className="text-black text-xl">🎯</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase text-white relative">
                Nutri<span className="text-lime-500 drop-shadow-[0_0_15px_rgba(132,204,22,0.4)]">Gain</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-8">
              {user ? (
                <>
                  <div className="nav-element text-right hidden md:block">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Logged in as</p>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                  </div>
                  <div className="nav-element h-10 w-px bg-white/10"></div>
                  <Link href="/dashboard" className="nav-element text-xs font-bold uppercase tracking-wider text-lime-400 hover:text-lime-300 transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="nav-element text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="nav-element text-neutral-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-xs">
                    Login
                  </Link>
                  <Link href="/register" className="nav-element group overflow-hidden bg-lime-500 text-black px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-transform hover:scale-105 shadow-[0_0_15px_rgba(132,204,22,0.3)]">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button - keep unchanged */}
            <div className="nav-element flex items-center lg:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 hover:bg-white/5 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#050505]/95 backdrop-blur-3xl border-b border-white/5 absolute w-full left-0 top-full shadow-2xl">
            {/* Same auth dropdown setup as before, omitted for brevity but keeping standard rendering */}
            <div className="px-6 py-8 space-y-4">
              {user ? (
                <>
                  <div className="pb-6 border-b border-white/5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">User</p>
                    <p className="text-xl font-bold text-white">{user.name}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-5 py-4 rounded-xl bg-white/5 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition">Dashboard</Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-5 py-4 rounded-xl border border-red-900/30 text-red-500 font-bold uppercase tracking-wider text-sm hover:bg-red-900/10 transition">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-5 py-4 rounded-xl text-white font-bold uppercase tracking-wider text-sm border border-white/10 transition flex justify-between">Login <span>→</span></Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-5 py-4 rounded-xl bg-lime-500 text-black font-bold uppercase tracking-wider text-sm transition flex justify-between shadow-[0_0_20px_rgba(132,204,22,0.3)]">Get Started <span>→</span></Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 1: HERO */}
      <div className="relative pt-[20vh] pb-32 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="max-w-6xl mx-auto text-center px-4">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 rounded-full border border-lime-500/30 bg-lime-500/10 text-lime-400 text-xs font-bold mb-8 uppercase tracking-widest backdrop-blur-md">
            Nutrition & Gym Tracker
          </div>

          <h1 className="hero-title text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tighter text-white mb-6 leading-[0.9] uppercase italic" style={{ perspective: "1000px" }}>
            <span className="hero-title-word inline-block origin-bottom transform-gpu">Nutri</span>
            <span className="hero-title-word inline-block origin-bottom transform-gpu text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 drop-shadow-[0_0_40px_rgba(132,204,22,0.35)] pr-4">Gain</span>
          </h1>

          <p className="hero-subtitle text-2xl md:text-4xl text-neutral-300 mt-6 mb-6 max-w-3xl mx-auto tracking-wide font-light">
            Track Your Macros. <span className="text-lime-500 font-bold">Dominate Your Goals.</span>
          </p>

          <p className="hero-desc text-lg text-neutral-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            NutriGain is a full-stack fitness tracking hub for athletes who take their nutrition and lifting seriously. Monitor calories, track PRs, and map your consistency.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/register" className="group relative px-10 py-4 bg-lime-500 text-black rounded-xl font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-[0_0_20px_rgba(132,204,22,0.3)]">
              <span className="relative z-10">Get Started Free</span>
            </Link>
            <Link href="/login" className="group px-10 py-4 bg-transparent border border-neutral-700 rounded-xl font-bold uppercase tracking-wider text-white text-sm hover:border-lime-500 hover:text-lime-500 transition-all hover:scale-105">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: CORE FEATURES GRID */}
      <div className="relative max-w-7xl mx-auto px-4 pb-40 z-10 scroll-stagger-container">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl font-black uppercase text-neutral-500 tracking-tighter">— The Foundation</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="scroll-stagger-item w-full">
            <div className="group relative p-8 rounded-2xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-lime-500/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-3xl mb-5 mx-auto group-hover:scale-125 transition-transform duration-500">🎯</div>
                <h3 className="text-lg font-bold mb-2 text-white uppercase tracking-tight">Track Macros</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">Monitor calories, protein, carbs, and fats visually.</p>
              </div>
            </div>
          </div>

          <div className="scroll-stagger-item w-full">
            <div className="group relative p-8 rounded-2xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-lime-500/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-3xl mb-5 mx-auto group-hover:scale-125 transition-transform duration-500">🍽️</div>
                <h3 className="text-lg font-bold mb-2 text-white uppercase tracking-tight">Meal Database</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">Access verified meals with highly accurate macro data.</p>
              </div>
            </div>
          </div>

          <div className="scroll-stagger-item w-full">
            <div className="group relative p-8 rounded-2xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-lime-500/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-3xl mb-5 mx-auto group-hover:scale-125 transition-transform duration-500">🏋️</div>
                <h3 className="text-lg font-bold mb-2 text-white uppercase tracking-tight">Gym Library</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">Log personal records and working weights per muscle group.</p>
              </div>
            </div>
          </div>

          <div className="scroll-stagger-item w-full">
            <div className="group relative p-8 rounded-2xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-lime-500/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center text-3xl mb-5 mx-auto group-hover:scale-125 transition-transform duration-500">📈</div>
                <h3 className="text-lg font-bold mb-2 text-white uppercase tracking-tight">Progression</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">See your gym momentum via activity heatmaps and weight charts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: GYM CALENDAR / WORKOUT TRACKER */}
      <div className="relative max-w-7xl mx-auto px-4 py-32 z-10 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal order-2 md:order-1 w-full">
            <div className="relative h-[400px] w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-8 group transition-all duration-500 hover:border-lime-500/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-full max-w-sm h-full border border-white/5 rounded-2xl bg-[#020202] flex flex-col items-center justify-center p-6 gap-4 relative z-10 hover:scale-105 transition-transform duration-700 shadow-2xl">
                 <div className="text-lime-500 text-6xl mb-2 drop-shadow-[0_0_15px_rgba(132,204,22,0.5)]">🔥</div>
                 <div className="w-3/4 h-6 border-b border-lime-500/30 font-bold uppercase tracking-widest text-neutral-400 text-[10px] text-center pb-2 mb-4">Activity Heatmap</div>
                 <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {[...Array(28)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${i % 3 === 0 || i % 5 === 0 ? 'bg-lime-500 drop-shadow-[0_0_5px_rgba(132,204,22,0.5)]' : 'bg-neutral-800'} transition-colors duration-300`}></div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
          
          <div className="scroll-reveal order-1 md:order-2">
            <div className="inline-block px-4 py-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 text-lime-400 text-[10px] font-bold mb-6 uppercase tracking-widest">
              Gym Tracking
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">Visualize</span> Consistency.
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-8 font-light">
              Logging meals is only half the equation. Track your daily gym sessions and visualize your consistency natively through a gorgeous GitHub-style heatmap calendar. Keep the momentum going.
            </p>
            <ul className="space-y-4">
              {['Log Personal Records (PRs) per exercise', 'Follow targeted weekly muscle schedules', 'Interactive body weight progression charts'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300 text-sm md:text-base font-bold tracking-wide" style={{ textTransform: "uppercase" }}>
                  <span className="text-lime-500 text-xl border border-lime-500/30 bg-lime-500/10 rounded-full h-6 w-6 flex items-center justify-center">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4: DIET PLANNING */}
      <div className="relative max-w-7xl mx-auto px-4 py-32 z-10 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold mb-6 uppercase tracking-widest">
              Nutrition Plans
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
              Data-Driven <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Dieting.</span>
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed mb-8 font-light">
              NutriGain replaces guessing with absolute precision. Create custom weekly protein plans and confidently hit your macros exactly where they need to be to fuel growth or drive fat loss.
            </p>
            <ul className="space-y-4">
              {['Custom Chicken vs Paneer day planning', 'Real-time Macro countdown meters', 'Live database search for fast logging'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300 text-sm md:text-base font-bold tracking-wide" style={{ textTransform: "uppercase" }}>
                  <span className="text-blue-500 text-xl border border-blue-500/30 bg-blue-500/10 rounded-full h-6 w-6 flex items-center justify-center">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="scroll-reveal w-full">
            <div className="relative h-[400px] w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-8 group transition-all duration-500 hover:border-blue-500/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="w-full max-w-sm h-full border border-white/5 rounded-2xl bg-[#020202] flex flex-col p-8 gap-6 relative z-10 hover:scale-105 transition-transform duration-700 shadow-2xl">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div className="font-bold text-neutral-500 text-[10px] uppercase tracking-widest">Daily Goals</div>
                  <div className="text-blue-400 text-3xl font-black tracking-tighter">2,450 kcal</div>
                </div>
                <div className="space-y-6 flex-1 mt-4">
                  {[
                    { name: 'Protein', color: 'bg-lime-500', width: 'w-[85%]', shadow: 'shadow-[0_0_10px_rgba(132,204,22,0.5)]' },
                    { name: 'Carbs', color: 'bg-blue-500', width: 'w-[45%]', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
                    { name: 'Fats', color: 'bg-amber-500', width: 'w-[30%]', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' }
                  ].map((macro, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-white uppercase tracking-wider">
                        <span>{macro.name}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${macro.color} ${macro.width} rounded-full ${macro.shadow}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: FINAL CTA */}
      <div className="relative py-32 z-10 border-t border-white/5 bg-[radial-gradient(ellipse_at_bottom,rgba(132,204,22,0.1),transparent_50%)]">
        <div className="max-w-4xl mx-auto text-center px-4 scroll-reveal">
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter mb-8 italic">
            Stop Guessing.<br/><span className="text-lime-500">Start Gaining.</span>
          </h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join the ultimate platform for athletes who obsess over the details. Track your macros, crush your lifts, and hold yourself accountable.
          </p>
          <Link href="/register" className="inline-block group relative px-12 py-5 bg-lime-500 text-black rounded-xl font-black uppercase tracking-widest text-sm transition-transform hover:scale-105 shadow-[0_0_30px_rgba(132,204,22,0.4)]">
             Create Your Account
          </Link>
        </div>
      </div>

      {/* SECTION 6: FOOTER */}
      <footer className="relative border-t border-white/5 bg-[#010101] py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 grayscale cursor-pointer">
            <span className="text-xl">🎯</span>
            <span className="text-xl font-black tracking-tighter uppercase text-neutral-500">
              Nutri<span className="text-neutral-300">Gain</span>
            </span>
          </div>
          <p className="text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase">
            Built for athletes.
          </p>
          <div className="text-neutral-500 text-xs font-mono uppercase">
            © {new Date().getFullYear()} NutriGain.
          </div>
        </div>
      </footer>
    </div>
  );
}
