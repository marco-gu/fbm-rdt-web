<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <q-img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("setting.setting_language") }}
        </div>
        <div class="common-toolbar-right">
          <q-img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <!-- <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px; text-align: left">{{ title }}</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div> -->
    <q-separator color="grey-5" />
    <div class="setting-list-container">
      <q-list>
        <q-item clickable @click="onChangeLanguage('zh')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ chineseLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="selectedLanguage == 'zh'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
        <q-item clickable @click="onChangeLanguage('en')">
          <q-item-section style="text-align: left">
            <q-item-label>{{ englishLabel }}</q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="selectedLanguage == 'en'">
            <q-img :src="selectedIcon" />
          </q-item-section>
        </q-item>
        <q-separator color="grey-5" />
      </q-list>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useRouter } from "vue-router";
import { useI18n } from "@/plugin/i18nPlugins";
import selected from "../assets/icon/selected.svg";
import { ref } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
export default {
  name: "LanguageView",
  components: {},
  setup() {
    const i18n = useI18n();
    const router = useRouter();
    const selectedIcon = selected;
    const chineseLabel = ref("");
    const englishLabel = ref("");
    var selectedLanguage = ref("");
    const title = ref("Change Language");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.category.value = "SettingView";
      i18n.locale.value = res;
      title.value = res === "en" ? "Change Language" : "设置语言";
      selectedLanguage.value = res;
      chineseLabel.value = i18n.$t("chinese");
      englishLabel.value = i18n.$t("english");
    });

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
        console.log("setting language successfully ", args.language);
      });
    };

    return {
      router,
      home,
      back,
      onChangeLanguage,
      selectedIcon,
      selectedLanguage,
      chineseLabel,
      englishLabel,
      title,
      homeIcon,
      arrowIcon,
    };
  },
};
</script>
<style lang="scss" scoped>
// .wrapper {
//   display: flex;
//   flex-direction: column;
//   height: 100vh;
//   background: rgb(233, 229, 229);
//   .header {
//     display: flex;
//     background: #fff;
//     justify-content: space-around;
//     height: 60px;
//     align-items: center;
//   }
//   .q-item {
//     background-color: #ffffff;
//     height: 50px;
//     width: 100%;
//   }
// }
.q-item {
  height: 50px;
  width: 100%;
}
</style>
