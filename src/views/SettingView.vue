<template>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component> -->
    <common-header-component
      :titles="[$t('setting.setting_header')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="page-content">
      <div class="setting-card-item" @click="goRingVoice">
        <div class="label">{{ $t("setting.ring_voice") }}</div>
        <!-- <div class="right-icon">
          <q-icon name="chevron_right" />
        </div> -->
        <div class="item-value">
          {{ ringVoice }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="setting-card-item" @click="goLanguage">
        <div class="label">{{ $t("setting.language") }}</div>
        <!-- <div class="right-icon">
          <q-icon name="chevron_right" />
        </div> -->
        <div class="item-value">
          {{ $t("setting.current_language") }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="setting-card-item" @click="goScanningDevice">
        <div class="label">{{ $t("setting.scanning_device") }}</div>
        <!-- <div class="right-icon">
          <q-icon name="chevron_right" />
        </div> -->
        <div class="item-value">
          {{ scanningDevice }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="setting-card-item" @click="goResetPwd">
        <div class="label">{{ $t("setting.reset_password") }}</div>
        <!-- <div class="right-icon">
          <q-icon name="chevron_right" />
        </div> -->
        <div class="spacer"></div>
      </div>

      <div class="setting-card-item">
        <div class="label">{{ $t("setting.last_profile_sync_time") }}</div>
        <div class="item-value">
          {{
            lastProfileSyncTime
              ? formatDate(new Date(lastProfileSyncTime))
              : "-"
          }}
        </div>
        <div class="spacer"></div>
      </div>

      <div class="setting-card-item" @click="goSoftwareUpdate">
        <div class="label">{{ $t("setting.software_update") }}</div>
        <!-- <div class="right-icon">
          <q-icon name="chevron_right" />
        </div> -->
        <div class="item-value">Ver {{ softwareUpdate }}</div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import formatDate from "../utils/formatDate";
import HeaderComponent from "@/components/HeaderComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { VersionInfo } from "@/models/profile";
export default {
  name: "SettingView",
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const router = useRouter();
    const ringVoice = ref("");
    const scanningDevice = ref("");
    const lastProfileSyncTime = ref("");
    const softwareUpdate = ref("");
    const username = ref("");
    const password = ref("");
    const titleParam = i18n.t("setting.setting_header");
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
      bridge.call("getAppVersion", null, (res: string) => {
        if (res) {
          const versionInfo = JSON.parse(res) as VersionInfo;
          softwareUpdate.value = versionInfo.versionName;
        }
      });
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
      router.push({
        path: "/home",
      });
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
      });
    };
    return {
      back,
      home,
      formatDate,
      goLanguage,
      goResetPwd,
      goRingVoice,
      goScanningDevice,
      goSoftwareUpdate,
      lastProfileSyncTime,
      ringVoice,
      scanningDevice,
      softwareUpdate,
      titleParam,
    };
  },
};
</script>
