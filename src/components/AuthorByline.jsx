import CopyEmail from './CopyEmail'

export default function AuthorByline() {
  return (
    <div className="byline">
      by YiChin Lew.{' '}
      <a href="/resume.pdf" target="_blank" rel="noreferrer">Resume</a>
      <span className="sep"> · </span>
      <a href="https://www.linkedin.com/in/yichinlew" target="_blank" rel="noreferrer">LinkedIn</a>
      <span className="sep"> · </span>
      <a href="https://github.com/lyichin" target="_blank" rel="noreferrer">GitHub</a>
      <span className="sep"> · </span>
      <CopyEmail />
    </div>
  )
}
