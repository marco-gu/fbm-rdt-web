<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[$t('setting.setting_header'), $t('setting.software_update')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="page-content" v-if="currentVersionCode < latestVersionCode">
      <div class="setting-item">
        <div class="label">
          {{ $t("setting.latest_version_label") }}
        </div>
        <div class="item-value">Ver {{ latestVersionName }}</div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
      <div class="setting-item">
        <div class="label" style="text-align: left; white-space: pre-wrap">
          {{ latestVersionDetail }}
        </div>
        <div class="spacer"></div>
      </div>
    </div>
    <div class="page-content" v-else>
      <div class="setting-item">
        <div class="label">
          {{ $t("setting.already_latest_version_label") }}
        </div>
        <div class="item-value">Ver {{ currentVersionName }}</div>
        <div class="spacer"></div>
      </div>
    </div>
    <q-separator inset color="grey-3" />
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
    <!-- Progress dialog -->
    <q-dialog v-model="progressDialogVisible" persistent>
      <q-card>
        <q-card-section>
          <q-circular-progress
            show-value
            font-size="16px"
            :value="progress"
            size="80px"
            :thickness="0.22"
            color="secondary"
            track-color="grey-3"
            class="q-ma-md"
          >
            {{ progress }}%
          </q-circular-progress>
          <q-card-section> Downloading...</q-card-section>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Error message dialog -->
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="popupVisible = false"
    ></PopupComponent>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";
import { VersionInfo } from "@/models/profile";
import { useRouter } from "vue-router";
import PopupComponent from "@/components/PopupComponent.vue";

import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import LoadingComponent from "@/components/LoadingComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
export default {
  name: "SoftwareUpdateView",
  components: {
    CommonHeaderComponent,
    LoadingComponent,
    PopupComponent,
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
    const progressDialogVisible = ref(false);
    const progress = ref(0);
    const popupVisible = ref(false);
    const msg = ref("");
    const type = ref("");
    onMounted(() => {
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
          msg.value = message;
          type.value = "error";
          popupVisible.value = true;
        }
      });
    });

    const handleDownload = () => {
      showProgress();
      downloadPending.value = true;
      bridge.call("downloadLatestVersion", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          stopProgress();
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          progressDialogVisible.value = false;
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          msg.value = message;
          type.value = "error";
          popupVisible.value = true;
        }
        downloadPending.value = false;
      });
    };
    const installApk = () => {
      bridge.call("installAPK", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          // popupErrorMsg($q, message);
        }
      });
    };

    function stopProgress() {
      const interval = setInterval(() => {
        progress.value = Math.min(
          100,
          progress.value + Math.floor(Math.random() * 20)
        );

        if (progress.value === 100) {
          clearInterval(interval);
          setTimeout(() => {
            progressDialogVisible.value = false;
            installApk();
          }, 350);
        }
      }, 500);
    }
    function showProgress() {
      progress.value = 0;
      progressDialogVisible.value = true;
      const interval = setInterval(() => {
        progress.value = Math.min(
          100,
          progress.value + Math.floor(Math.random() * 5)
        );
        if (progress.value === 100) {
          clearInterval(interval);
          setTimeout(() => {
            progressDialogVisible.value = false;
          }, 350);
        }
      }, 1000);
    }
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
      installApk,
      showProgress,
      stopProgress,
      latestVersionCode,
      latestVersionName,
      latestVersionDetail,
      titleParam,
      backUrlParam,
      loadingStatus,
      progressDialogVisible,
      progress,
      popupVisible,
      msg,
      type,
    };
  },
};
</script>
