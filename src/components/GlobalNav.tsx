import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export default function GlobalNav() {
  const ref = useRef<HTMLElement>(null)
  const loc = useLocation()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <nav ref={ref} className="fixed top-0 left-0 right-0 z-50 px-8 py-5 gsap-hidden">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <svg width="28" height="28" viewBox="0 0 28 28" className="text-crimson transition-transform group-hover:rotate-45 duration-500">
            <path d="M14 2 L14 26 M14 8 C8 8 4 12 4 16 M14 12 C20 12 24 16 24 20 M14 18 C9 18 5 20 3 24"
                  stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <span className="font-mono text-xs tracking-[4px] text-ink/70 group-hover:text-ink">ARBOR · LITTERARUM</span>
        </Link>
        <div className="flex items-center gap-8 font-mono text-xs tracking-[3px]">
          {loc.pathname === '/' ? (
            <span className="text-crimson">FIG.01 — SPECIMEN TOTALIS</span>
          ) : (
            <Link to="/" className="text-ink/60 hover:text-crimson transition-colors">← 返回树冠</Link>
          )}
          <span className="text-ink/40 hidden md:inline">389 SCRIPTORES · 21 AETATES</span>
        </div>
      </div>
    </nav>
  )
}
