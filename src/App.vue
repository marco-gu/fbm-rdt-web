<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import bridge from "dsbridge";
import { useRouter } from "vue-router";
const App = defineComponent({
  setup() {
    const router = useRouter();
    bridge.register("getDeviceBrand", (res: any) => {
      console.log("get device brand", res);
    });
    bridge.register("reLogin", () => {
      router.push({ name: "login", params: { message: "TOKEN EXPIRED" } });
    });
  },
});
export default App;
</script>
