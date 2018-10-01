const Nico    = require('./Nico'),
      YouTube = require('./YouTube')

class Resource {

  static async factory(url) {

    const nico = new Nico(url)
    await nico.match()
    if (nico.isValid()) return nico

    const yt = new YouTube(url)
    await yt.match()
    if (yt.isValid()) return yt

    return null
  }
}

module.exports = Resource