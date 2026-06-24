import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const onHome = location.pathname === '/'

  // If URL has a hash (e.g. /#builds), scroll to it on mount/route change
  useEffect(() => {
    if (onHome && location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        // small delay so the page is painted before scrolling
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
    }
  }, [location, onHome])

  function scrollToSection(id) {
    return (e) => {
      e.preventDefault()
      if (onHome) {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.history.replaceState(null, '', `/#${id}`)
      } else {
        navigate(`/#${id}`)
      }
    }
  }

  return (
    <div className="site">
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <img src="/favicon.png" alt="" className="nav-mark" />
            <span>YiChin Lew</span>
          </Link>
          <nav className="nav-links">
            <a href="/#builds" onClick={scrollToSection('builds')}>Builds</a>
            <a href="/#expertise" onClick={scrollToSection('expertise')}>Expertise</a>
            <Link to="/about">About</Link>
            <a href="/#notes" onClick={scrollToSection('notes')}>Notes</a>
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="footer">
        © 2026 YiChin Lew
      </footer>
    </div>
  )
}
