import { useEffect } from 'react'
import socket from '../socket'

export function useSocket(roomCode, handlers) {
  useEffect(() => {
    socket.on('new-message', handlers.onNewMessage)
    socket.on('user-joined', handlers.onUserJoined)
    socket.on('user-left', handlers.onUserLeft)
    socket.on('user-typing', handlers.onUserTyping)
    socket.on('user-stopped-typing', handlers.onUserStoppedTyping)
    socket.on('room-error', handlers.onRoomError)

    return () => {
      socket.off('new-message', handlers.onNewMessage)
      socket.off('user-joined', handlers.onUserJoined)
      socket.off('user-left', handlers.onUserLeft)
      socket.off('user-typing', handlers.onUserTyping)
      socket.off('user-stopped-typing', handlers.onUserStoppedTyping)
      socket.off('room-error', handlers.onRoomError)
    }
  }, [roomCode])
}