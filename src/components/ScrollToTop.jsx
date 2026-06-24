import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to top of page whenever the route changes — UNLESS the URL has a hash
 * (like /#builds), in which case Layout.jsx handles the in-page scroll.
 *
 * Three things conspire to break naive scroll-on-route-change in React Router:
 * 1. The site sets `html { scroll-behavior: smooth }` globally, which hijacks
 *    window.scrollTo even with `behavior: 'instant'` on some browsers. Setting
 *    scrollTop directly bypasses it.
 * 2. The browser's built-in `history.scrollRestoration: 'auto'` re-applies the
 *    previous scroll position AFTER our reset, on Back/Forward AND sometimes
 *    on regular pushState. Switching to 'manual' tells the browser to stop.
 * 3. The new route's content paints after our useEffect runs, so the browser
 *    can re-anchor to a focused element or restored scroll. useLayoutEffect
 *    fires synchronously after DOM mutations but before paint, so the reset
 *    lands before the user sees anything.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  // One-time: disable native scroll restoration so the browser stops
  // fighting our reset on history navigation.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (hash) return // let Layout's anchor-scroll handler take over

    const scrollTop = () => {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      window.scrollTo(0, 0)
    }
    scrollTop()
    // Belt-and-suspenders: re-apply after layout & paint in case async content
    // (markdown render, image load) shifts the page.
    requestAnimationFrame(scrollTop)
    const t = setTimeout(scrollTop, 50)
    return () => clearTimeout(t)
  }, [pathname, hash])

  return null
}
