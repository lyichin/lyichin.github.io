import { Link } from 'react-router-dom'
import posts, { formatDate } from '../data/posts'

export default function Notes() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Notes</h2>
        <div className="notes-list">
          {posts.map((p) => (
            <article key={p.slug} className="note-row">
              <Link to={`/notes/${p.slug}`}>
                <div className="note-meta">{formatDate(p.date)}</div>
                <div className="note-title">{p.title}</div>
                <div className="note-excerpt">{p.excerpt}</div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
