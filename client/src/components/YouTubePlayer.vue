<template>
  <iframe :src="src" @load="onLoad" ref="player" frameborder="0" allowfullscreen></iframe>
</template>

<script>
  export default {

    name: 'TouTubePlayer',

    props: ['value', 'from'],

    computed: {
      src() {
        if (this.value) {
          return `https://www.youtube.com/embed/${this.value}?enablejsapi=1&autoplay=1&origin=http%3A%2F%2Fy.futa.ro&widgetid=1`
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
        if (e.origin === 'https://www.youtube.com') {
          if (e.data.eventName === 'playerStatusChange') {
            console.log(e.data.data.playerStatus)
            if (e.data.data.playerStatus === 4) {
              this.$emit('input', null)
            }
          }
        }
      },

      onLoad() {
        this.$refs.player.contentWindow.postMessage(
          '{"event":"command","func":"seekTo","args":[' + this.from + ', true]}',
          'https://www.youtube.com/'
        )
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