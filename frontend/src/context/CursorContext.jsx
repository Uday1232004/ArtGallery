import { createContext, useContext, useState, useCallback } from 'react'

const CursorContext = createContext({
  hoverState: { type: 'default', text: '' },
  setHoverState: () => {},
  resetCursor: () => {},
})

export const useCursor = () => useContext(CursorContext)

export const CursorProvider = ({ children }) => {
  const [hoverState, setHoverStateInternal] = useState({ type: 'default', text: '' })

  const setHoverState = useCallback((type, text = '') => {
    setHoverStateInternal({ type, text })
  }, [])

  const resetCursor = useCallback(() => {
    setHoverStateInternal({ type: 'default', text: '' })
  }, [])

  return (
    <CursorContext.Provider value={{ hoverState, setHoverState, resetCursor }}>
      {children}
    </CursorContext.Provider>
  )
}
