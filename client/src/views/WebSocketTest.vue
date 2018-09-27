<template>
  <div>
    <h1>websocket test</h1>
    <section>
      <h3>Add Tack Test</h3>
      <input type="text" v-model="new_track_url">
      <button @click.prevent="addTrack">Add Track</button>
    </section>
    <div v-if="niconico_src">
      <iframe :src="niconico_src" @load="onLoad" ref="player" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
</template>
<script>

  export default {

    name: "WebSocketTest",

    data() {
      return {
        ws           : null,
        new_track_url: 'http://www.nicovideo.jp/watch/sm33663298',
        niconico_src : null
      }
    },

    created() {
      this.connect()
    },

    methods: {

      connect() {
        this.ws = new WebSocket('ws://localhost:7000/', ['echo-protocol', 'soap', 'xmpp'])

        this.ws.onopen = _ => {
          this.ws.send(JSON.stringify({action: 'hello'}))
        }

        this.ws.onerror = error => {
          console.log('WebSocket Error ' + error)
        }

        this.ws.onmessage = e => {
          console.log('Server: ' + e.data)

          const response = JSON.parse(e.data)
          if (response.action) {
            if (response.action === 'play') {
              this.play(response.data)
            }
          }
        }

        this.ws.onclose = e => {
          console.log('Close')
          this.ws = null
        }
      },

      addTrack() {
        this.ws.send(JSON.stringify({action: 'add_track', data: {url: this.new_track_url}}))
      },

      play(data) {
        console.log(data.track)
        this.niconico_src = `http://embed.nicovideo.jp/watch/${data.track.uid}?jsapi=1`
      },

      onLoad() {
        this.$refs.player.contentWindow.postMessage({
          sourceConnectorType: 1,
          eventName          : 'play'
        }, 'http://embed.nicovideo.jp/')
      }
    }
  }
</script>
