<template>
  <div>
    <div id="disconnect" v-if="!ws">LOSE CONNECTION.</div>
    <NicoPlayer v-if="nico_uid" v-model="nico_uid" :from="from" />
    <YouTubePlayer v-else-if="youtube_uid && youtube_api" v-model="youtube_uid" :from="from" />
    <div v-else>...</div>
  </div>
</template>
<script>

  import NicoPlayer    from '../components/NicoPlayer'
  import YouTubePlayer from '../components/YouTubePlayer'
  import configs       from '../../../config.client'

  export default {

    name: "VideoScreen",

    components: {NicoPlayer, YouTubePlayer},

    data() {
      return {
        ws         : null,
        nico_uid   : null,
        youtube_uid: null,
        from       : 0,
        workspace  : null,
        channel    : null,

        url: 'radiohead'
      }
    },

    computed: {
      youtube_api() {
        return !!window.YT
      }
    },

    watch: {
      youtube_uid(new_val, old_val) {
        console.log('new_val', new_val, 'old_val', old_val)
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
        this.youtube_uid = null
        this.nico_uid    = null
        if (data.track.type === 'niconico') {
          this.nico_uid = data.track.uid
          this.from     = data.from
        } else if (data.track.type === 'youtube') {
          this.youtube_uid = data.track.uid
          this.from        = data.from
        }
      },
    }
  }
</script>

<style scoped>
  #disconnect {
    position         : absolute;
    top              : 0;
    left             : 0;
    height           : 100vh;
    width            : 100vw;
    z-index          : 999;
    background-color : rgba(0, 0, 0, 0.5);
    text-align       : center;
    line-height      : 100vh;
    letter-spacing   : 0.2rem;
    color            : #AAA;
    font-size        : 12px;
  }
</style>