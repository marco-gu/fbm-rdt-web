<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="setting-card-item" @click="onChangeRingVoice('on')">
        <div class="label">{{ $t("setting.on") }}</div>
        <div v-if="ringVoice == 'on'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item" @click="onChangeRingVoice('off')">
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
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
export default {
  name: "SettingRingVoiceView",
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const ringVoice = ref("");
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

    return {
      ringVoice,
      onChangeRingVoice,
      titleParam,
      backUrlParam,
    };
  },
};
</script>
