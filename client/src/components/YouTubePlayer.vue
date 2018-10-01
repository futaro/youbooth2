<template>
  <iframe :src="src" @load="onLoad" type="text/html" ref="player" frameborder="0" allowfullscreen></iframe>
</template>

<script>
  export default {

    name: 'YouTubePlayer',

    props: ['value', 'from'],

    computed: {
      src() {
        if (this.value) {
          return `http://www.youtube.com/embed/${this.value}?enablejsapi=1&startSeconds=1&startSeconds=${this.from}&origin=http://y.futa.ro`
        } else {
          return null
        }
      }
    },

    // created() {
    //   window.removeEventListener('message', e => this.onMessage(e))
    //   window.addEventListener('message', e => this.onMessage(e))
    // },

    methods: {

      onMessage(e) {
        // if (e.origin === 'http://embwwwed.youtube.com') {
        //   if (e.data.eventName === 'playerStatusChange') {
        //     console.log(e.data.data.playerStatus)
        //     if (e.data.data.playerStatus === 4) {
        //       this.$emit('input', null)
        //     }
        //   }
        // }
      },

      onLoad() {
        // this.$refs.player.contentWindow.postMessage({
        //   sourceConnectorType: 1,
        //   eventName          : 'play'
        // }, 'http://embed.nicovideo.jp/')
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