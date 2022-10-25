<template>
  <q-layout view="lHh Lpr lFf" class="bg-white">
    <!-- <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
        />
        <q-toolbar-title>LNS</q-toolbar-title>
        <q-btn
          v-if="isBackShow"
          flat
          dense
          round
          @click="back()"
          icon="arrow_back"
        />
      </q-toolbar>
    </q-header> -->
    <q-drawer v-model="leftDrawerOpen" show-if-above class="bg-grey-2">
      <div class="drawer-content">
        <div>
          <q-list>
            <q-item style="background-color: #42b0d5">
              <q-img :src="logoIcon" />
            </q-item>
            <q-item clickable @click="goMyProfile()" v-ripple>
              <q-item-section avatar>
                <q-img :src="userProfileIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>My Client Profile</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="goDataManagement()" v-ripple>
              <q-item-section avatar>
                <q-img :src="dataManagementIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>Data Management</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-img :src="lpListIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>LP List</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-img :src="cargoImageIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>Cargo Images</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-img :src="settingIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>Setting</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-img :src="userManualIcon" />
              </q-item-section>
              <q-item-section avatar>
                <q-item-label>User Manual</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-img :src="logoutIcon" />
            </q-item-section>
            <q-item-section avatar @click="logout()">
              <q-item-label>Log out</q-item-label>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import { AndroidResponse } from "@/models/android.response";
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
export default {
  name: "HomeView",
  components: {},
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const isBackShow = ref(false);
    const userProfileIcon = userProfile;
    const dataManagementIcon = dataManagement;
    const lpListIcon = lpList;
    const cargoImageIcon = cargoImage;
    const settingIcon = setting;
    const userManualIcon = userManual;
    const logoutIcon = logOut;
    const logoIcon = logo;
    const $q = useQuasar();
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    const goMyProfile = () => {
      isBackShow.value = true;
      alert("My Client Profile");
    };
    const goDataManagement = () => {
      alert("Data Management");
    };
    const logout = () => {
      bridge.call("logout", null, (data: string) => {
        const apiResponse = JSON.parse(data) as AndroidResponse<LogoutResponse>;
        if (apiResponse.data.isSuccess) {
          $q.notify({
            position: "center",
            color: "blue-5",
            textColor: "white",
            icon: "info",
            timeout: 2000,
            message: "Logout success",
          });
          router.push("/");
        } else {
          $q.notify({
            position: "center",
            color: "red-5",
            textColor: "white",
            icon: "error",
            timeout: 2000,
            message: apiResponse.messageCode,
          });
        }
      });
    };
    const back = () => {
      router.go(-1);
      isBackShow.value = false;
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      goMyProfile,
      back,
      goDataManagement,
      logout,
      isBackShow,
      userProfileIcon,
      dataManagementIcon,
      lpListIcon,
      cargoImageIcon,
      settingIcon,
      userManualIcon,
      logoutIcon,
      logoIcon,
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
</style>
