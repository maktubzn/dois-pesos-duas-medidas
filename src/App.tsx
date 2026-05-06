import { useEffect, useState } from 'react'
import { AdminPage } from '@/components/Admin/AdminPage'
import { QuizStage } from '@/components/QuizStage/QuizStage'
import type { AppRoute } from '@/types/game.types'
import './App.css'

function getRoute(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/admin') return 'admin'
  return 'stage'
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRoute())

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', '/stage')
    }

    function handlePopState() {
      setRoute(getRoute())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return <div className="app">{route === 'admin' ? <AdminPage /> : <QuizStage />}</div>
}
