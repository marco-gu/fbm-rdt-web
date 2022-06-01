<template>
  <q-layout view="lHh Lpr lFf" class="bg-white">
    <q-header elevated>
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
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <div class="drawer-content">
        <div>
          <q-list>
            <q-item-label header>Essential Links</q-item-label>
            <q-item clickable @click="goProfileManagement()">
              <q-item-section avatar>
                <q-icon name="business" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Client Scan Profile Management</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="assessment" />
              </q-item-section>
              <q-item-section>
                <q-item-label>LP Management </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="table_chart" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Data Management</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Setting </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="live_help" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Online Help </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div>
          <q-item clickable @click="logout()">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Logout</q-item-label>
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
export default {
  name: "HomeView",
  components: {},
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const isBackShow = ref(false);
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    const goProfileManagement = () => {
      isBackShow.value = true;
      router.push("/profileMgm");
    };
    const logout = () => {
      router.push("/");
    };
    const back = () => {
      router.go(-1);
      isBackShow.value = false;
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      goProfileManagement,
      back,
      isBackShow,
      logout,
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
