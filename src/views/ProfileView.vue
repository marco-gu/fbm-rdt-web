<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable>
        <q-item-section avatar @click="home">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span class="title-text">Profile</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
      <div class="search q-pa-sm">
        <q-input v-model="search" outlined dense placeholder="Search" clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <div class="profile-list-container">
      <div>
        <q-list v-for="(item, index) in profileListDisplay" :key="index">
          <q-item clickable @click="onClickProfile(item)">
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.client }}</q-item-label>
              <q-item-label caption>{{ item.effectiveDate }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </q-list>
      </div>
      <q-pull-to-refresh @refresh="refresh">
        <q-list>
          <q-item> </q-item>
        </q-list>
      </q-pull-to-refresh>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { useStore } from "@/store";
const ProfileView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();
    let result: ProfileMaster[] = [];
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const search = ref("");

    const refresh = () => {
      bridge.call("refreshProfile", {}, () => {
        getProfileList();
      });
    };

    const onClickProfile = (profileItem: any) => {
      store
        .dispatch("profileModule/saveProfile", {
          profile: JSON.stringify(profileItem),
        })
        .then(() => {
          router.push("/lpSearch");
        });
      // router.push({
      //   name: "lpSearch",
      //   params: { profile: JSON.stringify(profileItem) },
      // });
    };
    const getProfileList = () => {
      const profileList = bridge.call("fetchProfile");
      result = JSON.parse(profileList) as ProfileMaster[];
      profileListDisplay.value = JSON.parse(profileList) as ProfileMaster[];
      if (result.length === 0) {
        $q.dialog({
          title: "Sync Profile",
          message: "Please synchronize the latest profiles",
        }).onOk(() => {
          refresh();
        });
      }
    };
    onMounted(() => {
      getProfileList();
    });
    watch(search, () => {
      if (search.value) {
        const filteredResult = result.filter(
          (item) =>
            item.client.toLowerCase().indexOf(search.value.toLowerCase()) > -1
        );

        profileListDisplay.value = filteredResult;
      } else {
        profileListDisplay.value = result;
      }
      console.log(profileListDisplay.value);
    });

    return {
      router,
      refresh,
      onClickProfile,
      profileListDisplay,
      search,
    };
  },
});
export default ProfileView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  // height: 60px;
  background-color: #ffffff;
  z-index: 1;
  .q-item {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
  }

  .title-text {
    font-size: 21px;
  }
}

// .profile-list-container {
// }
</style>
