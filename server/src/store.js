const logger = require('./logger')

const _instances = []

class Store {

  static factory(workspace, channel) {
    const store = _instances.find(i => i.workspace === workspace && i.channel === channel)
    if (store) {
      return store
    } else {
      logger.info(`new store ${workspace}/${channel}`)
      const s = new Store(workspace, channel)
      _instances.push(s)
      return s
    }
  }

  constructor(workspace, channel) {
    this.workspace     = workspace
    this.channel       = channel
    this._nowPlayingID = null
    this._startTime    = 0
    this._isRandom     = false
    this._timerID      = false
  }

  get nowPlayingID() {
    return this._nowPlayingID
  }

  set nowPlayingID(val) {
    this._nowPlayingID = val
  }

  get startTime() {
    return this._startTime
  }

  set startTime(val) {
    this._startTime = val
  }

  get isRandom() {
    return this._isRandom
  }

  set isRandom(val) {
    this._isRandom = val
  }

  get timerID() {
    return this._timerID
  }

  set timerID(val) {
    this._timerID = val
  }

  dump() {
    logger.debug(this.workspace + '/' + this.channel + ' ' + this._nowPlayingID + '/' + this._startTime + '/' + this._isRandom)
  }
}

module.exports = Store