 <template>
       <v-layout row>
        <v-snackbar  v-model="error" color="error" :timeout="timeout" top="top">
          {{errorMsg}}
        </v-snackbar>
       <edit-dialog :dialog="dialogState" :loading="dialogLoading" @saveJson="saveJson()" @RemoveJson="deleteYp()" @closeDialog="dialogState = $event">
                  <vue-json-editor class="yp_editor"
                        v-model="jsonYp"
                        :show-btns="false"
                        mode="code"
                        @json-change="onJsonChange"
                        @json-save="onJsonSave"
                        @has-error="onJsonError"></vue-json-editor>
       </edit-dialog>
       <v-flex xs12 align-space-around fill-height>
        <app-header  v-if="headerState" :hideTitle="!titleState">
          <span slot="title">YP</span>
          <span slot="right">
                <v-btn style="margin-top: 0px;width:30px;height:30px;" @click.stop="insertYp()"  fab small light>
                  <v-icon>add</v-icon>
                 </v-btn>
          </span>
        </app-header>
          <v-card class="yp_card"  light>
          <v-progress-linear v-if="isLoading" class="loading" height="4" :indeterminate="true"></v-progress-linear>

              <v-card-text>
                 <v-flex xs12 sm10 offset-sm1 md8 offset-md2>
                   <v-text-field v-model="model"
                        v-on:keyup.enter="searchText"
                        label="Search keyword or group name"
                        prepend-icon="search"
                        clearable
                      ></v-text-field>
                  </v-flex>
              </v-card-text>



            <v-expand-transition>
              <v-list v-if="model" class="yp_list">
                 <template v-for="(item, index) in result">
                    <v-list-tile  :key="index" @click.stop="editYp(item, index)" class="yp_list_item" >
                        <v-layout align-start justify-start row>
                            <template v-for="(value, key) in item">
                             <v-list-tile-action v-if="key != 'showOperand' && key != 'gid'" class="yp_action_tile" :key="key">
                              <v-list-tile-sub-title v-text="key"></v-list-tile-sub-title>
                              <v-list-tile-title v-text="value"></v-list-tile-title>
                            </v-list-tile-action>
                            </template>
                        </v-layout>
                         <v-list-tile-action>
                            <v-btn @click.stop="dupplicateYp(item, index)" outline color="indigo"  fab small light>
                                <v-icon>filter_none</v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
               </template>
              </v-list>
            </v-expand-transition>
          </v-card>
       </v-flex>
        <app-footer  v-if="footerState">
        </app-footer>
    </v-layout>
</template>
<script>
import vueJsonEditor from 'vue-json-editor';
import EditDialog from '../components/yp/EditDialog';
import { setTimeout } from 'timers';
import webmms from "webmms-client";
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { mapGetters } from 'vuex';
import HeaderState from '@/components/HeaderLogin';
import conf from '@/config/config';

export default {
    data (){
      return {
         eiInfo: {
          eiName: 'yp',
          eiTag: '',
          ddn : ''
        },
         webmmsOptions : {
            EiToken: '',
            SToken: '',
            UToken: ''
        },
         yp:{
          ddn: '>>group-mms',
          topic: 'yp://group',
          func: 'object',
          args: null
        },
        dialogState: false,
        dialogLoading: false,
        dialogIsNew: false,
        dialogIndex: 0,
        error: false,
        errorMsg: '',
        timeout: 3000,
        mmsReady: false,
        mms: null,
        jsonYp: {

        },
        descriptionLimit: 60,
        entries: [],
        result: [],
        isLoading: false,
        model: null,
        search: null
      }
    },
    async created() {
       this.readQueryParam();
       this.startMMS();
    },
    async beforeMount() {
       await this.subscribeMMS();
    },
    computed: {
      fields () {
        if (!this.model) return []

        return Object.keys(this.model).map(key => {
          return {
            key,
            value: this.model[key] || 'n/a'
          }
        })
      },
      items () {
        return this.entries.map(entry => {
          return entry;
        })
      },
      ...mapGetters([
        'headerState',
        'footerState',
        'titleState'
      ])
    },
     watch: {
     async search (val) {
        // Items have already been loaded
        if (this.items.length > 0) return;

        // Items have already been requested
        if (this.isLoading) return;

        this.isLoading = true;
        console.log(this.eiInfo.ddn);

        setTimeout(()=>{

          this.isLoading = false;
        }, 2000);


      },
      model: function(val){
        this.searchText();
      }
    },
    components :{
        vueJsonEditor,
        EditDialog ,
        HeaderState,
    },
    methods: {
      insertYp(){
          this.dialogIsNew = true;
          this.dialogState = true;
          this.dialogIndex = -1;
          this.jsonYp = {name: 'newGroup', properties: {}};
      },
      editYp(item, index){
          this.dialogIsNew = false;
          this.dialogState = true;
          this.dialogIndex = index;
          this.deleteObjectKey(item);
          this.jsonYp = item;
      },
      async deleteYp(){
        if(!this.checkWebMMSState())
          return;

        //this.isLoading = true;
         this.dialogLoading = true;
        let [{ Reply: result }] = await this.mms.callMMS({
              topic: "",
              DDN: this.yp.ddn,
              func: "RemoveGrp",
              payload: {
                "condition" : {
                  "name" : this.jsonYp.name
                }
              }
          });
           this.dialogLoading = false;
         //this.isLoading = false;

         if(result.RstMsg == 'OK'){
           this.dialogState = false;
            this.result.splice(this.dialogIndex, 1);
          }else{
             this.errorMsg = result.RstMsg;
             this.error = true;
          }


      },
      async dupplicateYp(item, index){
          if(!this.checkWebMMSState())
              return;
        let itemCopy = Object.assign({}, item);
        this.$delete(itemCopy, 'gid');
        itemCopy.name = itemCopy.name + '-' + this.makeId(4)
        this.isLoading = true;
        let [{ Reply: result }] = await this.mms.callMMS({
              topic: "",
              DDN: this.yp.ddn,
              func: "CreateGrp",
              payload: itemCopy
          });
         this.isLoading = false;

         if(result.RstMsg == 'OK'){
            let data = result.Data;
            this.deleteObjectKey(data);
            this.result.splice(index + 1, 0, data);
          }else{
             this.errorMsg = result.RstMsg;
             this.error = true;
          }
      },
      async saveJson (){
         if(!this.checkWebMMSState())
          return;

         this.dialogLoading = true;
          let [{ Reply: result }] = await this.mms.callMMS({
               topic: "",
               DDN: this.yp.ddn,
               func: this.dialogIsNew ? "CreateGrp" : "UpdateGrp",
               payload: this.jsonYp
            });

            this.dialogLoading = false;
            if(result.RstMsg == 'OK' || result.RstCode == '-600'){
                this.dialogState = false;
                this.deleteObjectKey(result.Data);
                if(this.dialogIsNew){
                    //this.result.push(result.Data);
                 }
                else{
                  this.result[this.dialogIndex] = result.Data;
                }
            }else{
                this.errorMsg = result.RstMsg;
                this.error = true;
            }

      },
      async searchText(){


        if(!this.model || this.model.length == 0)
        {
          this.result = [];
        }else{

            if(!this.checkWebMMSState())
             return;

           this.isLoading = true;
           let [{ Reply: result, IN: state }] = await this.mms.callMMS({
               topic: "",
               DDN: this.yp.ddn,
               func: "FindGrp",
               payload: {
                 "condition" : {
                   "name" : {$regex: this.model + '.*'}
                 }
               }
            });
          console.log(JSON.stringify(state));
          this.isLoading = false;
          if(result.RstMsg == 'OK'){

            this.result = result.Data.map(item => {
               this.deleteObjectKey(item);
               return item;
            });
          }else{
            this.result = [];
          }

          // this.result = this.entries.filter( item => {
          //     return item.name.toLowerCase().includes(this.model.toLowerCase());
          // });
        }
      },
      toggleOperand(item){
        this.$set(item,'showOperand',!item.showOperand);
          //item.showOperand =  !item.showOperand;
      },
      deleteObjectKey(item){
          this.$delete(item, '_w');
          this.$delete(item, '_id');
          this.$delete(item, '__v');
          this.$delete(item, 'path');
          this.$delete(item, 'insertDate');
          this.$delete(item, 'updateDate');
          this.$delete(item, 'parentId');
          this.$delete(item, 'objects');
          this.$delete(item, 'showOperand');
      },
      checkWebMMSState(){
        if(!this.mmsReady)
        {
          this.errorMsg = "WebMMS is not connected or registered.";
          this.error = true;
          return false;
        }else return  true;

      },
      startMMS(){
          this.mms =  webmms({
            wsurl: conf.wsurl,
            EiToken: getCookie("yp-EiToken") || "",
            SToken: getCookie("yp-SToken") || ""
          });
      },
      readQueryParam(){
          const { json, src, yp, name, tag } = this.$route.query;

          this.eiInfo.eiName = name || 'yp' + this.makeId(5);
          this.eiInfo.eiTag = tag ? '#' + tag : '';


          if(src) {
              fetch(src)
                .then(async res => {
                  const data = JSON.parse(await res.text());
                  this.json = Object.assign({},this.json, data);
                  console.log(this.json);
                })
                .catch(e => {
                  console.error(e.message);
                });
              return;
          }

          if (json){

            console.log(json);
            console.log( JSON.parse(json));
              this.json = Object.assign( {},this.json, JSON.parse(json));
               if (typeof data !== "object") {

                  //throw Error("json format error");
              }
              console.log(this.json);
              return;
          }

          if(yp){
              this.mms.CallMMS(this.yp.ddn, this.yp.topic, this.yp.func, yp, null, null, result => {
                  console.log('CallMMS: result=%s', JSON.stringify(result));
                  this.json = result;
                  console.log(this.json);
              });
          }
      },
       async subscribeMMS() {
        this.removeEvent = this.mms.on("registered", async reply => {
             if(reply.ErrMsg == "OK"){
                this.eiInfo.ddn = reply.result.DDN;
                this.webmmsOptions.EiToken = reply.result.EiToken;
                this.webmmsOptions.SToken = reply.result.SToken;
                this.webmmsOptions.UToken = reply.result.UToken;

                this.mmsReady = true;
                this.error = false;

             }else{
                this.mmsReady = false;
                this.error = false;
             }

             let expiredTime = 60 * 60 * 24 * 30 * 12;

            setCookie("yp-EiToken", this.webmmsOptions.EiToken);
            setCookie("yp-SToken", this.webmmsOptions.SToken);

             console.log('regtoCenter: %s', reply.ErrMsg);

             this.searchText();
        });

        this.mms.on('message', (method, from, data, body) => {
              this.mmsReady = true;
             this.error = false;
             console.log('rcve: from=%s, data=%s', from, JSON.stringify(data));
        });

        this.mms.on('state', msg => {
            console.log('WS error: %s', msg);
            this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('disconnect', msg => {
            this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('error', err => {
             this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('connect_error', err => {
             this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('connect_timeout', err => {
            this.mmsReady = false;
            this.error = true;
        });
      },

      onJsonChange (value) {
        //console.log('change value:', value)
      },
      onJsonSave (value){
        //console.log('save value:', value);
      },
      onJsonError (error){
         //console.log('error:', error);
      }
    }
}
</script>
<style scoped>
.yp_card{
  height: 90%;
}
.yp_list{
   background-color:#fafafa;
}

.yp_editor{
  min-height: 500px;
  height: 100%;
}
.yp_action_tile{
  margin-left: 10px;
}
.yp_list_item{
      margin-bottom: 15px;

}
.loading{
      margin: 0 !important;
}
</style>
<style>

.jsoneditor-vue{
  height: 100%;
}
.json-save-btn{
  padding: 8px 35px !important;
  margin-bottom: 20px;
}
.yp_edit > div{
      padding-left: 10px;
    padding-right: 10px;
}
div.jsoneditor-menu{
  background-color: #dfdede !important;
  border-bottom: 1px solid #bcbcbc !important;
  color: #0c0b0b !important;
}
div.jsoneditor-menu button{
  color: #0c0b0b !important;
}
div.jsoneditor{
  border: 1px solid #b2b3b4 !important;
}
div.jsoneditor-menu > button, div.jsoneditor-menu > div.jsoneditor-modes > button{
  color: #0c0b0b !important;
}
.jsoneditor-compact,.jsoneditor-format{
 color: #0c0b0b !important;
}
.jsoneditor-poweredBy{
  color: #dfdede !important;
}
.yp_toolbar .v-toolbar__content{
height: 45px !important;
}
</style>


