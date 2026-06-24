import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost, formatDate } from '../data/posts'
import AuthorByline from '../components/AuthorByline'

export default function Post() {
  const { slug } = useParams()
  const post = getPost(slug)

  if (!post) {
    return (
      <div className="post">
        <p>Post not found. <Link to="/notes">Back to all notes</Link>.</p>
      </div>
    )
  }

  return (
    <article className="post">
      <Link to="/notes" className="post-back">← All notes</Link>
      <div className="post-meta">{formatDate(post.date)}</div>
      <h1 className="post-title">{post.title}</h1>
      <div className="post-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
      <AuthorByline />
    </article>
  )
}
