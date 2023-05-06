<template>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[$t('setting.ring_voice')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="page-content">
      <div class="setting-item" @click="onChangeRingVoice('on')">
        <div class="label">{{ $t("setting.on") }}</div>
        <div v-if="ringVoice == 'on'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
      <div class="setting-item" @click="onChangeRingVoice('off')">
        <div class="label">{{ $t("setting.off") }}</div>
        <div v-if="ringVoice == 'off'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <q-separator inset color="grey-3" />
    </div>
  </div>
</template>
<script lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
export default {
  name: "SettingRingVoiceView",
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const ringVoice = ref("");
    const router = useRouter();
    const titleParam = i18n.t("setting.ring_voice");
    const backUrlParam = "/setting";
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
      ringVoice,
      onChangeRingVoice,
      titleParam,
      backUrlParam,
    };
  },
};
</script>
