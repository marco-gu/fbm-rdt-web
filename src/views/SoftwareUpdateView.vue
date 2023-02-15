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
    <div class="item-container" v-if="currentVersion == latestVersion">
      <q-item>
        <q-item-section style="text-align: left">
          <q-item-label>{{
            $t("setting.already_latest_version_label")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense no-caps>{{ currentVersion }}</q-btn>
        </q-item-section>
      </q-item>
    </div>
    <div class="item-container" v-else>
      <q-item>
        <q-item-section style="text-align: left">
          <q-item-label>{{ $t("setting.latest_version_label") }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense no-caps>{{ latestVersion }}</q-btn>
        </q-item-section>
      </q-item>
      <q-separator inset color="#878787" />
      <q-item style="text-align: left; white-space: pre-wrap">
        {{ latestVersionDetail }}
      </q-item>
    </div>
    <div class="button-container" v-show="currentVersion != latestVersion">
      <q-btn
        no-caps
        flat
        push
        style="width: 100%"
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
    const latestVersion = ref("");
    const latestVersionDetail = ref("");
    onMounted(() => {
      showLoading($q);
      bridge.call("getLatestVersion", null, (res: string) => {
        closeLoading($q);
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          const versionInfo = JSON.parse(androidResponse.data) as VersionInfo;
          latestVersion.value = versionInfo.version;
          latestVersionDetail.value = versionInfo.detail;
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
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
        closeLoading($q);
        downloadPending.value = false;
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
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
.item-container {
  margin: 23px;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px 1px rgba(11, 69, 95, 0.08);
  background-color: #ffffff;
  font-size: 18px;
  text-align: left;
  color: #757575;
}
.button-container {
  display: flex;
  position: fixed;
  margin-left: 23px;
  bottom: 30px;
  width: 88%;
  height: 49px;
  border-radius: 3px;
  background: #42b0d5;
  color: white;
  font-size: 20px;
}
</style>
