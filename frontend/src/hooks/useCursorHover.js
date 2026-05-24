import { useCallback } from 'react'
import { useCursor } from '../context/CursorContext'

export const useCursorHover = (type, text = '') => {
  const { setHoverState, resetCursor } = useCursor()

  const onMouseEnter = useCallback(() => {
    setHoverState(type, text)
  }, [setHoverState, type, text])

  const onMouseLeave = useCallback(() => {
    resetCursor()
  }, [resetCursor])

  return { onMouseEnter, onMouseLeave }
}
