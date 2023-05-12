<template>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[$t('setting.setting_header'), $t('setting.setting_language')]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      v-model:searchValue="search"
      @onBack="back"
    />
    <div class="page-content">
      <div class="setting-card-item" @click="onChangeLanguage('en')">
        <div class="label">{{ $t("setting.english") }}</div>
        <div v-if="selectedLanguage == 'en'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <!-- <q-separator inset color="grey-3" /> -->
      <div class="setting-card-item" @click="onChangeLanguage('zh')">
        <div class="label">{{ $t("setting.chinese") }}</div>
        <div v-if="selectedLanguage == 'zh'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <!-- <q-separator inset color="grey-3" /> -->
      <div class="setting-card-item" @click="onChangeLanguage('da')">
        <div class="label">{{ $t("setting.danish") }}</div>
        <div v-if="selectedLanguage == 'da'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <!-- <q-separator inset color="grey-3" /> -->
      <div class="setting-card-item" @click="onChangeLanguage('ar')">
        <div class="label">{{ $t("setting.arabic") }}</div>
        <div v-if="selectedLanguage == 'ar'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <!-- <q-separator inset color="grey-3" /> -->
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
//import HeaderComponent from "@/components/HeaderComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
export default {
  name: "SettingLanguageView",
  components: {
    CommonHeaderComponent,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
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
      onChangeLanguage,
      selectedLanguage,
      titleParam,
      backUrlParam,
    };
  },
};
</script>
