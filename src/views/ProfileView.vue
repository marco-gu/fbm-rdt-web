<template>
  <div class="wrapper">
    <div class="header">
      <q-toolbar class="common-toolbar">
        <q-btn flat round dense icon="arrow_back" @click="home" />
        <q-toolbar-title :shrink="false">
          {{ $t("profile.profile") }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="home" @click="home" />
      </q-toolbar>
      <div class="search">
        <q-input v-model="search" outlined dense placeholder="Search" clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <div class="profile-list-container">
      <q-pull-to-refresh @refresh="refresh">
        <q-list v-for="(item, index) in profileListDisplay" :key="index">
          <q-item class="list-item" clickable @click="onClickProfile(item)">
            <q-item-section class="item-labels">
              <q-item-label>{{ item.profileCode }}</q-item-label>
              <q-item-label class="sub-text">{{
                item.updateDatetime
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-pull-to-refresh>
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { useStore } from "@/store";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { useI18n } from "vue-i18n";
const ProfileView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    let isFirstSync = true;
    const store = useStore();
    let result: ProfileMaster[] = [];
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const search = ref("");
    const refresh = (done: any) => {
      bridge.call("refreshProfile", null, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<
          ProfileMaster[]
        >;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          getProfileList();
          popupSuccessMsg($q, i18n.t("profile.sync_complete"));
          isFirstSync = false;
          done();
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
          done();
        }
      });
    };
    const sortProfileList = (profileListDisplay: any[]) => {
      profileListDisplay.sort((a: any, b: any) => {
        return (a.profileCode + "").localeCompare(b.profileCode + "");
      });
    };
    const onClickProfile = (profileItem: any) => {
      store
        .dispatch("profileModule/saveProfile", {
          profile: JSON.stringify(profileItem),
        })
        .then(() => {
          localStorage.setItem("profile", JSON.stringify(profileItem));
          const page = route.params.id;
          router.push("/lpSearch/" + page);
        });
    };
    const getProfileList = () => {
      bridge.call("fetchProfile", null, (res: string) => {
        result = JSON.parse(res) as ProfileMaster[];
        profileListDisplay.value = JSON.parse(res) as ProfileMaster[];
        if (result.length === 0) {
          if (isFirstSync) {
            $q.dialog({
              title: i18n.t("profile.sync_profile"),
              message: i18n.t("profile.sync_latest"),
              noBackdropDismiss: true,
            }).onOk(() => {
              refresh(() => void 0);
            });
          } else {
            $q.dialog({
              title: i18n.t("profile.sync_profile"),
              message: i18n.t("profile.no_profile"),
            }).onCancel(() => {
              void 0;
            });
          }
        } else {
          sortProfileList(profileListDisplay.value);
        }
      });
    };
    onMounted(() => {
      // Initialize
      getProfileList();
    });
    watch(search, () => {
      if (search.value) {
        const filteredResult = result.filter(
          (item) =>
            item.profileCode.toLowerCase().indexOf(search.value.toLowerCase()) >
            -1
        );
        profileListDisplay.value = filteredResult;
      } else {
        profileListDisplay.value = result;
      }
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
  height: 100%;
  position: relative;
}
.header {
  position: sticky;
  top: 0;
  width: 100%;
  // height: 60px;
  z-index: 1;
  background-image: url("../assets/images/lns_bg.png");
  background-size: cover;
  .q-item {
    height: 60px;
    width: 100%;
  }
  .title-text {
    font-size: 20px;
  }
  .search {
    margin: 0 20px;
    background-color: #ffffff;
  }
}
.list-item {
  margin: 20px;
  padding: 15px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  font-size: 16px;
  .item-labels {
    text-align: left;
    color: black;
    .sub-text {
      color: #757575;
      font-size: 14px;
    }
  }
}
</style>
