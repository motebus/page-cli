<template>
  <v-toolbar class="header" dense light color="grey lighten-3">
    <!-- <back-page v-if="!hideBackPage && !cleanHeader"></back-page> -->
    <back-jujue v-if="!hideBackPage && !cleanHeader"></back-jujue>
    <v-btn class="refresh_btn" icon v-if="!hideRefresh  && !cleanHeader" @click="reloadPage()">
      <v-icon>refresh</v-icon>
    </v-btn>
    <slot name="left"></slot>
    <v-spacer v-if="!hideBackPage"></v-spacer>

    <v-menu :nudge-width="150" :nudge-left="75" transition="slide-y-transition" bottom offset-y  close-on-content-click v-if="!hideTitle  && !cleanHeader">
        <template v-slot:activator="{ on }">
          <v-btn class="header_btn" flat light v-on="on">
            <v-avatar style="margin-right:8px;" size="25" tile="tile" ><img :src="JJ" /></v-avatar>
            <slot name="title"></slot>
          </v-btn>
        </template>
        <v-list >
            <v-list-tile v-for="(item, index) in items" :key="index" @click="goToPage(item)">
               <v-avatar style="margin-right:8px;" size="25" tile="tile" ><img :src="JJ" /></v-avatar>
                <v-list-tile-title>{{ item }}</v-list-tile-title>
            </v-list-tile>
        </v-list>
    </v-menu>

    <v-spacer v-if="!hideTitle"></v-spacer>

    <slot name="right"></slot>
    <v-btn icon v-if="!hideSearch && !cleanHeader" @click="goToJujue()">
      <v-icon>search</v-icon>
    </v-btn>
    <v-btn icon v-if="!hideMenu && !cleanHeader">
      <v-icon>more_vert</v-icon>
    </v-btn>
  </v-toolbar>
</template>
<script>
import BackPage from '@/components/BackPage';
import BackJujue from '@/components/BackJujue';
import JJ from '@/assets/gitpage_icon.png';

export default {
    data(){
      return {
        JJ,
        items : [
          'urt',
          'view',
          'miki',
          'json',
          'yp',
          'sticker',
          'button',
          'twin'
        ]
      }
    },
    props: {
      hideSearch: {
        type: Boolean
      },
      hideRefresh: {
        type: Boolean
      },
      hideBackPage: {
        type: Boolean
      },
      hideMenu: {
        type: Boolean
      },
      hideTitle: {
        type: Boolean
      },
      cleanHeader: {
        type: Boolean
      }
    },
    components : {
      BackPage,
      BackJujue
    },
    methods : {
      goToPage(page){
        this.$router.push(page);
      },
      goToJujue(){
        window.location.href = 'https://jujue.app/browser';
      },
       reloadPage(){
        this.$router.go();
      }
    }
};
</script>
<style scoped>
.header{
  box-shadow: none;
  border:none;
  position: fixed;
  top: 0;
  z-index: 2;
}
.header_title{
  font-weight:bold;
}
.header_btn{
      font-weight: bold;
    font-size: 13pt;
    text-transform: none;

}
.refresh_btn{
      margin-left: -5px;
}
</style>


