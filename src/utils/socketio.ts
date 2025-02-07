import { Server, Socket } from 'socket.io'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
} from './socketio.types'
import { getRoom, getUser, joinUserToRoom, leaveUserFromRoom } from '../data/database'

const Events = {
  CONNECTION: 'connection',
  DISCONNECTING: 'disconnecting',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'joinRoom',
  LEFT_ROOM: 'leftRoom',
  MESSAGE: 'message',
  SEND_MESSAGE: 'sendMessage',
  ROOM_DATA: 'roomData'
} as const

type UserEventData = {
  username: string
  roomname: string
}

type UserMessageData = UserEventData & {
  message: string
}


const socketEvents = (socket: Socket, io: Server) => {
  socket.on(Events.JOIN_ROOM, (data: UserEventData) => {
    const { username, roomname } = data
    socket.join(roomname)
    joinUserToRoom(username, roomname)
    console.log(`${username} joined to ${roomname} room`)

    socket.emit(Events.MESSAGE, {
      data: {
        username: 'Admin',
        message: `Hi, ${username}!`
      }
    })

    socket.broadcast.to(roomname).emit(Events.MESSAGE, {
      data: {
        username: 'Admin',
        message: `${username} has joined`
      }
    })

    const roomData = getRoom(roomname)
    const userCount = roomData?.users.length ?? 0
    io.to(roomname).emit(Events.ROOM_DATA, {
      data: {
        userCount
      }
    })
  })

  socket.on(Events.LEFT_ROOM, (data: UserEventData) => {
    const { username, roomname } = data
    socket.leave(roomname)
    leaveUserFromRoom(username, roomname)
    console.log(`${username} leave from ${roomname} room`)

    socket.broadcast.to(roomname).emit(Events.MESSAGE, {
      data: {
        username: 'Admin',
        message: `${username} has left`
      }
    })

    const roomData = getRoom(roomname)
    const userCount = roomData?.users.length ?? 0
    io.to(roomname).emit(Events.ROOM_DATA, {
      data: {
        userCount
      }
    })
  })

  socket.on(Events.SEND_MESSAGE, (data: UserMessageData) => {
    const { username, roomname, message } = data

    const user = getUser(username)
    if (user) {
      io.to(roomname).emit(Events.MESSAGE, {
        data: {
          username,
          message
        }
      })
    }
  })

  socket.on(Events.DISCONNECTING, () => {
    console.log('disconnecting')
  })

  socket.on(Events.DISCONNECT, () => {
    console.log('disconnect')
  })
}


export const socketIO = async (server: any) => {
  try {
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    io.on(Events.CONNECTION, async (socket: Socket) => {
      console.log(`${socket.id} user connected`)
      socketEvents(socket, io)
    })
  } catch (error) {
    console.error(error)
    throw new Error('[Socket.IO] could not be started')
  }
}
