<template>
  <h1>hoge</h1>
</template>
<script>

  export default {
    name : "WebSocketTest",

    created() {
      var ws = new WebSocket('ws://localhost:7000/', ['echo-protocol', 'soap', 'xmpp']);

      ws.onopen = function () {//WS接続確立
        ws.send('hello');
      };

      // Log errors
      ws.onerror = function (error) {
        console.log('WebSocket Error ' + error);
      };

      // Log messages from the server
      ws.onmessage = function (e) {
        console.log('Server: ' + e.data);
      };

    }
  }
</script>
