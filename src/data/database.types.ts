export type User = {
  username: string
  isOnline: boolean
}

export type Room = {
  name: string
  users: string[]
}

export type Database = {
  users: User[]
  rooms: Room[]
}
