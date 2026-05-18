import { gsap, ScrollTrigger } from './gsap'

// ─── Easing presets ──────────────────────────────────────
const EASE = {
  expo: 'expo.out',
  power3: 'power3.out',
  power4: 'power4.out',
  back: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.5)',
  circ: 'circ.out',
}

// ─── fadeUp ──────────────────────────────────────────────
/**
 * Fade elements up from below with opacity
 * @param {string|Element|NodeList} targets
 * @param {Object} opts - GSAP/ScrollTrigger options
 */
export function fadeUp(targets, opts = {}) {
  const {
    y = 60,
    duration = 1.1,
    stagger = 0,
    delay = 0,
    ease = EASE.expo,
    trigger = null,
    start = 'top 88%',
    once = true,
    ...rest
  } = opts

  const tl = gsap.timeline({
    scrollTrigger: trigger
      ? {
          trigger,
          start,
          end: 'bottom 20%',
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        }
      : undefined,
  })

  tl.from(targets, {
    y,
    opacity: 0,
    duration,
    stagger,
    delay,
    ease,
    ...rest,
  })

  return tl
}

// ─── textReveal ──────────────────────────────────────────
/**
 * Word-by-word text reveal using wrapper spans
 * Expects HTML structure: <span class="word-wrapper"><span class="word-inner">word</span></span>
 * @param {string|Element} container
 * @param {Object} opts
 */
export function textReveal(container, opts = {}) {
  const {
    stagger = 0.08,
    duration = 1,
    ease = EASE.expo,
    delay = 0,
    trigger = null,
    start = 'top 85%',
  } = opts

  const el = typeof container === 'string' ? document.querySelector(container) : container
  if (!el) return

  const words = el.querySelectorAll('.word-inner')

  const tl = gsap.timeline({
    scrollTrigger: trigger
      ? {
          trigger,
          start,
          toggleActions: 'play none none none',
        }
      : undefined,
  })

  tl.from(words, {
    yPercent: 110,
    duration,
    stagger,
    ease,
    delay,
  })

  return tl
}

// ─── splitTextIntoWords ──────────────────────────────────
/**
 * Split element text into wrapped words for animation
 * @param {Element} el
 * @returns {Element} - the same element with words wrapped
 */
export function splitTextIntoWords(el) {
  if (!el) return el
  const text = el.textContent.trim()
  const words = text.split(' ')
  el.innerHTML = words
    .map(
      (word) =>
        `<span class="word-wrapper"><span class="word-inner">${word}</span></span>`
    )
    .join(' ')
  return el
}

// ─── clipReveal ──────────────────────────────────────────
/**
 * Reveal element using clip-path animation (curtain wipe)
 * @param {Element} el
 * @param {Object} opts
 */
export function clipReveal(el, opts = {}) {
  const {
    direction = 'bottom', // 'bottom' | 'right' | 'top' | 'left'
    duration = 1.2,
    ease = EASE.expo,
    delay = 0,
    trigger = null,
    start = 'top 80%',
  } = opts

  const clipFrom = {
    bottom: 'inset(100% 0 0 0)',
    top: 'inset(0 0 100% 0)',
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
  }

  const tl = gsap.timeline({
    scrollTrigger: trigger
      ? {
          trigger,
          start,
          toggleActions: 'play none none none',
        }
      : undefined,
  })

  tl.from(el, {
    clipPath: clipFrom[direction],
    duration,
    ease,
    delay,
  })

  return tl
}

// ─── parallax ────────────────────────────────────────────
/**
 * Parallax scroll effect
 * @param {Element} el - element to parallax
 * @param {number} speed - 0 = no parallax, 1 = full speed, negative = opposite direction
 * @param {Object} opts
 */
export function parallax(el, speed = 0.3, opts = {}) {
  const { trigger = el, start = 'top bottom', end = 'bottom top' } = opts

  gsap.fromTo(
    el,
    { yPercent: -speed * 20 },
    {
      yPercent: speed * 20,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub: true,
      },
    }
  )
}

// ─── horizontalScroll ────────────────────────────────────
/**
 * Convert a container into a horizontal scroll section
 * controlled by vertical scroll via GSAP ScrollTrigger
 * @param {Element} container - the horizontal scroll container
 * @param {Element} wrapper - the section wrapping element (used as trigger)
 */
export function horizontalScroll(container, wrapper) {
  const totalWidth = container.scrollWidth - window.innerWidth

  gsap.to(container, {
    x: -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${totalWidth + window.innerWidth * 0.5}`,
      scrub: 1.2,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })
}

// ─── pinSection ──────────────────────────────────────────
/**
 * Pin a section while scrolling, running an animation timeline
 * @param {Element} trigger
 * @param {Function} animationBuilder - receives tl, builds timeline
 * @param {Object} opts
 */
export function pinSection(trigger, animationBuilder, opts = {}) {
  const {
    start = 'top top',
    end = '+=200%',
    scrub = 1.5,
    pin = true,
  } = opts

  const tl = gsap.timeline()
  animationBuilder(tl)

  ScrollTrigger.create({
    trigger,
    start,
    end,
    pin,
    scrub,
    animation: tl,
    anticipatePin: 1,
  })

  return tl
}

// ─── staggerReveal ───────────────────────────────────────
/**
 * Staggered entrance for a list of elements
 * @param {NodeList|Array} elements
 * @param {Object} opts
 */
export function staggerReveal(elements, opts = {}) {
  const {
    from = { y: 50, opacity: 0, scale: 0.95 },
    stagger = 0.12,
    duration = 1,
    ease = EASE.expo,
    trigger = null,
    start = 'top 85%',
  } = opts

  const tl = gsap.timeline({
    scrollTrigger: trigger
      ? {
          trigger,
          start,
          toggleActions: 'play none none none',
        }
      : undefined,
  })

  tl.from(elements, {
    ...from,
    stagger,
    duration,
    ease,
  })

  return tl
}

// ─── maskExpand ──────────────────────────────────────────
/**
 * SVG mask scale expansion driven by scroll
 * @param {Element} maskEl - the mask element to scale
 * @param {Element} triggerEl - scroll trigger wrapper
 * @param {Object} opts
 */
export function maskExpand(maskEl, triggerEl, opts = {}) {
  const {
    fromScale = 0.18,
    toScale = 4,
    start = 'top top',
    end = '+=250%',
    scrub = 2,
  } = opts

  gsap.fromTo(
    maskEl,
    { scale: fromScale },
    {
      scale: toScale,
      ease: 'none',
      scrollTrigger: {
        trigger: triggerEl,
        start,
        end,
        scrub,
        pin: triggerEl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    }
  )
}

// ─── scaleText ────────────────────────────────────────────
/**
 * Scale text based on scroll progress (manifesto style)
 */
export function scaleText(el, opts = {}) {
  const { fromScale = 0.6, toScale = 1.4, trigger = el } = opts

  gsap.fromTo(
    el,
    { scale: fromScale, opacity: 0.3 },
    {
      scale: toScale,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        end: 'center center',
        scrub: 1.5,
      },
    }
  )
}

export { EASE }
