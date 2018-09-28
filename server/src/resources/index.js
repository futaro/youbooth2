const Nico = require('./Nico')

class Resource {

  static async factory(url) {

    const nico = new Nico(url)
    await nico.match()
    if (nico.isValid()) return nico

    return null
  }
}

module.exports = Resource