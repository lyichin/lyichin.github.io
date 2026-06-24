import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top of page whenever the route changes — UNLESS the URL has a hash
 * (like /#builds), in which case Layout.jsx handles the in-page scroll.
 *
 * React Router doesn't reset scroll position by default, which made clicking
 * "YiChin Lew" from a deep position on /notes or /about land mid-page.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return // let Layout's anchor-scroll handler take over
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
