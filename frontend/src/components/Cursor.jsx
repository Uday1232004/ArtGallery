import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { useCursor } from '../context/CursorContext'

export default function Cursor() {
  const { hoverState } = useCursor()
  const cursorRef = useRef(null)
  const trailRef = useRef(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  
  const idleTimeout = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true)
      return
    }

    const cursor = cursorRef.current
    const trail = trailRef.current

    if (!cursor || !trail) return

    // Setup high performance gsap setters
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' })
    const trailXTo = gsap.quickTo(trail, 'x', { duration: 0.4, ease: 'power3' })
    const trailYTo = gsap.quickTo(trail, 'y', { duration: 0.4, ease: 'power3' })

    const moveCursor = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      trailXTo(e.clientX)
      trailYTo(e.clientY)

      setIsIdle(false)
      clearTimeout(idleTimeout.current)
      idleTimeout.current = setTimeout(() => {
        setIsIdle(true)
      }, 2000)
    }

    window.addEventListener('mousemove', moveCursor)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      clearTimeout(idleTimeout.current)
    }
  }, [])

  if (isTouchDevice) return null

  // Determine classes based on state
  const isText = hoverState.type === 'text'
  const isButton = hoverState.type === 'button'
  const isArtwork = hoverState.type === 'artwork'

  const baseClasses = "fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform"
  
  const cursorClasses = `
    ${baseClasses} 
    w-4 h-4 bg-white/90 backdrop-blur-md border border-white/20
    transition-all duration-300 ease-out
    ${isText ? 'h-1 w-8 bg-gold border-transparent rounded-sm scale-150 mix-blend-normal' : ''}
    ${isButton ? 'w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/40 scale-110' : ''}
    ${isArtwork ? 'w-24 h-24 bg-void/80 backdrop-blur-xl border border-white/20 mix-blend-normal flex items-center justify-center' : ''}
    ${isIdle && !isText && !isButton && !isArtwork ? 'scale-150 bg-white/40 blur-[2px]' : ''}
  `

  const trailClasses = `
    ${baseClasses}
    w-8 h-8 bg-white/40 blur-[4px]
    transition-all duration-300 ease-out
    ${isText || isButton || isArtwork ? 'opacity-0 scale-0' : 'opacity-100'}
  `

  return (
    <>
      <svg className="hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
      
      <div style={{ filter: 'url(#gooey)' }} className="pointer-events-none fixed inset-0 z-[9998]">
        <div ref={trailRef} className={trailClasses} />
        <div ref={cursorRef} className={cursorClasses}>
          {isArtwork && (
            <div className="flex flex-col items-center justify-center gap-1 opacity-100 transition-opacity duration-300 delay-100">
              <span className="text-[8px] uppercase tracking-[0.2em] text-mist/70">{hoverState.text || 'Artwork'}</span>
              <span className="text-[10px] uppercase tracking-widest text-ivory font-medium">Open</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
