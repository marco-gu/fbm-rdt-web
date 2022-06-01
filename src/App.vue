<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import bridge from "dsbridge";
const App = defineComponent({
  setup() {
    bridge.register("getDeviceBrand", (res: any) => {
      console.log("get device brand", res);
    });
  },
});
export default App;
</script>
