<template>
    <v-layout>
        <app-header  v-if="headerState && headerStateCli" :hideTitle="!titleState">
          <span slot="title">{{title}}</span>
        </app-header>
         <v-layout justify-center row  wrap style="margin-top:55px;">
              <v-flex  v-for="item in list" :key="item.name" xs4 sm3 md2>
                  <v-responsive class="sticker__item__wrapper" :aspect-ratio="1/1">
                      <v-btn class="sticker__item__btn ma-0" absolute block flat icon @click="sendMMS(item.payload)"><img :src="item.img" /></v-btn>
                  </v-responsive>
                  <div class="sticker__item__name">{{ item.name }}</div>
              </v-flex>
          </v-layout>
           <app-footer  v-if="footerState && footerStateCli">
           </app-footer>
    </v-layout>
</template>

<script>
import webmms from 'webmms';
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { mapGetters } from 'vuex';
import { setTimeout } from 'timers';

const list = [
  {
    payload: 'https://www.youtube.com/watch?v=XxJKnDLYZz4',
    img: './images/stickers/TTV.png',
  },
  {
    payload: 'https://www.youtube.com/watch?v=DVOHYy_m_qU',
    img: './images/stickers/CTV.png',
  },
  {
    payload: 'http://crs.ccdntech.com/rds/playerh7livecdn?vod51_Live/ch02&cname&autostart',
    img: './images/stickers/gn.png',
  },
  {
    payload: 'https://www.youtube.com/watch?v=oV_i3Hsl_zg',
    img: './images/stickers/tzu2.png',
  },
  {
    payload: 'https://www.youtube.com/watch?v=J78SdCzzumA',
    img: './images/stickers/france24.png',
  },

];


export default {
    data() {
      return {
        list,
        mms: null,
        mmsReady: false,
        loading: false,
        response: null,
        state: '',
        params: {},
        loading: true,
        config: {
          app: '',
          websockURL: 'https://lib.ypcloud.com',
          topic: '',
          params: {
            pin: {
              default: 'ylobby',
            },
          },
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
        yp:{
          ddn: '>>jj-portal',
          topic: 'jj-exp://parse',
          func: 'parse',
          args: null
        },
        headerStateCli: {{header}},
        footerStateCli: {{footer}},
        iconStateCli: {{icon}}
      };
    },
    computed: {
      ...mapGetters([
        'headerState',
        'footerState',
        'titleState'
      ])
    },
    created() {
      this.setParams();
      this.startMMS();
    },
    async beforeMount() {
        await this.subscribeMMS();
    },
    beforeDestroy() {
        this.removeEvent();
    },
  methods: {
    async sendMMS(payload) {
      const topic = `ss://${this.params.pin}`;
      const data = `drop ${payload}`;
       let res = await this.mms.sendMMS({
        DDN : '',
        topic : topic,
        payload: data
      });
       this.response = res;
    },
    setParams() {
      const urlps = new URL(window.location).searchParams;

      const result = {};

      Object.entries(this.config.params).forEach((o) => {
        const key = o[0];
        const value = o[1];
        const { required, reducer } = value;
        let param = urlps.get(key);

        if (!param) {
          if (required) {
            throw new Error(`${key}是必要參數。範例：?${key}=xxx`);
          }

          if (value.default) {
            param = value.default;
          }
        }

        if (reducer) {
          param = reducer(param);
        }

        result[key] = param;
      });

      this.params = result;
      console.log(this.params);
    },
    startMMS() {
      this.mms =  webmms({
              EiToken: getCookie("stk-EiToken") || "",
              SToken: getCookie("stk-SToken") || ""
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

             setCookie("stk-EiToken", this.webmmsOptions.EiToken);
             setCookie("stk-SToken", this.webmmsOptions.SToken);


             console.log('regtoCenter: %s', reply.ErrMsg);

             this.state = '連線D-center...';

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
              this.handleErr(data);
              //this.eventList.push(data.data);
              //this.setLog({From : from, Data: data}, 'In');

            }
        });

        this.mms.on('state', msg => {
            console.log('WS error: %s', msg);
            this.handleErr(res);
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
    handleErr(res) {
      let content;

      if (Array.isArray(res)) {
        content = res[0].Reply;
      } else {
        content = res;
      }

      const { ErrCode, ErrMsg } = content;

      if (ErrCode && ErrCode !== 0) {
        this.state = ErrMsg;
        return false;
      }

      return true;
    }
  }
}
</script>

<style lang="sass">
.sticker
  &__item
    text-align: center
    font-size: $l
    &__btn
      +size(80%, 80%)
      +ab_center
      img
        +size(60%, 60%)
</style>
<style scoped>
.event_header{
  /* background-color:#e9fafb; */
  height: 45px;
  box-shadow: none;
  padding-top: 5px;
  border:none;
  position: fixed;
  top: 0;
  z-index: 2;
}
.event_header_title{
  font-weight: bold;
   font-size: 15pt;
  margin: 0;
}

.event_header .v-toolbar__content{
   height: 45px;
}
</style>
<style>
.event_header .v-toolbar__content{
   height: 45px !important;
       display: block;
}
</style>

