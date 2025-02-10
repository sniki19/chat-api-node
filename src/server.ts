import express, { Express, json } from 'express'
import * as http from 'node:http'
import cors from 'cors'
import { router } from './utils/routes'
import { socketIO } from './utils/socketio'


const port = process.env.PORT || 3000
const app: Express = express()


app.use(cors({
  origin: '*'
}))
app.use(json())
app.use(router)


export const server = () => {
  try {
    const httpServer = http.createServer(app)

    httpServer.listen(port, () => {
      console.log(`[server]: Server listening on port ${port}`)
    })

    socketIO(httpServer)
  } catch (error) {
    console.error('[server] ', error)
  }
}
