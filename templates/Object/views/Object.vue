<template>
  <v-layout row>
      <div class="loading" v-if="loading">
        <v-layout align-center justify-center row fill-height>
          <v-progress-circular :size="25" :width="3" color="grey" indeterminate >
              </v-progress-circular>
        </v-layout>
      </div>
       <edit-dialog
            :editMode="editMode"
            :dialog="dialogState"
            :editItem="editItem"
            :loading="dialogLoading"
            @saveJson="saveJson()"
            @editMode="editMode = $event"
            @closeDialog="dialogState = $event"
            @deleteJson="callDeleteJson($event)"
            @editItem="editItem.data = $event"
            >
                  <vue-json-editor  v-if="editMode"
                        class="json_editor"
                        v-model="editItem"
                        :show-btns="false"
                        mode="code"
                        @json-change="onJsonChange"
                        @json-save="onJsonSave"
                        @has-error="onJsonError"></vue-json-editor>
                <vue-json-pretty v-if="!editMode"
                  :path="'res'"
                  :data="editItem"
                  showLength
                  showLine
                  showDoubleQuotes
                  :deep="5"
                  highlightMouseoverNode
                  highlightSelectedNode
                  >
                </vue-json-pretty>
       </edit-dialog>
    <v-snackbar  v-model="errorLoading" color="error" :timeout="timeout" top="top">
      {{errorMsg}}
    </v-snackbar>
    <v-flex xs12 sm12 class="event_body" style="background-color:rgb(247, 247, 247)">
      <v-card class="event_card">
        <app-header   v-if="headerState" :hideTitle="!titleState">
          <span slot="title">Miki</span>
        </app-header>
        <v-layout class="urt_form">
            <v-flex xs12 sm10 offset-sm1 md8 offset-md2>
                <v-card class="card_form">
                       <v-toolbar flat color="white" class="table_header" >
                           <v-flex xs9>
                              <v-text-field class="table_search" :style="[($vuetify.breakpoint.xs || $vuetify.breakpoint.sm) ? {'margin-left': '-5px'} : {'margin-left': '-15px'}]" :class="{'xs_input': $vuetify.breakpoint.xs}"
                                    v-model="model"
                                    label="Search"
                                    data-vv-name="Search"
                                    solo
                                     v-on:keyup.enter="loadList"
                                     append-icon="search"
                                    @click:append="loadList"
                                    clearable
                                    @click:clear="clearSearch"
                                ></v-text-field>
                           </v-flex>
                            <v-flex xs3 style="padding-left:10px;">
                              <v-combobox
                               class="table_combo"
                                v-model="typeModel"
                                :items="typeList"
                                @change="loadList"
                                label="Select json type"
                                solo
                                no-filter
                              ></v-combobox>
                            </v-flex>
                          <v-spacer></v-spacer>
                           <v-btn fab light small class="mb-2 table_btn" :style="[($vuetify.breakpoint.xs || $vuetify.breakpoint.sm) ? {'height': '30px','width': '30px'} : {}]" @click="insertJson">
                                <v-icon>add</v-icon>
                           </v-btn>
                        </v-toolbar>
                        <v-data-table
                          :headers="headerList"
                          :items="result"
                          :loading="isLoading"
                          :pagination.sync="pagination"
                          :total-items="totalItems"
                        >
                        <v-progress-linear  v-slot:progress color="blue" indeterminate></v-progress-linear>
                          <template v-slot:items="props"  >
                            <tr style="cursor:pointer;" @click.stop="detailJson(props.item, props.index)">
                              <td>{{ props.item.name }}</td>
                              <td >{{ props.item.updateDate | formatTime }}</td>
                              <td >{{ props.item.vpath }}</td>
                              <td class="hidden-xs-only">{{ props.item.tag }}</td>
                            </tr>
                          </template>
                          <template v-slot:no-data>
                            <v-layout align-center justify-center row>
                              <v-btn color="primary" class="table_btn" small outline light @click="loadList()">Try Fetch</v-btn>
                            </v-layout>
                          </template>
                        </v-data-table>

                </v-card>
            </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import JJ from '@/assets/gitpage_icon.png';
import Clock  from '@/components/Clock';
import vueJsonEditor from 'vue-json-editor';
import EditDialog from '@/components/json/EditDialog';
import BackPage from '@/components/BackPage';
import { setTimeout, setInterval } from 'timers';
import { isNumber } from 'util';
import parse from "url-parse";
import webmms from "webmms-client";
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { mapGetters } from 'vuex';
import HeaderState from '@/components/Header';
import VueJsonPretty from 'vue-json-pretty';
import conf from '@/config/config';

export default {
  $_veeValidate: {
        validator: 'new'
    },
     data () {
      return {
        JJ,
        value: '',
        dialogData: {},
        dialogState: false,
        deleteDialog: false,
        loading: false,
        successed: false,
        dialog: false,
        headers: [
          { text: 'Name', value: 'name' },
          { text: 'Time', value: 'updateDate' },
          { text: 'Path', value: 'vpath',sortable: false },
          { text: 'Tag', value: 'tag',sortable: false,hide: 'xs' }
          //{ text: 'Actions', value: 'name', sortable: false }
        ],
        typeList: [
          'object',
          'board'
        ],
        desserts: [],
        pagination: {},
        totalItems : 0,
        editedIndex: -1,
        editMode: false,
        editItem: {

        },
        editTempItem: {},
        dialogState: false,
        dialogLoading: false,
        dialogIsNew: false,
        dialogIndex: 0,
         eiInfo: {
          eiName: '',
          eiTag: '',
          ddn : ''
        },
        webmmsOptions : {
            EiToken: '',
            SToken: '',
            UToken: ''
        },
        yp:{
          ddn: '>>obj-mms',
          topic: '',
          func: 'object',
          args: null
        },
        errorList: [],
        error: true,
        errorLoading: false,
        errorMsg: '',
        result: [],
        isLoading: true,
        model: null,
        typeModel: 'object',
        search: null,
        timeout: 3000,
        mmsReady: false,
        mms: null
      }
    },
    computed: {
       ...mapGetters([
        'headerState',
        'footerState',
        'titleState'
      ]),
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
      headerList(){
        let bp = this.$vuetify.breakpoint;
        let vm= this
        return this.headers.filter(h => {
          if (!h.hide) return true;
          let hide = h.hide
          if (!Array.isArray(hide)) hide = [hide]
          return !hide.find(e => {
            if (typeof e === 'string') return bp[e]
          });
        });
      },
      user (){
        return this.$store.getters.user;
      }
    },
     watch: {
      dialog (val) {
        val || this.close()
      },
      pagination(){
        this.loadList();
      }
    },
    components: {
      vueJsonEditor,
      EditDialog,
      Clock,
      BackPage,
      HeaderState,
      VueJsonPretty
    },
    directives: {
        'indicator' : {
           bind(el, binding, vnode){
              setInterval(() => {
                if(el.style.backgroundColor == 'gray'){
                    el.style.backgroundColor = '';
                }else{
                    el.style.backgroundColor = 'gray';
                }
             }, 1000);
           }
        }
    },
    async created() {
       this.startMMS();
    },
    async beforeMount() {
       await this.subscribeMMS();
    },
    beforeDestroy() {
      this.removeEvent();
    },
    methods: {
      detailJson(item, index){
          let newItem =Object.assign({},item);
          this.editTempItem = item;
          this.deleteObjectKey(newItem);
          this.editItem = newItem;
          this.editMode = false;
          this.dialogIsNew = false;
          this.dialogState = true;
          this.dialogIndex = index;
      },
      insertJson(){
          if(this.typeModel == 'object')
            this.editItem = {name: 'newObject', vpath: '', file: '', type: 'object', tag: '', data: {}};
          else
            this.editItem = {name: 'newBoard', app: '', vpath: '', file: '', type: 'board', tag: '',params: {},  data: {}};
          this.dialogIsNew = true;
          this.editMode = true;
          this.dialogState = true;
          this.dialogIndex = -1;
      },
      editJson(item, index){
          let newItem =Object.assign({},item);
          this.editTempItem = item;
          this.deleteObjectKey(newItem);
          this.editItem = newItem;
          this.dialogIsNew = false;
          this.dialogState = true;
          this.dialogIndex = index;
      },
      async callDeleteJson(){
         if(!this.editItem.dialogIsNew)
            await this.deleteJson(this.editItem);
      },
      async deleteJson(item, index){
        if(!this.checkWebMMSState())
          return;

        let newItem =Object.assign({},item);
        //this.editTempItem = item;
        this.deleteObjectKey(newItem);
        this.editItem = newItem;
        //this.editItem.oid = this.editTempItem.oid;
        //this.dialogIndex = index;

        item.deleteDialog = false;
        //this.isLoading = true;
        this.isLoading = true;
        this.dialogLoading = true;
        let [{ Reply: result }] = await this.mms.callMMS({
              topic: "",
              DDN: this.yp.ddn,
              func: "RemoveObj",
              payload: {
                "condition" : {
                  "name" : this.editItem.name
                }
              }
          });
          this.isLoading = false;
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
      async saveJson (){
         if(!this.checkWebMMSState())
          return;

         if(!this.dialogIsNew)
            this.editItem.oid = this.editTempItem.oid;

         this.editItem.uid = this.user.Uid;

         this.dialogLoading = true;
          let [{ Reply: result }] = await this.mms.callMMS({
               topic: "",
               DDN: this.yp.ddn,
               func: this.dialogIsNew ? "CreateObj" : "UpdateObj",
               payload: this.editItem
            });

            this.dialogLoading = false;
            if(result.RstMsg == 'OK' || result.RstCode == '-600'){
                this.dialogState = false;
                //this.deleteObjectKey(result.Data);
                if(this.dialogIsNew){
                    this.result.push(result.Data);
                 }
                else{
                  this.result[this.dialogIndex] = result.Data;
                }
            }else{
                this.errorMsg = result.RstMsg;
                this.error = true;
            }

      },
      clearSearch(){
          this.model = '';
          this.loadList();
      },
      async loadList(){
          let payload;
          const { sortBy, descending, page, rowsPerPage } = this.pagination;

          let sort = {};
          if (this.pagination.sortBy) {
              sort[sortBy] = descending ? -1 : 1;
          }else{
            sort = {name : 1};
          }

          payload = {
              page: page - 1,
              limit: rowsPerPage,
              sort : sort
          }

          if(!this.model || this.model.length == 0)
          {
            payload.condition = {uid: this.user.Uid};

          }else{
             if(this.model.startsWith('/'))
                payload.condition = { vpath : {$regex: this.model + '.*'}, uid: this.user.Uid};
             else if(this.model.startsWith('#'))
                payload.condition = { tag : {$regex: this.model.substring(1) + '.*'}, uid: this.user.Uid};
             else
                payload.condition = { name : {$regex: this.model + '.*'}, uid: this.user.Uid};
          }

          payload.condition.type = this.typeModel;

          console.log(payload);

          if(!this.checkWebMMSState())
            return;

          this.isLoading = true;
          // let [{ Reply: result, IN: state }] = await this.mms.callMMS({
          //     topic: "",
          //     DDN: this.yp.ddn,
          //     func: "FindObj",
          //     payload: payload
          // });

          let res = await this.mms.callMMS({
              topic: this.yp.topic,
              DDN: this.yp.ddn,
              func: "FindObj",
              payload: payload
          });

          this.isLoading = false;

          if(res){
                let result;
                if(typeof res == 'object')
                    result = res;
                else
                    result = res[0];

                if(!result)
                  return;
                console.log(result);

                if(result[0]){
                  result = result[0];
                }

                if(result.Reply && result.Reply.RstMsg == 'OK'){
                  let data = result.Reply.Data;
                  this.result = data.Data.map(item => {
                    //this.deleteObjectKey(item);
                    return item;
                  });
                  this.totalItems = data.TotalCount;
                }else{
                  this.result = [];
                  this.totalItems = 0;
                }
            }


          // this.result = this.entries.filter( item => {
          //     return item.name.toLowerCase().includes(this.model.toLowerCase());
          // });
      },
      deleteObjectKey(item){
          this.$delete(item, '_w');
          this.$delete(item, '_id');
          this.$delete(item, 'oid');
          this.$delete(item, '__v');
          this.$delete(item, 'path');
          this.$delete(item, 'uid');
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
      // save () {
      //   if (this.editedIndex > -1) {
      //     Object.assign(this.desserts[this.editedIndex], this.editedItem)
      //   } else {
      //     this.desserts.push(this.editedItem)
      //   }
      //   this.close()
      // },
      startMMS(){
          this.mms =  webmms({
            wsurl: conf.wsurl,
            EiToken: getCookie("obj-EiToken") || "",
            SToken: getCookie("obj-SToken") || ""
          });
      },
      async subscribeMMS() {
        this.removeEvent = this.mms.on("registered", async reply => {
            //console.log('reply=%s', JSON.stringify(reply))
             if(reply.ErrMsg == "OK"){
                this.eiInfo.ddn = reply.result.DDN;
                this.webmmsOptions.EiToken = reply.result.EiToken;
                this.webmmsOptions.SToken = reply.result.SToken;
                this.webmmsOptions.UToken = reply.result.UToken;
                // if(this.eiInfo.eiName == ''){
                //   this.eiInfo.eiName = reply.result.EiName ? reply.result.EiName : 'urt' + this.makeId(5);
                // }
                //  if(this.eiInfo.eiTag == ''){
                //   this.eiInfo.eiTag = reply.result.EiTag ? reply.result.EiTag : '';
                // }
                this.mmsReady = true;
                this.error = false;
             }else{
                this.mmsReady = false;
                this.error = false;
             }

             let expiredTime = 60 * 60 * 24 * 30 * 12;

             setCookie("obj-EiToken", this.webmmsOptions.EiToken);
             setCookie("obj-SToken", this.webmmsOptions.SToken);


             console.log('regtoCenter: %s', reply.ErrMsg);

             this.loadList();

        });

        this.mms.on('message', (method, from, data, body) => {
             this.mmsReady = true;
             this.error = false;
             console.log('rcve: from=%s, data=%s', from, JSON.stringify(data));
            if(typeof data == 'object' && !data.from)
              data.from = from;
            //body.sender = data;
            if(data)
            {

              //this.eventList.push(data.data);
              //this.setLog({From : from, Data: data}, 'In');

            }
        });

        this.mms.on('state', msg => {
            console.log('WS error: %s', msg);
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('disconnect', msg => {
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('error', err => {
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('connect_error', err => {
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('connect_timeout', err => {
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
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
.json_editor{
  min-height: 500px;
  height: 100%;
}
.event_body{
   /* background-color:#e9fafb; */
}
.event_card{
   box-shadow: none;
}
.header_layout{
  margin-top: -5px;
}
.event_header{
  /* background-color:#e9fafb; */
  height: 45px;
  box-shadow: none;
  padding-top: 10px;
  border:none;
  position: fixed;
  top: 0;
  z-index: 2;
}

.card_form{
      margin-top: 60px;
}

.view_footer{
   z-index: 2;
}
.flash_box{
  float: right;
  /* margin-right: -15px; */
}
.event_status{
  height: 25px;
  width: 25px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 6px;
  vertical-align: middle;
  margin-top: -5px;
}
.event_status_connect{
   background-color:#08b325;
   border-color: #08b325;
}
.event_status_disconnect{
   background-color: #d22727;
   border-color: #b72626;
}
.event_header_title{
  font-weight: bold;
   font-size: 15pt;
  margin: 0;
}

.event_header .v-toolbar__content{
   height: 45px;
}
.list{
  background-color:#f2f3f3;
  padding: 0 0 0;
  box-shadow: none;
  border:none;
  margin-top: 0;
}
  .event-action{
    margin-right:15px;
    min-width: auto;
    line-height: 18pt;
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

  .list-item{
    border-bottom: 1px solid #c9c8c8;
  }
.table_btn{
  text-transform: unset;
}
</style>

<style>
.v-list__tile--avatar{
   height: 35px !important;
}
.v-list__tile__sub-title {
    font-size: 10pt;
}
.event_header .v-toolbar__content{
   height: 45px !important;
       display: block;
}
.item_form .v-text-field__details{
  margin: 0 !important;
}
.xs_input .v-input__control{
    min-height: 37px !important;
}
.xs_input .v-input__slot{
    margin-bottom: 3px !important;
}
.xs_input .v-label{
  font-size: 12px !important;
}
td{
  vertical-align: middle !important;
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
.xs_input .v-input__control{
    min-height: 37px !important;
}
.xs_input .v-input__slot{
    margin-bottom: 3px !important;
}
.xs_input .v-label{
  font-size: 12px !important;
}
.table_header .v-toolbar__content{
  height: 70px !important;
}
.table_search .v-input__control {
  min-height: 40px !important;
}
.table_combo .v-input__control {
  min-height: 40px !important;
}
</style>
