<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="common-header-toolbar">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          color="black"
        />
        <q-space />
        <q-btn
          class="header-logout-btn"
          flat
          dense
          round
          @click="logout()"
          icon="logout"
          color="black"
        />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-grey-2">
      <div class="drawer-content">
        <div>
          <q-list>
            <q-item class="bg-secondary">
              <q-img no-spinner :src="logoIcon" />
            </q-item>
            <q-item clickable @click="goMyProfile()" v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="userProfileIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.profile") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goDataManagement()" v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="dataManagementIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.data_management") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goLPList" v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="lpListIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.lp_list") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goImageAccess" v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="cargoImageIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.cargo_image") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goSetting" v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="settingIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.setting") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-img no-spinner :src="userManualIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>{{ $t("home.user_manual") }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-img no-spinner :src="logoutIcon" />
            </q-item-section>
            <q-item-section avatar @click="logout()">
              <q-item-label>{{ $t("home.logout") }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import bridge from "dsbridge";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { useQuasar } from "quasar";
import { LogoutResponse } from "@/models/login.response";
import userProfile from "../assets/icon/user-profile.svg";
import dataManagement from "../assets/icon/data-management.svg";
import lpList from "../assets/icon/lp-list.svg";
import cargoImage from "../assets/icon/cargo-images.svg";
import setting from "../assets/icon/setting.svg";
import userManual from "../assets/icon/user-manual.svg";
import logOut from "../assets/icon/logout.svg";
import logo from "../assets/images/Maersk_Logo_Neg.svg";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { useI18n } from "vue-i18n";
export default {
  name: "HomeView",
  components: {},
  setup() {
    const route = useRoute();
    const router = useRouter();
    const i18n = useI18n();
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const userProfileIcon = userProfile;
    const dataManagementIcon = dataManagement;
    const lpListIcon = lpList;
    const cargoImageIcon = cargoImage;
    const settingIcon = setting;
    const userManualIcon = userManual;
    const logoutIcon = logOut;
    const logoIcon = logo;
    onMounted(() => {
      if (route.query.leftDrawerOpen == "true") {
        toggleLeftDrawer();
      }
    });
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    const goMyProfile = () => {
      router.push("/profileManagement");
    };
    const goDataManagement = () => {
      router.push("/dataManagement");
    };
    const logout = () => {
      showLoading($q);
      bridge.call("logout", null, (data: string) => {
        closeLoading($q);
        const androidResponse = JSON.parse(
          data
        ) as AndroidResponse<LogoutResponse>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          const msg = i18n.t("messageCode.E93-06-0001");
          router.push("/");
          popupSuccessMsg($q, msg);
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const goSetting = () => {
      router.push("/setting");
    };
    const goLPList = () => {
      router.push("/lpList");
    };
    const goImageAccess = () => {
      router.push("/imageAccess");
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      goMyProfile,
      goDataManagement,
      logout,
      userProfileIcon,
      dataManagementIcon,
      lpListIcon,
      cargoImageIcon,
      settingIcon,
      userManualIcon,
      logoutIcon,
      logoIcon,
      goSetting,
      goLPList,
      goImageAccess,
    };
  },
};
</script>
<style lang="scss" scoped>
.drawer-content {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
}
.q-layout {
  background: transparent;
}
</style>
