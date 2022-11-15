<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Setting</span>
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
            <q-item-label>Ring voice</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense label="ON" icon-right="chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>Language</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              dense
              label="English"
              icon-right="chevron_right"
              @click="goLanguage"
            />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>Scanning device</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense label="Camera" icon-right="chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>Reset password</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense icon-right="chevron_right" @click="goResetPwd" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>Last Profile Sync Time</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>2015-03-03 14:20:11</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item>
          <q-item-section style="text-align: left">
            <q-item-label>Software update</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense label="V 1.0.1" icon-right="chevron_right" />
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
export default {
  name: "SettingView",
  components: {},
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    bridge.call("getSystemLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    const home = () => {
      router.push("/home");
    };
    const goResetPwd = () => {
      // TODO
    };
    const goLanguage = () => {
      // TODO
    };
    return {
      router,
      home,
      goResetPwd,
      goLanguage,
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
