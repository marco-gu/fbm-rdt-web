<template>
  <ul v-if="isAndroidSimulator" class="nav x android_top">
    <li class="left">
      {{ showTime() }}
    </li>
    <li class="right">
      <i class="fa fa-solid fa-battery-half"></i>
    </li>
  </ul>

  <router-view></router-view>
  <ul v-if="isAndroidSimulator" class="nav x android_bottom">
    <li>
      <span class="nav_button"><i class="fa-solid fa-angle-left"></i></span>
    </li>
    <li>
      <span class="nav_button"><i class="fa-regular fa-square"></i></span>
    </li>
    <li>
      <span class="nav_button"><i class="fa fa-regular fa-circle"></i></span>
    </li>
  </ul>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { setShellStyle } from "./utils/screen.utils";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const isAndroidSimulator = ref(false);
    const route = useRoute();
    onMounted(() => {
      // TODO get device's style
      const screenStyle = {
        rows: 15,
      };
      localStorage.setItem("screenStyle", JSON.stringify(screenStyle));
      const shell = document.getElementById("app") as HTMLElement;
      setShellStyle(shell);
      isAndroidSimulator.value =
        process.env.VUE_APP_IS_ANDROID_SIMULATOR === "true" ||
        process.env.VUE_APP_IS_SIMULATOR === "true" ||
        false;
    });
    const showTime = () => {
      const time = new Date();
      const hour = time.getHours();
      const minutes = time.getMinutes();
      return (
        (hour < 10 ? "0" + hour : hour) +
        ":" +
        (minutes < 10 ? "0" + minutes : minutes)
      );
    };

    return {
      showTime,
      isAndroidSimulator,
      route,
    };
  },
});
</script>
