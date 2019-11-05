<template>
    <v-dialog  v-model="getDialog" fullscreen hide-overlay >

      <v-card class="edit_card">
        <div class="loading" v-if="loading">
          <v-layout align-center justify-center row fill-height>
            <v-progress-circular :size="50" :width="7" color="primary" indeterminate >
               </v-progress-circular>
          </v-layout>
        </div>
        <v-toolbar light>
          <v-btn icon  @click.prevent="close()">
            <v-icon>keyboard_backspace</v-icon>
          </v-btn>
          <v-toolbar-title></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-title style="font-weight:bold;">Edit</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
             <v-btn @click.prevent="saveJson()" color="primary"  fab small light>
                 <v-icon>check</v-icon>
             </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-container fluid fill-height>
           <v-layout align-space-around fill-height row>
              <v-flex xs12 >
                 <slot></slot>
              </v-flex>
          </v-layout>
        </v-container>

      </v-card>
    </v-dialog>

</template>
<script>
export default {
    id: "#editDialog",
    props: {
      dialog: {
        type: Boolean
      },
      loading: {
        type: Boolean
      }
    },
    computed: {
      getDialog(){
        return this.dialog;
      }
    },
    methods: {
      close() {
        this.$emit('closeDialog', false);
      },
      saveJson(){
        this.$emit('saveJson', true);
      }
    }
}
</script>
<style scoped>
.edit_card{
  position: relative;
  min-height: 100%;
}
.loading{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left:0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.4196078431372549);
}
</style>

