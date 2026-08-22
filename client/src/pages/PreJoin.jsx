import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateName } from '../utils/nameGenerator'
import { useTheme } from '../App'

function PreJoin() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* Navbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '56px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--ink)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: dark ? '#111' : '#fff', fontSize: '12px', fontWeight: '700' }}>
              B
            </span>
          </div>
          <span style={{
            fontWeight: '600', fontSize: '15px',
            color: 'var(--ink)', letterSpacing: '-0.02em'
          }}>
            Blazechat
          </span>
        </div>

        <button
          onClick={toggleDark}
          style={{
            padding: '7px 14px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px', fontWeight: '500',
            color: 'var(--muted)', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '80px 24px 40px'
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'var(--surface)',
          borderRadius: '24px',
          padding: '36px 32px',
          border: '1px solid var(--border)'
        }}>

          {/* Room badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--cobalt-bg)',
            border: '1px solid var(--cobalt-bd)',
            borderRadius: '8px', padding: '5px 12px',
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--cobalt)'
            }}>
              Joining room
            </span>
            <span style={{
              fontSize: '13px', fontWeight: '700',
              letterSpacing: '0.1em', color: 'var(--cobalt)'
            }}>
              {code}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '26px', fontWeight: '400',
            letterSpacing: '-0.02em',
            color: 'var(--ink)', marginBottom: '6px',
            lineHeight: '1.15'
          }}>
            You are joining as
          </h1>

          <p style={{
            fontSize: '14px', color: 'var(--muted)',
            fontWeight: '300', marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            This is your anonymous alias. You can change it before entering.
          </p>

          {/* Name display or edit */}
          {!isEditing ? (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px', padding: '12px 14px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: '9px', background: 'var(--cobalt)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', color: '#fff'
                }}>
                  {name.charAt(0)}
                </div>
                <span style={{
                  fontSize: '16px', fontWeight: '600',
                  color: 'var(--ink)', letterSpacing: '-0.01em'
                }}>
                  {name}
                </span>
              </div>
              <button
                onClick={handleEditClick}
                style={{
                  padding: '6px 14px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px', fontWeight: '500',
                  color: 'var(--muted)', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif"
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--bg)',
                border: '1.5px solid var(--cobalt)',
                borderRadius: '14px', padding: '10px 12px'
              }}>
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: '9px', background: 'var(--cobalt)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700',
                  color: '#fff', flexShrink: 0
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
                      flex: 1,
                      minWidth: 0,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--ink)',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  />
                <button
                  onClick={handleNameSave}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--cobalt)',
                    border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: '500',
                    color: '#fff', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    flexShrink: 0
                  }}
                >
                  Save
                </button>
              </div>
              {nameError && (
                <p style={{
                  fontSize: '12px', color: 'var(--red-text)',
                  marginTop: '6px', paddingLeft: '4px'
                }}>
                  {nameError}
                </p>
              )}
              <p style={{
                fontSize: '11px', color: 'var(--muted-2)',
                marginTop: '4px', paddingLeft: '4px'
              }}>
                Enter to save · Esc to cancel
              </p>
            </div>
          )}

          <p style={{
            fontSize: '12px', color: 'var(--muted-2)',
            marginBottom: '28px'
          }}>
            If someone has the same name, a number is added automatically.
          </p>

          <button
            onClick={handleEnterRoom}
            disabled={isEditing}
            style={{
              width: '100%', padding: '14px',
              background: isEditing ? 'var(--muted-3)' : 'var(--cobalt)',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: '500',
              color: '#fff',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.18s',
              letterSpacing: '-0.01em',
              cursor: isEditing ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'var(--cobalt-h)' }}
            onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'var(--cobalt)' }}
          >
            Enter room as {name}
          </button>

          <p style={{
            fontSize: '12px', color: 'var(--muted-2)',
            textAlign: 'center', marginTop: '16px'
          }}>
            No account needed · alias disappears when room closes
          </p>
        </div>
      </div>
    </div>
  )
}

export default PreJoin