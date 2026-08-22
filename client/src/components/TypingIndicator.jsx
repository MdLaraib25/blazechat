function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null

  function getMessage() {
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing`
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing`
    return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="flex items-center gap-1 bg-[#F0EDE8] rounded-2xl rounded-bl-sm px-3 py-2.5">
        <span
          className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-xs text-[#A8A29E] italic">
        {getMessage()}
      </span>
    </div>
  )
}

export default TypingIndicator