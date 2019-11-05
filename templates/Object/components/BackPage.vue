<template>
   <v-btn class="back" icon v-if="$routerHistory.hasPrevious()"  @click.prevent="back()">
      <v-icon>keyboard_backspace</v-icon>
   </v-btn>
</template>
<script>
export default {
    methods : {
      back(){
        this.$router.go(-1);
      }
    }
}
</script>
<style scoped>
 .back {
    float:left;
 }
</style>

