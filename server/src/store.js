const _instances = []

class Store {

  static factory(workspace, channel) {
    const store = _instances.find(i => i.workspace === workspace && i.channel === channel)
    if (store) {
      return store
    } else {
      const s =  new Store(workspace, channel)
      _instances.push(s)
      return s
    }
  }

  constructor(workspace, channel) {
    this.workspace     = workspace
    this.channel       = channel
    this._nowPlayingID = null
    this._startTime    = 0
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
}

module.exports = Store