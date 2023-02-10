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
    <q-separator color="grey-5" />
    <div v-if="currentVersion == latestVersion">
      <q-item>
        <q-item-section style="text-align: left">
          <q-item-label>{{
            $t("setting.already_latest_version_label")
          }}</q-item-label>
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
            <q-item-label>{{
              $t("setting.latest_version_label")
            }}</q-item-label>
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
        :label="$t('common.download')"
        @click="handleDownload"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import selected from "../assets/icon/selected.svg";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { VersionInfo } from "@/models/profile";
import { useI18n } from "vue-i18n";
export default {
  name: "SoftwareUpdateView",
  components: {},
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const currentVersion = ref(route.query.softwareUpdate);
    const latestVersion = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    // const latestVersionDetail = ref(
    //   "New functions:\n* use face ID to login\nRepair:\n* repair some bugs"
    // );
    const latestVersionDetail = ref("");

    onMounted(() => {
      // showLoading($q);
      // bridge.call("getLatestVersion", null, (res: string) => {
      //   const androidResponse = JSON.parse(res) as AndroidResponse<any>;
      //   if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
      //     const versionInfo = JSON.parse(androidResponse.data) as VersionInfo;
      //     latestVersion.value = versionInfo.version;
      //     latestVersionDetail.value = versionInfo.detail;
      //   } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
      //     i18n.category.value = "MessageCode";
      //     const message = i18n.$t(androidResponse.messageCode);
      //     popupErrorMsg($q, message);
      //   }
      //   closeLoading($q);
      // });
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
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
        closeLoading($q);
      });
    };
    return {
      back,
      currentVersion,
      handleDownload,
      home,
      latestVersion,
      latestVersionDetail,
      homeIcon,
      arrowIcon,
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
