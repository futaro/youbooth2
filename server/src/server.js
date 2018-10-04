const WebSocketServer = require('websocket').server
  , http              = require('http')
  , Store             = require('./store')
  , logger            = require('./logger')
  , {Track}           = require('./models')
  , configs           = require('../../config.server')

class Server {

  constructor(dj) {

    this._createServer()
    this._createWebSocketServer()

    this.handlers = {}
    this.addHandler('hello', async req => {

      logger.debug(`hello()`)

      const team_id    = req.data.workspace || false,
            channel_id = req.data.channel || false

      const store = Store.factory(team_id, channel_id)

      if (!store.nowPlayingID) {
        await this.dj.playTrack(team_id, channel_id)
        return
      }

      const track = await Track.findById(store.nowPlayingID)

      if (!track) return

      return {
        action: 'play',
        data  : {
          workspace: team_id,
          channel  : channel_id,
          track    : track,
          from     : parseInt(((new Date()).getTime() - store.startTime) / 1000),
          is_random: store.isRandom
        }
      }
    })

    this.dj = dj
    this.dj.on('play', (track, is_random) => {
      console.log(track)
      this.broadcast({
        action: 'play',
        data  : {
          workspace: track.workspace,
          channel  : track.channel,
          track    : track,
          from     : 0,
          is_random: is_random
        }
      })
    })
  }

  _createServer() {
    this._server = http.createServer((req, res) => {
      logger.debug(`Received request for ${req.url}`)
      res.writeHead(404)
      res.end()
    })
  }

  _createWebSocketServer() {
    this._wsServer = new WebSocketServer({
      httpServer           : this._server,
      autoAcceptConnections: false
    })
    this._wsServer.on('request', this.onRequest.bind(this))
  }

  onRequest(req) {
    const isAllowOrigin = configs.ws.allowOrigins.some(o => o === req.origin)
    if (isAllowOrigin !== true) {
      req.reject()
      logger.debug(`Connection from origin ${req.origin} rejected.`)
      return
    }
    this._connection = req.accept('echo-protocol', req.origin)
    this._connection.on('message', this.onMessage.bind(this))
    this._connection.on('close', this.onClose.bind(this))
  }

  async onMessage(message) {
    if (message.type === 'utf8') {
      // logger.debug('Received Message: ' + message.utf8Data)

      try {
        const parsedMessage = JSON.parse(message.utf8Data)
        if (this.handlers[parsedMessage.action]) {
          const res = await this.handlers[parsedMessage.action](parsedMessage)
          if (res) {
            this._connection.sendUTF(JSON.stringify(res))
          }
        }
      } catch (e) {
        logger.error(e)
      }

    } else if (message.type === 'binary') {
      // logger.debug('Received Binary Message of ' + message.binaryData.length + ' bytes')
      // this._connection.sendBytes(message.binaryData)
    }
  }

  onClose(reasonCode, description) {
    // logger.debug(`Peer ${this._connection.remoteAddress} disconnected.`)
  }

  addHandler(action, callback) {
    this.handlers[action] = callback
  }

  broadcast(message) {
    logger.debug(`broadcast(${JSON.stringify(message)})`)
    this._wsServer.broadcast(JSON.stringify(message))
  }

  listen() {
    this._server.listen(configs.ws.port, () => {
      logger.debug(`logger.debug Server is listening on port ${configs.ws.port}`)
    })
  }
}

module.exports = Server