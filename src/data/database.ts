import { Database, Room, User } from './database.types'


const db: Database = {
  users: [],
  rooms: []
}

export const getUser = (username: string) => {
  const user = db.users.find(user => user.username === username)
  return user
}

const addUser = (username: string) => {
  const newUser: User = {
    username,
    isOnline: false
  }
  db.users.push(newUser)

  return newUser
}

export const getRoom = (roomname: string) => {
  const room = db.rooms.find(room => room.name === roomname)
  return room
}

const addRoom = (room: string) => {
  const newRoom: Room = {
    name: room,
    users: []
  }
  db.rooms.push(newRoom)

  return newRoom
}

const removeRoom = (roomname: string) => {
  db.rooms = [...db.rooms.filter(room => room.name !== roomname)]
  return db.rooms
}

export const joinUserToRoom = (username: string, roomname: string) => {
  let room = getRoom(roomname)
  if (!room) {
    room = addRoom(roomname)
  }

  let user = getUser(username)
  if (!user) {
    user = addUser(username)
  }

  user.isOnline = true
  const userInRoom = room.users.includes(username)
  if (!userInRoom) {
    room.users.push(user.username)
  }
}

export const leaveUserFromRoom = (username: string, roomname: string) => {
  const user = getUser(username)
  const room = getRoom(roomname)
  if (user && room) {
    room.users = [...room.users.filter(user => user !== username)]
    if (!room.users.length) {
      removeRoom(roomname)
    }

    user.isOnline = false
  }
}
