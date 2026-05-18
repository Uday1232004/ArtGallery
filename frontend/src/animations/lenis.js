import Lenis from 'lenis'
import { gsap } from './gsap'

let lenisInstance = null

/**
 * Initialize Lenis smooth scroll and integrate with GSAP ticker
 * @returns {Lenis} - the Lenis instance
 */
export function initLenis() {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  })

  // Integrate Lenis with GSAP ticker for synchronized animation frames
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000)
  })

  // Disable GSAP lag smoothing to prevent conflicts
  gsap.ticker.lagSmoothing(0)

  return lenisInstance
}

/**
 * Get the current Lenis instance (must call initLenis first)
 */
export function getLenis() {
  return lenisInstance
}

/**
 * Destroy Lenis instance (cleanup)
 */
export function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
  }
}

/**
 * Stop smooth scrolling temporarily
 */
export function stopLenis() {
  lenisInstance?.stop()
}

/**
 * Resume smooth scrolling
 */
export function startLenis() {
  lenisInstance?.start()
}
