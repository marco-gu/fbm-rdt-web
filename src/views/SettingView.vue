<template>
  <div class="wrapper">
    <div class="header">
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
    </div>
    <q-separator color="grey-5" />
    <div class="setting-list-container">
      <q-list>
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>{{ ringVoiceLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right">
              {{ ringVoice }}
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
        <q-item>
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
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>{{ softwareUpdateLabel }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right">{{
              softwareUpdate
            }}</q-btn>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";
import { onMounted, ref, watch } from "vue";
export default {
  name: "SettingView",
  components: {},
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    const settingTitle = ref("Setting");
    const ringVoiceLabel = ref("");
    const ringVoice = ref("ON");
    const languageLabel = ref("");
    const language = ref("");
    const scanningDeviceLabel = ref("");
    const scanningDevice = ref("CAMERA");
    const resetPasswordLabel = ref("");
    const lastProfileSyncTimeLabel = ref("");
    const lastProfileSyncTime = ref("2015-03-03 14:20:11");
    const softwareUpdateLabel = ref("");
    const softwareUpdate = ref("V 1.0.1");
    const username = ref("");
    const password = ref("");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.category.value = "SettingView";
      i18n.locale.value = res;
      settingTitle.value = res === "en" ? "Setting" : "设置";
      language.value = res === "en" ? "English" : "简体中文";
      ringVoiceLabel.value = i18n.$t("ringVoice");
      languageLabel.value = i18n.$t("language");
      scanningDeviceLabel.value = i18n.$t("scanningDevice");
      resetPasswordLabel.value = i18n.$t("resetPassword");
      lastProfileSyncTimeLabel.value = i18n.$t("lastProfileSyncTime");
      softwareUpdateLabel.value = i18n.$t("softwareUpdate");
    });
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
    const goLanguage = () => {
      router.push("/settingLanguage");
    };
    return {
      router,
      home,
      goResetPwd,
      goLanguage,
      ringVoiceLabel,
      ringVoice,
      languageLabel,
      language,
      scanningDeviceLabel,
      scanningDevice,
      resetPasswordLabel,
      lastProfileSyncTimeLabel,
      lastProfileSyncTime,
      softwareUpdateLabel,
      softwareUpdate,
      back,
      settingTitle,
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
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .q-item {
    background-color: #ffffff;
    height: 50px;
    width: 100%;
  }
}
</style>
