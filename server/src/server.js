const WebSocketServer = require('websocket').server
  , http              = require('http')
  , logger            = require('./logger')
  , configs           = require('../../config.server')

class Server {

  constructor() {

    this.handlers = {}

    this._server = http.createServer((req, res) => {
      logger.debug(`Received request for ${req.url}`)
      res.writeHead(404)
      res.end()
    })
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
    // logger.debug(`Connection accepted.`)
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
    this._wsServer.broadcast(message)
  }

  listen() {
    this._server.listen(configs.ws.port, () => {
      logger.debug(`logger.debug Server is listening on port ${configs.ws.port}`)
    })
  }
}

module.exports = Server