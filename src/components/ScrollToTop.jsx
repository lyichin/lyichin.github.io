import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top of page whenever the route changes — UNLESS the URL has a hash
 * (like /#builds), in which case Layout.jsx handles the in-page scroll.
 *
 * Why this is more aggressive than a single window.scrollTo:
 * - The site sets `html { scroll-behavior: smooth }` globally for anchor links,
 *   which can hijack/animate even `behavior: 'instant'` calls on some browsers
 *   (Chrome respects it, Safari is inconsistent).
 * - Setting scrollTop directly on both documentElement and body bypasses the
 *   CSS smooth-behavior and works in every browser.
 * - We also reset on the next animation frame in case the new route paints
 *   below the fold and the browser tries to restore the previous scroll.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return // let Layout's anchor-scroll handler take over

    const scrollTop = () => {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    scrollTop()
    // Catch any post-paint restoration the browser tries on route change.
    requestAnimationFrame(scrollTop)
  }, [pathname, hash])

  return null
}
