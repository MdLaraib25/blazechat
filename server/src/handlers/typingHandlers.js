function typingHandlers(io, socket) {

  socket.on('typing-start', ({ code, name }) => {
    socket.to(code).emit('user-typing', { name })
  })

  socket.on('typing-stop', ({ code, name }) => {
    socket.to(code).emit('user-stopped-typing', { name })
  })
}

module.exports = typingHandlers