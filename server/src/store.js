const _instances = []

class Store {

  static factory(workspace, channel) {
    const store = _instances.find(i => i.workspace === workspace && i.channel === channel)
    if (store) {
      return store
    } else {
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
    this._is_random    = false
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

  get is_random() {
    return this._is_random
  }

  set is_random(val) {
    this._is_random = val
  }
}

module.exports = Store