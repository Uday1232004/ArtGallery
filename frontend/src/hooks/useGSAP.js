import { useEffect, useRef, useContext, createContext } from 'react'
import { gsap } from '../animations/gsap'

const GSAPContext = createContext(null)

/**
 * useGSAP — creates a GSAP context for a component, ensuring
 * all animations are properly scoped and cleaned up.
 * @param {Function} animationFn - receives gsap context, runs animations
 * @param {Array} deps - dependency array
 * @returns {{ ref: RefObject, ctx: GSAPContext }}
 */
export function useGSAP(animationFn, deps = []) {
  const containerRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create scoped GSAP context
    ctxRef.current = gsap.context(() => {
      animationFn(containerRef.current)
    }, containerRef)

    return () => {
      ctxRef.current?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ref: containerRef, ctx: ctxRef }
}

export default useGSAP
