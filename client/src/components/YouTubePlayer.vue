<template>
  <div id="player"></div>
  <!--<iframe :src="src" @load="onLoad" type="text/html" ref="player" frameborder="0" allowfullscreen></iframe>-->
</template>

<script>
  export default {

    name: 'YouTubePlayer',

    props: ['value', 'from'],

    data() {
      return {
        player: null
      }
    },

    // computed: {
    //   src() {
    //     if (this.value) {
    //       return `http://www.youtube.com/embed/${this.value}?enablejsapi=1&autoplay=1&startSeconds=${this.from}&origin=http://y.futa.ro`
    //     } else {
    //       return null
    //     }
    //   }
    // },

    watch: {
      value(val) {
        if (val) {
          this.player = new window.YT.Player('player', {
            videoId: val,
            events : {
              'onReady'      : this.onPlayerReady,
              'onStateChange': this.onPlayerStateChange
            }
          })
        }
      }
    },

    methods: {

      onPlayerReady(event) {
        event.target.playVideo();
      },

      onPlayerStateChange(event) {
        if (event.data === window.YT.PlayerState.ENDED) {
          this.$emit('input', null)
        }
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