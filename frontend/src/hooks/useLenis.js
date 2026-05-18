import { useEffect, useRef } from 'react'
import { initLenis, getLenis } from '../animations/lenis'

/**
 * useLenis — initializes Lenis smooth scroll on mount,
 * cleans up on unmount, and exposes the instance via ref.
 */
export function useLenis() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = initLenis()
    lenisRef.current = lenis

    return () => {
      // We don't destroy on unmount since it's a singleton,
      // but we could if needed
    }
  }, [])

  return lenisRef
}

export default useLenis
