<template>
  <div>
    <NicoPlayer v-if="nico_uid" v-model="nico_uid" :from="from" />
  </div>
</template>
<script>

  import NicoPlayer from '../components/NicoPlayer'
  import configs    from '../../../config.client'

  export default {

    name: "WebSocketTest",

    components: {NicoPlayer},

    data() {
      return {
        ws       : null,
        nico_uid : null,
        from     : 0,
        workspace: null,
        channel  : null
      }
    },

    created() {
      this.workspace = this.$route.params['workspace']
      this.channel   = this.$route.params['channel']
      this.connect()
    },

    methods: {

      connect() {
        if (this.ws !== null) return
        this.ws = new WebSocket(configs.ws, ['echo-protocol', 'soap', 'xmpp'])

        this.ws.onopen = _ => {
          this.ws.send(JSON.stringify({action: 'hello', data: {workspace: this.workspace, channel: this.channel}}))
        }

        this.ws.onerror = error => {
          console.log('WebSocket Error ' + error)
        }

        this.ws.onmessage = e => {
          const response = JSON.parse(e.data)
          if (!response.action) return
          if (response.action === 'play') {
            this.play(response.data)
          }
        }

        this.ws.onclose = e => {
          console.log('Close')
          this.ws = null
        }
      },

      play(data) {
        console.log('play()', this.workspace, data.workspace, this.channel, data.channel)
        if (this.workspace !== data.workspace || this.channel !== data.channel) {
          console.log('other workspace or channel. skip.')
          return
        }
        if (data.track.type === 'niconico') {
          this.nico_uid = data.track.uid
          this.from     = data.from
        }
      }
    }
  }
</script>
