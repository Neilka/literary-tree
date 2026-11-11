import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** Global scroll-triggered subtle background effects */
export default function ScrollBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.to('.grid-overlay', {
        backgroundSize: '120px 120px',
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* Fixed grid overlay */}
      <div className="grid-overlay pointer-events-none fixed inset-0 z-[2]" />
      {/* Floating dot cursor follower */}
      <MouseDot />
    </>
  )
}

function MouseDot() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current!
    const ring = ringRef.current!
    let mx = 0, my = 0
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      gsap.to(dot, { x: mx - 4, y: my - 4, duration: 0.1, ease: 'power2.out' })
      gsap.to(ring, { x: mx - 16, y: my - 16, duration: 0.4, ease: 'power2.out' })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <div ref={ringRef}
           className="pointer-events-none fixed w-8 h-8 rounded-full border border-crimson/40 z-[9999] hidden lg:block" />
      <div ref={dotRef}
           className="pointer-events-none fixed w-2 h-2 rounded-full bg-crimson/60 z-[9999] hidden lg:block" />
    </>
  )
}
