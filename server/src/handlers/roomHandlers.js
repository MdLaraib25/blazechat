const { generateRoomCode } = require('../codeGenerator')
const {
  createRoom,
  getRoom,
  addMember,
  removeMember,
  getRoomBySocketId,
  scheduleRoomDeletion,
  cancelRoomDeletion
} = require('../roomStore')

function getUniqueName(room, requestedName) {
  const existingNames = room.members.map(m => m.name)
  if (!existingNames.includes(requestedName)) {
    return requestedName
  }
  let counter = 2
  while (existingNames.includes(`${requestedName}#${counter}`)) {
    counter++
  }
  return `${requestedName}#${counter}`
}

function roomHandlers(io, socket) {

  socket.on('create-room', () => {
    const code = generateRoomCode()
    createRoom(code)
    socket.join(code)
    socket.emit('room-created', { code })
  })

  socket.on('join-room', ({ code, name }) => {
    const room = getRoom(code)
    if (!room) {
      socket.emit('room-error', { message: 'Room not found. Check the code and try again.' })
      return
    }
    cancelRoomDeletion(code)
    const uniqueName = getUniqueName(room, name)
    addMember(code, { id: socket.id, name: uniqueName })
    socket.join(code)
    socket.emit('room-joined', {
      code,
      assignedName: uniqueName,
      members: room.members,
      messages: room.messages
    })
    socket.to(code).emit('user-joined', {
      name: uniqueName,
      members: room.members
    })
  })

  socket.on('leave-room', ({ code }) => {
    handleLeave(io, socket, code)
  })

  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id)
    if (room) handleLeave(io, socket, room.code)
  })
}

function handleLeave(io, socket, code) {
  const room = getRoom(code)
  if (!room) return
  const member = room.members.find(m => m.id === socket.id)
  removeMember(code, socket.id)
  socket.leave(code)
  if (room.members.length === 0) {
    scheduleRoomDeletion(code)
  } else {
    socket.to(code).emit('user-left', {
      name: member?.name,
      members: room.members
    })
  }
}

module.exports = roomHandlers
