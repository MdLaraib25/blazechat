const { getRoom } = require('../roomStore')

function messageHandlers(io, socket) {

  socket.on('send-message', ({ code, message }) => {
    const room = getRoom(code)
    if (!room) return

    room.messages.push(message)

    if (room.messages.length > 100) {
      room.messages.shift()
    }

    io.to(code).emit('new-message', message)
  })
}

module.exports = messageHandlers