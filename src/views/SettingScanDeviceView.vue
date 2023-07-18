<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('setting.setting_header'), $t('setting.scanning_device')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="page-content">
      <div class="setting-item" @click="onChangeDevice('camera')">
        <div class="label">{{ $t("setting.camera") }}</div>
        <div v-if="selectedDevice == 'camera'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
      <div
        v-if="deviceType == 2"
        class="setting-item"
        @click="onChangeDevice('bluetooth')"
      >
        <div class="label">{{ $t("setting.bluetooth") }}</div>
        <div v-if="selectedDevice == 'bluetooth'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
      <div class="setting-item" @click="onChangeDevice('scanner')">
        <div class="label">{{ $t("setting.scanner") }}</div>
        <div v-if="selectedDevice == 'scanner'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { ref } from "vue";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
export default {
  name: "SettingScanDeviceView",
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const selectedDevice = ref("");
    const router = useRouter();
    const i18n = useI18n();
    const titleParam = i18n.t("setting.scanning_device");
    const backUrlParam = "/setting";
    const store = useStore();
    const deviceType = store.state.deviceProfileModule.deviceProfile.type;
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
      onChangeDevice,
      selectedDevice,
      titleParam,
      backUrlParam,
      deviceType,
    };
  },
};
</script>
