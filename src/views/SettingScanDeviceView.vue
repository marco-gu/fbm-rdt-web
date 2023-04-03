<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="setting-card-item" @click="onChangeDevice('camera')">
        <div class="label">{{ $t("setting.camera") }}</div>
        <div v-if="selectedDevice == 'camera'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item" @click="onChangeDevice('bluetooth')">
        <div class="label">{{ $t("setting.bluetooth") }}</div>
        <div v-if="selectedDevice == 'bluetooth'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item" @click="onChangeDevice('scanner')">
        <div class="label">{{ $t("setting.scanner") }}</div>
        <div v-if="selectedDevice == 'scanner'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { ref } from "vue";
import store from "@/store";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
export default {
  name: "SettingScanDeviceView",
  components: {
    HeaderComponent,
  },
  setup() {
    const selectedDevice = ref("");
    const i18n = useI18n();
    const titleParam = i18n.t("setting.scanning_device");
    const backUrlParam = "/setting";
    bridge.call("getScanDevice", null, (res: string) => {
      selectedDevice.value = res;
    });
    const onChangeDevice = (device: string) => {
      const args = {
        device: device,
      };
      bridge.call("setScanDevice", args, () => {
        selectedDevice.value = args.device;
        store.dispatch("commonModule/setScanDevice", device);
      });
    };
    return {
      onChangeDevice,
      selectedDevice,
      titleParam,
      backUrlParam,
    };
  },
};
</script>
