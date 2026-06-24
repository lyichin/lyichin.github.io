import CopyEmail from './CopyEmail'

export default function AboutContent() {
  return (
    <div className="about-content">
      <div className="about-grid">
        <div className="about-text">
          <p>I'm YiChin.</p>

          <p>
            I think in systems. I naturally start building a map when I encounter a
            problem: people, processes, data, decisions, and the wires between
            them. What's different about today's AI is that it can act on the
            map, not just describe it.
          </p>

          <p>
            Enterprise AI is one of the richest system-design problems I know.
            Organizations are full of disconnected systems, fragmented workflows,
            and untapped knowledge. The work I do is figuring out where the
            pieces should connect, and what has to be true before they can act
            together.
          </p>

          <p>
            I lead product for enterprise AI and data systems, working across
            agents, evaluation frameworks, data platforms, and AI-native
            workflows. The judgment call I'm known for is the action dial:
            where humans stay in the loop, where systems can take over, and
            how to earn the trust to keep moving the dial rightward.
          </p>

          <p>This site is where I think out loud.</p>

          <p>
            The notes here come from building production AI systems: what I'm
            learning, what surprised me, what I got wrong, and what I'd do
            differently. The same thinking shows up at home too. As a mom, I
            build small tools and workflows to solve everyday problems.
            Different scene, same question.
          </p>

          <p><em>Less takes. More practice.</em></p>
        </div>
        <div className="about-photo">
          <img src="/photo.jpg" alt="YiChin Lew" />
        </div>
      </div>

      <div className="about-links">
        <a href="/resume.pdf" target="_blank" rel="noreferrer">Resume (PDF)</a>
        <span className="sep">·</span>
        <a href="https://www.linkedin.com/in/yichinlew" target="_blank" rel="noreferrer">LinkedIn</a>
        <span className="sep">·</span>
        <a href="https://github.com/lyichin" target="_blank" rel="noreferrer">GitHub</a>
        <span className="sep">·</span>
        <CopyEmail />
      </div>
    </div>
  )
}
