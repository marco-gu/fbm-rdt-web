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
      <div class="search" v-show="!isEditMode">
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
    <div class="edit-list-container" v-if="isEditMode">
      <q-list v-for="(item, index) in profileListDisplay" :key="index">
        <div class="item-container row">
          <q-checkbox
            v-model="item.isSelected"
            checked-icon="app:checkboxOn"
            unchecked-icon="app:checkboxOff"
          />
          <q-item class="item">
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
    <div class="list-container" v-else v-touch-hold:1800="handleHold">
      <q-pull-to-refresh @refresh="refresh">
        <div
          v-if="profileListDisplay.length === 0 && !isFirstSync"
          class="no-data"
        >
          {{ $t("profile.no_profile") }}
        </div>
        <template v-else>
          <q-list v-for="(item, index) in profileListDisplay" :key="index">
            <q-item class="item">
              <q-item-section class="item-labels">
                <q-item-label>{{ item.profileCode }}</q-item-label>
                <q-item-label class="sub-text">{{
                  item.updateDatetime
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-pull-to-refresh>
    </div>
    <div class="button-bottom" v-show="isEditMode">
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
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
import formateDate from "../utils/formatDate";
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
          }
        } else {
          sortProfileList(profileListDisplay.value);
          if (!isFirstSync) {
            popupSuccessMsg($q, i18n.t("profile.sync_complete"));
          }
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
            isFirstSync = false;
            bridge.call("setProfileLastSyncDate", {
              formatDate: formateDate(new Date()),
            });
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
.list-container {
  .item {
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
  }
}
.edit-list-container {
  .item-container {
    margin: 0 23px 23px 13px;
    justify-content: space-between;
    .item {
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
      margin-top: 9px;
    }
  }
}
.button-bottom {
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
