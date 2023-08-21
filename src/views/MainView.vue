<template>
  <div class="home-container">
    <div class="logo-container">
      <q-img no-transition no-spinner :src="maerskLogo" class="logo-image" />
    </div>
    <div class="card" @click="goOnline()">
      <div class="image">
        <q-img no-transition no-spinner :src="onlineLogo" width="100px" />
      </div>
      <div class="content">
        <div class="title">{{ $t("home.pre_validation") }}</div>
        <div class="sub-title">{{ $t("home.pre_validation_hint") }}</div>
      </div>
    </div>
    <div class="card" @click="goOffline()">
      <div class="image">
        <q-img no-transition no-spinner :src="offlineLogo" width="100px" />
      </div>
      <div class="content">
        <div class="title">{{ $t("home.offline") }}</div>
        <div class="sub-title">{{ $t("home.offline_hint") }}</div>
      </div>
    </div>
    <div class="card" @click="goContinue()">
      <div class="image">
        <q-img no-transition no-spinner :src="continueLogo" width="100px" />
      </div>
      <div class="content">
        <div class="title">{{ $t("home.continue") }}</div>
        <div class="sub-title">{{ $t("home.continue_hint") }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import online from "../assets/images/home_online.svg";
import offline from "../assets/images/home_offline.svg";
import continueJob from "../assets/images/home_continue.svg";
import { useRouter } from "vue-router";
import logo from "../assets/images/Maersk_Logo_RGB.svg";
import { onMounted, ref } from "vue";
import bridge from "dsbridge";
export default {
  name: "MainView",
  components: {},
  setup() {
    const router = useRouter();
    const onlineLogo = online;
    const offlineLogo = offline;
    const continueLogo = continueJob;
    const maerskLogo = logo;
    const versionNum = ref();
    const goOnline = () => {
      router.push("/profile/online");
    };
    const goOffline = () => {
      router.push("/profile/offline");
    };
    const goContinue = () => {
      router.push("/continueJobs");
    };
    onMounted(() => {
      bridge.call("getAppInfo", null, async (res: string) => {
        if (res) {
          versionNum.value = res;
        }
      });
    });
    return {
      router,
      onlineLogo,
      offlineLogo,
      continueLogo,
      goOnline,
      goOffline,
      goContinue,
      maerskLogo,
      versionNum,
    };
  },
};
</script>
<style lang="scss" scoped>
.logo-container {
  height: 140px;
  .logo-image {
    max-width: 90%;
  }
}
.version-bottom {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  color: #b2b2b2;
}

.card {
  background-color: #ffffff;
  width: 76%;
  height: 130px;
  margin: 25px auto;
  box-shadow: 4px 4px 12px 2px rgba(0, 0, 0, 0.12);
  display: flex;
  border-radius: 5px;
  justify-content: center;
  padding: 25px 15px;
  &:first-child {
    margin-top: 0px;
  }
  .image,
  .content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image {
    flex: 0.8;
    svg {
      width: 100%;
      height: 100%;
    }
  }
  .content {
    flex: 1.2;
    flex-direction: column;
    align-items: flex-start;
    .title {
      font-weight: bold;
      color: #000000;
      font-size: 20px;
      white-space: nowrap;
    }
    .sub-title {
      text-align: left;
      margin-top: 8px;
      color: #000000;
      font-size: 17px;
      line-height: 20px;
    }
  }
}
</style>
