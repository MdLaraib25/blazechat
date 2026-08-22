import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../App'
import RoomModal from '../components/RoomModal'
import socket from '../socket'

/* ─────────────────────────────────────────
   ICON STYLES — defined first, used below
───────────────────────────────────────── */
const ico = {
  width: 14, height: 14,
  stroke: 'var(--cobalt)',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ppIco = {
  width: 18, height: 18,
  stroke: 'var(--cobalt)',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/* ─────────────────────────────────────────
   TICKER ITEMS
───────────────────────────────────────── */
const TICKER_STEPS = [
  { num: 'Step 01', text: 'Create a room', sub: 'one click, zero setup' },
  { num: 'Step 02', text: 'Share the code', sub: '6 characters, that is all' },
  { num: 'Step 03', text: 'Pick your alias', sub: 'anonymous by default' },
  { num: 'Step 04', text: 'Start chatting', sub: 'real time, no delay' },
  { num: 'Step 05', text: 'Leave when done', sub: 'room self-destructs, nothing saved' },
]

/* ─────────────────────────────────────────
   TRUST ITEMS
───────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    label: 'No account required',
    icon: (
      <svg viewBox="0 0 24 24" style={ico}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'Nothing stored ever',
    icon: (
      <svg viewBox="0 0 24 24" style={ico}>
        <polyline points="3 6 5 12 3 18"/>
        <polyline points="21 6 19 12 21 18"/>
        <path d="M5 12h14"/>
      </svg>
    ),
  },
  {
    label: 'Live in under 3 seconds',
    icon: (
      <svg viewBox="0 0 24 24" style={ico}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    label: 'Any device, any browser',
    icon: (
      <svg viewBox="0 0 24 24" style={ico}>
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
]

/* ─────────────────────────────────────────
   STEPS
───────────────────────────────────────── */
const STEPS = [
  {
    num: '1',
    title: 'Create the room',
    body: 'Tap the button. A room opens instantly with a unique 6-character code. You do not fill anything out — it is just ready.',
  },
  {
    num: '2',
    title: 'Share the code',
    body: 'Copy the 6-character code and send it anywhere — a group chat, a DM, an email, word of mouth. Anyone with it can walk straight in.',
  },
  {
    num: '3',
    title: 'Talk, then leave',
    body: 'Chat happens in real time. When the last person leaves, the room closes permanently. No transcript. No archive. It is gone.',
  },
]

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
const FEATURES = [
  {
    tag: 'Privacy',
    title: 'Zero identity required',
    body: 'We do not collect an email, a name, a password, or a phone number. You are not a user to us. You are a conversation happening right now.',
  },
  {
    tag: 'Security',
    title: 'Rooms self-destruct',
    body: 'When the last person leaves, the room closes and all messages are deleted. There is no history sitting on a server waiting to be leaked or subpoenaed.',
  },
  {
    tag: 'Speed',
    title: 'Sub-3-second setup',
    body: 'Most chat apps make you sign up, verify an email, choose a username, and upload a photo. Blazechat skips all of that. You are in a live room in under 3 seconds.',
  },
  {
    tag: 'Identity',
    title: 'Ghost aliases',
    body: 'Every person gets an auto-assigned alias like CinderMoth or JuniperBlue — just enough identity to follow a thread, not enough to reveal anything real.',
  },
  {
    tag: 'Reach',
    title: 'Works on everything',
    body: 'No app to install. Open any browser on any device — phone, tablet, old laptop — enter the code, and you are in. The code is the whole app.',
  },
  {
    tag: 'Scale',
    title: 'Group-ready',
    body: 'Rooms are not just for two. Drop the same code to an entire group and everyone lands in the same space. No invite list, no capacity limit.',
  },
]

/* ─────────────────────────────────────────
   PREVIEW POINTS
───────────────────────────────────────── */
const PREVIEW_POINTS = [
  {
    title: 'Auto-assigned aliases',
    body: 'Every person gets a name like MidnightOwl or SilverFern the moment they join. Enough identity to follow the conversation, nothing that reveals who you actually are.',
    icon: (
      <svg viewBox="0 0 24 24" style={ppIco}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    title: 'Live typing indicators',
    body: 'See when someone is composing a message in real time. The dots appear the moment they start typing and disappear when they stop — keeping the conversation flowing naturally.',
    icon: (
      <svg viewBox="0 0 24 24" style={ppIco}>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: 'Message grouping',
    body: 'Consecutive messages from the same person are grouped together visually. Clean, readable, and easy to follow even in busy group conversations.',
    icon: (
      <svg viewBox="0 0 24 24" style={ppIco}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'System events in context',
    body: 'When someone joins or leaves, a quiet system message appears inline — so everyone always knows who is present without the clutter of a separate members panel.',
    icon: (
      <svg viewBox="0 0 24 24" style={ppIco}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
]

/* ─────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -28px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visible]
}

/* ─────────────────────────────────────────
   REVEAL WRAPPER
───────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()

  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // card tilt on scroll
  useEffect(() => {
    const handler = () => {
      const wrap = document.getElementById('cardWrap')
      if (!wrap) return
      const deg = Math.max(0, 2.5 - window.scrollY * 0.006)
      wrap.style.transform = `rotate(${deg}deg)`
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleCreateRoom() {
    setLoading(true)
    socket.connect()
    socket.emit('create-room', {})
    socket.once('room-created', ({ code }) => {
      setCreatedCode(code)
      setShowModal(true)
      setLoading(false)
    })
  }

  function handleEnterRoom() {
    socket.disconnect()
    setShowModal(false)
    navigate(`/join/${createdCode}`)
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) {
      setJoinError(true)
      setTimeout(() => setJoinError(false), 2500)
      return
    }
    navigate(`/join/${code}`)
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', color: 'var(--ink)', fontFamily: 'var(--ff-sans)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 48px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-2)',
      }}>
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
        >
          <div style={{
            width: 28, height: 28, background: 'var(--ink)',
            borderRadius: 8, display: 'grid', placeItems: 'center',
            flexShrink: 0, transition: 'background 0.3s',
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: dark ? 'var(--canvas)' : '#fff', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Blazechat
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[['How it works', 'how'], ['Features', 'features']].map(([label, id]) => (
            <span
              key={id}
              onClick={() => scrollTo(id)}
              style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 400, cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = 'var(--ink)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {label}
            </span>
          ))}

          <button
            onClick={toggleDark}
            style={{
              width: 34, height: 34,
              background: 'var(--canvas-2)',
              border: '1px solid var(--border)',
              borderRadius: 9,
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', color: 'var(--muted)',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--canvas-3)'; e.currentTarget.style.color = 'var(--ink)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--canvas-2)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            {dark ? SunIcon : MoonIcon}
          </button>

          <button
            onClick={handleCreateRoom}
            style={{
              height: 34, padding: '0 18px',
              background: 'var(--ink)', border: 'none',
              borderRadius: 9, fontFamily: 'var(--ff-sans)',
              fontSize: 13.5, fontWeight: 500,
              color: 'var(--canvas)', cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'background 0.18s, transform 0.18s, color 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--cobalt)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--canvas)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Start a room
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '58px 48px 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 60,
        alignItems: 'center',
        minHeight: '100vh',
      }}>

        {/* Left */}
        <div style={{ paddingTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 500, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'bcPulse 2.5s ease infinite' }} />
            No sign up &nbsp;·&nbsp; No history &nbsp;·&nbsp; No trace
          </div>

          <h1 style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(3rem, 5.5vw, 4.8rem)', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 22 }}>
            A place to<br />
            talk that<br />
            <em style={{ fontStyle: 'italic', color: 'var(--cobalt)' }}>forgets you</em>
          </h1>

          <p style={{ fontSize: 16.5, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300, maxWidth: 400, marginBottom: 40 }}>
            Create a room in one click. Share the code. Chat with anyone. When everyone leaves, the room closes and nothing is kept.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--cobalt)', color: '#fff', border: 'none',
                borderRadius: 13, padding: '14px 26px',
                fontFamily: 'var(--ff-sans)', fontSize: 15, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                width: 'fit-content', letterSpacing: '-0.01em',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--cobalt-h)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45,91,227,0.28)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--cobalt)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: 5, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 300, flexShrink: 0 }}>+</span>
              {loading ? 'Creating room...' : 'Create a room'}
            </button>

            <div style={{ display: 'flex', gap: 8, maxWidth: 380 }}>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Have a code? e.g. XK94MV"
                maxLength={6}
                style={{
                  flex: 1, height: 48, padding: '0 16px',
                  background: 'var(--surface)',
                  border: `1.5px solid ${joinError ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: 11, fontFamily: 'var(--ff-sans)',
                  fontSize: 14, color: 'var(--ink)',
                  letterSpacing: '0.05em', outline: 'none',
                  textTransform: 'uppercase',
                  transition: 'border-color 0.18s',
                }}
                onFocus={e => { if (!joinError) e.target.style.borderColor = 'var(--cobalt)' }}
                onBlur={e => { if (!joinError) e.target.style.borderColor = 'var(--border)' }}
              />
              <button
                onClick={handleJoin}
                style={{
                  height: 48, padding: '0 20px',
                  background: 'var(--canvas-2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 11, fontFamily: 'var(--ff-sans)',
                  fontSize: 13.5, fontWeight: 500,
                  color: 'var(--ink-soft)', cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.18s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--canvas-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--canvas-2)'}
              >
                Join →
              </button>
            </div>

            {joinError && (
              <span style={{ fontSize: 12, color: 'var(--red)' }}>
                Please enter a valid 6-character room code
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>
              Codes are 6 characters. No account needed.
            </span>
          </div>
        </div>

        {/* Right — room card */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0 40px' }}>
          <div
            id="cardWrap"
            style={{ transform: 'rotate(2.5deg)', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2.5deg)'}
          >
            <div style={{
              width: 300, background: 'var(--surface)',
              borderRadius: 22, overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.1), 0 40px 64px rgba(0,0,0,0.06)',
              border: '1px solid var(--border-2)',
            }}>
              <div style={{ background: 'var(--ink)', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
                    <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  ))}
                </div>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginRight: 34 }}>
                  blazechat · room XK9-4MV
                </span>
              </div>
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 5 }}>
                  Room code
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '0.18em', color: 'var(--ink)', marginBottom: 4, lineHeight: 1 }}>
                  XK9-4MV
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-2)', marginBottom: 14 }}>
                  Share this with anyone you want in
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: '100%', padding: '9px 14px', background: 'var(--cobalt-bg)', border: '1px solid var(--cobalt-bd)', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: 'var(--cobalt)', textAlign: 'center' }}>
                    Copy code
                  </div>
                  <div style={{ width: '100%', padding: '9px 14px', background: 'var(--ink)', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: dark ? 'var(--canvas)' : '#fff', textAlign: 'center' }}>
                    Enter room →
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex' }}>
                    {[['#2D5BE3', 'M'], ['#E85A4F', 'S'], ['#50B86C', 'J']].map(([c, l], i) => (
                      <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid var(--surface)', display: 'grid', placeItems: 'center', fontSize: 8.5, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -7 : 0 }}>
                        {l}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 8 }}>
                    3 people in this room
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop: '1px solid var(--border-2)', borderBottom: '1px solid var(--border-2)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center' }}>
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 9,
                padding: '17px 0', paddingLeft: i === 0 ? 0 : 24,
                fontSize: 12.5, color: 'var(--muted)',
                borderRight: i < TRUST_ITEMS.length - 1 ? '1px solid var(--border-2)' : 'none',
              }}
            >
              <div style={{ width: 28, height: 28, background: 'var(--cobalt-bg)', border: '1px solid var(--cobalt-bd)', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── TICKER ── */}
      <div style={{ background: 'var(--ticker-bg)', borderTop: '1px solid var(--border-2)', borderBottom: '1px solid var(--border-2)', overflow: 'hidden', padding: '13px 0', position: 'relative', transition: 'background 0.3s' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(to right, var(--ticker-bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(to left, var(--ticker-bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div
          style={{ display: 'flex', width: 'max-content', animation: 'bcTicker 32s linear infinite' }}
          onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
        >
          {[...TICKER_STEPS, ...TICKER_STEPS].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 32px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cobalt)', opacity: 0.8 }}>
                {s.num}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ticker-acc)' }}>→</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ticker-text)', letterSpacing: '-0.01em' }}>
                <strong style={{ fontWeight: 600, color: 'var(--ticker-text)' }}>{s.text}</strong> — {s.sub}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ticker-acc)', flexShrink: 0, margin: '0 8px', display: 'inline-block' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: 'var(--canvas-2)', borderTop: '1px solid var(--border-2)', borderBottom: '1px solid var(--border-2)', padding: '96px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48, marginBottom: 56 }}>
            <div>
              <Reveal>
                <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cobalt)', display: 'block', marginBottom: 12 }}>
                  How it works
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 12 }}>
                  Three steps.<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>That is the whole thing.</em>
                </h2>
              </Reveal>
            </div>
            <Reveal>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300, maxWidth: 280 }}>
                No forms, no installs, no signups. If you can share a link you can use Blazechat.
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 18, overflow: 'hidden' }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  style={{ background: 'var(--canvas)', padding: '34px 28px 38px', height: '100%', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--canvas)'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 20 }}>
                    {s.num}
                  </div>
                  <div style={{ fontFamily: 'var(--ff-serif)', fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 9 }}>
                    {s.title}
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.72, fontWeight: 300 }}>
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48, marginBottom: 56 }}>
            <div>
              <Reveal>
                <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cobalt)', display: 'block', marginBottom: 12 }}>
                  Why Blazechat
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h2 style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--ink)' }}>
                  Everything a chat needs.<br />
                  <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>Nothing it does not.</em>
                </h2>
              </Reveal>
            </div>
            <Reveal>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75, fontWeight: 300, maxWidth: 280 }}>
                Built around one idea — some conversations should not exist on a server anywhere.
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border-2)', borderRadius: 18, overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 0.08}>
                <div
                  style={{ background: 'var(--surface)', padding: '30px 26px', height: '100%', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--canvas)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cobalt)', marginBottom: 10, display: 'block', opacity: 0.8 }}>
                    {f.tag}
                  </span>
                  <div style={{ fontFamily: 'var(--ff-serif)', fontSize: '1.15rem', fontWeight: 400, letterSpacing: '-0.015em', color: 'var(--ink)', marginBottom: 9 }}>
                    {f.title}
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.72, fontWeight: 300 }}>
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAT PREVIEW ── */}
      <section style={{ background: 'var(--canvas-2)', borderTop: '1px solid var(--border-2)', borderBottom: '1px solid var(--border-2)', padding: '96px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          <Reveal>
            <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cobalt)', display: 'block', marginBottom: 12 }}>
              Inside a room
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 56 }}>
              This is what the<br />
              <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>conversation looks like</em>
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 56, alignItems: 'center' }}>
            {/* Chat window mockup */}
            <Reveal>
              <div style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 20px 48px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      Anonymous room
                      <span style={{ fontSize: 9.5, fontWeight: 500, background: 'rgba(22,163,74,0.08)', color: 'var(--green)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 100, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'bcPulse 2s infinite' }} />
                        live
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>Room XK9-4MV · expires when everyone leaves</div>
                  </div>
                </div>

                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-2)', paddingBottom: 8 }}>SilverFern joined the room</div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-end' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#E85A4F', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>S</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '75%' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-2)', display: 'flex', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink-soft)' }}>SilverFern</span>
                        <span>2:11 PM</span>
                      </div>
                      <div style={{ padding: '9px 13px', borderRadius: 14, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--canvas-2)', color: 'var(--ink)' }}>okay wait this is way smoother than I expected</div>
                      <div style={{ padding: '9px 13px', borderRadius: 14, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--canvas-2)', color: 'var(--ink)' }}>no login, literally nothing?</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-end', flexDirection: 'row-reverse' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#2D5BE3', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>M</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '75%', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-2)', display: 'flex', gap: 5, marginBottom: 2, flexDirection: 'row-reverse' }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink-soft)' }}>MidnightOwl</span>
                        <span>2:12 PM</span>
                      </div>
                      <div style={{ padding: '9px 13px', borderRadius: 14, borderBottomRightRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--cobalt)', color: '#fff' }}>just the code. that is it</div>
                      <div style={{ padding: '9px 13px', borderRadius: 14, borderTopRightRadius: 4, borderBottomRightRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--cobalt)', color: '#fff' }}>room closes when we all leave and nothing is saved</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 3, alignItems: 'flex-end' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#50B86C', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>J</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '75%' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-2)', display: 'flex', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 500, color: 'var(--ink-soft)' }}>JuniperBlue</span>
                        <span>2:13 PM</span>
                      </div>
                      <div style={{ padding: '9px 13px', borderRadius: 14, borderBottomLeftRadius: 4, fontSize: 13, lineHeight: 1.55, background: 'var(--canvas-2)', color: 'var(--ink)' }}>sending this to my team for quick standups</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 4 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: '#9B6FF7', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0, opacity: 0.7 }}>C</div>
                    <div style={{ background: 'var(--canvas-2)', borderRadius: 14, borderBottomLeftRadius: 4, padding: '10px 14px', display: 'flex', gap: 3, alignItems: 'center' }}>
                      {[0, 0.18, 0.36].map((d, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted-2)', animation: `bcTyping 1.2s ${d}s ease infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--canvas)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '9px 10px 9px 14px' }}>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--muted-2)', fontStyle: 'italic' }}>Type a message...</span>
                    <div style={{ width: 30, height: 30, background: 'var(--cobalt)', borderRadius: 8, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: '#fff', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Preview points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {PREVIEW_POINTS.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--cobalt-bg)', border: '1px solid var(--cobalt-bd)', borderRadius: 11, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--ff-serif)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                        {p.title}
                      </div>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.68, fontWeight: 300 }}>
                        {p.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ background: '#18181B', padding: '96px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 48px', textAlign: 'center' }}>
          <Reveal>
            <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 24 }}>
              Our philosophy
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <p style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', fontWeight: 400, letterSpacing: '-0.025em', lineHeight: 1.35, color: 'rgba(255,255,255,0.55)', marginBottom: 48 }}>
              "Not every conversation needs to be<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.88)' }}>archived, indexed, and remembered.</em><br />
              Some things are better said in a room<br />
              that <span style={{ color: '#818CF8' }}>forgets you were ever there.</span>"
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ fontFamily: 'var(--ff-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, letterSpacing: '-0.03em', color: '#fff', marginBottom: 10 }}>
              Ready to disappear?
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontWeight: 300 }}>
              No account. No install. Just a code.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <button
              onClick={handleCreateRoom}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#fff', color: '#18181B',
                border: 'none', borderRadius: 13,
                padding: '14px 28px', fontFamily: 'var(--ff-sans)',
                fontSize: 15, fontWeight: 500, cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'background 0.18s, transform 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E0D8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ width: 18, height: 18, background: 'rgba(24,24,27,0.1)', borderRadius: 5, display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0 }}>+</span>
              Create my room
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border-2)', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Blazechat</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['How it works', 'how'], ['Features', 'features']].map(([label, id]) => (
            <span
              key={id}
              onClick={() => scrollTo(id)}
              style={{ fontSize: 12.5, color: 'var(--muted-2)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.target.style.color = 'var(--ink)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted-2)'}
            >
              {label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-3)', fontFamily: 'monospace' }}>
          // no logs · no accounts · gone when you leave
        </div>
      </footer>

      {/* ── MODAL ── */}
      {showModal && (
        <RoomModal
          code={createdCode}
          onClose={() => setShowModal(false)}
          onEnter={handleEnterRoom}
        />
      )}

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes bcPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes bcTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes bcTyping {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%           { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 900px) {
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </div>
  )
}