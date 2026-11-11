import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import ScrollBackground from '@/components/ScrollBackground'
import GlobalNav from '@/components/GlobalNav'

const AuthorDetailPage = lazy(() => import('@/pages/AuthorDetailPage'))

export default function App() {
  return (
    <div className="paper-bg min-h-screen">
      <ScrollBackground />
      <GlobalNav />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center font-mono text-[11px] tracking-[4px] text-ink/40">
            ARBOR · 装帧中
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/author/:slug" element={<AuthorDetailPage />} />
        </Routes>
      </Suspense>
      {/* Corner registration marks */}
      <div className="reg-mark tl" />
      <div className="reg-mark tr" />
      <div className="reg-mark bl" />
      <div className="reg-mark br" />
    </div>
  )
}
