<template>
  <div class="wrapper">
    <div>
      <q-img no-spinner :src="logoIcon" />
    </div>
    <div @click="goOnline()">
      <q-img no-spinner :src="onlineLogo" width="80%" />
    </div>
    <div>
      <q-img no-spinner :src="offlineLogo" width="80%" />
    </div>
    <div>
      <q-img no-spinner :src="continueLogo" width="80%" />
    </div>
  </div>
</template>
<script lang="ts">
import online from "../assets/images/online.png";
import offline from "../assets/images/offline.png";
import continueJob from "../assets/images/continue.png";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import logo from "../assets/images/Maersk_Logo_Neg.svg";
export default {
  name: " MainView",
  components: {},
  setup() {
    const router = useRouter();
    const onlineLogo = online;
    const offlineLogo = offline;
    const continueLogo = continueJob;
    const logoIcon = logo;
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
      logoIcon,
    };
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-around;
  background: #42b0d5;
}

// .menu-item {
//   background: #42b0d5;
//   width: 50%;
//   align-self: center;
// }
</style>
