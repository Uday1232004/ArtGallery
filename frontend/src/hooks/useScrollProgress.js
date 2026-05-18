import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../animations/gsap'

/**
 * useScrollProgress — tracks scroll progress of an element
 * Returns progress 0→1 as element scrolls through viewport
 * @param {Object} opts - ScrollTrigger options
 */
export function useScrollProgress(opts = {}) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: opts.start || 'top bottom',
      end: opts.end || 'bottom top',
      onUpdate: (self) => setProgress(self.progress),
      ...opts,
    })

    return () => st.kill()
  }, [])

  return { ref, progress }
}

export default useScrollProgress
