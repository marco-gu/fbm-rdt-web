<template>
  <div class="header">
    <div class="common-toolbar">
      <div class="common-toolbar-left">
        <img :src="arrowIcon" @click="back" />
      </div>
      <div class="common-toolbar-middle">
        {{ title }}
      </div>
      <div v-show="homeVisible" class="common-toolbar-right">
        <img :src="homeIcon" @click="home" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import { RouteLocationRaw, useRouter } from "vue-router";
const HeaderComponent = defineComponent({
  props: {
    titleParam: {
      type: String,
    },
    backUrlParam: {
      type: String,
    },
    backFunctionParam: {
      type: Function,
    },
    homeVisibleParam: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const { titleParam, backUrlParam, backFunctionParam, homeVisibleParam } =
      toRefs(props);
    const title = titleParam.value;
    const homeVisible = homeVisibleParam.value;
    const url = backUrlParam.value as RouteLocationRaw;
    const backFunction = backFunctionParam.value;
    const back = () => {
      if (url) {
        router.push(url);
      } else if (backFunction instanceof Function) {
        backFunction();
      }
    };
    const home = () => {
      router.push("/home");
    };
    return {
      homeIcon,
      arrowIcon,
      back,
      home,
      title,
      homeVisible,
    };
  },
});
export default HeaderComponent;
</script>
