import { Fragment, useEffect, useRef, useState } from 'react'
import { expertise } from '../data/expertise'

export default function Expertise() {
  const [openNum, setOpenNum] = useState('')
  const panelRef = useRef(null)

  // 4 chevrons live between the 5 cards. Each is positioned absolutely at
  // the boundary between two cards (20%, 40%, 60%, 80% of the row width).
  const chevronPositions = ['20%', '40%', '60%', '80%']

  // When a card is expanded, scroll the panel into view below the sticky nav.
  // Works at every breakpoint: scroll-margin-top in CSS handles the offset.
  useEffect(() => {
    if (openNum && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [openNum])

  return (
    <div className="expertise-wrap">
      <div className="expertise-grid">
        {expertise.map((e) => {
          const isOpen = openNum === e.num
          return (
            <Fragment key={e.num}>
              <button
                className="expertise-card"
                aria-expanded={isOpen}
                onClick={() => setOpenNum(isOpen ? '' : e.num)}
              >
                <div className="expertise-num">{e.num}</div>
                <div className="expertise-name">{e.name}</div>
                <div className="expertise-desc">{e.desc}</div>
                <div className="expertise-outcome">
                  <span>Build</span>
                  <span className="arrow" aria-hidden="true">↗</span>
                </div>
              </button>
              {isOpen && (
                <div className="expertise-panel" ref={panelRef}>
                  <div className="expertise-panel-title">
                    {e.num} · {e.name}
                  </div>
                  <p>{e.expanded}</p>
                </div>
              )}
            </Fragment>
          )
        })}
        <div className="expertise-flow" aria-hidden="true">
          {chevronPositions.map((pos) => (
            <span key={pos} className="flow-marker" style={{ left: pos }}>›</span>
          ))}
        </div>
      </div>
    </div>
  )
}
