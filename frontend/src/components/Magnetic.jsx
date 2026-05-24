import React, { useEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useCursorHover } from '../hooks/useCursorHover';

export default function Magnetic({ children, strength = 0.5, cursorType = 'button' }) {
  const ref = useRef(null);
  const hoverProps = useCursorHover(cursorType);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // We only trigger magnetic pull if it's not a touch device
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;

      xTo(distanceX * strength);
      yTo(distanceY * strength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      hoverProps.onMouseLeave(); // Reset cursor context
    };

    const handleMouseEnter = () => {
      hoverProps.onMouseEnter(); // Set cursor context
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [strength, hoverProps]);

  return React.cloneElement(children, { ref });
}
