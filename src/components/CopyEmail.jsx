import { useState } from 'react'

const EMAIL = 'yichinlew@gmail.com'

export default function CopyEmail({ className = '' }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API blocked — do nothing
    }
  }

  return (
    <button
      type="button"
      className={`copy-email ${className}`}
      onClick={copy}
      title="Click to copy email"
    >
      {copied ? 'Copied!' : EMAIL}
    </button>
  )
}
