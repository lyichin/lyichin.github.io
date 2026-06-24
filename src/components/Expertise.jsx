import { useState } from 'react'
import { expertise } from '../data/expertise'

export default function Expertise() {
  const [openNum, setOpenNum] = useState('')
  const openItem = expertise.find((e) => e.num === openNum)

  return (
    <div className="expertise-wrap">
      <div className="expertise-grid">
        {expertise.map((e) => {
          const isOpen = openNum === e.num
          return (
            <button
              key={e.num}
              className="expertise-card"
              aria-expanded={isOpen}
              onClick={() => setOpenNum(isOpen ? '' : e.num)}
            >
              <div className="expertise-num">{e.num}</div>
              <div className="expertise-name">{e.name}</div>
              <div className="expertise-desc">{e.desc}</div>
              <div className="expertise-outcome">
                <span>See the build</span>
                <span className="arrow" aria-hidden="true">↗</span>
              </div>
            </button>
          )
        })}
        <div className="expertise-flow" aria-hidden="true">
          <span></span>
          <span className="flow-marker">›</span>
          <span className="flow-marker">›</span>
          <span className="flow-marker">›</span>
          <span className="flow-marker">›</span>
        </div>
      </div>
      {openItem && (
        <div className="expertise-panel">
          <div className="expertise-panel-title">
            {openItem.num} · {openItem.name}
          </div>
          <p>{openItem.expanded}</p>
        </div>
      )}
    </div>
  )
}
