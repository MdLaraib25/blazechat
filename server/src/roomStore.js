const rooms = {};
const pendingDeletionTimers = {};
const ROOM_DELETE_GRACE_MS = 15000;

function createRoom (code) {
    cancelRoomDeletion(code);
    rooms[code] = {
        code,
        members : [],
        messages : [],
        createdAt : Date.now()
    }
    return rooms[code];
}   

function getRoom(code) {
    return rooms[code] || null;
}

function addMember(code, member) {
    cancelRoomDeletion(code);
    rooms[code].members.push(member);
}

function removeMember(code, socketId) {
    if (!rooms[code]) return;
    rooms[code].members = rooms[code].members.filter(
    m => m.id !== socketId
    )
}

function deleteRoom (code) {
    cancelRoomDeletion(code);
    delete rooms[code];
}

function scheduleRoomDeletion(code) {
    cancelRoomDeletion(code);
    pendingDeletionTimers[code] = setTimeout(() => {
        delete rooms[code];
        delete pendingDeletionTimers[code];
    }, ROOM_DELETE_GRACE_MS);
}

function cancelRoomDeletion(code) {
    if (!pendingDeletionTimers[code]) return;
    clearTimeout(pendingDeletionTimers[code]);
    delete pendingDeletionTimers[code];
}

function getRoomBySocketId(socketId) {
    return Object.values(rooms).find(room =>
        room.members.some(m => m.id === socketId)
    ) || null
}

module.exports = {
  rooms,
  createRoom,
  getRoom,
  addMember,
  removeMember,
  deleteRoom,
  getRoomBySocketId,
  scheduleRoomDeletion,
  cancelRoomDeletion
}
