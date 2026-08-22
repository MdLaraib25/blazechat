const AVATAR_COLORS = [
  '#2D5BE3', '#E85A4F', '#50B86C',
  '#9B6FF7', '#F59E0B', '#0891B2'
]

function Sidebar({ members, roomCode, myName, onLeave }) {
  return (
    <div className="w-[240px] bg-[#FAFAF7] border-r border-black/5 flex flex-col flex-shrink-0">

      <div className="p-4 border-b border-black/5">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[#2D5BE3] mb-1">
          Room {roomCode}
        </div>
        <div className="text-[15px] font-medium text-[#18181B] mb-1">
          Anonymous room
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#A8A29E]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          {members.length} {members.length === 1 ? 'person' : 'people'} connected
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-[10px] font-medium tracking-widest uppercase text-[#A8A29E] px-2 py-2">
          In this room
        </div>

        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F0EDE8] transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
            >
              {member.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-[#3C3C42] flex-1 truncate">
              {member.name}
            </span>
            {member.name === myName && (
              <span className="text-[10px] bg-[#2D5BE3]/8 text-[#2D5BE3] rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                you
              </span>
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-black/5">
        <button
          onClick={onLeave}
          className="w-full py-2.5 rounded-xl text-sm text-[#78716C] border border-black/8 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          Leave room
        </button>
      </div>
    </div>
  )
}

export default Sidebar