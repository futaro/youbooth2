const AppServer = require('./src/server')
  , {Track}     = require('./src/models')
  , NicoNicoAPI = require('./src/api/niconico')

Track.sync()

let nowPlayingID = null

async function play() {

  const track = await Track.findOne({
    where: {
      isPlayed: 0
    },
    order: ['createdAt']
  })

  if (track) {

    nowPlayingID = track.id

    app.broadcast(JSON.stringify({action: 'play', data: {track: track}}))

    track.isPlayed = 1
    await track.save()

    setTimeout(() => {
      nowPlayingID = null
      play()
    }, track.duration * 1000 + 5000)
  }
}


const app = new AppServer()

app.addHandler('hello', (req) => {
  // console.log(req)
  // app.broadcast('hello!')
  return 'hello'
})

app.addHandler('add_track', async req => {
  console.log(req.data)

  const url = req.data.url

  const matchNicoNico = /https?:\/\/www\.nicovideo\.jp\/watch\/(sm[0-9]+)/

  let type, uid, title, duration
  if (matchNicoNico.test(url)) {
    type = 'niconico'
    uid = RegExp.$1
    const info = await NicoNicoAPI.getInfo(uid)
    console.log('info', info)
    title = info.title
    duration = info.duration
  }

  if (!uid) {
    return {error: 'not match'}
  }

  let track = new Track()
  track.type = type
  track.uid = uid
  track.title = title
  track.duration = duration
  track.isPlayed = 0
  track.requestedBy = 'test'

  await track.save()

  if (!nowPlayingID) {
    play()
  }

  return track
})

app.listen()

//
// const WebSocketServer = require('websocket').server
//   , http              = require('http')
//   , log4js            = require('log4js')
//   , configs           = require('./config')
//
// const logger = log4js.getLogger()
// logger.level = configs.logLevel
//
// const server = http.createServer((req, res) => {
//   logger.debug(`Received request for ${req.url}`)
//   res.writeHead(404)
//   res.end()
// })
//
// server.listen(configs.port, () => {
//   logger.debug(`logger.debug Server is listening on port ${configs.port}`)
// })
//
// const wsServer = new WebSocketServer({
//   httpServer           : server,
//   autoAcceptConnections: false
// })
//
// wsServer.on('request', req => {
//
//   const isAllowOrigin = configs.allowOrigins.some(o => o === req.origin)
//   if (isAllowOrigin !== true) {
//     req.reject()
//     logger.debug(`Connection from origin ${req.origin} rejected.`)
//     return
//   }
//
//   const connection = req.accept('echo-protocol', req.origin)
//
//   logger.debug(`Connection accepted.`)
//
//   connection.on('message', (message) => {
//     console.log(JSON.parse(message.utf8Data))
//     if (message.type === 'utf8') {
//       logger.debug('Received Message: ' + message.utf8Data)
//       connection.sendUTF(message.utf8Data)
//     } else if (message.type === 'binary') {
//       logger.debug('Received Binary Message of ' + message.binaryData.length + ' bytes')
//       connection.sendBytes(message.binaryData)
//     }
//   })
//   connection.on('close', (reasonCode, description) => {
//     logger.debug((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
//   })
// })
