<template>
  <div class="wrapper">
    <div class="menu-item" @click="goOnline()">
      <q-img :src="onlineLogo" style="max-width: 300px; max-height: 180px" />
    </div>
    <div class="menu-item">
      <q-img :src="offlineLogo" style="max-width: 300px; max-height: 180px" />
    </div>
    <div class="menu-item">
      <q-img :src="continueLogo" style="max-width: 300px; max-height: 180px" />
    </div>
  </div>
</template>
<script lang="ts">
import online from "../assets/images/online.png";
import offline from "../assets/images/offline.png";
import continueJob from "../assets/images/continue.png";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
export default {
  name: " MainView",
  components: {},
  setup() {
    const router = useRouter();
    const onlineLogo = online;
    const offlineLogo = offline;
    const continueLogo = continueJob;
    const goOnline = () => {
      const args = {
        clientCode: "WOLV",
        so: "CGP7649289",
        po: "4700522258",
      };

      bridge.call("fetchLp", args, (res: string) => {
        console.log(res);
      });
      // router.push("/profile");
    };
    return {
      router,
      onlineLogo,
      offlineLogo,
      continueLogo,
      goOnline,
    };
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 90vh;
  justify-content: space-around;
}

.menu-item {
  background: #42b0d5;
  width: 50%;
  align-self: center;
}
</style>
