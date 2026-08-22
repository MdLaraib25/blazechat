import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import Landing from './pages/Landing'
import PreJoin from './pages/PreJoin'
import Room from './pages/Room'

export const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('blazechat_theme') === 'dark'
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('blazechat_theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('blazechat_theme', 'light')
    }
  }, [dark])

  function toggleDark() {
    setDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join/:code" element={<PreJoin />} />
          <Route path="/room/:code" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}

export default App