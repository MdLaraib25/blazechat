import { useState } from 'react'

function RoomModal({ code, onClose, onEnter }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px'
      }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '36px 32px',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        border: '1px solid var(--border)'
      }}>

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '30px', height: '30px',
            borderRadius: '50%',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: '13px', color: 'var(--muted)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          ✕
        </button>

        <div style={{
          width: '44px', height: '44px',
          background: 'rgba(22,163,74,0.1)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '24px', fontWeight: '400',
          letterSpacing: '-0.02em',
          color: 'var(--ink)', marginBottom: '6px'
        }}>
          Room created
        </h2>

        <p style={{
          fontSize: '14px', color: 'var(--muted)',
          lineHeight: '1.6', marginBottom: '24px'
        }}>
          Share this code with anyone you want in the room. No account needed.
        </p>

        <div style={{
          background: 'var(--bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '11px', fontWeight: '500',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--muted-2)', marginBottom: '8px'
          }}>
            Room code
          </div>
          <div style={{
            fontSize: '2.2rem', fontWeight: '700',
            letterSpacing: '0.2em', color: 'var(--ink)',
            lineHeight: '1', fontFamily: "'DM Sans', sans-serif"
          }}>
            {code}
          </div>
          <div style={{
            fontSize: '12px', color: 'var(--muted-2)',
            marginTop: '8px'
          }}>
            Expires when everyone leaves
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleCopy}
            style={{
              width: '100%',
              padding: '13px',
              background: copied
                ? 'rgba(22,163,74,0.08)'
                : 'var(--cobalt-bg)',
              border: `1.5px solid ${copied
                ? 'rgba(22,163,74,0.25)'
                : 'var(--cobalt-bd)'}`,
              borderRadius: '12px',
              fontSize: '14px', fontWeight: '500',
              color: copied ? 'var(--green)' : 'var(--cobalt)',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.18s',
              letterSpacing: '-0.01em'
            }}
          >
            {copied ? 'Copied to clipboard' : 'Copy code'}
          </button>

          <button
            onClick={onEnter}
            style={{
              width: '100%',
              padding: '13px',
              background: 'var(--cobalt)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px', fontWeight: '500',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.18s',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-h)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cobalt)'}
          >
            Enter room
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomModal