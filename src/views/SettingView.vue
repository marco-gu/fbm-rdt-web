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
        <div class="item-value" style="font-size: 16px; padding-top: 2px">
          {{ formatDate(new Date(lastProfileSyncTime)) }}
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
import formatDate from "../utils/formatDate";
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
      router.push("/setting-scan-device");
    };

    const goLanguage = () => {
      router.push("/setting-language");
    };
    const goRingVoice = () => {
      router.push({
        path: "/setting-ring-voice",
        query: { ringVoice: ringVoice.value },
      });
    };
    const goSoftwareUpdate = () => {
      router.push({
        path: "/software-update",
        query: { softwareUpdate: softwareUpdate.value },
      });
    };
    return {
      arrowIcon,
      back,
      formatDate,
      goLanguage,
      goResetPwd,
      goRingVoice,
      goScanningDevice,
      goSoftwareUpdate,
      home,
      homeIcon,
      lastProfileSyncTime,
      ringVoice,
      router,
      scanningDevice,
      softwareUpdate,
    };
  },
};
</script>
<style lang="scss" scoped>
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
