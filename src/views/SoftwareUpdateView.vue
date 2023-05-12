<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[$t('setting.setting_header'), $t('setting.software_update')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      v-model:searchValue="search"
      @onBack="back"
    />
    <div class="page-content" v-if="currentVersionCode < latestVersionCode">
      <div class="setting-card-item">
        <div class="title">
          {{ $t("setting.latest_version_label") }}: Ver {{ latestVersionName }}
        </div>
        <div></div>
        <div class="spacer"></div>
        <div style="text-align: center; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </div>
        <div class="spacer"></div>
      </div>
      <!-- <q-separator inset color="grey-3" /> -->
      <!-- <div class="setting-card-item">
        <div class="label" style="text-align: left; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </div>
        <div class="spacer"></div>
      </div> -->
    </div>
    <div class="page-content" v-else>
      <div class="setting-card-item">
        <div class="title">
          {{ $t("setting.already_latest_version_label") }}
        </div>
        <!-- <div class="item-value">Ver {{ currentVersionName }}</div> -->
        <div class="spacer"></div>
      </div>
    </div>
    <!-- <q-separator inset color="grey-3" /> -->
    <div
      class="bottom-button"
      id="bottom-button"
      v-show="currentVersionCode < latestVersionCode"
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
import { onMounted, ref, version } from "vue";
import { VersionInfo } from "@/models/profile";
import { useRouter } from "vue-router";
// import { popupErrorMsg } from "@/plugin/popupPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import HeaderComponent from "@/components/HeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
export default {
  name: "SoftwareUpdateView",
  components: {
    CommonHeaderComponent,
    LoadingComponent,
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const i18n = useI18n();
    const currentVersionCode = ref();
    const currentVersionName = ref("");
    const downloadPending = ref(false);
    const latestVersionCode = ref();
    const latestVersionName = ref("");
    const latestVersionDetail = ref("");
    const titleParam = i18n.t("setting.software_update");
    const backUrlParam = "/setting";
    const loadingStatus = ref(false);
    onMounted(() => {
      // showLoading($q);

      bridge.call("getAppVersion", null, (res: string) => {
        const versionInfo = JSON.parse(res) as VersionInfo;
        currentVersionCode.value = versionInfo.versionCode;
        currentVersionName.value = versionInfo.versionName;
      });
      loadingStatus.value = true;
      bridge.call("getLatestVersion", null, (res: string) => {
        loadingStatus.value = false;
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          const versionInfo = JSON.parse(androidResponse.data) as VersionInfo;
          latestVersionCode.value = versionInfo.versionCode;
          latestVersionName.value = versionInfo.versionName;
          latestVersionDetail.value = versionInfo.detail;
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          // popupErrorMsg($q, message);
        }
        // closeLoading($q);
      });
    });
    const handleDownload = () => {
      // showLoading($q);
      loadingStatus.value = true;
      downloadPending.value = true;
      bridge.call("downloadLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          // popupErrorMsg($q, message);
        }
        // closeLoading($q);
        loadingStatus.value = false;
        downloadPending.value = false;
      });
    };
    const back = () => {
      router.push({
        path: "/setting",
      });
    };
    const home = () => {
      router.push({
        path: "/home",
      });
    };
    return {
      back,
      home,
      currentVersionCode,
      currentVersionName,
      downloadPending,
      handleDownload,
      latestVersionCode,
      latestVersionName,
      latestVersionDetail,
      titleParam,
      backUrlParam,
      loadingStatus,
    };
  },
};
</script>
<style lang="scss" scoped>
.title {
  text-align: center;
  font-size: 20px;
  font-family: Maersk Text-Bold, Maersk Text;
  font-weight: bold;
}
</style>
