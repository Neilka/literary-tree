import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '@/data/authors.json'
import LiteraryTree from '@/components/LiteraryTree'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-title', { y: 80, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' })
      gsap.from('.hero-label', { y: 30, opacity: 0, duration: 1, delay: 0.1, ease: 'power2.out' })
      gsap.from('.hero-sub', { y: 30, opacity: 0, duration: 1, delay: 0.6, ease: 'power2.out' })
      gsap.from('.hero-stats > *', { y: 30, opacity: 0, duration: 0.6, delay: 1, stagger: 0.12, ease: 'power2.out' })

      // Scroll-driven tree section animation
      gsap.from('.tree-section', {
        scrollTrigger: {
          trigger: '.tree-section',
          start: 'top 90%',
          end: 'bottom top',
          toggleActions: 'play none none reverse',
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
      })

      // Branch sections fade in
      gsap.utils.toArray('.branch-card').forEach((el: any) => {
        gsap.fromTo(el,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 40%',
              scrub: true,
            }
          }
        )
      })

      // Marquee infinite scroll
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          duration: 40,
          ease: 'none',
          repeat: -1,
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const { branches, stats } = data as any

  return (
    <div ref={heroRef} className="relative">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Marquee top */}
        <div className="absolute top-20 left-0 w-full overflow-hidden py-3 border-y border-bark/20 bg-parchment-dark/30">
          <div ref={marqueeRef} className="flex whitespace-nowrap font-mono text-xs tracking-[6px] text-ink/40">
            {Array.from({ length: 2 }).map((_, r) => (
              <div key={r} className="flex gap-12 pr-12">
                {['FIG.01', 'ARBOR LITTERARUM', '世界文学正典', 'ANNO -800 AD — 2026 AD', '389 SCRIPTORES', '21 AETATES', 'CANON OF WORLD LITERATURE', 'TRUNCUS = TEMPUS · RAMUS = AETAS · FOLIUM = SCRIPTOR'].map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center max-w-[1400px]">
          <div className="hero-label font-mono text-sm tracking-[6px] text-crimson mb-6">
            FIG. 01 — ARBOR LITTERARUM · 世界文学正典谱系
          </div>
          <h1 className="hero-title font-serif text-[clamp(64px,12vw,180px)] font-black leading-[0.9] tracking-tight text-ink">
            世界文学<br />
            <span className="text-crimson italic">之</span>树
          </h1>
          <p className="hero-sub mt-8 font-mono text-sm tracking-[3px] text-ink/60">
            从公元前 8 世纪到 21 世纪 · 一部可交互的文学谱系
          </p>
          <div className="hero-stats mt-12 grid grid-cols-2 md:flex md:items-center md:justify-center gap-8 md:gap-12 font-mono">
            <StatItem n={stats.total_authors} label="位作者 · SCRIPTORS" />
            <StatItem n={stats.total_branches} label="个时代分支 · AETATES" />
            <StatItem n={stats.pioneers} label="位流派开创者 · CONDITores" />
            <StatItem n={stats.nobelists} label="位诺奖得主 · PRAEMIUM" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[4px] text-ink/40 flex flex-col items-center gap-3">
          <span>SCROLL · DESCENDE AD RADICES</span>
          <div className="w-px h-12 bg-bark/40 relative overflow-hidden">
            <div className="absolute w-full h-4 bg-crimson animate-[scrollDown_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* TREE SECTION */}
      <section className="tree-section relative px-6 pb-32">
        <div className="max-w-[2200px] mx-auto">
          <div className="mb-16 text-center">
            <div className="font-mono text-xs tracking-[3px] text-crimson mb-3">SPECIMEN TOTALIS · 全景标本</div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink">文学之树</h2>
            <p className="mt-4 font-mono text-xs tracking-[2px] text-ink/50 max-w-2xl mx-auto leading-relaxed">
              树干为时间轴 · 从下往上：古典 → 中世纪 → 文艺复兴 → 启蒙 → 19世纪 → 现代主义 → 21世纪<br />
              枝干为时代分支 · 彩色树叶为作者 · 红色描边为流派开创者
            </p>
          </div>

          <LiteraryTree branches={branches} />

          {/* Legend below tree */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 font-mono text-xs text-ink/50">
            <LegendItem color="#C0392B" label="流派开创者 / CONDITOR" ring />
            <span className="text-crimson">●</span>
            <span>时间节点 / ANNUS</span>
            <span className="hidden md:inline opacity-50">|</span>
            <span className="hidden md:inline">点击树叶 → 查看作者详情</span>
          </div>
        </div>
      </section>

      {/* BRANCHES CARDS SECTION */}
      <section className="relative px-6 pb-32">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-16">
            <div className="font-mono text-xs tracking-[3px] text-crimson mb-3 text-center">RAMI · 时代枝干</div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink text-center mb-4">21 个时代分支</h2>
            <p className="font-mono text-xs tracking-[2px] text-ink/50 text-center">每一枝桠都是一个时代的呼吸</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {branches.map((branch) => (
              <BranchCard key={branch.name} branch={branch} index={0} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-bark/20 px-8 py-12 font-mono text-[11px] tracking-[2px] text-ink/40">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span>ARBOR LITTERARUM</span>
            <span className="opacity-50">|</span>
            <span>FONS: 世界文学正典总表 · 完整版</span>
          </div>
          <div className="flex items-center gap-4">
            <span>SCALA 1:1</span>
            <span className="opacity-50">|</span>
            <span>PROIECTIO: Orthogonalis</span>
            <span className="opacity-50">|</span>
            <span>REV. MMXXVI</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scrollDown {
          0% { top: -100%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}

function StatItem({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-4xl md:text-5xl font-black text-ink">{n}</div>
      <div className="text-[10px] tracking-[3px] text-ink/50 mt-1">{label}</div>
    </div>
  )
}

function LegendItem({ color, label, ring }: { color: string; label: string; ring?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {ring ? (
        <span className="w-3 h-3 rounded-full" style={{ border: `1.8px solid ${color}` }} />
      ) : (
        <span className="w-3 h-2 rounded-sm" style={{ background: color }} />
      )}
      <span>{label}</span>
    </div>
  )
}

function BranchCard({ branch, index }: { branch: any; index: number }) {
  const color = branch.color
  return (
    <div
      className="branch-card group relative bg-parchment border border-bark/20 p-6 transition-all duration-500 hover:border-current hover:shadow-xl"
      style={{ borderColor: `${color}40` }}
    >
      {/* Decorative line */}
      <div className="absolute top-0 left-6 right-6 h-[2px]" style={{ background: color }} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] tracking-[3px] opacity-50">
            {String(index + 1).padStart(2, '0')} / {String(21).padStart(2, '0')}
          </div>
          <h3 className="font-serif text-2xl font-bold mt-2" style={{ color }}>{branch.name}</h3>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
             style={{ background: `${color}20`, color }}>
          <span className="font-mono text-xs font-bold">{branch.authors.length}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {branch.authors.slice(0, 5).map((a: any) => (
          <div key={a.slug} className="flex items-center gap-2 font-mono text-[11px] text-ink/60">
            {a.isPioneer && <span className="text-crimson">★</span>}
            <span className="truncate">{a.name}</span>
          </div>
        ))}
        {branch.authors.length > 5 && (
          <div className="font-mono text-[10px] text-ink/30 pt-1">... 等 {branch.authors.length} 位</div>
        )}
      </div>
    </div>
  )
}
