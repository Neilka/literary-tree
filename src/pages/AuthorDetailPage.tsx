import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import gsap from 'gsap'
import data from '@/data/authors.json'
import { loadEnrichedAuthor } from '@/data/enriched/load'
import type { EnrichedAuthor } from '@/data/enriched/types'
import type { Author } from '@/types'

export default function AuthorDetailPage() {
  const { slug } = useParams<{ slug: string }>()!
  const rootRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  const author = (data.authors as Author[]).find(a => a.slug === slug)
  const [enriched, setEnriched] = useState<EnrichedAuthor | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!slug || !author) { setLoaded(true); return }
    let alive = true
    setLoaded(false)
    setEnriched(undefined)
    loadEnrichedAuthor(author.name, slug).then(e => {
      if (!alive) return
      setEnriched(e)
      setLoaded(true)
    })
    return () => { alive = false }
  }, [slug, author])

  // Prev/next within the same branch
  const siblings = author
    ? (data.authors as Author[]).filter(a => a.branch === author.branch)
    : []
  const idx = siblings.findIndex(a => a.slug === slug)
  const prev = idx > 0 ? siblings[idx - 1] : null
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!rootRef.current || !loaded) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    const ctx = gsap.context(() => {
      gsap.from('.detail-hero', { y: 60, opacity: 0, duration: 1, ease: 'power3.out' })
      gsap.from('.detail-portrait', { scale: 0.8, opacity: 0, duration: 1, delay: 0.2, ease: 'back.out(1.5)' })
      gsap.from('.detail-meta > *', { y: 20, opacity: 0, duration: 0.5, delay: 0.6, stagger: 0.1, ease: 'power2.out' })
      gsap.from('.detail-section', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, delay: 1, ease: 'power2.out' })
      gsap.from('.work-item', { x: -30, opacity: 0, duration: 0.5, stagger: 0.05, delay: 1.2, ease: 'power2.out' })
    }, rootRef)
    return () => ctx.revert()
  }, [slug, loaded])

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-ink/60">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <p>作者未找到 · SCRIPTOR NON INVENTUS</p>
          <Link to="/" className="inline-block mt-8 px-6 py-2 border border-ink/40 hover:border-crimson hover:text-crimson transition-colors">
            返回树冠
          </Link>
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="w-10 h-10 mx-auto mb-6 border-2 border-bark/20 border-t-crimson rounded-full animate-spin" />
          <div className="text-[11px] tracking-[4px] text-ink/50">ARCHIVUM · 手稿调取中</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="pb-32">
      {/* HERO */}
      <section className="detail-hero relative pt-32 pb-20 px-6">
        <div className="max-w-[1500px] mx-auto grid md:grid-cols-[420px_1fr] gap-12 md:gap-20 items-center">
          {/* Era mark card — no portrait, pure typography */}
          <div className="detail-portrait relative mx-auto w-[340px] h-[440px]">
            <div className="absolute inset-0 border-2 border-bark" />
            <div className="absolute inset-2 border border-crimson/40" />
            <div className="absolute inset-4 bg-parchment-dark/50 flex flex-col items-center justify-center px-8 text-center">
              <div className="font-mono text-[10px] tracking-[3px] text-crimson mb-6">
                {author.branch.toUpperCase()}
              </div>
              <div className="font-serif text-[120px] font-black leading-none text-ink/15 mb-4">
                {(enriched?.englishName || author.name).charAt(0).toUpperCase()}
              </div>
              <div className="font-serif text-xl text-ink/70 leading-tight">
                {enriched?.englishName?.toUpperCase() ?? author.name}
              </div>
              <div className="w-12 h-[1px] bg-crimson/50 my-5" />
              <div className="font-mono text-[11px] tracking-[2px] text-ink/50">
                {author.era}
              </div>
              <div className="mt-3 font-serif text-sm text-ink/50 italic">
                {author.reason.slice(0, 28)}…
              </div>
            </div>
            {/* Corner marks */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-crimson" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-crimson" />
            <div className="absolute -bottom-10 left-0 font-mono text-[10px] tracking-[2px] text-ink/50">
              FIG. 02 · {author.name} · {author.era}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Movement tags — wrap into pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(enriched?.movement?.length ? enriched.movement : [author.section])
                .map((m, i) => (
                  <span key={i} className="inline-block font-mono text-[11px] tracking-[2px] text-crimson border border-crimson/40 px-3 py-1 bg-crimson/[0.04]">
                    {m}
                  </span>
                ))}
            </div>

            <h1 className="font-serif text-[clamp(48px,7vw,100px)] font-black leading-[0.95] tracking-tight text-ink">
              {author.name}
            </h1>
            <div className="font-mono text-base md:text-lg tracking-[4px] text-ink/50 mt-3 break-words">
              {enriched?.englishName?.toUpperCase() ?? author.name.split('·')[0]}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-3 mt-6">
              {author.isPioneer && (
                <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-crimson bg-crimson/5">
                  <span className="text-crimson">★</span>
                  <span className="font-mono text-[11px] tracking-[2px] text-crimson font-bold">
                    {enriched?.movement?.includes('魔幻现实主义') ? '魔幻现实主义开创者' :
                     enriched?.movement?.includes('新文化') ? '白话小说奠基人' :
                     enriched?.movement?.includes('后现代') ? '后现代叙事先驱' :
                     enriched?.movement?.includes('现代主义') ? '现代主义文学先驱' :
                     '流派开创者 · CONDITOR'}
                  </span>
                </div>
              )}
              {author.isNobel && (
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-ink/30 bg-parchment-dark">
                  <span className="font-mono text-[11px] tracking-[2px] text-ink/70">
                    ★ {enriched?.nobelYear ? `${enriched.nobelYear}年 ` : ''}诺贝尔文学奖
                  </span>
                </div>
              )}
            </div>

            {/* Meta info — bordered 2x2 archive grid */}
            <div className="detail-meta mt-8 grid grid-cols-1 sm:grid-cols-2 max-w-xl border border-bark/30 divide-y divide-bark/30 sm:divide-y-0">
              <MetaItem label="NATUS / 生卒" val={enriched?.birthDeath || author.era} bordered />
              <MetaItem label="ORIGO / 籍贯" val={enriched?.nationality || author.era} bordered />
              <MetaItem label="RAMUS / 所属分支" val={author.branch} bordered />
              <MetaItem label="PRAEMIUM / 荣誉" val={author.isNobel ? '诺贝尔文学奖' : author.isPioneer ? '流派开创者' : '经典作家'} bordered />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-[1400px] mx-auto px-6">

        {/* BIOGRAPHY */}
        <section className="detail-section mb-16">
          <SectionHeader num="01" title="生平传记" en="VITA SCRIPTORIS" />
          {enriched ? (
            <div className="font-serif text-[17px] leading-[2] text-ink/85">
              {enriched.bio.map((p, i) => <p key={i} className="mb-5">{p}</p>)}
            </div>
          ) : (
            <div className="font-serif text-[17px] leading-[2] text-ink/85">
              <p>
                {author.name}，{author.era}，{author.reason}。
              </p>
            </div>
          )}

          {/* Controversies */}
          {(enriched && enriched.controversies.length > 0) && (
            <div className="mt-8 space-y-4">
              {enriched.controversies.map((c, i) => (
                <div key={i} className="border-l-[3px] border-crimson pl-6 pr-4 py-5 bg-crimson/[0.03]">
                  <div className="font-mono text-[11px] tracking-[3px] text-crimson font-bold mb-2">
                    {c.tag}
                  </div>
                  <p className="font-serif text-[15px] leading-[1.85] text-ink/80">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MOVEMENT */}
        {(enriched?.movementDesc || enriched?.movementTraits) && (
          <section className="detail-section mb-16">
            <SectionHeader num="02" title="所属流派 · 写作特点" en="SCHOLA & STILUS" />
            <div className="bg-bark-dark/[0.04] border border-bark/20 p-8 md:p-10 grid md:grid-cols-[240px_1fr] gap-8 items-start">
              <div>
                <div className="font-serif text-2xl font-bold text-ink leading-tight">
                  {enriched.movement?.join(' · ')}
                </div>
                {enriched.movement.map?.(m => (
                  <div key={m} className="font-mono text-xs text-crimson mt-2 tracking-[2px]">{m.toUpperCase()}</div>
                ))}
              </div>
              <div>
                {enriched.movementDesc && (
                  <p className="font-serif text-[16px] leading-[1.9] text-ink/85">{enriched.movementDesc}</p>
                )}
                {enriched.movementTraits && enriched.movementTraits.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {enriched.movementTraits.map(t => (
                      <span key={t} className="px-3 py-1.5 bg-ink text-parchment font-mono text-[11px] tracking-[1px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* WORKS */}
        <section className="detail-section mb-16">
          <SectionHeader num="03" title="全部作品 · 按写作时间" en="OPERA OMNIA · CHRONOLOGICE" />
          {enriched?.works ? (
            <div className="relative pl-10">
              <div className="absolute left-3 top-2 bottom-2 w-[2px] bg-bark/30" />
              {enriched.works.map((w, i) => (
                <div key={i} className="work-item relative mb-5 pl-4">
                  <div className="absolute -left-[30px] top-[10px] w-3 h-3 rounded-full bg-crimson border-2 border-parchment" />
                  <div className="font-mono text-xs text-crimson font-bold tracking-[1px]">{w.year}</div>
                  <div className="font-serif text-xl font-bold text-ink leading-tight mt-1">{w.title}</div>
                  <div className="font-mono text-[11px] text-ink/40 mt-0.5 tracking-[1px]">{w.type}</div>
                  {w.note && <div className="font-serif text-[14px] text-ink/60 mt-1 leading-relaxed">{w.note}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {author.works.length > 0 ? (
                author.works.map((w, i) => (
                  <div key={i} className="work-item flex items-baseline gap-4 font-serif">
                    <span className="w-2 h-2 rounded-full bg-crimson shrink-0 mt-2" />
                    <span className="text-lg text-ink">{w}</span>
                  </div>
                ))
              ) : (
                <p className="text-ink/40 font-mono text-sm">本作者作品收录于正典表格中，详细年表待补充。</p>
              )}
            </div>
          )}
        </section>

        {/* POSITION */}
        {(enriched?.position || author.isPioneer) && (
          <section className="detail-section mb-16">
            <SectionHeader num="04" title="文学史地位" en="STATUS IN HISTORIA LITTERARUM" />
            <div className="relative bg-ink text-parchment p-10 md:p-14">
              <div className="absolute top-6 left-8 text-[120px] font-serif text-crimson/20 leading-none select-none pointer-events-none">"</div>
              <p className="font-serif text-[22px] leading-[1.8] relative z-10 pl-6 md:pl-8">
                {enriched?.position || author.reason}
              </p>
              {enriched?.positionSource && (
                <div className="relative z-10 mt-6 font-mono text-[11px] tracking-[2px] text-parchment/40 pl-6 md:pl-8">
                  {enriched.positionSource}
                </div>
              )}
            </div>
          </section>
        )}

        {/* §05 CREATOR INSPIRATION */}
        {enriched?.inspiration && (
          <section className="detail-section mb-16">
            <SectionHeader num="05" title="创作者灵感" en="INSPIRATIO CREATORUM" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InspirationCard
                icon="✎"
                label="新人作者"
                en="WRITER"
                accent="text-crimson border-crimson/30"
                content={enriched.inspiration.author}
              />
              <InspirationCard
                icon="◈"
                label="画师"
                en="ILLUSTRATOR"
                accent="text-amber-700 border-amber-700/30"
                content={enriched.inspiration.illustrator}
              />
              <InspirationCard
                icon="▣"
                label="游戏策划"
                en="GAME DESIGNER"
                accent="text-ink border-ink/30"
                content={enriched.inspiration.gameDesigner}
              />
            </div>
          </section>
        )}

      </div>

      {/* PREV / NEXT NAVIGATION */}
      {author && (
        <div className="max-w-[1400px] mx-auto px-6 mt-16">
          <div className="grid grid-cols-2 border-t border-bark/20 pt-8 gap-6">
            {prev ? (
              <Link to={`/author/${prev.slug}`} className="group flex items-center gap-4">
                <span className="font-mono text-2xl text-ink/30 group-hover:text-crimson group-hover:-translate-x-1 transition-all">←</span>
                <div>
                  <div className="font-mono text-[10px] tracking-[2px] text-ink/40 mb-1">上一位 · PRAECEDENS</div>
                  <div className="font-serif text-xl font-bold text-ink group-hover:text-crimson transition-colors">{prev.name}</div>
                </div>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/author/${next.slug}`} className="group flex items-center justify-end gap-4 text-right">
                <div>
                  <div className="font-mono text-[10px] tracking-[2px] text-ink/40 mb-1">下一位 · SEQUENS</div>
                  <div className="font-serif text-xl font-bold text-ink group-hover:text-crimson transition-colors">{next.name}</div>
                </div>
                <span className="font-mono text-2xl text-ink/30 group-hover:text-crimson group-hover:translate-x-1 transition-all">→</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="max-w-[1400px] mx-auto px-6 mt-24">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-[2px] text-ink/40 border-t border-bark/20 pt-6">
          <span>FOLIUM · {author.slug.toUpperCase()}</span>
          <Link to="/" className="hover:text-crimson transition-colors">← 回到树冠</Link>
          <span>REV. MMXXVI</span>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-ink text-parchment font-mono text-lg shadow-lg hover:bg-crimson transition-all duration-500 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="回到顶部"
      >↑</button>
    </div>
  )
}

function MetaItem({ label, val, bordered }: { label: string; val: string; bordered?: boolean }) {
  if (bordered) {
    return (
      <div className="p-5 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:border-bark/30">
        <div className="font-mono text-[10px] tracking-[2px] text-ink/50 uppercase mb-2">{label}</div>
        <div className="font-serif text-ink font-medium leading-snug text-[15px]">{val}</div>
      </div>
    )
  }
  return (
    <div className="border-t border-bark/30 pt-2">
      <div className="font-mono text-[10px] tracking-[2px] text-ink/50 uppercase mb-1">{label}</div>
      <div className="font-serif text-ink font-medium leading-snug">{val}</div>
    </div>
  )
}

function SectionHeader({ num, title, en }: { num: string; title: string; en: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-8 pb-4 border-b border-bark/20">
      <span className="font-mono text-xs tracking-[3px] text-crimson font-bold">§ {num}</span>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink">{title}</h2>
      <span className="font-mono text-[11px] tracking-[3px] text-ink/40">{en}</span>
    </div>
  )
}

function InspirationCard({ icon, label, en, accent, content }: {
  icon: string; label: string; en: string; accent: string; content: string
}) {
  return (
    <div className={`bg-parchment border ${accent.split(' ')[1]} rounded-sm p-8 relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`text-2xl ${accent.split(' ')[0]}`}>{icon}</span>
        <div>
          <div className={`font-serif text-lg font-bold ${accent.split(' ')[0]}`}>{label}</div>
          <div className="font-mono text-[10px] tracking-[2px] text-ink/40">{en}</div>
        </div>
      </div>
      <p className="font-serif text-[15px] leading-[1.75] text-ink/80">{content}</p>
    </div>
  )
}
