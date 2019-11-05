<template>
      <v-layout row>
      <div class="loading" v-if="loading">
        <v-layout align-center justify-center row fill-height>
          <v-progress-circular :size="25" :width="3" color="grey" indeterminate >
              </v-progress-circular>
        </v-layout>
      </div>
    <v-snackbar  v-model="errorLoading" color="error" :timeout="timeout" top="top">
      {{errorMsg}}
    </v-snackbar>
    <v-flex xs12 sm12 class="event_body" :style="{ 'background-color': json.backgroundColor}">
      <v-card class="event_card">
         <app-header  v-if="headerState" :hideTitle="!titleState">
          <span slot="title">Urt</span>
        </app-header>
        <urt-dialog id="eventDialog" :data="dialogData" :dialog="dialogState" @closeDialog="dialogState = $event"></urt-dialog>
        <v-layout class="urt_form">
            <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
                <v-card class="card_form">
                    <v-toolbar class="card_form_toolbar"  light dense>
                    <v-toolbar-title style="font-size: 11pt;font-weight: bold;margin-left: 0;" :style="[$vuetify.breakpoint.xs ? {'font-size': '10pt'} : {}]">{{eiInfo.eiName}} ({{eiInfo.ddn}})</v-toolbar-title>
                    <v-spacer></v-spacer>

                     <v-menu bottom left>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on"  fab light small :style="[$vuetify.breakpoint.xs ? {'height': '30px','width': '30px', 'margin': '0','margin-left': '8px'} : {}]">
                                <v-icon>help</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-tile v-for="(item, i) in urtSamples" :key="i" @click="selectSample(item)">
                                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                    <v-btn @click="clear" fab light small :style="[$vuetify.breakpoint.xs ? {'height': '30px','width': '30px', 'margin': '0','margin-left': '8px'} : {}]">
                        <v-icon>clear</v-icon>
                    </v-btn>
                    <v-btn @click="webmmsSubmit" fab light small :style="[$vuetify.breakpoint.xs ? {'height': '30px','width': '30px', 'margin': '0','margin-left': '8px'} : {}]">
                        <v-icon>send</v-icon>
                    </v-btn>
                    </v-toolbar>
                    <div style="padding:15px;padding-bottom: 0;">
                    <form>
                        <v-layout row wrap>
                           <v-flex class="item_form" xs12 md6>
                             <v-text-field :class="{'xs_input': $vuetify.breakpoint.xs}"
                                v-model="urt.ddn"
                                label="DDN"
                                data-vv-name="ddn"
                                solo
                                ></v-text-field>
                            </v-flex>
                            <v-flex class="item_form" xs12 md6>
                                <v-text-field :class="{'xs_input': $vuetify.breakpoint.xs}"
                                    v-model="urt.topic"
                                    label="Topic"
                                    data-vv-name="topic"
                                    solo
                                ></v-text-field>
                            </v-flex>
                             <v-flex class="item_form" xs12 md6>
                                <v-text-field :class="{'xs_input': $vuetify.breakpoint.xs}"
                                    v-model="urt.payload"
                                    label="Payload"
                                    data-vv-name="payload"
                                    solo
                                ></v-text-field>
                            </v-flex>
                            <v-flex class="item_form" xs12 md6 >
                                <v-text-field :class="{'xs_input': $vuetify.breakpoint.xs}"
                                    v-model="urt.func"
                                    label="Func"
                                    data-vv-name="func"
                                    solo
                                ></v-text-field>
                            </v-flex>
                        </v-layout>

                </form>
                </div>

                </v-card>

            </v-flex>
        </v-layout>
        <v-list  class="list" expand>
          <template v-for="(item, index) in eventList" class="list-item">
            <v-list-tile
              :key="item.title"
              avatar
              ripple
              @click.stop="toggle(item, index)"
            >
                <v-layout align-start justify-start row>

                    <v-list-tile-action class="event-action"  >
                        <v-list-tile-action-text class="event_default" :class="{'event_reply': item.type == 'Out', 'event_state': item.type == 'State'}">{{ item.time }}</v-list-tile-action-text>
                    </v-list-tile-action>

                    <v-list-tile-content>
                        <v-list-tile-title class="event_default"  :class="{'event_reply': item.type == 'Out', 'event_state': item.type == 'State'}">{{ item.data }}</v-list-tile-title>
                    </v-list-tile-content>

                </v-layout>
            </v-list-tile>
            <v-divider v-if="(index + 1 < eventList.length) && json.showLineRow" :key="index">
            </v-divider>
          </template>
          <template v-for="(item, index) in errorList" class="list-item">
            <v-list-tile
              :key="item.title"
              avatar
              ripple
              @click.stop="toggle(item, index)"
            >
                <v-layout align-start justify-start row>

                    <v-flex xs2 sm2 md1 lg1 class="hidden-sm-and-down">
                    <v-list-tile-action class="event-action"  >
                        <v-list-tile-action-text class="event_default" style="color:#ce0000">--------</v-list-tile-action-text>
                    </v-list-tile-action>

                    </v-flex>

                    <v-flex xs4 sm2 md1 lg1 >
                    <v-list-tile-action class="event-action" >
                        <v-list-tile-title class="event_default" style="color:#ce0000">--------</v-list-tile-title>
                    </v-list-tile-action>
                    </v-flex>

                    <v-flex xs2 sm2 md2 lg1>
                    <v-list-tile-action class="event-action" >
                        <v-list-tile-action-text class="event_default" style="color:#ce0000"> {{ item.ErrCode }}</v-list-tile-action-text>
                    </v-list-tile-action>
                    </v-flex>
                    <v-flex :class="{xs4 : json.displayField.length == 5, xs5 : json.displayField.length == 4,
                                    md6 : json.displayField.length == 5, md8 : json.displayField.length == 4,
                                    lg7 : json.displayField.length == 5, lg8 : json.displayField.length == 4}"    v-if="displayField('content')">
                    <v-list-tile-content>
                        <v-list-tile-title class="event_default"  style="color:#ce0000">{{ item.ErrMsg }}</v-list-tile-title>
                    </v-list-tile-content>
                    </v-flex>
                </v-layout>
            </v-list-tile>
            <v-divider v-if="(index + 1 < errorList.length) && json.showLineRow" :key="index">
            </v-divider>
          </template>
        </v-list>
      </v-card>
    </v-flex>
     <app-footer  v-if="footerState">
      <span slot="right">
          <div class="flash_box" >
                  <clock v-if="json.showClock" ></clock>
                  <div v-if="json.showState" v-indicator class="event_status" :style="[$vuetify.breakpoint.xs ? {'height': '20px', 'width':'20px', 'margin-top':'-1px'} : {}]" :class="{'event_status_connect' : mmsReady, 'event_status_disconnect': !mmsReady}"></div>
          </div>
      </span>
    </app-footer>
  </v-layout>
</template>
<script>
import get from 'lodash/get';
import JJ from '@/assets/gitpage_icon.png';
import UrtDialog from '../components/urt/UrtDialog';
import Clock  from '../components/Clock';
import { setTimeout, setInterval } from 'timers';
import { isNumber } from 'util';
import parse from "url-parse";
import webmms from "webmms-client";
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { mapGetters } from 'vuex';
import HeaderState from '@/components/HeaderLogin';
import conf from '@/config/config';
import urtSampleList from '@/assets/json/urt';

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
        loading: false,
        successed: false,
        webmmsTypeList: [
            'SendMMS',
            'CallMMS'
        ],
        config: {
          app: '',
          ddn: 'W6mMVtS9',
          websockURL: 'https://lib.ypcloud.com',
          topic: 'jj://page',
        },
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
        json : {
          backgroundColor : 'rgb(247, 247, 247)',
          headerBackgroundColor : 'rgb(239, 239, 239)',
          footerBackGroundColor : 'rgb(239, 239, 239)',
          title : 'Urt',
          showClock: true,
          showState: true,
          showLineRow: false,
          displayField: ['time', 'from', 'note', 'content'],
          statusColors: {
            '0'   : '#000000',
            '1'   : '#b9b306',
            '-1'  : '#bd0303',
            '-2'  : '#b96506',
            '-3'  : '#96a704',
            '-4'  : '#7a0260',
            '-5'  : '#390179',
            '-6'  : '#77104c',
            '-7'  : '#13554f',
            '2'   : '#0621b9',
            '3'   : '#8f06b9',
            '4'   : '#ac05ac',
            '5'   : '#5906b9',
            '6'   : '#b9066e',
            '7'   : '#01887d'
          }
        },
        yp:{
          ddn: '',
          topic: 'yp://group',
          func: 'object',
          args: null
        },
        urt :{
          ddn: '',
          topic: '',
          func: '',
          payload: ''
        },
        urtSample: {
            ddn: '>>123456',
            topic: 'group-mms',
            func: 'echo',
            payload: { data : 'test' }
        },
        urtSamples : urtSampleList,
        eventList: [],
        errorList: [],
        error: true,
        errorLoading: false,
        errorMsg: '',
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
      ])
    },
    components: {
      UrtDialog ,
      Clock,
      HeaderState,
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
       this.readQueryParam();
       this.startMMS();
    },
    async beforeMount() {
       await this.subscribeMMS();
    },
    beforeDestroy() {
      this.removeEvent();
    },
    methods: {
      toggle (item, index) {
        this.dialogState = true;
        this.dialogData = item;
      },
      getClassColor(status){
         let statusKey1 = 'event_' + status;
         let statusKey2 = 'event__' + status;
          return {
              'event_ok' : status == 0,
              'event_warning': status == 1,
              'event_error' : status == -1,
               statusKey1 : status >= 2,
               statusKey2 : status <= -2,

          }
      },
      getStyleColor(status){
          return {
            'color' : this.json.statusColors[status] || '#000000'
          }
      },
      displayField(field){
          return this.json.displayField.indexOf(field) > -1;
      },
      startMMS(){
          this.mms =  webmms({
            wsurl: this.config.websockURL,
            EiToken: getCookie("urt-EiToken") || "",
            SToken: getCookie("urt-SToken") || ""
          });
      },
      readQueryParam(){
          const { json, src, yp, name, tag, lib } = this.$route.query;

          this.eiInfo.eiName = name || '';
          this.eiInfo.eiTag = tag ? '#' + tag : '';
          this.config.websockURL = lib ? `https://${lib}` : conf.wsurl;


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
      sampleUrt(urt){
          this.urt[urt] =  typeof this.urtSample[urt] == 'object' ? JSON.stringify(this.urtSample[urt]) : this.urtSample[urt];
      },
      selectSample(item){
         this.urt =  Object.assign({},item.data) ;
         this.urt.payload = typeof this.urt.payload == 'object' ? JSON.stringify(this.urt.payload) : this.urt.payload;
      },
      setLog(data, type){
        let _data =typeof data == 'object' ? Object.assign({},data) : {data : data};
        if(_data.payload){
          _data.payload = this.isJson(_data.payload) ? JSON.parse(_data.payload) : _data.payload;
        }
        let log = {
            time : this.getTime(),
            data : _data,
            type: type
        };
        this.eventList.push(log);
      },
      async webmmsSubmit(){
        //this.$validator.validateAll();
        const { ddn, topic, func, payload } = this.urt;
        if(ddn == '' && topic == ''){
          this.errorMsg = 'Please fill ddn or topic !!!';
          this.errorLoading = true;
          return;
        }
        if(payload == ''){
          this.errorMsg = 'Please fill payload !!!';
          this.errorLoading = true;
          return;
        }

        this.setLog(this.urt, 'In');

        if(func && func != ''){
            this.loading = true;
            let res;
            try {
               res = await this.mms.callMMS({
                  DDN : ddn,
                  topic : topic,
                  func: func,
                  payload: this.isJson(payload) ? JSON.parse(payload) : payload
              });
            } catch (error) {
              this.setLog({'websocket': error}, 'State');
            }
            this.loading = false;
            if(res){
                let result;
                if(typeof res == 'object')
                    result = res;
                else
                    result = res[0];
                console.log(result);
                if(!result)
                  return;

                this.setLog(result, 'Out');

            }
        }else{
           this.loading = true;
           let res;
           try {
               res = await this.mms.sendMMS({
                  DDN : ddn,
                  topic : topic,
                  payload: this.isJson(payload) ? JSON.parse(payload) : payload
              });
           } catch (error) {
             this.setLog({'websocket': error}, 'State');
           }
            this.loading = false;

            if(res){
                let result;
                if(typeof res == 'object')
                    result = res;
                else
                    result = res[0];
                console.log(result);
                if(!result)
                  return;

                this.setLog(result, 'Out');
            }
        }

      },
      clear(){
          this.urt.ddn = '';
          this.urt.topic = '';
          this.urt.func = '';
          this.urt.payload = '';
          this.eventList = [];
          this.$validator.reset();
      },
      async subscribeMMS() {
        this.removeEvent = this.mms.on("registered", async reply => {
             if(reply.ErrMsg == "OK"){
                this.eiInfo.ddn = reply.result.DDN;
                this.webmmsOptions.EiToken = reply.result.EiToken;
                this.webmmsOptions.SToken = reply.result.SToken;
                this.webmmsOptions.UToken = reply.result.UToken;
                if(this.eiInfo.eiName == ''){
                  this.eiInfo.eiName = reply.result.EiName ? reply.result.EiName : 'pgURT' + this.makeId(5);
                }
                 if(this.eiInfo.eiTag == ''){
                  this.eiInfo.eiTag = reply.result.EiTag ? reply.result.EiTag : '';
                }
             }

             let expiredTime = 60 * 60 * 24 * 30 * 12;

             setCookie("urt-EiToken", this.webmmsOptions.EiToken);
             setCookie("urt-SToken", this.webmmsOptions.SToken);


             console.log('regtoCenter: %s', reply.ErrMsg);
            this.setLog({'regtoCenter':reply}, 'State');
             this.mmsReady = true;
             this.error = false;
             let deviceInfo = {"DDN":this.eiInfo.ddn,"EiOwner":"","EiName":this.eiInfo.eiName,"EiType":".page","EiTag":this.eiInfo.eiTag,"EiLoc":""};
             let result = await this.mms.setDeviceInfo(deviceInfo);
             console.log('SetDevice reply=%s', JSON.stringify(result));
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
              this.setLog({From : from, Data: data}, 'In');

            }
        });

        this.mms.on('state', msg => {
            console.log('WS error: %s', msg);
            this.setLog({'WS error':msg}, 'State');
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('disconnect', msg => {
            this.setLog({'disconnect':msg}, 'State');
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('error', err => {
            this.setLog({'error':err}, 'State');
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('connect_error', err => {
            this.setLog({'connect_error':err}, 'State');
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });

        this.mms.on('connect_timeout', err => {
             this.setLog({'connect_timeout':err}, 'State');
            this.mmsReady = false;
            this.error = true;
            this.loading = false;
        });
      }
  }
}
</script>
<style  scoped>
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
    margin-top: 5px;
    box-shadow: none;
}
.card_form_toolbar{
  box-shadow: none;
  background-color: transparent;
  padding-left: 15px !important;
  padding-right: 15px !important;
}
.urt_form{
    margin-bottom: 0;
}
.item_form{
    padding-left: 10px;
    padding-right: 10px;
    margin-top: -5px;
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
  .event_ok{
    color: #000000 !important;
  }
  .event_error{
    color:#bd0303 !important;
  }

  .event_reply{
    color:#13ce66 !important;
  }

  .event_state{
    color:#c1ac06 !important;
  }



  .event_info{
    color: #20b8f2 !important;
  }
  .event_blue{
    color: #71d4fa !important;
  }
  .event_default{
    color:#00464e;
    font-size: 10pt;
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
</style>





