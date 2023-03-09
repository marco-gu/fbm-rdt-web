<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
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
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="isEditMode">
          <div class="edit-container">
            <q-list v-for="(item, index) in profileListDisplay" :key="index">
              <div class="card-edit-container">
                <q-checkbox
                  v-model="item.isSelected"
                  checked-icon="app:checkboxOn"
                  unchecked-icon="app:checkboxOff"
                />
                <q-item class="card-edit-item">
                  <q-item-section class="card-item-labels">
                    <q-item-label>{{ item.profileCode }}</q-item-label>
                    <q-item-label class="card-item-date-text">
                      {{ formatDate(new Date(item.updateDatetime)) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
          </div>
        </template>
        <template v-else>
          <q-pull-to-refresh @refresh="refresh">
            <template
              v-if="profileListDisplay.length === 0 && !isFirstSync.value"
            >
              <div class="no-data">
                {{ $t("profile.no_profile") }}
              </div>
            </template>
            <template v-else>
              <q-list v-for="(item, index) in profileListDisplay" :key="index">
                <q-item class="card-item" v-touch-hold:1800="handleHold">
                  <q-item-section class="card-item-labels">
                    <q-item-label>{{ item.profileCode }}</q-item-label>
                    <q-item-label class="card-item-date-text">
                      {{ formatDate(new Date(item.updateDatetime)) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-pull-to-refresh>
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" v-show="isEditMode">
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
        @click="deleteProfile"
      />
    </div>
    <q-dialog v-model="dialogVisible" persistent>
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("profile.sync_profile") }}
        </div>
        <div class="dialog-container__content">
          {{ $t("profile.sync_latest") }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button confirm" @click="refresh">
            {{ $t("common.ok") }}
          </button>
        </div>
      </div>
    </q-dialog>
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
import formatDate from "../utils/formatDate";
import HeaderComponent from "@/components/HeaderComponent.vue";
const ProfileManagementView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const i18n = useI18n();
    const search = ref("");
    const isEditMode = ref(false);
    let result: ProfileMaster[] = [];
    const isFirstSync = ref(true);
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const titleParam = i18n.t("profile.profile");
    const dialogVisible = ref(false);
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
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
            dialogVisible.value = true;
          }
        } else {
          sortProfileList(profileListDisplay.value);
          if (!isFirstSync.value && mode != "delete") {
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
    const refresh = (done: any) => {
      if (!isEditMode.value) {
        bridge.call("refreshProfile", null, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<
            ProfileMaster[]
          >;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            getProfileList("refresh");
            isFirstSync.value = false;
            bridge.call("setProfileLastSyncDate", {
              formatDate: formatDate(new Date()),
            });
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
          }
          dialogVisible.value = false;
          done();
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
      dialogVisible,
      formatDate,
      handleHold,
      isEditMode,
      isFirstSync,
      profileListDisplay,
      refresh,
      search,
      titleParam,
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
  margin-top: 15px;
  .card-edit-container {
    padding: 0px 15px 0px 0px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .card-edit-item {
      @extend .card-item;
      flex: 5;
    }
  }
}
</style>
