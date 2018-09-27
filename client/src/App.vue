<template>
  <div id="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<style>
  body {
    background-color: #333;
    padding: 0;
    margin: 0;
  }

  #app {
    font-family: 'Futura', 'Avenir', Helvetica, Arial, sans-serif;
    font-weight: lighter;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #CCC;
  }

</style>
