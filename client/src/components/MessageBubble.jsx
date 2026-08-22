function MessageBubble({ message, myName, isFirst }) {
  const isMe = message.sender === myName
  const isSystem = message.type === 'system'

  if (isSystem) {
    return (
      <div className="text-center text-xs text-[#A8A29E] py-1.5">
        {message.content}
      </div>
    )
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>

      {!isMe && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end"
          style={{ background: message.avatarColor || '#78716C' }}
        >
          {message.sender.charAt(0)}
        </div>
      )}

      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
        {isFirst && (
          <div className={`flex items-baseline gap-2 px-1 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
            {!isMe && (
              <span className="text-xs font-medium text-[#3C3C42]">
                {message.sender}
              </span>
            )}
            <span className="text-[11px] text-[#A8A29E]">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed word-break
            ${isMe
              ? 'bg-[#2D5BE3] text-white rounded-br-sm'
              : 'bg-[#F0EDE8] text-[#18181B] rounded-bl-sm'
            }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble