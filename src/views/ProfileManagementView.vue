<template>
  <div class="wrapper">
    <div class="header">
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
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="searchPlaceHolder"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <div class="profile-list-container" v-if="isEditMode">
      <q-list v-for="(item, index) in profileListDisplay" :key="index">
        <q-item>
          <q-item-section side>
            <q-checkbox v-model="item.isSelected" />
          </q-item-section>
          <q-item-section style="text-align: left">
            <q-item-label>{{ item.profileCode }}</q-item-label>
            <q-item-label caption>{{ item.updateDatetime }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
      </q-list>
    </div>
    <div class="profile-list-container" v-else v-touch-hold:1800="handleHold">
      <q-pull-to-refresh @refresh="refresh">
        <q-list v-for="(item, index) in profileListDisplay" :key="index">
          <q-item>
            <q-item-section style="text-align: left">
              <q-item-label>{{ item.profileCode }}</q-item-label>
              <q-item-label caption>{{ item.updateDatetime }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator spaced inset />
        </q-list>
      </q-pull-to-refresh>
    </div>
    <div class="bottom" v-show="isEditMode">
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        :label="deleteLabel"
        @click="deleteProfile"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 52%"
        flat
        type="submit"
        push
        :label="cancelLabel"
        @click="cancelEditMode"
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
import { useI18n } from "@/plugin/i18nPlugins";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
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
    const pageTitle = ref("");
    const searchPlaceHolder = ref("");
    const deleteLabel = ref("");
    const cancelLabel = ref("");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
      i18n.category.value = "ProfileManagementView";
      pageTitle.value = i18n.$t("pageTitle");
      searchPlaceHolder.value = i18n.$t("searchPlaceHolder");
      deleteLabel.value = i18n.$t("deleteLabel");
      cancelLabel.value = i18n.$t("cancelLabel");
    });
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
              title: "Sync Profile",
              message: "Please synchronize the latest profiles",
              noBackdropDismiss: true,
            }).onOk(() => {
              refresh(() => void 0);
            });
          } else {
            $q.dialog({
              title: "Sync Profile",
              message: "No profile found for this user.",
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
            popupSuccessMsg($q, "Synchronize completed!");
            isFirstSync = false;
            done();
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            i18n.category.value = "MessageCode";
            const message = i18n.$t(androidResponse.messageCode);
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
            i18n.category.value = "MessageCode";
            const message = i18n.$t(androidResponse.messageCode);
            popupErrorMsg($q, message);
          }
        });
      } else {
        i18n.category.value = "MessageCode";
        const message = i18n.$t("E93-04-0004");
        popupErrorMsg($q, message);
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
    };
    return {
      cancelEditMode,
      cancelLabel,
      back,
      deleteLabel,
      deleteProfile,
      pageTitle,
      handleHold,
      home,
      isEditMode,
      profileListDisplay,
      refresh,
      router,
      search,
      searchPlaceHolder,
    };
  },
});
export default ProfileManagementView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
  .header {
    position: sticky;
    top: 0;
    width: 100%;
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
  .bottom {
    position: fixed;
    bottom: 0px;
    display: flex;
    background: #42b0d5;
    color: white;
    width: 100%;
    height: 50px;
  }
}
</style>
