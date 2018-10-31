'use strict';

var app = new Vue({
  el: '#app',
  data: {
    spaces: []
  },
  mounted() {
    fetch('/spaces/list')
      .then(response => response.json())
      .then((data) => {
        this.spaces = data;
      })
  }
});
