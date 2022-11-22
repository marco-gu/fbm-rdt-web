<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px; text-align: left">{{ pageTitle }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="setting-list-container">
      <q-list>
        <q-item clickable @click="onChangeRingVoice('on')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ onLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="ringVoice == 'on'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="onChangeRingVoice('off')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ offLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="ringVoice == 'off'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import { ref } from "vue";
import bridge from "dsbridge";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";
import selected from "../assets/icon/selected.svg";
export default {
  name: "RingVoiceView",
  components: {},
  setup() {
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const selectedIcon = selected;
    const pageTitle = ref("Ring Voice");
    const onLabel = ref("");
    const offLabel = ref("");
    const ringVoice = ref(route.query.ringVoice);
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.category.value = "SettingView";
      i18n.locale.value = res;
      pageTitle.value = i18n.$t("ringVoice");
      onLabel.value = i18n.$t("on");
      offLabel.value = i18n.$t("off");
    });
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
    return {
      home,
      back,
      selectedIcon,
      ringVoice,
      onLabel,
      offLabel,
      pageTitle,
      onChangeRingVoice,
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
    background: #ffffff;
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
