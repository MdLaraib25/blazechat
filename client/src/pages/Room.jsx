import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { generateName } from '../utils/nameGenerator'
import { useTheme } from '../App'
import socket, { SOCKET_EVENT_TIMEOUT_MS } from '../socket'

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

function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '8px', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38,
      fontWeight: '700', flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {name.charAt(0)}
    </div>
  )
}

function SystemMessage({ content }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '10px', margin: '10px 0'
    }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontSize: '11px', color: 'var(--muted-2)', whiteSpace: 'nowrap' }}>
        {content}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function MessageBubble({ message, myName, isFirst, avatarColor }) {
  const isMe = message.sender === myName

  if (message.type === 'system') {
    return <SystemMessage content={message.content} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMe ? 'row-reverse' : 'row',
      gap: '10px', alignItems: 'flex-end', marginBottom: '2px'
    }}>
      <div style={{ width: '32px', flexShrink: 0 }}>
        {!isMe && isFirst && (
          <Avatar name={message.sender} color={avatarColor} size={32} />
        )}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '65%', gap: '3px'
      }}>
        {isFirst && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            flexDirection: isMe ? 'row-reverse' : 'row',
            paddingLeft: isMe ? 0 : '2px',
            paddingRight: isMe ? '2px' : 0,
            marginBottom: '3px'
          }}>
            {!isMe && (
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--ink-soft)' }}>
                {message.sender}
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--muted-3)' }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <div style={{
          padding: '10px 14px',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMe ? 'var(--cobalt)' : 'var(--bg-2)',
          color: isMe ? '#fff' : 'var(--ink)',
          fontSize: '14px', lineHeight: '1.55',
          wordBreak: 'break-word', maxWidth: '100%',
          boxShadow: isMe
            ? '0 2px 8px rgba(45,91,227,0.2)'
            : '0 1px 3px rgba(0,0,0,0.04)'
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
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '10px', padding: '4px 0 4px 42px'
    }}>
      <div style={{
        display: 'flex', gap: '3px', alignItems: 'center',
        background: 'var(--bg-2)', borderRadius: '12px',
        padding: '8px 12px'
      }}>
        {[0, 150, 300].map(delay => (
          <div key={delay} style={{
            width: '5px', height: '5px',
            borderRadius: '50%', background: 'var(--muted-2)',
            animation: 'typingBounce 1.2s ease infinite',
            animationDelay: `${delay}ms`
          }} />
        ))}
      </div>
      <span style={{ fontSize: '11px', color: 'var(--muted-2)', fontStyle: 'italic' }}>
        {text}
      </span>
    </div>
  )
}

function MemberItem({ member, isMe, index }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 10px', borderRadius: '10px',
      background: isMe ? 'var(--cobalt-bg)' : 'transparent',
      transition: 'background 0.15s'
    }}>
      <Avatar name={member.name} color={getAvatarColor(index)} size={30} />
      <span style={{
        fontSize: '13px', fontWeight: '500',
        color: 'var(--ink)', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {member.name}
      </span>
      {isMe && (
        <span style={{
          fontSize: '10px', fontWeight: '500',
          background: 'var(--cobalt-bg)',
          color: 'var(--cobalt)',
          borderRadius: '4px', padding: '2px 6px'
        }}>
          you
        </span>
      )}
      <div style={{
        width: '7px', height: '7px',
        borderRadius: '50%', background: 'var(--green)',
        flexShrink: 0
      }} />
    </div>
  )
}

function Room() {
  const { code } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggleDark } = useTheme()

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

  const typingTimeoutRef = useRef(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)
  const roomJoinTimeoutRef = useRef(null)

  useEffect(() => {
    let active = true

    const handleBeforeUnload = () => {
      socket.disconnect()
    }

    const cleanupJoinAttempt = () => {
      clearTimeout(roomJoinTimeoutRef.current)
      socket.off('connect', joinRoom)
      socket.off('connect_error', handleConnectError)
      socket.off('room-joined', handleRoomJoined)
    }

    const handleConnectError = (error) => {
      if (!active) return
      cleanupJoinAttempt()
      sessionStorage.removeItem('blazechat_room')
      sessionStorage.removeItem('blazechat_name')
      setRoomError(
        error?.message || 'Could not connect to the server. Please try again.'
      )
    }

    const handleRoomJoined = ({ members, messages, assignedName }) => {
      if (!active) return
      cleanupJoinAttempt()
      if (assignedName && assignedName !== myName) {
        setMyName(assignedName)
        sessionStorage.setItem('blazechat_name', assignedName)
      }
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(messages)
      setConnected(true)
    }

    const joinRoom = () => {
      socket.emit('join-room', { code, name: myName })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    socket.once('connect_error', handleConnectError)
    socket.once('room-joined', handleRoomJoined)

    sessionStorage.setItem('blazechat_room', code)
    sessionStorage.setItem('blazechat_name', myName)

    roomJoinTimeoutRef.current = setTimeout(() => {
      handleConnectError(
        new Error('Timed out while joining the room. Please try again.')
      )
    }, SOCKET_EVENT_TIMEOUT_MS)

    if (socket.connected) {
      joinRoom()
    } else {
      socket.once('connect', joinRoom)
      socket.connect()
    }

    return () => {
      active = false
      clearTimeout(typingTimeoutRef.current)
      cleanupJoinAttempt()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      socket.disconnect()
    }
  }, [code])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handlers = useCallback({
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message])
    },
    onUserJoined: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, {
        id: Date.now(), type: 'system',
        content: `${name} joined the room`,
        timestamp: new Date().toISOString()
      }])
    },
    onUserLeft: ({ name, members }) => {
      setMembers(members.map((m, i) => ({ ...m, avatarColor: getAvatarColor(i) })))
      setMessages(prev => [...prev, {
        id: Date.now(), type: 'system',
        content: `${name} left the room`,
        timestamp: new Date().toISOString()
      }])
    },
    onUserTyping: ({ name }) => {
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name])
    },
    onUserStoppedTyping: ({ name }) => {
      setTypingUsers(prev => prev.filter(n => n !== name))
    },
    onRoomError: ({ message }) => {
      clearTimeout(roomJoinTimeoutRef.current)
      sessionStorage.removeItem('blazechat_room')
      sessionStorage.removeItem('blazechat_name')
      setRoomError(message)
      setTimeout(() => navigate('/'), 2000)
    }
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
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 90) + 'px'
    }
  }

  function handleSend() {
    if (!inputValue.trim()) return
    const myIndex = members.findIndex(m => m.name === myName)
    const message = {
      id: Date.now(),
      sender: myName,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      avatarColor: getAvatarColor(myIndex >= 0 ? myIndex : 0)
    }
    socket.emit('send-message', { code, message })
    socket.emit('typing-stop', { code, name: myName })
    clearTimeout(typingTimeoutRef.current)
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
    return (
      messages[index].sender !== messages[index - 1].sender ||
      messages[index].type === 'system' ||
      messages[index - 1].type === 'system'
    )
  }

  const isMobile = window.innerWidth < 768

  if (roomError) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '8px', background: 'var(--bg)'
      }}>
        <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--ink)' }}>
          {roomError}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--muted-2)' }}>
          Redirecting to home...
        </p>
      </div>
    )
  }

  if (!connected) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '12px', background: 'var(--bg)'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2.5px solid var(--bg-3)',
          borderTopColor: 'var(--cobalt)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Connecting to room {code}...
        </p>
      </div>
    )
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', overflow: 'hidden'
    }}>

      {/* Navbar */}
      <div style={{
        height: '56px', flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10, gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              width: '28px', height: '28px',
              background: 'var(--ink)', borderRadius: '8px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <span style={{
              color: dark ? '#111' : '#fff',
              fontSize: '12px', fontWeight: '700'
            }}>B</span>
          </div>
          {!isMobile && (
            <span style={{
              fontWeight: '600', fontSize: '15px',
              color: 'var(--ink)', letterSpacing: '-0.02em'
            }}>
              Blazechat
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px', padding: '6px 10px'
          }}>
            <span style={{
              fontSize: '10px', color: 'var(--muted)',
              fontWeight: '500', letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Room
            </span>
            <span style={{
              fontSize: '13px', fontWeight: '600',
              color: 'var(--ink)', letterSpacing: '0.08em'
            }}>
              {code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            style={{
              padding: '6px 10px',
              background: copiedCode ? 'rgba(22,163,74,0.08)' : 'var(--cobalt-bg)',
              border: `1px solid ${copiedCode ? 'rgba(22,163,74,0.2)' : 'var(--cobalt-bd)'}`,
              borderRadius: '8px',
              fontSize: '12px', fontWeight: '500',
              color: copiedCode ? 'var(--green)' : 'var(--cobalt)',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.18s', whiteSpace: 'nowrap'
            }}
          >
            {copiedCode ? 'Copied' : 'Copy code'}
          </button>

          <button
            onClick={toggleDark}
            style={{
              padding: '6px 10px',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px', fontWeight: '500',
              color: 'var(--muted)', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap'
            }}
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar — hidden on mobile */}
        {!isMobile && (
          <div style={{
            width: '220px', flexShrink: 0,
            background: 'var(--bg)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 14px 12px',
              borderBottom: '1px solid var(--border-2)'
            }}>
              <div style={{
                fontSize: '10px', fontWeight: '600',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--cobalt)', marginBottom: '4px'
              }}>
                Anonymous room
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%', background: 'var(--green)'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {members.length} {members.length === 1 ? 'person' : 'people'} here
                </span>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
              <div style={{
                fontSize: '10px', fontWeight: '600',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--muted-3)', padding: '4px 8px 10px'
              }}>
                Members
              </div>
              {members.map((member, index) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isMe={member.name === myName}
                  index={index}
                />
              ))}
            </div>

            <div style={{
              padding: '12px',
              borderTop: '1px solid var(--border-2)'
            }}>
              <button
                onClick={handleLeave}
                style={{
                  width: '100%', padding: '9px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  fontSize: '13px', color: 'var(--muted)',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer', transition: 'all 0.18s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--red-bd)'
                  e.currentTarget.style.color = 'var(--red-text)'
                  e.currentTarget.style.background = 'var(--red-hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                  e.currentTarget.style.background = 'none'
                }}
              >
                Leave room
              </button>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--surface)'
        }}>

          {/* Chat header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-2)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '14px', fontWeight: '600',
                  color: 'var(--ink)', letterSpacing: '-0.01em'
                }}>
                  Anonymous room
                </span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(22,163,74,0.08)',
                  border: '1px solid rgba(22,163,74,0.15)',
                  borderRadius: '100px', padding: '2px 8px'
                }}>
                  <div style={{
                    width: '5px', height: '5px',
                    borderRadius: '50%', background: 'var(--green)'
                  }} />
                  <span style={{
                    fontSize: '10px', fontWeight: '600',
                    color: 'var(--green)', letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                    live
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted-2)', marginTop: '2px' }}>
                {isMobile
                  ? `${members.length} members · expires when everyone leaves`
                  : 'Expires when everyone leaves · messages not saved'
                }
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Avatar stack */}
              <div style={{ display: 'flex' }}>
                {members.slice(0, isMobile ? 3 : 4).map((m, i) => (
                  <div
                    key={m.id}
                    title={m.name}
                    style={{
                      width: '26px', height: '26px',
                      borderRadius: '50%',
                      background: getAvatarColor(i),
                      border: '2px solid var(--surface)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px', fontWeight: '700', color: '#fff',
                      marginLeft: i > 0 ? '-7px' : '0',
                      zIndex: members.length - i,
                      position: 'relative'
                    }}
                  >
                    {m.name.charAt(0)}
                  </div>
                ))}
                {members.length > (isMobile ? 3 : 4) && (
                  <div style={{
                    width: '26px', height: '26px',
                    borderRadius: '50%',
                    background: 'var(--bg-2)',
                    border: '2px solid var(--surface)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px', fontWeight: '600',
                    color: 'var(--muted)',
                    marginLeft: '-7px', position: 'relative'
                  }}>
                    +{members.length - (isMobile ? 3 : 4)}
                  </div>
                )}
              </div>

              {/* Leave button on mobile */}
              {isMobile && (
                <button
                  onClick={handleLeave}
                  style={{
                    padding: '6px 10px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px', color: 'var(--muted)',
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer'
                  }}
                >
                  Leave
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex', flexDirection: 'column',
            gap: '2px'
          }}>
            {messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '60px 0'
              }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'var(--bg-2)', borderRadius: '12px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: '4px'
                }}>
                  <div style={{
                    width: '18px', height: '18px',
                    borderRadius: '50%', background: 'var(--muted-3)'
                  }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink-soft)' }}>
                  No messages yet
                </p>
                <p style={{ fontSize: '13px', color: 'var(--muted-2)' }}>
                  Be the first to say something
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                myName={myName}
                isFirst={isFirstInGroup(index)}
                avatarColor={
                  message.avatarColor ||
                  getAvatarColor(members.findIndex(m => m.name === message.sender))
                }
              />
            ))}

            <TypingIndicator typingUsers={typingUsers} />
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px 14px',
            borderTop: '1px solid var(--border-2)',
            flexShrink: 0, background: 'var(--surface)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '8px', marginBottom: '8px'
            }}>
              <Avatar
                name={myName}
                color={getAvatarColor(members.findIndex(m => m.name === myName))}
                size={18}
              />
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Chatting as{' '}
                <strong style={{ color: 'var(--ink)', fontWeight: '600' }}>
                  {myName}
                </strong>
              </span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '8px',
              background: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '10px 10px 10px 14px',
              transition: 'border-color 0.18s'
            }}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                style={{
                  flex: 1, background: 'none',
                  border: 'none', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px', color: 'var(--ink)',
                  resize: 'none', lineHeight: '1.5',
                  minHeight: '22px', maxHeight: '90px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                style={{
                  width: '34px', height: '34px',
                  background: inputValue.trim() ? 'var(--cobalt)' : 'var(--bg-3)',
                  border: 'none', borderRadius: '10px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  flexShrink: 0, transition: 'background 0.18s, transform 0.15s'
                }}
                onMouseEnter={e => {
                  if (inputValue.trim()) e.currentTarget.style.transform = 'scale(1.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-3)' }}>
                Enter to send · Shift Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
