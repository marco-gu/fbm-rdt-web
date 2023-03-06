<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="setting-card-item" @click="onChangeLanguage('en')">
        <div class="label">{{ $t("setting.english") }}</div>
        <div v-if="selectedLanguage == 'en'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="setting-card-item" @click="onChangeLanguage('zh')">
        <div class="label">{{ $t("setting.chinese") }}</div>
        <div v-if="selectedLanguage == 'zh'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
export default {
  name: "SettingLanguageView",
  components: {
    HeaderComponent,
  },
  setup() {
    const store = useStore();
    const selectedLanguage = ref("");
    const i18n = useI18n();
    const titleParam = i18n.t("setting.setting_language");
    const backUrlParam = "/setting";
    const onChangeLanguage = (language: string) => {
      const args = {
        language: language,
      };
      bridge.call("settingLanguage", args, () => {
        selectedLanguage.value = args.language;
        store.dispatch("languageModule/setCurrentLang", language);
      });
    };
    onMounted(() => {
      bridge.call("getSettingLanguage", null, (res: string) => {
        if (res) {
          selectedLanguage.value = res;
        }
      });
    });

    return {
      onChangeLanguage,
      selectedLanguage,
      titleParam,
      backUrlParam,
    };
  },
};
</script>
