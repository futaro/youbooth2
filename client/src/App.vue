<template>
  <div id="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<style>
  body {
    background-color : #333;
    color            : #EEE;
    padding          : 0;
    margin           : 0;
    overflow         : hidden;
  }
</style>
