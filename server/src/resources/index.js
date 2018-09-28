const Nico = require('./Nico')

class Resource {

  static get resources() {
    return [Nico]
  }

  static async factory(url) {

    let resource = null

    for (let i = 0; i < this.resources.length; i++) {

      let rsc = this.resources[i]

      let r = new rsc(url)
      await r.match()
      if (r.isValid()) resource = r
    }

    return resource
  }
}

module.exports = Resource