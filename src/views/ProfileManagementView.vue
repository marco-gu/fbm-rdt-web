<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('profile.profiles')]"
      :icons="
        !isEditMode ? ['back', 'search', 'home'] : ['back', 'home', 'empty']
      "
      @onHome="home"
      v-model:searchValue="search"
      @onBack="back"
      @onOpenSearch="openSearch"
      @onCloseSearch="closeSearch"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="isEditMode">
          <div class="edit-container">
            <div
              class="common-card-2"
              v-for="(item, index) in profileListDisplay"
              :key="index"
              v-touch-hold:1800="handleHold"
            >
              <q-checkbox
                class="checkbox"
                v-model="item.isSelected"
                checked-icon="app:checkboxOn"
                unchecked-icon="app:checkboxOff"
              />
              <div class="label">{{ item.profileCode }}</div>
              <div class="value">
                {{
                  item.updateDatetime
                    ? formatDate(new Date(item.updateDatetime))
                    : "-"
                }}
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <q-pull-to-refresh @refresh="refresh">
            <template v-if="noRecord">
              <div class="no-record">{{ $t("common.no_record") }}</div>
            </template>
            <div
              class="common-card-2"
              v-for="(item, index) in profileListDisplay"
              :key="index"
              v-touch-hold:1800="handleHold"
            >
              <div class="label">{{ item.profileCode }}</div>
              <div class="value">
                {{
                  item.updateDatetime
                    ? formatDate(new Date(item.updateDatetime))
                    : "-"
                }}
              </div>
            </div>
          </q-pull-to-refresh>
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button" v-show="isEditMode">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.delete')"
        :disable="isDeleteButtonDisabled"
        @click="showDeleteDialog"
      />
    </div>
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :messageCode="msgCode"
      :type="type"
      @close="onConfirmDialog"
      @cancel="popupVisible = false"
    ></PopupComponent>
    <NotifyComponent
      :visible="notifyVisible"
      :message="msg"
      @close="onCloseNotify"
    >
    </NotifyComponent>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import formatDate from "../utils/formatDate";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
import {
  setContentHeight,
  setContentHeightInSearch,
  setContentHeightOutSearch,
  setContentHeightWithBtn,
} from "@/utils/screen.util";
const ProfileManagementView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    NotifyComponent,
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const search = ref("");
    const isEditMode = ref(false);
    let result: ProfileMaster[] = [];
    const isFirstSync = ref(true);
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const noRecord = ref(false);
    const type = ref("");
    const msg = ref("");
    const msgCode = ref("");
    const popupVisible = ref(false);
    const notifyVisible = ref(false);
    const pressHome = ref(false);
    const pressDelete = ref(false);
    onMounted(() => {
      setContentHeight("scroll-area");
      getProfileList("onMounted");
    });
    const sortProfileList = (profileListDisplay: any[]) => {
      profileListDisplay.sort((a: any, b: any) => {
        return (a.profileCode + "").localeCompare(b.profileCode + "");
      });
    };
    const getProfileList = (mode: string) => {
      bridge.call("fetchProfile", null, (res: string) => {
        result = JSON.parse(res) as ProfileMaster[];
        profileListDisplay.value = JSON.parse(res) as ProfileMaster[];
        if (result.length === 0) {
          if (isFirstSync.value) {
            popupVisible.value = true;
            type.value = "info";
            msg.value = i18n.t("profile.sync_latest");
          } else {
            noRecord.value = true;
          }
        } else {
          noRecord.value = false;
          sortProfileList(profileListDisplay.value);
          if (!isFirstSync.value && mode != "delete") {
            notifyVisible.value = true;
            msg.value = i18n.t("profile.sync_complete");
          }
          isFirstSync.value = false;
        }
      });
    };
    const home = () => {
      if (isEditMode.value) {
        pressHome.value = true;
        popupVisible.value = true;
        type.value = "action";
        msg.value = i18n.t("common.return_home");
      } else {
        router.push({
          path: "/home",
        });
      }
    };
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    const refresh = (done: any) => {
      if (!isEditMode.value) {
        bridge.call("refreshProfile", null, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<
            ProfileMaster[]
          >;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            isFirstSync.value = false;
            getProfileList("refresh");
            bridge.call("setProfileLastSyncDate", {
              formatDate: formatDate(new Date()),
            });
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            type.value = "error";
            popupVisible.value = true;
            msg.value = i18n.t("messageCode." + androidResponse.messageCode);
            msgCode.value = androidResponse.messageCode;
          }
          if (typeof done === "function") {
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
        if (filteredResult.length > 0) {
          noRecord.value = false;
        } else {
          noRecord.value = true;
        }
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
      setContentHeightWithBtn("scroll-area");
    };
    const deleteProfile = () => {
      // profileName is business primary key
      let profileNameList: any = [];
      profileListDisplay.value.forEach((item: any) => {
        if (item["isSelected"]) {
          profileNameList.push(item.profileName);
        }
      });
      if (profileNameList.length > 0) {
        const args = {
          profileNameList: profileNameList,
        };
        bridge.call("deleteProfile", args, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            isEditMode.value = false;
            getProfileList("delete");
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            type.value = "error";
            popupVisible.value = true;
            msg.value = i18n.t("messageCode." + androidResponse.messageCode);
            msgCode.value = androidResponse.messageCode;
          }
        });
      } else {
        type.value = "error";
        popupVisible.value = true;
        msg.value = i18n.t("messageCode.E93-04-0004");
        msgCode.value = "E93-04-0004";
      }
    };
    const cancelEditMode = () => {
      isEditMode.value = false;
      setContentHeight("scroll-area");
    };
    const isDeleteButtonDisabled = computed(() => {
      return !profileListDisplay.value.some((item: any) => item["isSelected"]);
    });
    const openSearch = () => {
      setContentHeightInSearch("scroll-area");
    };
    const closeSearch = () => {
      setContentHeightOutSearch("scroll-area");
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
    };
    const onConfirmDialog = () => {
      if (isFirstSync.value) {
        refresh(0);
      } else if (pressHome.value) {
        router.push("/home");
      } else if (pressDelete.value) {
        deleteProfile();
        pressDelete.value = false;
      }
      popupVisible.value = false;
    };
    const showDeleteDialog = () => {
      popupVisible.value = true;
      type.value = "action";
      pressDelete.value = true;
      msg.value = i18n.t("common.delete_dialog_message");
    };
    return {
      cancelEditMode,
      showDeleteDialog,
      back,
      home,
      deleteProfile,
      formatDate,
      handleHold,
      isEditMode,
      isFirstSync,
      profileListDisplay,
      refresh,
      search,
      noRecord,
      type,
      popupVisible,
      notifyVisible,
      onCloseNotify,
      onConfirmDialog,
      msg,
      msgCode,
      router,
      isDeleteButtonDisabled,
      openSearch,
      closeSearch,
    };
  },
});
export default ProfileManagementView;
</script>
<style lang="scss" scoped>
.card-item-labels {
  text-align: left;
  .card-item-date-text {
    margin-top: $--card-item-text-space-between;
    color: $--card-item-date-text-color;
  }
}
.edit-container {
  padding-bottom: 20px;
}
.scroll-area {
  padding-bottom: 35px;
}
</style>
