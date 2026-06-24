import CopyEmail from './CopyEmail'

export default function AuthorByline() {
  return (
    <div className="byline">
      <span className="byline-name">by YiChin Lew.</span>
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
      <span className="sep"> · </span>
      <a href="https://www.linkedin.com/in/yichinlew" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <span className="sep"> · </span>
      <a href="https://github.com/lyichin" target="_blank" rel="noopener noreferrer">GitHub</a>
      <span className="sep"> · </span>
      <CopyEmail />
    </div>
  )
}
