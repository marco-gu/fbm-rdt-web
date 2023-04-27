<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      style="
        background-color: #64b2d4;
        height: 13%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-top: 30px;
      "
    >
      <div style="width: 100%; margin: 0 auto; color: #fff; text-align: center">
        <!-- <q-btn
          style="position: absolute; left: 10px; color: #f6f3f1"
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          color="white"
        /> -->

        <q-img
          style="position: absolute; left: 20px; top: 54px"
          no-transition
          no-spinner
          :src="barWhiteIcon"
          @click="toggleLeftDrawer"
          width="20px"
        />

        <q-img no-transition no-spinner :src="maerskLogoIcon" width="46px" />
        <!-- <q-toolbar-title style="text-align: center">
          <q-img no-transition no-spinner :src="maerskLogoIcon" width="46px" />
        </q-toolbar-title> -->
      </div>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-grey-2">
      <div class="drawer-content">
        <div style="margin-top: 50px">
          <q-img
            no-transition
            no-spinner
            :src="barBlackIcon"
            width="24px"
            @click="onCloseMenu"
          />
        </div>
        <div>
          <q-list>
            <q-item clickable @click="goMyProfile()" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t("home.profile") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
            <q-item clickable @click="goDataManagement()" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t("home.data_management") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
            <q-item clickable @click="goLPList" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t("home.lp_list") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
            <q-item clickable @click="goImageAccess" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t("home.cargo_image") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label>{{ $t("home.user_manual") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator inset color="grey-3" />
          </q-list>
        </div>
        <div>
          <div @click="goSetting">
            <q-img no-transition no-spinner :src="gearIcon" width="24px" />
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
            >Version {{ appVersionName }}</span
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
          <!-- <q-icon name="close" v-close-popup /> -->
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
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="popupVisible = false"
    ></PopupComponent>
  </q-layout>
</template>
<script lang="ts">
import barBlack from "../assets/icon/bars-solid-black.svg";
import barWhite from "../assets/icon/bars-solid-white.svg";
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
import { useI18n } from "vue-i18n";
import menu from "../assets/images/bars-solid.svg";
import gear from "../assets/images/gear-solid.svg";
import doorOpen from "../assets/images/door-open-solid.svg";
import maerskLogo from "../assets/icon/Maersk.png";
import PopupComponent from "@/components/PopupComponent.vue";
import { VersionInfo } from "@/models/profile";
export default {
  name: "HomeView",
  components: {
    PopupComponent,
  },
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
    const menuIcon = menu;
    const barBlackIcon = barBlack;
    const barWhiteIcon = barWhite;
    const gearIcon = gear;
    const doorOpenIcon = doorOpen;
    const showLogoutDialog = ref(false);
    const maerskLogoIcon = maerskLogo;
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    const appVersionName = ref("");
    const onCloseMenu = () => {
      toggleLeftDrawer();
    };
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
    });
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    const goMyProfile = () => {
      router.push("/profileManagement");
    };
    const goDataManagement = () => {
      router.push("/dataMgmtList");
    };

    const logout = () => {
      showLogoutDialog.value = false;
      bridge.call("logout");
      bridge.call("goFirstPage", null, () => {
        router.push("/");
      });
      // bridge.call("logout", null, (data: string) => {
      //   const androidResponse = JSON.parse(
      //     data
      //   ) as AndroidResponse<LogoutResponse>;
      //   if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
      //     bridge.call("goFirstPage");
      //     router.push("/");
      //   } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
      //     type.value = "error";
      //     popupVisible.value = true;
      //     msg.value = i18n.t("messageCode." + androidResponse.messageCode);
      //   }
      // });
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
      showLogoutDialog,
      menuIcon,
      gearIcon,
      doorOpenIcon,
      onCloseMenu,
      maerskLogoIcon,
      barBlackIcon,
      barWhiteIcon,
      type,
      popupVisible,
      msg,
      appVersionName,
    };
  },
};
</script>
<style lang="scss" scoped>
.drawer-content {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 80%;
  font-size: 14px;
}
// .q-layout {
//   background: transparent;
// }
</style>
