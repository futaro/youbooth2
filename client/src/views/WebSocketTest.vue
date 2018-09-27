<template>
  <div>
    <section>
      <input type="text" v-model="new_track_url">
      <button @click.prevent="addTrack">Add Track</button>
    </section>
    <NicoPlayer v-if="nico_uid" v-model="nico_uid" :from="from" />
  </div>
</template>
<script>

  import NicoPlayer from '../components/NicoPlayer'

  export default {

    name : "WebSocketTest",

    components : {NicoPlayer},

    data() {
      return {
        ws            : null,
        new_track_url : 'http://www.nicovideo.jp/watch/sm33663298',
        nico_uid      : null,
        from          : 0
      }
    },

    created() {
      this.connect()
    },

    methods : {

      connect() {
        this.ws = new WebSocket('ws://localhost:7000/', ['echo-protocol', 'soap', 'xmpp'])

        this.ws.onopen = _ => {
          this.ws.send(JSON.stringify({action : 'hello'}))
        }

        this.ws.onerror = error => {
          console.log('WebSocket Error ' + error)
        }

        this.ws.onmessage = e => {
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
        this.ws.send(JSON.stringify({action : 'add_track', data : {url : this.new_track_url}}))
      },

      play(data) {
        if (data.track.type === 'niconico') {
          this.nico_uid = data.track.uid
          this.from     = data.from
        }
      }
    }
  }
</script>
