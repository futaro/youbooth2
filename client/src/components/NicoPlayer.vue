<template>
  <iframe :src="src" @load="onLoad" ref="player" frameborder="0" allowfullscreen></iframe>
</template>

<script>
  export default {

    name: 'NicoPlayer',

    props: ['value', 'from'],

    computed: {
      src() {
        if (this.value) {
          return `http://embed.nicovideo.jp/watch/${this.value}?jsapi=1&from=${this.from}`
        } else {
          return null
        }
      }
    },

    created() {
      window.removeEventListener('message', e => this.onMessage(e))
      window.addEventListener('message', e => this.onMessage(e))
    },

    methods: {

      onMessage(e) {
        if (e.origin === 'http://embed.nicovideo.jp') {
          if (e.data.eventName === 'playerStatusChange') {
            if (e.data.data.playerStatus === 4) {
              this.$emit('input', null)
            }
          }
        }
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

<style scoped>
  iframe {
    width  : 100vw;
    height : 100vh;
  }
</style>