<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px; text-align: left">{{ pageTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div v-if="currentVersion == latestVersion">
      <q-item>
        <q-item-section style="text-align: left">
          <q-item-label>{{ alreadyLatestVersionLabel }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense no-caps>v {{ currentVersion }}</q-btn>
        </q-item-section>
      </q-item>
    </div>
    <div v-else>
      <q-list>
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>{{ latestVersionLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense no-caps>v {{ latestVersion }}</q-btn>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item style="text-align: left; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
    </div>
    <div class="bottom" v-show="currentVersion != latestVersion">
      <q-btn
        no-caps
        flat
        push
        style="width: 100%"
        :label="downloadLabel"
        @click="handleDownload"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { useI18n } from "@/plugin/i18nPlugins";
import { useRoute, useRouter } from "vue-router";
import selected from "../assets/icon/selected.svg";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { VersionInfo } from "@/models/profile";
export default {
  name: "SoftwareUpdateView",
  components: {},
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const selectedIcon = selected;
    const pageTitle = ref("Software update");
    const currentVersion = ref(route.query.softwareUpdate);
    const alreadyLatestVersionLabel = ref("");
    const downloadLabel = ref("");
    const latestVersionLabel = ref("");
    const latestVersion = ref("");
    // const latestVersionDetail = ref(
    //   "New functions:\n* use face ID to login\nRepair:\n* repair some bugs"
    // );
    const latestVersionDetail = ref("");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.category.value = "SettingView";
      i18n.locale.value = res;
      pageTitle.value = i18n.$t("softwareUpdate");
      downloadLabel.value = i18n.$t("downloadLabel");
      latestVersionLabel.value = i18n.$t("latestVersionLabel");
      alreadyLatestVersionLabel.value = i18n.$t("alreadyLatestVersionLabel");
    });
    onMounted(() => {
      showLoading($q);
      bridge.call("getLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          const versionInfo = JSON.parse(androidResponse.data) as VersionInfo;
          latestVersion.value = versionInfo.version;
          latestVersionDetail.value = versionInfo.detail;
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
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
      bridge.call("downloadLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        closeLoading($q);
      });
    };
    return {
      alreadyLatestVersionLabel,
      back,
      currentVersion,
      downloadLabel,
      pageTitle,
      handleDownload,
      home,
      latestVersion,
      latestVersionDetail,
      latestVersionLabel,
      selectedIcon,
    };
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: rgb(233, 229, 229);
  .header {
    display: flex;
    background: #ffffff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .q-item {
    background-color: #ffffff;
    width: 100%;
  }
  .bottom {
    position: fixed;
    bottom: 0px;
    display: flex;
    background: #42b0d5;
    color: white;
    width: 100%;
    height: 50px;
  }
}
</style>
