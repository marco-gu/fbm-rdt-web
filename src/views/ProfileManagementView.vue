<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("profile.profile") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
      <div class="search">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <!-- <div class="header">
      <q-item clickable>
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span class="title-text">{{ pageTitle }}</span></q-item-section
        >
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
      <div class="search q-pa-sm" v-show="!isEditMode">
=======
      <q-toolbar class="common-toolbar">
        <q-btn flat round dense icon="arrow_back" @click="home" />
        <q-toolbar-title :shrink="false">
          {{ $t("profile.profile") }}
        </q-toolbar-title>
        <q-space />
        <q-btn flat round dense icon="home" @click="home" />
      </q-toolbar>
      <div class="search" v-show="!isEditMode">
>>>>>>> 8179849ab2723795a32c9223611c5b17a276271a
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div> -->
    <div class="profile-list-container" v-if="isEditMode">
      <q-list v-for="(item, index) in profileListDisplay" :key="index">
        <div class="edit-item-container row">
          <q-checkbox
            class="item-checkbox"
            color="black"
            v-model="item.isSelected"
          />
          <q-item class="list-item-edit">
            <q-item-section class="item-labels">
              <q-item-label>{{ item.profileCode }}</q-item-label>
              <q-item-label class="sub-text">{{
                item.updateDatetime
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </div>
    <div class="profile-list-container" v-else v-touch-hold:1800="handleHold">
      <q-pull-to-refresh @refresh="refresh">
        <q-list v-for="(item, index) in profileListDisplay" :key="index">
          <q-item class="list-item">
            <q-item-section class="item-labels">
              <q-item-label>{{ item.profileCode }}</q-item-label>
              <q-item-label class="sub-text">{{
                item.updateDatetime
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-pull-to-refresh>
    </div>
    <div class="button-container" v-show="isEditMode">
      <q-btn
        no-caps
        style="width: 50%"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 50%"
        flat
        push
        :label="$t('common.delete')"
        @click="deleteProfile"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { useI18n } from "vue-i18n";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const ProfileManagementView = defineComponent({
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const i18n = useI18n();
    const search = ref("");
    const isEditMode = ref(false);
    let result: ProfileMaster[] = [];
    let isFirstSync = true;
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    onMounted(() => {
      getProfileList();
    });
    const sortProfileList = (profileListDisplay: any[]) => {
      profileListDisplay.sort((a: any, b: any) => {
        return (a.profileCode + "").localeCompare(b.profileCode + "");
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
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    const home = () => {
      router.push("/home");
    };
    const refresh = (done: any) => {
      if (!isEditMode.value) {
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
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
            done();
          }
        });
      }
    };
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
    const updateProfileListDisplay = () => {
      profileListDisplay.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const handleHold = () => {
      updateProfileListDisplay();
      isEditMode.value = true;
    };
    const deleteProfile = () => {
      let profileCodeList: any = [];
      profileListDisplay.value.forEach((item: any) => {
        if (item["isSelected"]) {
          profileCodeList.push(item.profileCode);
        }
      });
      if (profileCodeList.length > 0) {
        const args = {
          profileCodeList: profileCodeList,
        };
        bridge.call("deleteProfile", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            isEditMode.value = false;
            getProfileList();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
          }
        });
      } else {
        const message = i18n.t("messageCode.E93-04-0004");
        popupErrorMsg($q, message);
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    return {
      cancelEditMode,
      back,
      deleteProfile,
      handleHold,
      home,
      isEditMode,
      profileListDisplay,
      refresh,
      router,
      search,
      homeIcon,
      arrowIcon,
    };
  },
});
export default ProfileManagementView;
</script>
<style lang="scss" scoped>
.list-item {
  margin: 0 23px 23px 23px;
  padding: 8px 15px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  font-size: 15px;
  .item-labels {
    text-align: left;
    color: black;
    .sub-text {
      margin-top: 8px;
      color: #757575;
    }
  }
  &:first-of-type {
    margin-top: 5px;
  }
}
.edit-item-container {
  margin: 0 23px 23px 15px;
  .item-checkbox {
    margin-right: 8px;
    border-radius: 3px;
  }
  .list-item-edit {
    width: 87%;
    padding: 8px 15px;
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
    font-size: 15px;
    .item-labels {
      text-align: left;
      color: black;
      .sub-text {
        margin-top: 8px;
        color: #757575;
      }
    }
  }
  &:first-of-type {
    margin-top: 5px;
  }
}
.button-container {
  display: flex;
  position: fixed;
  margin-left: 23px;
  bottom: 30px;
  width: 88%;
  height: 49px;
  border-radius: 3px;
  background: #42b0d5;
  color: white;
  font-size: 20px;
}
</style>
