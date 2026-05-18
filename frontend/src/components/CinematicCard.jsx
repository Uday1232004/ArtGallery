import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'

/**
 * CinematicCard — reusable gallery card with hover effects
 * Features: scale, overlay reveal, blur siblings effect
 */
export default function CinematicCard({
  image,
  title,
  medium,
  year,
  index = 0,
  size = 'default', // 'sm' | 'default' | 'lg'
  className = '',
}) {
  const cardRef = useRef(null)
  const overlayRef = useRef(null)
  const imageRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    const overlay = overlayRef.current
    const img = imageRef.current
    if (!card || !overlay || !img) return

    const enter = () => {
      setHovered(true)
      gsap.to(img, { scale: 1.07, duration: 0.8, ease: 'expo.out' })
      gsap.to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    }

    const leave = () => {
      setHovered(false)
      gsap.to(img, { scale: 1, duration: 0.8, ease: 'expo.out' })
      gsap.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.out' })
    }

    card.addEventListener('mouseenter', enter)
    card.addEventListener('mouseleave', leave)
    return () => {
      card.removeEventListener('mouseenter', enter)
      card.removeEventListener('mouseleave', leave)
    }
  }, [])

  const sizeClasses = {
    sm: 'aspect-[3/4]',
    default: 'aspect-[3/4]',
    lg: 'aspect-[2/3]',
  }

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-sm cursor-none group ${sizeClasses[size]} ${className}`}
      data-cursor-hover
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover img-cinematic"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/20 to-transparent" />

      {/* Hover overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-void/50 backdrop-blur-[2px] opacity-0 transition-opacity"
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {/* Index number */}
        <div className="font-sans text-[10px] tracking-[0.3em] text-gold/70 mb-2">
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl md:text-2xl text-ivory leading-tight mb-1">
          {title}
        </h3>

        {/* Meta */}
        <div
          className={`flex items-center gap-3 transition-all duration-500 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="font-sans text-xs text-mist tracking-widest">{medium}</span>
          <span className="w-1 h-1 rounded-full bg-gold/50" />
          <span className="font-sans text-xs text-mist">{year}</span>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-4 right-4 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M0 0 L24 0 L24 24" stroke="rgba(201,169,110,0.6)" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </div>
  )
}
