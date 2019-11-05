<template >
  <v-dialog id="urtDialog" persistent v-model="getDialog" max-width="700">
      <v-card>
        <v-card-title class="headline">
            <v-spacer></v-spacer>
            <v-btn @click.prevent="close()" flat icon small>
               <v-icon>clear</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text>
          <ul>
            <li >Time: {{ getData.time }}</li>

          </ul>
          <vue-json-pretty
              :path="'res'"
              :data="getData.data"
              showLength
              showLine
              showDoubleQuotes
              :deep="5"
              highlightMouseoverNode
              highlightSelectedNode
              >
            </vue-json-pretty>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>
<script>
  import VueJsonPretty from 'vue-json-pretty'

  export default {
    id: "#urtDialog",
    props: {
      data : {
        type: Object,
        required: true,
        default: function(){
          return {
            dialogData : {}
          }
        }
      },
      dialog: {
        type: Boolean
      }
    },
    computed: {
      getData() {
        return this.data || {};
      },
      getDialog(){
        return this.dialog;
      }
    },
    methods: {
      close() {
        this.$emit('closeDialog', false);
      }
    },
    components: {
       VueJsonPretty
    }

  }
</script>
<style scoped>
.headline{
    font-size: 12pt !important;
    color: #056e97;
    font-weight: bold;
    padding-bottom: 0;
    padding: 1px;
}
.event_meta{
  margin-bottom: 15px !important;
}
.event_ok{
    color: #228a02 !important;
  }
  .event_error{
    color:#bd0303 !important;
  }

  .event_warning{
    color:#a9a400 !important;
  }

  .event_info{
    color: #20b8f2 !important;
  }
</style>


