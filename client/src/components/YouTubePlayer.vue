<template>
  <div id="wrapper">
    <div id="player"></div>
  </div>
</template>

<script>
  export default {

    name: 'TouTubePlayer',

    props: ['value', 'from'],

    data() {
      return {
        player: null
      }
    },

    watch: {
      value() {
        this.initialize()
      }
    },

    mounted() {
      this.initialize()
    },

    methods: {
      initialize() {
        if (this.player) {
          this.player.destroy()
        }
        this.player = new window.YT.Player('player', {
          videoId: this.value,
          height : '100%',
          width  : '100%',
          events : {
            'onReady'      : (e) => {
              e.target.seekTo(this.from, true)
              e.target.playVideo();
            },
            'onStateChange': this.onStateChange
          }
        })
      },
      onStateChange(e) {
        if (e.data === 0) {
          this.$emit('input', null)
        }
      }
    }
  }
</script>

<style scoped>
  #wrapper {
    width  : 100vw;
    height : 100vh;
  }
</style>