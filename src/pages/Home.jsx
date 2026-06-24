import { Link } from 'react-router-dom'
import Builds from '../components/Builds'
import Expertise from '../components/Expertise'
import AboutContent from '../components/AboutContent'
import posts, { formatDate } from '../data/posts'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>AI Practice Notes</h1>
          <div className="hero-subtitle">
            Building, thinking, and applying AI across work and life.
          </div>
          <div className="hero-tags">
            Product Strategy · Enterprise AI · Everyday Systems
          </div>
        </div>
      </section>

      <section className="section" id="builds">
        <div className="container">
          <h2 className="section-title">Builds</h2>
          <Builds />
        </div>
      </section>

      <section className="section" id="expertise">
        <div className="container">
          <h2 className="section-title">Expertise</h2>
          <Expertise />
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <h2 className="section-title">About</h2>
          <AboutContent />
        </div>
      </section>

      <section className="section" id="notes">
        <div className="container">
          <h2 className="section-title">Notes</h2>
          <div className="notes-list">
            {posts.slice(0, 3).map((p) => (
              <article key={p.slug} className="note-row">
                <Link to={`/notes/${p.slug}`}>
                  <div className="note-meta">{formatDate(p.date)}</div>
                  <div className="note-title">{p.title}</div>
                  <div className="note-excerpt">{p.excerpt}</div>
                </Link>
              </article>
            ))}
          </div>
          {posts.length > 3 && (
            <div className="notes-more">
              <Link to="/notes">View all notes →</Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
