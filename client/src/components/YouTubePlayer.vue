<template>
  <div id="player"></div>
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

    computed: {
      video_id() {
        return this.value
      }
    },

    video_id: {
      value: function(val) {
        console.log(val)
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