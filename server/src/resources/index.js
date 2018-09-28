const Nico = require('./Nico')

class Resource {

  static get resources() {
    return [Nico]
  }

  static factory(url) {

    let resource
    const matched = this.resources.some(async rsc => {

      let r = new rsc(url)
      await r.match()
      if (r.isValid()) {
        resource = r
        return true
      }

      return false
    })

    return matched ? resource : null
  }
}

module.exports = Resource