import { useState } from 'react'
import { builds } from '../data/builds'

export default function Builds() {
  const [openId, setOpenId] = useState('')

  return (
    <div className="builds-list">
      {builds.map((b) => {
        const isOpen = openId === b.id
        return (
          <div
            key={b.id}
            className={`build-row ${isOpen ? '' : 'is-stacked'}`}
          >
            <button
              className="build-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? '' : b.id)}
            >
              <div>
                <div className="build-title">{b.title}</div>
                <div className="build-outcome">{b.outcome}</div>
              </div>
              <span className="build-arrow" aria-hidden="true">↗</span>
            </button>
            {isOpen && (
              <div className="build-story">
                <p>{b.story}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
