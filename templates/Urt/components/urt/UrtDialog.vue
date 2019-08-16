<template >
  <v-dialog id="urtDialog" persistent v-model="getDialog" max-width="700">
      <v-card>
        <v-card-title class="headline">
            <v-spacer></v-spacer>
            <v-btn @click.prevent="close()" flat icon small>
               <v-icon>clear</v-icon>
            </v-btn>
        </v-card-title>

        <!-- <v-card-text v-if="getData && !getData.ErrMsg">
          <ul class="event_meta">
            <li v-if="getData.From">From DDN: {{ getData.From.DDN }}, From Name : {{getData.From.Name}}</li>
            <li v-if="getData.To">To DDN : {{ getData.To.DDN }}, To Name : {{getData.To.Name}}</li>
            <li v-if="getData.State" :class="{event_ok: getData.status == 'ok', event_error: getData.status == 'error', event_warning : getData.status == 'warning', event_info: getData.status == 'info'}">Send State : {{getData.State.RstMsg}}</li>
            <li v-if="getData.State" >Reply State : {{getData.RstMsg}}</li>
          </ul>

        </v-card-text>
        <v-card-text v-if="getData && getData.ErrMsg">
          <ul class="event_meta">
            <li >ErrCode: {{ getData.ErrCode }}</li>
            <li >ErrMsg: {{ getData.ErrMsg }}</li>
          </ul>
        </v-card-text> -->
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

        <!-- <v-card-actions>
          <v-spacer></v-spacer>



        </v-card-actions> -->
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


