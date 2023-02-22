<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.setting_language") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="setting-content">
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
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import { useStore } from "@/store";
export default {
  name: "SettingLanguageView",
  components: {},
  setup() {
    const router = useRouter();
    const store = useStore();
    let selectedLanguage = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    const home = () => {
      router.push("/home");
    };

    const back = () => {
      router.push("/setting");
    };

    const onChangeLanguage = (language: string) => {
      const args = {
        language: language,
      };
      bridge.call("settingLanguage", args, () => {
        selectedLanguage.value = args.language;
        store.dispatch("languageModule/setCurrentLang", language);
        console.log("setting language successfully ", args.language);
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
      router,
      home,
      back,
      onChangeLanguage,
      selectedLanguage,
      homeIcon,
      arrowIcon,
    };
  },
};
</script>
