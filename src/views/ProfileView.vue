<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component> -->
    <common-header-component
      :titles="[$t('profile.profiles')]"
      :icons="['back', 'search', 'home']"
      @onHome="homePopup = true"
      @onBack="() => router.push('/home')"
      v-model:searchValue="search"
      @onOpenSearch="openSearch"
      @onCloseSearch="closeSearch"
    />
    <div class="page-content">
      <!-- <div class="search">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div> -->
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="profileListDisplay.length === 0 && !isFirstSync">
            <!-- <div class="no-data">
              {{ $t("common.no_record") }}
            </div> -->
          </template>
          <template v-else>
            <div class="scroll-area">
              <div
                class="common-card-2"
                v-for="(item, index) in profileListDisplay"
                :key="index"
                @click="onClickProfile(item)"
              >
                <div class="label mb-lg">{{ item.profileCode }}</div>
                <div class="value">
                  {{ formatDate(new Date(item.updateDatetime)) }}
                </div>
              </div>
              <!-- <q-item class="card-item" clickable @click="onClickProfile(item)">
                <q-item-section class="card-item-labels">
                  <q-item-label>{{ item.profileCode }}</q-item-label>
                  <q-item-label class="card-item-date-text">
                    {{ formatDate(new Date(item.updateDatetime)) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="black" />
                </q-item-section>
              </q-item> -->
            </div>
          </template>
        </q-pull-to-refresh>
      </q-scroll-area>
    </div>
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      :messageCode="msgCode"
      @close="popupVisible = false"
    ></PopupComponent>
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
  <PopupComponent
    :visible="homePopup"
    :message="$t('common.return_home')"
    :type="'action'"
    @close="
      () => {
        homePopup = false;
        router.push('/home');
      }
    "
    @cancel="homePopup = false"
  />
  <NotifyComponent
    :visible="notifyVisible"
    :message="msg"
    @close="onCloseNotify"
  >
  </NotifyComponent>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ProfileMaster } from "../models/profile";
import { useStore } from "@/store";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { useI18n } from "vue-i18n";
import formatDate from "../utils/formatDate";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import rotate from "../assets/icon/rotate-solid.svg";
import PopupComponent from "@/components/PopupComponent.vue";
import LoadingComponent from "@/components/LoadingComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
import {
  setContentHeight,
  setContentHeightInSearch,
  setContentHeightOutSearch,
} from "@/utils/screen.util";
const ProfileView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
    NotifyComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    let isFirstSync = ref(true);
    const store = useStore();
    const backUrlParam = "/home";
    let result: ProfileMaster[] = [];
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const search = ref("");
    const dialogVisible = ref(false);
    const rotateIcon = rotate;
    const type = ref("");
    const msg = ref("");
    const msgCode = ref("");
    const popupVisible = ref(false);
    const loadingStatus = ref(false);
    const homePopup = ref(false);
    const notifyVisible = ref(false);
    const refresh = (done: any) => {
      loadingStatus.value = true;
      bridge.call("refreshProfile", null, (res: string) => {
        loadingStatus.value = false;
        const androidResponse = JSON.parse(res) as AndroidResponse<
          ProfileMaster[]
        >;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          getProfileList();
          isFirstSync.value = false;
          bridge.call("setProfileLastSyncDate", {
            formatDate: formatDate(new Date()),
          });
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          type.value = "error";
          popupVisible.value = true;
          msg.value = i18n.t("messageCode." + androidResponse.messageCode);
          msgCode.value = androidResponse.messageCode;
        }
        dialogVisible.value = false;
        done();
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
      bridge.call("fetchProfile", (res: string) => {
        result = JSON.parse(res) as ProfileMaster[];
        profileListDisplay.value = JSON.parse(res) as ProfileMaster[];
        if (result.length === 0) {
          if (isFirstSync.value) {
            dialogVisible.value = true;
          }
        } else {
          sortProfileList(profileListDisplay.value);
          if (!isFirstSync.value) {
            notifyVisible.value = true;
            msg.value = i18n.t("profile.sync_complete");
          }
        }
      });
    };
    onMounted(() => {
      const deviceHeight = store.state.screenModule.screenHeight;
      setContentHeight("scroll-area", deviceHeight);
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
    const openSearch = () => {
      setContentHeightInSearch("scroll-area");
    };
    const closeSearch = () => {
      setContentHeightOutSearch("scroll-area");
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
    };
    return {
      formatDate,
      isFirstSync,
      onClickProfile,
      profileListDisplay,
      refresh,
      router,
      search,
      backUrlParam,
      dialogVisible,
      notifyVisible,
      rotateIcon,
      type,
      popupVisible,
      msg,
      loadingStatus,
      msgCode,
      homePopup,
      openSearch,
      closeSearch,
      onCloseNotify,
    };
  },
});
export default ProfileView;
</script>
<style lang="scss" scoped>
.card-item-labels {
  text-align: left;
  .card-item-date-text {
    margin-top: $--card-item-text-space-between;
    color: $--card-item-date-text-color;
  }
}
.no-data {
  text-align: center;
  width: 100%;
}
.scroll-area {
  margin-bottom: 30px;
}
</style>
