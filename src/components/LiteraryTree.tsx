import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'
import type { Branch, Author } from '@/types'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  branches: Branch[]
}

interface AuthorCard {
  author: Author
  x: number
  y: number
  branchIdx: number
  side: number
}

// Canvas — the whole literary map
const CANVAS_W = 3800
const CANVAS_H = 5600

export default function LiteraryTree({ branches }: Props) {
  const rootRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const isDragging = useRef(false)
  const didDrag = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  // Build the winding trunk path and author card positions
  const layout = useMemo(() => {
    const n = branches.length
    const marginX = 500
    const marginY = 400
    const usableW = CANVAS_W - marginX * 2
    const usableH = CANVAS_H - marginY * 2
    const centerX = CANVAS_W / 2

    // 21 era nodes winding left-right as time flows downward
    const nodes = branches.map((b, i) => {
      const t = i / (n - 1)
      const y = marginY + t * usableH
      // wind amplitude modulated so the path feels like a river
      const wind = Math.sin(i * 0.62) * 0.5 + Math.sin(i * 1.3 + 1) * 0.15
      const x = centerX + wind * (usableW * 0.42)
      return { x, y, branch: b, idx: i }
    })

    // Build a smooth path through nodes using Catmull-Rom → Bezier conversion
    const pathPts = nodes.map(n => ({ x: n.x, y: n.y }))
    let pathD = `M ${pathPts[0].x} ${pathPts[0].y}`
    for (let i = 0; i < pathPts.length - 1; i++) {
      const p0 = pathPts[Math.max(i - 1, 0)]
      const p1 = pathPts[i]
      const p2 = pathPts[i + 1]
      const p3 = pathPts[Math.min(i + 2, pathPts.length - 1)]
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      pathD += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }

    // Tangent angle at each node (for fanning cards perpendicular to trunk)
    const tangents = nodes.map((_nd, i) => {
      const prev = nodes[Math.max(i - 1, 0)]
      const next = nodes[Math.min(i + 1, n - 1)]
      return Math.atan2(next.y - prev.y, next.x - prev.x)
    })

    const cards: AuthorCard[] = []
    const branchCards: { nodeIdx: number; cards: AuthorCard[] }[] = []

    nodes.forEach((node, i) => {
      const authors = node.branch.authors
      const tangent = tangents[i]
      // perpendicular direction; alternate left/right per branch
      const side = i % 2 === 0 ? 1 : -1
      const perpX = Math.cos(tangent + Math.PI / 2) * side
      const perpY = Math.sin(tangent + Math.PI / 2) * side

      // card layout: stack perpendicular to the trunk
      const cardH = 86
      const cardW = 230
      const gap = 14
      // card layout: 4 cards per column, stacked perpendicular to the trunk
      const branchCardsList: AuthorCard[] = []

      authors.forEach((a, ai) => {
        const col = Math.floor(ai / 4)
        const rowInCol = ai % 4
        const offsetX = perpX * (cardW + gap) * (col + 1)
        const offsetY = perpY * (cardH + gap) * (col + 1)
        // stagger along the tangent direction
        const alongX = Math.cos(tangent) * (rowInCol - 1.5) * (cardH + gap) * 0.9
        const alongY = Math.sin(tangent) * (rowInCol - 1.5) * (cardH + gap) * 0.9

        const cx = node.x + offsetX + alongX
        const cy = node.y + offsetY + alongY

        const card: AuthorCard = { author: a, x: cx, y: cy, branchIdx: i, side }
        cards.push(card)
        branchCardsList.push(card)
      })

      branchCards.push({ nodeIdx: i, cards: branchCardsList })
    })

    // Branch connecting lines: from node to each card's nearest edge
    const connectorLines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = []
    nodes.forEach((node, i) => {
      const tangent = tangents[i]
      const side = i % 2 === 0 ? 1 : -1
      const perpX = Math.cos(tangent + Math.PI / 2) * side
      const perpY = Math.sin(tangent + Math.PI / 2) * side
      const exitX = node.x + perpX * 30
      const exitY = node.y + perpY * 30
      branchCards[i].cards.forEach(c => {
        connectorLines.push({
          x1: exitX, y1: exitY,
          x2: c.x, y2: c.y,
          color: node.branch.color,
        })
      })
    })

    return { nodes, pathD, cards, branchCards, connectorLines, tangents }
  }, [branches])

  // GSAP entry animation
  useEffect(() => {
    if (!rootRef.current) return
    const root = rootRef.current

    const ctx = gsap.context(() => {
      // Trunk draw-on
      const trunk = root.querySelector('[data-el="trunk"]') as SVGPathElement | null
      if (trunk) {
        const len = trunk.getTotalLength()
        gsap.set(trunk, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(trunk, {
          strokeDashoffset: 0, duration: 3.5, ease: 'power2.inOut', delay: 0.3,
        })
      }

      // Era nodes pop in along the trunk
      gsap.fromTo('[data-el="era-node"]',
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5,
          stagger: { each: 0.12, from: 'start' },
          delay: 0.6, ease: 'back.out(2)',
        }
      )

      // Connector lines fade in after trunk
      gsap.fromTo('[data-el="connector"]',
        { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
        {
          opacity: 0.5, scaleX: 1, duration: 0.6,
          stagger: { each: 0.02, from: 'random' },
          delay: 2.5, ease: 'power2.out',
        }
      )

      // Author cards fly in
      gsap.fromTo('[data-el="author-card"]',
        { scale: 0.4, opacity: 0, rotation: -8 },
        {
          scale: 1, opacity: 1, rotation: 0, duration: 0.6,
          stagger: { each: 0.012, from: 'start' },
          delay: 3, ease: 'back.out(1.4)',
        }
      )

      // Era labels
      gsap.fromTo('[data-el="era-label"]',
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.5,
          stagger: { each: 0.12, from: 'start' },
          delay: 1, ease: 'power2.out',
        }
      )

      // Subtle parallax brightness on scroll
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          gsap.set('[data-el="author-card"]', {
            filter: `brightness(${0.7 + self.progress * 0.6})`,
          })
        },
      })
    }, root)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [layout])

  // Native non-passive wheel for zoom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(z => Math.min(Math.max(z * delta, 0.3), 3))
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    isDragging.current = true
    didDrag.current = false
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...pan }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) + Math.abs(dy) > 6) didDrag.current = true
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy })
  }, [])

  const handleMouseUp = useCallback(() => { isDragging.current = false }, [])
  const handleDoubleClick = useCallback(() => { setZoom(0.7); setPan({ x: 0, y: 0 }) }, [])

  const handleCardClick = useCallback((slug: string) => {
    if (didDrag.current) return
    navigate(`/author/${slug}`)
  }, [navigate])

  // Card helper text
  const cardWorks = (a: Author) => {
    const w = a.works?.[0] || ''
    return w.length > 16 ? w.slice(0, 16) + '…' : w
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-bark/20 bg-[#ede4d3]"
      style={{ height: '82vh', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Topographic / map texture overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 30% 20%, #4a3d2a 0, #4a3d2a 1px, transparent 1px, transparent 28px), repeating-radial-gradient(circle at 70% 80%, #4a3d2a 0, #4a3d2a 1px, transparent 1px, transparent 36px)',
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))}
          className="w-10 h-10 rounded-full bg-parchment border border-bark/30 flex items-center justify-center text-ink/70 hover:bg-ink hover:text-parchment transition-colors font-mono text-lg">+</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.3))}
          className="w-10 h-10 rounded-full bg-parchment border border-bark/30 flex items-center justify-center text-ink/70 hover:bg-ink hover:text-parchment transition-colors font-mono text-lg">−</button>
        <button onClick={handleDoubleClick}
          className="w-10 h-10 rounded-full bg-parchment border border-bark/30 flex items-center justify-center text-ink/70 hover:bg-crimson hover:text-parchment transition-colors font-mono text-xs">⟲</button>
      </div>
      <div className="absolute bottom-4 left-4 z-20 font-mono text-[10px] tracking-[2px] text-ink/50 bg-parchment/80 px-2 py-1 rounded border border-bark/20">
        ZOOM {Math.round(zoom * 100)}% · 双击重置 · 拖拽平移
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-20 font-mono text-[10px] tracking-[1px] text-ink/60 bg-parchment/80 px-3 py-2 rounded border border-bark/20 flex gap-4">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-crimson" />开创者</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />诺奖</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ink/40" />经典作家</span>
      </div>

      <svg
        ref={rootRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: isDragging.current ? 'none' : 'transform 0.3s ease',
        }}
      >
        {/* Distant terrain shading bands */}
        <defs>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b4a2b" />
            <stop offset="50%" stopColor="#8b6914" />
            <stop offset="100%" stopColor="#a0522d" />
          </linearGradient>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4a3d2a" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Contour lines (topographic feel) */}
        <g opacity="0.06" stroke="#4a3d2a" fill="none" strokeWidth="1">
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i}
              d={`M ${100 + i * 30} ${200} Q ${CANVAS_W / 2} ${600 + i * 40}, ${CANVAS_W - 100 - i * 30} ${1000 + i * 60}`}
            />
          ))}
        </g>

        {/* Connector lines from era nodes to cards */}
        <g>
          {layout.connectorLines.map((ln, i) => (
            <line key={i} data-el="connector"
              x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
              stroke={ln.color} strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5"
            />
          ))}
        </g>

        {/* The winding trunk (literary river) */}
        <path data-el="trunk"
          d={layout.pathD}
          fill="none" stroke="url(#trunkGrad)" strokeWidth="14"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Trunk inner highlight */}
        <path d={layout.pathD} fill="none" stroke="#d4a76a" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
          style={{ strokeDasharray: '10000' }} /* drawn together via trunk animation won't apply; keep static soft */
        />

        {/* Era nodes + labels */}
        {layout.nodes.map((node, i) => (
          <g key={i}>
            <circle data-el="era-node"
              cx={node.x} cy={node.y} r="14"
              fill="#C0392B" stroke="#f0ebe0" strokeWidth="3"
            />
            <circle cx={node.x} cy={node.y} r="5" fill="#f0ebe0" />
            <text data-el="era-label"
              x={node.x} y={node.y - 26}
              textAnchor="middle"
              className="font-mono"
              fontSize="13" fontWeight="bold"
              fill="#4a3d2a"
              style={{ letterSpacing: '1px' }}
            >
              {node.branch.name}
            </text>
            <text data-el="era-label"
              x={node.x} y={node.y + 32}
              textAnchor="middle"
              className="font-mono"
              fontSize="10"
              fill="#4a3d2a" opacity="0.6"
            >
              {node.branch.authors.length} scriptores
            </text>
          </g>
        ))}

        {/* Author cards */}
        {layout.cards.map((card, i) => {
          const a = card.author
          const w = 230, h = 86
          const isPioneer = a.isPioneer
          const isNobel = a.isNobel
          const borderColor = isPioneer ? '#C0392B' : isNobel ? '#b8860b' : '#4a3d2a'
          const accentBg = isPioneer ? 'rgba(192,57,43,0.06)' : isNobel ? 'rgba(184,134,11,0.06)' : 'rgba(74,61,42,0.03)'
          return (
            <g key={i} data-el="author-card"
              transform={`translate(${card.x - w / 2}, ${card.y - h / 2})`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick(a.slug)}
              onMouseEnter={(e) => { gsap.to(e.currentTarget, { scale: 1.08, duration: 0.25, ease: 'back.out(2)' }) }}
              onMouseLeave={(e) => { gsap.to(e.currentTarget, { scale: 1, duration: 0.3 }) }}
            >
              <rect width={w} height={h} rx="6" fill="#f5efe0" stroke={borderColor} strokeWidth="1.5" filter="url(#cardShadow)" />
              <rect width={w} height={h} rx="6" fill={accentBg} />
              {/* left accent bar */}
              <rect width="4" height={h} rx="2" fill={borderColor} />
              {/* name */}
              <text x="16" y="34" fontSize="16" fontWeight="bold" fill="#2c2416" className="font-serif">
                {a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name}
              </text>
              {/* era */}
              <text x="16" y="54" fontSize="10" fill="#6b5d4a" className="font-mono" style={{ letterSpacing: '0.5px' }}>
                {a.era}
              </text>
              {/* work */}
              <text x="16" y="72" fontSize="11" fill="#8b7d6a" className="font-serif" fontStyle="italic">
                {cardWorks(a) || '—'}
              </text>
              {/* pioneer/nobel dot */}
              {isPioneer && <circle cx={w - 16} cy="16" r="4" fill="#C0392B" />}
              {isNobel && !isPioneer && <circle cx={w - 16} cy="16" r="4" fill="#b8860b" />}
            </g>
          )
        })}

        {/* Start / End markers */}
        <g>
          <text x={layout.nodes[0].x} y={layout.nodes[0].y - 60} textAnchor="middle"
            fontSize="11" fill="#4a3d2a" opacity="0.5" className="font-mono" style={{ letterSpacing: '2px' }}>
            ↑ ANNO · 公元前8世纪
          </text>
          <text x={layout.nodes[layout.nodes.length - 1].x} y={layout.nodes[layout.nodes.length - 1].y + 60} textAnchor="middle"
            fontSize="11" fill="#4a3d2a" opacity="0.5" className="font-mono" style={{ letterSpacing: '2px' }}>
            ↓ ANNO · 21世纪
          </text>
        </g>
      </svg>
    </div>
  )
}
