<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="main-header">
      <q-img
        style="position: absolute; left: 20px"
        no-transition
        no-spinner
        :src="menuWhite"
        @click="toggleLeftDrawer"
        width="20px"
      />
      <q-img no-transition no-spinner :src="logoIcon" width="46px" />
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      class="bg-grey-2"
      @show="showDrawer"
      @hide="hideDrawer"
    >
      <div class="drawer-content">
        <div style="margin-top: 50px">
          <q-img
            no-transition
            no-spinner
            :src="menuBlack"
            width="24px"
            @click="toggleLeftDrawer"
          />
        </div>
        <q-list>
          <q-item clickable @click="() => router.push('/profileManagement')">
            <q-item-section>
              <q-item-label>{{ $t("profile.profiles") }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset color="grey-3" />
          <q-item clickable @click="() => router.push('/dataMgmtList')">
            <q-item-section>
              <q-item-label>{{ $t("home.data_management") }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset color="grey-3" />
          <q-item clickable @click="() => router.push('/lpList')">
            <q-item-section>
              <q-item-label>{{ $t("lp.lp_files") }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset color="grey-3" />
          <div v-if="imageVisible == 2">
            <q-item clickable @click="() => router.push('/cargoImageList')">
              <q-item-section>
                <q-item-label>{{ $t("home.cargo_image") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
          </div>
          <q-item clickable @click="userManualVisible = true">
            <q-item-section>
              <q-item-label>{{ $t("home.user_manual") }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset color="grey-3" />
        </q-list>
        <div>
          <div @click="() => router.push('/setting')">
            <q-img no-transition no-spinner :src="settingIcon" width="24px" />
          </div>
          <div style="margin-top: 30px" @click="showLogoutDialog = true">
            <q-img no-transition no-spinner :src="doorOpenIcon" width="24px" />
          </div>
        </div>
        <div>
          <span style="display: block; font-size: 14px"
            >Label & Scan System</span
          >
          <span style="display: block; font-size: 10px; color: #757575"
            >Version {{ appVersionName }}{{ envInfo }}</span
          >
          <span style="display: block; font-size: 10px; color: #757575"
            >by Maersk WDP@2023-3-10</span
          >
        </div>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="showLogoutDialog" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("home.logout") }}
        </div>
        <div class="dialog-container__content">
          {{ $t("home.logout_promot") }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button cancel" v-close-popup>
            {{ $t("common.cancel") }}
          </button>
          <button class="dialog-button confirm" @click="logout">
            {{ $t("home.logout") }}
          </button>
        </div>
      </div>
    </q-dialog>
    <UserManual
      :dialogVisible="userManualVisible"
      @close="userManualVisible = false"
    >
    </UserManual>
  </q-layout>
</template>
<script lang="ts">
import barBlack from "../assets/icon/bars-solid-black.svg";
import barWhite from "../assets/icon/bars-solid-white.svg";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import bridge from "dsbridge";
import setting from "../assets/images/gear-solid.svg";
import doorOpen from "../assets/images/door-open-solid.svg";
import maerskLogo from "../assets/icon/Maersk.png";
import { VersionInfo } from "@/models/profile";
import router from "@/router";
import UserManual from "@/components/UserManualComponent.vue";
import { useStore } from "@/store";
export default {
  name: "HomeView",
  components: {
    UserManual,
  },
  setup() {
    const route = useRoute();
    const leftDrawerOpen = ref(false);
    const menuBlack = barBlack;
    const menuWhite = barWhite;
    const settingIcon = setting;
    const doorOpenIcon = doorOpen;
    const showLogoutDialog = ref(false);
    const logoIcon = maerskLogo;
    const appVersionName = ref("");
    const envInfo = ref("");
    const userManualVisible = ref(false);
    const store = useStore();
    const imageVisible = store.state.deviceProfileModule.deviceProfile.type;
    onMounted(() => {
      if (route.query.leftDrawerOpen == "true") {
        toggleLeftDrawer();
      }
      bridge.call("getAppVersion", null, (res: string) => {
        if (res) {
          const versionInfo = JSON.parse(res) as VersionInfo;
          appVersionName.value = versionInfo.versionName;
        }
      });
      bridge.call("getEnvInfo", null, (res: string) => {
        if (res) {
          envInfo.value = res;
        }
      });
    });
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const logout = () => {
      showLogoutDialog.value = false;
      bridge.call("logout", null, () => {
        router.replace("/");
      });
      // bridge.call("goFirstPage", null, () => {
      //   router.push("/");
      // });
    };

    const showDrawer = () => {
      bridge.call("switchBarColor", { type: "drawer_backdrop" });
    };

    const hideDrawer = () => {
      bridge.call("switchBarColor", { type: "home" });
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      logout,
      settingIcon,
      showLogoutDialog,
      doorOpenIcon,
      logoIcon,
      menuBlack,
      menuWhite,
      appVersionName,
      envInfo,
      router,
      showDrawer,
      hideDrawer,
      userManualVisible,
      imageVisible,
    };
  },
};
</script>
<style lang="scss" scoped>
.main-header {
  background-color: #64b2d4;
  height: 71px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.drawer-content {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 80%;
  font-size: 14px;
}
</style>
