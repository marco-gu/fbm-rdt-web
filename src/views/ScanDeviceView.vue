<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px; text-align: left">{{ title }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="setting-list-container">
      <q-list>
        <q-item clickable @click="onChangeDevice('camera')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ cameraLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="selectedDevice == 'camera'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="onChangeDevice('bluetooth')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ bluetoothLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="selectedDevice == 'bluetooth'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";
import selected from "../assets/icon/selected.svg";
import { ref } from "vue";
export default {
  name: "LanguageView",
  components: {},
  setup() {
    const i18n = useI18n();
    const router = useRouter();
    const selectedIcon = selected;
    const cameraLabel = ref("");
    const bluetoothLabel = ref("");
    var selectedDevice = ref("");
    const title = ref("Scanning device");

    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.category.value = "SettingView";
      i18n.locale.value = res;
      title.value = res === "en" ? "Scanning device" : "扫描设备";
      cameraLabel.value = i18n.$t("camera");
      bluetoothLabel.value = i18n.$t("bluetooth");
    });

    bridge.call("getScanDevice", null, (res: string) => {
      selectedDevice.value = res;
    });

    const home = () => {
      router.push("/home");
    };

    const back = () => {
      router.push("/setting");
    };

    const onChangeDevice = (device: string) => {
      const args = {
        device: device,
      };
      bridge.call("setScanDevice", args, () => {
        selectedDevice.value = args.device;
        console.log("setting scan device successfully ", args.device);
      });
    };

    return {
      router,
      home,
      back,
      onChangeDevice,
      selectedIcon,
      selectedDevice,
      cameraLabel,
      bluetoothLabel,
      title,
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
