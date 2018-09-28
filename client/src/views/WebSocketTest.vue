<template>
  <div>
    <NicoPlayer v-if="nico_uid" v-model="nico_uid" :from="from" />
  </div>
</template>
<script>

  import NicoPlayer from '../components/NicoPlayer'
  import configs from '../../config'

  export default {

    name: "WebSocketTest",

    components: {NicoPlayer},

    data() {
      return {
        ws      : null,
        nico_uid: null,
        from    : 0
      }
    },

    created() {
      this.connect()
    },

    methods: {

      connect() {
        this.ws = new WebSocket(configs.ws, ['echo-protocol', 'soap', 'xmpp'])

        this.ws.onopen = _ => {
          this.ws.send(JSON.stringify({action: 'hello'}))
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

      play(data) {
        if (data.track.type === 'niconico') {
          this.nico_uid = data.track.uid
          this.from = data.from
        }
      }
    }
  }
</script>
