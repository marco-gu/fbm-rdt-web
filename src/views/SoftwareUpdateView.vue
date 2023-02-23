<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.software_update") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="setting-content" v-if="currentVersion == latestVersion">
      <div class="setting-card-item">
        <div class="label">
          {{ $t("setting.already_latest_version_label") }}
        </div>
        <div class="item-value">
          {{ currentVersion }}
        </div>
        <div class="spacer"></div>
      </div>
    </div>
    <div class="setting-content" v-else>
      <div class="setting-card-item">
        <div class="label">
          {{ $t("setting.latest_version_label") }}
        </div>
        <div class="item-value">
          {{ latestVersion }}
        </div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item">
        <div class="label" style="text-align: left; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </div>
        <div class="spacer"></div>
      </div>
    </div>
    <div
      class="bottom"
      id="bottom-button"
      v-show="currentVersion != latestVersion"
    >
      <q-btn
        no-caps
        unelevated
        class="full-width"
        color="secondary"
        :label="$t('common.download')"
        :disable="downloadPending"
        @click="handleDownload"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VersionInfo } from "@/models/profile";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import { showLoading, closeLoading } from "@/plugin/loadingPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
export default {
  name: "SoftwareUpdateView",
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const arrowIcon = arrowImg;
    const homeIcon = homeImg;
    const currentVersion = ref(route.query.softwareUpdate);
    const downloadPending = ref(false);
    const latestVersion = ref("Ver 1.0");
    const latestVersionDetail = ref("");
    onMounted(() => {
      showLoading($q);
      bridge.call("getLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          const versionInfo = JSON.parse(androidResponse.data) as VersionInfo;
          latestVersion.value = versionInfo.version;
          latestVersionDetail.value = versionInfo.detail;
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        closeLoading($q);
      });
    });
    const back = () => {
      router.push("/setting");
    };
    const home = () => {
      router.push("/home");
    };
    const handleDownload = () => {
      showLoading($q);
      downloadPending.value = true;
      bridge.call("downloadLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        closeLoading($q);
        downloadPending.value = false;
      });
    };
    return {
      arrowIcon,
      back,
      currentVersion,
      downloadPending,
      handleDownload,
      home,
      homeIcon,
      latestVersion,
      latestVersionDetail,
    };
  },
};
</script>
<style lang="scss" scoped>
.bottom {
  position: fixed;
  bottom: $--page-bottom-margin-bottom;
  .q-btn:nth-child(2) {
    margin-top: 10px;
  }
}
</style>
