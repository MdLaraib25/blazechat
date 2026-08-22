import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

function ChatWindow({ messages, myName, typingUsers }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  function isFirstInGroup(index) {
    if (index === 0) return true
    return messages[index].sender !== messages[index - 1].sender
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-1 scrollbar-thin">
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#A8A29E] text-center leading-relaxed">
            No messages yet. Say something to get started.
          </p>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          myName={myName}
          isFirst={isFirstInGroup(index)}
        />
      ))}

      <TypingIndicator typingUsers={typingUsers} />
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatWindow