<template>
    <div class="clock" >
      <span class="time" :style="[$vuetify.breakpoint.xs ? {'font-size': '10pt'} : {'font-size': '13pt'}]">{{time}}</span>
    </div>
</template>
<script>
export default {
    data: function() {
        return {date: 'empty', time: 'empty', interval: null};
    },
    methods: {
    updateClock: function(){
            var d = new Date();
            var datestring =
                ("0" + d.getDate()).slice(-2)
                + "/" + ("0"+(d.getMonth()+1)).slice(-2)
                + "/" + d.getFullYear()
            this.date = datestring;
            var timestring =
                ("0" + d.getHours()).slice(-2)
                + ":" + ("0" + d.getMinutes()).slice(-2)
                + ":" + ("0" + d.getSeconds()).slice(-2);
            this.time = timestring;
        }
    },
    mounted: function(){
            this.updateClock();
            this.interval = setInterval(function () {
            this.updateClock();
    }.bind(this), 1000);
  },
  beforeDestroy: function(){
    clearInterval(this.interval);
  }
}
</script>
<style media="screen">
    .clock {
    color:#000000;
    display: inline-block;
    padding: 5px;
  }
  .time {
    font-size: 13pt;
    font-weight: bold;
    /* margin-left: 5px; */
  }
</style>


