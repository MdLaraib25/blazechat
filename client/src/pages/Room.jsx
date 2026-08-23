import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { generateName } from '../utils/nameGenerator'
import { useTheme } from '../App'
import socket from '../socket'

const AVATAR_COLORS = [
  '#2D5BE3', '#E85A4F', '#50B86C',
  '#9B6FF7', '#F59E0B', '#0891B2'
]

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  })
}

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

function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38,
      fontWeight: 700, flexShrink: 0,
      fontFamily: 'var(--ff-sans)',
    }}>
      {name.charAt(0)}
    </div>
  )
}

function SystemMessage({ content }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, color: 'var(--muted-2)', whiteSpace: 'nowrap' }}>{content}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function MessageBubble({ message, myName, isFirst, avatarColor }) {
  const isMe = message.sender === myName
  if (message.type === 'system') return <SystemMessage content={message.content} />

  return (
    <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end', marginBottom: 2 }}>
      <div style={{ width: 32, flexShrink: 0 }}>
        {!isMe && isFirst && <Avatar name={message.sender} color={avatarColor} size={32} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '72%', gap: 3 }}>
        {isFirst && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexDirection: isMe ? 'row-reverse' : 'row', paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0, marginBottom: 3 }}>
            {!isMe && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)' }}>{message.sender}</span>}
            <span style={{ fontSize: 11, color: 'var(--muted-3)' }}>{formatTime(message.timestamp)}</span>
          </div>
        )}
        <div style={{
          padding: '10px 14px',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMe ? 'var(--cobalt)' : 'var(--bg-2)',
          color: isMe ? '#fff' : 'var(--ink)',
          fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
          boxShadow: isMe ? '0 2px 8px rgba(45,91,227,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null
  const text = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
    : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 4px 42px' }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', background: 'var(--canvas-2)', borderRadius: 12, padding: '8px 12px' }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted-2)', animation: 'bcTyping 1.2s ease infinite', animationDelay: `${delay}ms` }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted-2)', fontStyle: 'italic' }}>{text}</span>
    </div>
  )
}

function MemberItem({ member, isMe, index }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: isMe ? 'var(--cobalt-bg)' : 'transparent' }}>
      <Avatar name={member.name} color={getAvatarColor(index)} size={30} />
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
      {isMe && <span style={{ fontSize: 10, fontWeight: 500, background: 'var(--cobalt-bg)', color: 'var(--cobalt)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>you</span>}
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
    </div>
  )
}

export default function Room() {
  const { code } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggleDark } = useTheme()
  const w = useWindowWidth()
  const isMobile = w < 768

  const [myName, setMyName] = useState(() => {
    const savedName = sessionStorage.getItem('blazechat_name')
    const savedRoom = sessionStorage.getItem('blazechat_room')
    if (savedName && savedRoom === code) return savedName
    return location.state?.name || generateName()
  })

  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [roomError, setRoomError] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showMobileMembers, setShowMobileMembers] = useState(false)

  const typingTimeoutRef = useRef(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    let hasJoined = false
    let isRefreshing = false

    const handleBeforeUnload = () => { isRefreshing = true }
    window.addEventListener('beforeunload', handleBeforeUnload)

    if (!socket.connected) socket.connect()

    sessionStorage.setItem('blazechat_room', code)
    sessionStorage.setItem('blazechat_name', myName)

    socket.emit('join-room', { code, name: myName })
    hasJoined = true

    socket.once('room-joined', ({ members, messages, assignedName }) => {
      if (assignedName && assignedName !== myName) {
        setMyName(assignedName)
        sessionStorage.setItem('blazechat_name', assignedName)
      }
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(messages)
      setConnected(true)
    })

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (hasJoined && !isRefreshing) {
        socket.emit('leave-room', { code })
        socket.disconnect()
      } else if (isRefreshing) {
        socket.disconnect()
      }
    }
  }, [code])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handlers = useCallback({
    onNewMessage: (message) => setMessages(prev => [...prev, message]),
    onUserJoined: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, { id: Date.now(), type: 'system', content: `${name} joined the room`, timestamp: new Date().toISOString() }])
    },
    onUserLeft: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, { id: Date.now(), type: 'system', content: `${name} left the room`, timestamp: new Date().toISOString() }])
    },
    onUserTyping: ({ name }) => setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]),
    onUserStoppedTyping: ({ name }) => setTypingUsers(prev => prev.filter(n => n !== name)),
    onRoomError: ({ message }) => {
      sessionStorage.removeItem('blazechat_room')
      sessionStorage.removeItem('blazechat_name')
      setRoomError(message)
      setTimeout(() => navigate('/'), 2000)
    },
  }, [navigate])

  useSocket(code, handlers)

  function handleInputChange(e) {
    setInputValue(e.target.value)
    socket.emit('typing-start', { code, name: myName })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { code, name: myName })
    }, 1500)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 90) + 'px' }
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const myIndex = members.findIndex(m => m.name === myName)
    const message = {
      id: Date.now(), sender: myName,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      avatarColor: getAvatarColor(myIndex >= 0 ? myIndex : 0),
    }
    socket.emit('send-message', { code, message })
    socket.emit('typing-stop', { code, name: myName })
    clearTimeout(typingTimeoutRef.current)
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleLeave() {
    sessionStorage.removeItem('blazechat_room')
    sessionStorage.removeItem('blazechat_name')
    socket.emit('leave-room', { code })
    socket.disconnect()
    navigate('/')
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function isFirstInGroup(index) {
    if (index === 0) return true
    return messages[index].sender !== messages[index - 1].sender || messages[index].type === 'system' || messages[index - 1].type === 'system'
  }

  if (roomError) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--canvas)' }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{roomError}</p>
        <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>Redirecting to home...</p>
      </div>
    )
  }

  if (!connected) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--canvas)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid var(--canvas-3)', borderTopColor: 'var(--cobalt)', animation: 'bcSpin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Connecting to room {code}...</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--canvas)', overflow: 'hidden' }}>

      {/* Navbar */}
      <div style={{
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${isMobile ? '16px' : '20px'}`,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10, gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => navigate('/')} style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: dark ? 'var(--canvas)' : '#fff', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          {!isMobile && (
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Blazechat</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--canvas-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px' }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Room</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.08em' }}>{code}</span>
          </div>
          <button onClick={handleCopyCode} style={{ padding: '6px 10px', background: copiedCode ? 'rgba(22,163,74,0.08)' : 'var(--cobalt-bg)', border: `1px solid ${copiedCode ? 'rgba(22,163,74,0.2)' : 'var(--cobalt-bd)'}`, borderRadius: 8, fontSize: 12, fontWeight: 500, color: copiedCode ? 'var(--green)' : 'var(--cobalt)', cursor: 'pointer', fontFamily: 'var(--ff-sans)', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
            {copiedCode ? 'Copied' : 'Copy'}
          </button>
          <button onClick={toggleDark} style={{ width: 32, height: 32, background: 'var(--canvas-2)', border: '1px solid var(--border)', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }}>
              {dark
                ? <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
                : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              }
            </svg>
          </button>
          {isMobile && (
            <button
              onClick={() => setShowMobileMembers(v => !v)}
              style={{ width: 32, height: 32, background: 'var(--canvas-2)', border: '1px solid var(--border)', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Sidebar — hidden on mobile, shown as overlay when toggled */}
        {(!isMobile || showMobileMembers) && (
          <div style={{
            width: isMobile ? '100%' : 220,
            flexShrink: 0,
            background: 'var(--canvas)',
            borderRight: isMobile ? 'none' : '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            position: isMobile ? 'absolute' : 'relative',
            top: isMobile ? 0 : 'auto',
            left: isMobile ? 0 : 'auto',
            right: isMobile ? 0 : 'auto',
            bottom: isMobile ? 0 : 'auto',
            zIndex: isMobile ? 20 : 'auto',
            boxShadow: isMobile ? '0 0 40px rgba(0,0,0,0.15)' : 'none',
          }}>
            {isMobile && (
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Members</span>
                <button onClick={() => setShowMobileMembers(false)} style={{ width: 30, height: 30, background: 'var(--canvas-2)', border: '1px solid var(--border)', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 14, color: 'var(--muted)' }}>✕</button>
              </div>
            )}
            <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border-2)' }}>
              {!isMobile && <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cobalt)', marginBottom: 4 }}>Anonymous room</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{members.length} {members.length === 1 ? 'person' : 'people'} here</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-3)', padding: '4px 8px 10px' }}>Members</div>
              {members.map((member, index) => (
                <MemberItem key={member.id} member={member} isMe={member.name === myName} index={index} />
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border-2)' }}>
              <button onClick={handleLeave}
                style={{ width: '100%', padding: 9, background: 'none', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--ff-sans)', cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-bd)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none' }}
              >
                Leave room
              </button>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>

          {/* Chat header */}
          <div style={{ padding: isMobile ? '10px 16px' : '12px 20px', borderBottom: '1px solid var(--border-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                Anonymous room
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: 100, padding: '2px 8px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>live</span>
                </div>
              </div>
              <div style={{ fontSize: isMobile ? 10.5 : 11.5, color: 'var(--muted-2)', marginTop: 2 }}>
                {isMobile ? `${members.length} members · expires when empty` : 'Expires when everyone leaves · messages not saved'}
              </div>
            </div>

            {/* Avatar stack */}
            <div style={{ display: 'flex' }}>
              {members.slice(0, isMobile ? 3 : 4).map((m, i) => (
                <div key={m.id} title={m.name} style={{ width: 26, height: 26, borderRadius: '50%', background: getAvatarColor(i), border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -7 : 0, position: 'relative', zIndex: members.length - i }}>
                  {m.name.charAt(0)}
                </div>
              ))}
              {members.length > (isMobile ? 3 : 4) && (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--canvas-2)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginLeft: -7 }}>
                  +{members.length - (isMobile ? 3 : 4)}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 0' }}>
                <div style={{ width: 44, height: 44, background: 'var(--canvas-2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--muted-3)' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)' }}>No messages yet</p>
                <p style={{ fontSize: 13, color: 'var(--muted-2)' }}>Be the first to say something</p>
              </div>
            )}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                myName={myName}
                isFirst={isFirstInGroup(index)}
                avatarColor={message.avatarColor || getAvatarColor(members.findIndex(m => m.name === message.sender))}
              />
            ))}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: isMobile ? '10px 12px 14px' : '12px 16px 14px', borderTop: '1px solid var(--border-2)', flexShrink: 0, background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar name={myName} color={getAvatarColor(members.findIndex(m => m.name === myName))} size={18} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Chatting as <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{myName}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: 'var(--canvas)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '10px 10px 10px 14px' }}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--ff-sans)', fontSize: isMobile ? 15 : 14, color: 'var(--ink)', resize: 'none', lineHeight: 1.5, minHeight: 22, maxHeight: 90 }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{ width: 34, height: 34, background: inputValue.trim() ? 'var(--cobalt)' : 'var(--canvas-3)', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'background 0.18s' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted-3)' }}>Enter to send · Shift Enter for new line</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bcPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes bcTyping { 0%,80%,100%{transform:scale(.7);opacity:.4} 40%{transform:scale(1);opacity:1} }
        @keyframes bcSpin { to{transform:rotate(360deg)} }
        textarea::placeholder { color: var(--muted-2); }
      `}</style>
    </div>
  )
}