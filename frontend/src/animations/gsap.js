import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Register all plugins once
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// Global GSAP defaults
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
})

// ScrollTrigger defaults
ScrollTrigger.config({
  limitCallbacks: true,
  syncInterval: 40,
})

export { gsap, ScrollTrigger }
