<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.scanning_device") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="setting-content">
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
import { useRouter } from "vue-router";
import { ref } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
export default {
  name: "SettingScanDeviceView",
  components: {},
  setup() {
    const router = useRouter();
    let selectedDevice = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

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
      selectedDevice,
      homeIcon,
      arrowIcon,
    };
  },
};
</script>
