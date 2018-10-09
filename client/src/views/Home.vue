<template>
  <div id="main">
    <h1>YouBooth</h1>
    <h2>Add App to Your Workspace</h2>
    <a href="https://slack.com/oauth/authorize?client_id=444289117029.443780503616&scope=commands,bot,chat:write:bot,channels:write"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
    <h2>Usage</h2>
    <pre>/url</pre>
    <p>show url</p>
    <pre>/add (URL)</pre>
    <p>Add track to channel's playlist.Support media is <a href="https://youtube.com">YouTube</a> and <a href="http://www.nicovideo.jp/">ニコニコ動画</a></p>
    <pre>/youtube (word)</pre>
    <p>Search YouTube videos.</p>
  </div>
</template>

<script>
  export default {
    name: 'Home'
  }
</script>

<style>
  #main {
    padding: 10px;
  }
</style>
