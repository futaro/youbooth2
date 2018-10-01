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

    mounted() {
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

    methods: {
      onStateChange(e) {
        if (e.data === 0) {
          console.log('end', this.$emit)
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