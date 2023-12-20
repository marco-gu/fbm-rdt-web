<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { setShellStyle } from "./utils/screen.utils";

export default defineComponent({
  setup() {
    onMounted(() => {
      const shell = document.getElementById("app") as HTMLElement;
      setShellStyle(shell);
    });
  },
});
</script>
