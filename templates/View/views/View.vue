<template>
      <v-layout row fill-height>
    <v-flex xs12 sm12 class="event_body" :style="{ 'background-color': json.backgroundColor}" >
      <v-card class="event_card">
        <app-header v-if="headerState" :hideTitle="!titleState" :style="{ 'background-color': json.headerBackgroundColor}">
          <span slot="title">{{json.title}}</span>
        </app-header>
        <event-dialog id="eventDialog" :data="dialogData" :dialog="dialogState" @closeDialog="dialogState = $event"></event-dialog>
        <v-list  class="list" expand>
          <template v-for="(item, index) in eventList" class="list-item">
            <v-list-tile
              :key="item.title"
              avatar
              ripple
              @click.stop="toggle(item, index)"
            >
             <v-layout align-start justify-start row>

                <v-flex xs2 sm2 md1 lg1 v-if="displayField('time')">
                   <v-list-tile-action class="event-action"  >
                    <v-list-tile-action-text class="event_default" >{{ item.time }}</v-list-tile-action-text>
                </v-list-tile-action>

                </v-flex>

                 <v-flex xs2 sm2 md1 lg1 v-if="displayField('from')">
                  <v-list-tile-action class="event-action" >
                    <v-list-tile-title class="event_default" :style="getStyleColor(item.status)">{{ item.from }}</v-list-tile-title>
                  </v-list-tile-action>
                </v-flex>

                <v-flex xs2 sm2 md2 lg1 v-if="displayField('to')">
                  <v-list-tile-action class="event-action" >
                    <v-list-tile-action-text class="event_default"> {{ item.to }}</v-list-tile-action-text>
                  </v-list-tile-action>
                </v-flex>

                 <v-flex xs3 sm3 md2 lg2 v-if="displayField('note')">
                  <v-list-tile-action class="event-action">
                    <v-list-tile-sub-title :style="getStyleColor(item.status)"> {{ item.note }}</v-list-tile-sub-title>
                  </v-list-tile-action>
                </v-flex>

                 <v-flex :class="{xs4 : json.displayField.length == 5, xs5 : json.displayField.length == 4,
                                  md6 : json.displayField.length == 5, md8 : json.displayField.length == 4,
                                  lg7 : json.displayField.length == 5, lg8 : json.displayField.length == 4}"    v-if="displayField('content')">
                  <v-list-tile-content>
                    <v-list-tile-title class="event_default"  >{{ item.content }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-flex>
             </v-layout>
            </v-list-tile>
            <v-divider v-if="(index + 1 < eventList.length) && json.showLineRow" :key="index">
            </v-divider>
          </template>
        </v-list>
      </v-card>
      <v-footer class="view_footer" fixed height="auto" :color="json.footerBackGroundColor">
        <v-layout  justify-start row wrap>

        </v-layout>
      </v-footer>
    </v-flex>
    <app-footer  v-if="footerState" :color="json.footerBackGroundColor">
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
import EventDialog from '@/components/EventDialog';
import Clock  from '@/components/Clock';
import { setTimeout, setInterval } from 'timers';
import { isNumber } from 'util';
import parse from "url-parse";
import webmms from "webmms-client";
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { mapGetters } from 'vuex';
import HeaderState from '@/components/HeaderLogin';
import conf from '@/config/config';

  export default {
     data () {
      return {
        value: '',
        dialogData: {},
        dialogState: false,
        loading: false,
        successed: false,
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
          backgroundColor : '#e9fafb',
          headerBackgroundColor : '#e9fafb',
          footerBackGroundColor : 'rgb(196, 237, 240)',
          title : 'Event',
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
        eventList: [],
        error: true,
        timeout: 0,
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
      EventDialog ,
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
            wsurl: conf.wsurl,
            EiToken: getCookie("view-EiToken") || "",
            SToken: getCookie("view-SToken") || ""
          });
      },
      readQueryParam(){
          const { json, src, yp, name, tag } = this.$route.query;

          this.eiInfo.eiName = name || '';
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
            //console.log('reply=%s', JSON.stringify(reply))
             if(reply.ErrMsg == "OK"){
                this.eiInfo.ddn = reply.result.DDN;
                this.webmmsOptions.EiToken = reply.result.EiToken;
                this.webmmsOptions.SToken = reply.result.SToken;
                this.webmmsOptions.UToken = reply.result.UToken;
                if(this.eiInfo.eiName == ''){
                  this.eiInfo.eiName = reply.result.EiName ? reply.result.EiName : 'pgVIEW' + this.makeId(5);
                }
                 if(this.eiInfo.eiTag == ''){
                  this.eiInfo.eiTag = reply.result.EiTag ? reply.result.EiTag : '';
                }
             }

             let expiredTime = 60 * 60 * 24 * 30 * 12;

             setCookie("view-EiToken", this.webmmsOptions.EiToken);
             setCookie("view-SToken", this.webmmsOptions.SToken);


             console.log('regtoCenter: %s', reply.ErrMsg);
             this.mmsReady = true;
             this.error = false;
             let deviceInfo = {"DDN":this.eiInfo.ddn,"EiOwner":"","EiName":this.eiInfo.eiName,"EiType":".web","EiTag":this.eiInfo.eiTag,"EiLoc":""};
             let result = await this.mms.setDeviceInfo(deviceInfo);
             console.log('SetDevice reply=%s', JSON.stringify(result));
        });

        this.mms.on('message', (method, from, data, body) => {
              this.mmsReady = true;
             this.error = false;
             console.log('rcve: from=%s, data=%s', from, JSON.stringify(data));
            if(!data.from)
              data.from = from;
            //body.sender = data;
            if(data)
            {
              this.eventList.push(data.data);
              setTimeout(function(){
                window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
              }, 10);
            }
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
.view_footer{
   z-index: 2;
}
.flash_box{
  float: right;
  /* margin-right:-15px; */
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
  background-color:#e9fafb;
  padding: 0 0 0;
  box-shadow: none;
  border:none;
  margin-top: 45px;
}
  .event-action{
    margin-right:15px;
    min-width: auto;
    line-height: 18pt;
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

  .event_warning{
    color:#b9b306 !important;
  }

  .event_2{
    color:#0621b9 !important;
  }
  .event_3{
    color:#8f06b9 !important;
  }
  .event_4{
    color:#ac05ac !important;
  }
  .event_5{
    color:#5906b9 !important;
  }
  .event_6{
    color:#b9066e !important;
  }
  .event_7{
    color:#01887d !important;
  }
  .event__2{
    color:#b96506 !important;
  }
  .event__3{
    color:#96a704 !important;
  }
  .event__4{
    color:#7a0260 !important;
  }
  .event__5{
    color:#390179 !important;
  }
  .event__6{
    color:#77104c !important;
  }
  .event__7{
    color:#13554f !important;
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
</style>




