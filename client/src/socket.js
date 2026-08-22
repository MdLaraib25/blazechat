import { io } from 'socket.io-client'

export const serverUrl =
  import.meta.env.VITE_SERVER_URL ||
  'https://blazechat-backend-production.up.railway.app'

export const SOCKET_TIMEOUT_MS = 10000
export const SOCKET_EVENT_TIMEOUT_MS = 12000

const socket = io(serverUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  rememberUpgrade: true,
  timeout: SOCKET_TIMEOUT_MS,
  reconnectionAttempts: 2
})

export default socket
