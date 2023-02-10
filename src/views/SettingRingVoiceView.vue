<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.ring_voice") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="list-container">
      <div class="list-item" @click="onChangeRingVoice('on')">
        <div class="label">{{ $t("setting.on") }}</div>
        <div v-if="ringVoice == 'on'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="list-item" @click="onChangeRingVoice('off')">
        <div class="label">{{ $t("setting.off") }}</div>
        <div v-if="ringVoice == 'off'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { onMounted, ref } from "vue";
import bridge from "dsbridge";
import { useRoute, useRouter } from "vue-router";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
export default {
  name: "SettingRingVoiceView",
  components: {},
  setup() {
    const route = useRoute();
    const router = useRouter();

    let ringVoice = ref(route.query.ringVoice);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    const home = () => {
      router.push("/home");
    };
    const back = () => {
      router.push("/setting");
    };
    const onChangeRingVoice = (selected: string) => {
      ringVoice.value = selected;
      const args = {
        RingVoice: selected,
      };
      bridge.call("setRingVoice", args);
    };
    onMounted(() => {
      bridge.call("getRingVoice", null, (res: string) => {
        if (res) {
          ringVoice.value = res;
        }
      });
    });

    return {
      home,
      back,
      ringVoice,
      onChangeRingVoice,
      homeIcon,
      arrowIcon,
    };
  },
};
</script>
<style lang="scss" scoped>
.list-container {
  padding: 0 20px;

  .list-item {
    font-size: 18px;
    background-color: #ffffff;
    box-shadow: 0px 2px 5px 1px rgba(11, 69, 95, 0.08);
    border-radius: 5px;
    width: 100%;
    text-align: left;
    padding: 15px;
    color: #00243d;
    margin-top: 23px;
    .label {
      float: left;
    }
    .item-value,
    .right-icon {
      float: right;
    }
    .spacer {
      clear: both;
    }
  }
}
</style>
