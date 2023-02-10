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
    <div class="list-container">
      <div class="list-item" @click="onChangeLanguage('en')">
        <div class="label">{{ $t("setting.english") }}</div>
        <div v-if="selectedLanguage == 'en'" class="right-icon">
          <q-icon name="check" />
        </div>
        <div class="spacer"></div>
      </div>
      <div class="list-item" @click="onChangeLanguage('zh')">
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
