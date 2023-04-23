<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    {{ currentVersionCode < latestVersionCode }}
    <div class="page-content" v-if="currentVersionCode < latestVersionCode">
      <div class="setting-card-item">
        <div class="label">
          {{ $t("setting.latest_version_label") }}
        </div>
        <div class="item-value">Ver {{ latestVersionName }}</div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item">
        <div class="label" style="text-align: left; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </div>
        <div class="spacer"></div>
      </div>
    </div>
    <div class="page-content" v-else>
      <div class="setting-card-item">
        <div class="label">
          {{ $t("setting.already_latest_version_label") }}
        </div>
        <div class="item-value">Ver {{ currentVersionName }}</div>
        <div class="spacer"></div>
      </div>
    </div>
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
// import { popupErrorMsg } from "@/plugin/popupPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import HeaderComponent from "@/components/HeaderComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
export default {
  name: "SoftwareUpdateView",
  components: {
    HeaderComponent,
    LoadingComponent,
  },
  setup() {
    const $q = useQuasar();
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
    return {
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
