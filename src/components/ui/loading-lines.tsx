import { useEffect, useState } from 'react'

export default function LoadingLines() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 900)
    const hideTimer = setTimeout(() => setVisible(false), 1400)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  const letters = 'Laden'.split('')

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? 'none' : 'all' }}
    >
      <div className="relative flex items-center justify-center h-[120px] w-auto m-8 font-body normal-case text-[1.6em] font-semibold select-none scale-[2]">
        {letters.map((letter, idx) => (
          <span
            key={idx}
            className="loading-letter relative inline-block opacity-0 z-[2] text-white"
            style={{ animationDelay: `${0.1 + idx * 0.105}s` }}
          >
            {letter}
          </span>
        ))}

        <div className="loading-lines-bg absolute top-0 left-0 w-full h-full z-[1]" />
      </div>
    </div>
  )
}
