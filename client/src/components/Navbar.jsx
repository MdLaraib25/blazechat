import { useNavigate } from 'react-router-dom'

function Navbar({ inRoom = false, roomCode = '' }) {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-12 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-black/5">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-7 h-7 bg-[#18181B] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">B</span>
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-[#18181B]">
          Blazechat
        </span>
      </div>

      {inRoom && roomCode && (
        <div className="text-xs text-[#78716C] bg-[#F0EDE8] border border-black/8 rounded-lg px-3 py-1.5 tracking-wide">
          Room {roomCode}
        </div>
      )}
    </nav>
  )
}

export default Navbar