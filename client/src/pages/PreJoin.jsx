import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateName } from '../utils/nameGenerator'
import { useTheme } from '../App'

function useWindowWidth() {
  const [w, setW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

export default function PreJoin() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()
  const w = useWindowWidth()
  const isMobile = w < 768

  const [name, setName] = useState(() => generateName())
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [nameError, setNameError] = useState('')

  function handleEditClick() {
    setEditValue(name)
    setIsEditing(true)
    setNameError('')
  }

  function handleNameSave() {
    const trimmed = editValue.trim()
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters')
      return
    }
    if (trimmed.length > 20) {
      setNameError('Name must be under 20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_\s]+$/.test(trimmed)) {
      setNameError('Only letters, numbers, spaces and underscores')
      return
    }
    setName(trimmed)
    setIsEditing(false)
    setNameError('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleNameSave()
    if (e.key === 'Escape') setIsEditing(false)
  }

  function handleEnterRoom() {
    navigate(`/room/${code}`, { state: { name } })
  }

  const MoonIcon = (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )

  const SunIcon = (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )

  const px = isMobile ? '20px' : '48px'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--canvas)',
      fontFamily: 'var(--ff-sans)',
    }}>

      {/* Navbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 56,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${px}`,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-2)',
        zIndex: 10,
      }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
        >
          <div style={{
            width: 28, height: 28,
            background: 'var(--ink)', borderRadius: 8,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: dark ? 'var(--canvas)' : '#fff', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Blazechat
          </span>
        </div>

        <button
          onClick={toggleDark}
          style={{
            width: 34, height: 34,
            background: 'var(--canvas-2)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            display: 'grid', placeItems: 'center',
            cursor: 'pointer', color: 'var(--muted)',
          }}
        >
          {dark ? SunIcon : MoonIcon}
        </button>
      </div>

      {/* Card */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: isMobile ? '80px 20px 40px' : '80px 24px 40px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'var(--surface)',
          borderRadius: 24,
          padding: isMobile ? '28px 22px' : '36px 32px',
          border: '1px solid var(--border)',
        }}>

          {/* Room badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--cobalt-bg)',
            border: '1px solid var(--cobalt-bd)',
            borderRadius: 8, padding: '5px 12px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cobalt)' }}>
              Joining room
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--cobalt)' }}>
              {code}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--ff-serif)',
            fontSize: isMobile ? '1.6rem' : '1.75rem',
            fontWeight: 400, letterSpacing: '-0.02em',
            color: 'var(--ink)', marginBottom: 6, lineHeight: 1.15,
          }}>
            You are joining as
          </h1>

          <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 300, marginBottom: 24, lineHeight: 1.6 }}>
            This is your anonymous alias. You can change it before entering.
          </p>

          {/* Name display */}
          {!isEditing ? (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--canvas)',
              border: '1.5px solid var(--border)',
              borderRadius: 14, padding: '12px 14px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'var(--cobalt)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {name.charAt(0)}
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 600,
                  color: 'var(--ink)', letterSpacing: '-0.01em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name}
                </span>
              </div>
              <button
                onClick={handleEditClick}
                style={{
                  padding: '6px 14px', background: 'none',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: 12, fontWeight: 500, color: 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'var(--ff-sans)',
                  flexShrink: 0, marginLeft: 8,
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--canvas)',
                border: '1.5px solid var(--cobalt)',
                borderRadius: 14, padding: '10px 12px',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'var(--cobalt)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {editValue.charAt(0) || '?'}
                </div>
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => { setEditValue(e.target.value); setNameError('') }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your name"
                  maxLength={20}
                  style={{
                    flex: 1, minWidth: 0,
                    background: 'none', border: 'none', outline: 'none',
                    fontSize: 15, fontWeight: 600, color: 'var(--ink)',
                    fontFamily: 'var(--ff-sans)',
                  }}
                />
                <button
                  onClick={handleNameSave}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--cobalt)', border: 'none',
                    borderRadius: 8, fontSize: 12, fontWeight: 500,
                    color: '#fff', cursor: 'pointer',
                    fontFamily: 'var(--ff-sans)', flexShrink: 0,
                  }}
                >
                  Save
                </button>
              </div>
              {nameError && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 6, paddingLeft: 4 }}>
                  {nameError}
                </p>
              )}
              <p style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 4, paddingLeft: 4 }}>
                Enter to save · Esc to cancel
              </p>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 28 }}>
            If someone has the same name, a number is added automatically.
          </p>

          <button
            onClick={handleEnterRoom}
            disabled={isEditing}
            style={{
              width: '100%', padding: '14px',
              background: isEditing ? 'var(--muted-3)' : 'var(--cobalt)',
              border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 500, color: '#fff',
              fontFamily: 'var(--ff-sans)',
              transition: 'background 0.18s',
              letterSpacing: '-0.01em',
              cursor: isEditing ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'var(--cobalt-h)' }}
            onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'var(--cobalt)' }}
          >
            Enter room as {name}
          </button>

          <p style={{ fontSize: 12, color: 'var(--muted-2)', textAlign: 'center', marginTop: 16 }}>
            No account needed · alias disappears when room closes
          </p>
        </div>
      </div>
    </div>
  )
}