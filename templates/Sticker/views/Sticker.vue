<template>
  <div>
    <app-header v-if="headerState" :hideTitle="!titleState" style="z-index:999">
      <span slot="title">Sticker</span>
    </app-header>
  <v-container fluid>
    <v-layout justify-center row wrap >
      <v-flex v-for="item in list" :key="item.name" xs6 sm4 md2>
        <v-responsive class="sticker__item__wrapper align-center" style="text-align:center" :aspect-ratio="1/1">
           <!-- <v-btn
            fab
            class="sticker__item__btn ma-0"
            @click="sendMMS(item.url)"
          >
           </v-btn>  -->
           <button class="sticker__item__btn" @click="sendMMS(item.url)"><img :src="item.img" /></button>
        </v-responsive>
      </v-flex>
    </v-layout>
  </v-container>
  <app-footer v-if="footerState" style="z-index:999"></app-footer>
</div>
</template>

<script>
import webmms from "webmms-client";
import {
  set as setCookie,
  get as getCookie,
  remove as removeCookie
} from "es-cookie";
import { mapGetters } from "vuex";
import { setTimeout } from "timers";
import json from "@/assets/json/tv.json";
import conf from '@/config/config';

export default {
  data() {
    return {
      list : json,
      mms: null,
      mmsReady: false,
      loading: false,
      response: null,
      state: "",
      params: {},
      loading: true,
      config: {
        app: "",
        websockURL: "https://lib.ypcloud.com",
        topic: "",
        params: {
          pin: {
            default: "",
          }
        }
      },
      eiInfo: {
        eiName: "",
        eiTag: "",
        ddn: ""
      },
      webmmsOptions: {
        EiToken: "",
        SToken: "",
        UToken: ""
      },
      yp: {
        ddn: ">>jj-portal",
        topic: "jj-exp://parse",
        func: "parse",
        args: null
      }
    };
  },
  computed: {
    ...mapGetters(["headerState", "footerState", "titleState"])
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
    async sendMMS(url) {
      const topic = `ss://${this.params.pin}`;
      const data = `drop ${url}`;
      let res = await this.mms.sendMMS({
        DDN: "",
        topic: topic,
        payload: data
      });
      this.response = res;
    },
    setParams() {
      const urlps = new URL(window.location).searchParams;

      const result = {};

      Object.entries(this.config.params).forEach(o => {
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
      this.mms = webmms({
        wsurl: conf.wsurl,
        EiToken: getCookie("stk-EiToken") || "",
        SToken: getCookie("stk-SToken") || ""
      });
    },
    async subscribeMMS() {
      this.removeEvent = this.mms.on("registered", async reply => {
        //console.log('reply=%s', JSON.stringify(reply))
        if (reply.ErrMsg == "OK") {
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
        } else {
          this.mmsReady = false;
          this.error = false;
        }

        let expiredTime = 60 * 60 * 24 * 30 * 12;

        setCookie("stk-EiToken", this.webmmsOptions.EiToken);
        setCookie("stk-SToken", this.webmmsOptions.SToken);

        console.log("regtoCenter: %s", reply.ErrMsg);

        this.state = "連線D-center...";
      });

      this.mms.on("message", (method, from, data, body) => {
        this.mmsReady = true;
        this.error = false;
        console.log("rcve: from=%s, data=%s", from, JSON.stringify(data));
        if (typeof data == "object" && !data.from) data.from = from;
        //body.sender = data;
        if (data) {
          this.handleErr(data);
          //this.eventList.push(data.data);
          //this.setLog({From : from, Data: data}, 'In');
        }
      });

      this.mms.on("state", msg => {
        console.log("WS error: %s", msg);
        this.handleErr(res);
        this.mmsReady = false;
        this.error = true;
        this.loading = false;
      });

      this.mms.on("disconnect", msg => {
        this.mmsReady = false;
        this.error = true;
        this.loading = false;
      });

      this.mms.on("error", err => {
        this.mmsReady = false;
        this.error = true;
        this.loading = false;
      });

      this.mms.on("connect_error", err => {
        this.mmsReady = false;
        this.error = true;
        this.loading = false;
      });

      this.mms.on("connect_timeout", err => {
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
};
</script>

<style lang="sass">
.sticker
  &__item
    text-align: center
    font-size: $l
    &__btn
      +size(60%,auto)
      //+background
      //+threeDify(15,#DDDDDD)
      img
        +size(100%, 100%)
</style>


