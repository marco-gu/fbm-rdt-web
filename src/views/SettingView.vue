<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.ring_voice") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <!-- <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">{{ settingTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div> -->
    <!-- <q-separator color="grey-5" />
    <div class="setting-list-container">
      <q-list>
        <q-item clickable @click="goRingVoice">
          <q-item-section style="text-align: left">
            <q-item-label>{{ ringVoiceLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right">
              {{ ringVoiceDisplay }}
            </q-btn>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="goLanguage">
          <q-item-section style="text-align: left">
            <q-item-label>{{ languageLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right">
              {{ language }}
            </q-btn>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="goScanningDevice">
          <q-item-section style="text-align: left">
            <q-item-label>{{ scanningDeviceLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right">
              {{ scanningDevice }}
            </q-btn>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="goResetPwd">
          <q-item-section style="text-align: left">
            <q-item-label>{{ resetPasswordLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>{{ lastProfileSyncTimeLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>{{ lastProfileSyncTime }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="goSoftwareUpdate">
          <q-item-section style="text-align: left">
            <q-item-label>{{ softwareUpdateLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right"
              >V {{ softwareUpdate }}</q-btn
            >
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
      <q-toolbar class="common-toolbar">
        <q-btn flat round dense icon="arrow_back" @click="back" />
        <q-toolbar-title :shrink="false">
          {{ $t("home.setting") }}
        </q-toolbar-title>
        <q-btn flat round dense icon="home" @click="home" />
      </q-toolbar>
    </div> -->
    <div class="list-container">
      <div class="list-item" @click="goRingVoice">
        <div class="label">{{ $t("setting.ring_voice") }}</div>
        <div class="right-icon">
          <q-icon name="chevron_right" />
        </div>
        <div class="item-value">
          {{ ringVoice }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="list-item" @click="goLanguage">
        <div class="label">{{ $t("setting.language") }}</div>
        <div class="right-icon">
          <q-icon name="chevron_right" />
        </div>
        <div class="item-value">
          {{ $t("setting.current_language") }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="list-item" @click="goScanningDevice">
        <div class="label">{{ $t("setting.scanning_device") }}</div>
        <div class="right-icon">
          <q-icon name="chevron_right" />
        </div>
        <div class="item-value">
          {{ scanningDevice }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="list-item" @click="goResetPwd">
        <div class="label">{{ $t("setting.reset_password") }}</div>
        <div class="right-icon">
          <q-icon name="chevron_right" />
        </div>
        <div class="spacer"></div>
      </div>

      <div class="list-item">
        <div class="label">{{ $t("setting.last_profile_sync_time") }}</div>
        <div class="item-value">
          {{ lastProfileSyncTime }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="list-item" @click="goSoftwareUpdate">
        <div class="label">{{ $t("setting.software_update") }}</div>
        <div class="right-icon">
          <q-icon name="chevron_right" />
        </div>
        <div class="item-value">{{ softwareUpdate }}</div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import { useI18n } from "vue-i18n";
import config from "../assets/config.json";
export default {
  name: "SettingView",
  components: {},
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    const ringVoice = ref("");
    const scanningDevice = ref("");
    const lastProfileSyncTime = ref("N/A");
    const softwareUpdate = ref("");
    const username = ref("");
    const password = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    onMounted(() => {
      bridge.call("checkUserUid", null, (res: string) => {
        if (res) {
          username.value = res.toUpperCase();
        }
      });

      bridge.call("getUserPassword", null, (res: string) => {
        if (res) {
          password.value = res;
        }
      });

      bridge.call("getScanDevice", null, (device: string) => {
        scanningDevice.value = i18n.t("setting." + device);
      });

      bridge.call("getRingVoice", null, (res: string) => {
        if (res) {
          ringVoice.value = i18n.t("setting." + res);
        }
      });

      bridge.call("getProfileLastSyncDate", null, (date: string) => {
        if (date) {
          lastProfileSyncTime.value = date;
        }
      });

      softwareUpdate.value = config.app_version_number;
    });

    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };

    const home = () => {
      router.push("/home");
    };

    const goResetPwd = () => {
      router.push({
        name: "resetPwd",
        params: {
          from: "SettingView",
          username: username.value,
          password: password.value,
        },
      });
    };

    const goScanningDevice = () => {
      router.push("/settingScanDevice");
    };

    const goLanguage = () => {
      router.push("/settingLanguage");
    };
    const goRingVoice = () => {
      router.push({
        path: "/ringVoice",
        query: { ringVoice: ringVoice.value },
      });
    };
    const goSoftwareUpdate = () => {
      // TODO software update
      void 0;
    };
    return {
      back,
      goLanguage,
      goResetPwd,
      goRingVoice,
      goScanningDevice,
      goSoftwareUpdate,
      home,
      ringVoice,
      lastProfileSyncTime,
      router,
      scanningDevice,
      softwareUpdate,
      homeIcon,
      arrowIcon,
    };
  },
};
</script>
<style lang="scss" scoped>
// .wrapper {
//   display: flex;
//   flex-direction: column;
//   height: 100vh;
//   background: rgb(233, 229, 229);
//   .header {
//     display: flex;
//     background: #fff;
//     justify-content: space-around;
//     height: 60px;
//     align-items: center;
//   }
//   .q-item {
//     background-color: #ffffff;
//     height: 50px;
//     width: 100%;
//   }
// }
// .q-item {
//   height: 50px;
.list-container {
  padding: 0 20px;

  .list-item {
    font-size: 18px;
    background-color: #ffffff;
    box-shadow: 0px 2px 5px 1px rgba(11, 69, 95, 0.08);
    border-radius: 5px;
    width: 100%;
    text-align: left;
    padding: 15px;
    color: #000000;
    margin-top: 23px;
    .label {
      float: left;
      color: #757575;
    }
    .q-icon {
      color: #757575;
    }
    .item-value,
    .right-icon {
      float: right;
    }
    .spacer {
      clear: both;
    }
  }
}
</style>
