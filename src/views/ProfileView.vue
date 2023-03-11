<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
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
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-pull-to-refresh @refresh="refresh">
          <template v-if="profileListDisplay.length === 0 && !isFirstSync">
            <div class="no-data">
              {{ $t("common.no_record") }}
            </div>
          </template>
          <template v-else>
            <q-list v-for="(item, index) in profileListDisplay" :key="index">
              <q-item class="card-item" clickable @click="onClickProfile(item)">
                <q-item-section class="card-item-labels">
                  <q-item-label>{{ item.profileCode }}</q-item-label>
                  <q-item-label class="card-item-date-text">
                    {{ formatDate(new Date(item.updateDatetime)) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="black" />
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-pull-to-refresh>
      </q-scroll-area>
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
import formatDate from "../utils/formatDate";
import HeaderComponent from "@/components/HeaderComponent.vue";
const ProfileView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const i18n = useI18n();
    let isFirstSync = ref(true);
    const store = useStore();
    const titleParam = i18n.t("profile.profile");
    const backUrlParam = "/home";
    let result: ProfileMaster[] = [];
    const profileListDisplay: Ref<ProfileMaster[]> = ref([]);
    const search = ref("");
    const dialogVisible = ref(false);
    const refresh = (done: any) => {
      bridge.call("refreshProfile", null, (res: string) => {
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
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
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
            popupSuccessMsg($q, i18n.t("profile.sync_complete"));
          }
        }
      });
    };
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
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
      formatDate,
      isFirstSync,
      onClickProfile,
      profileListDisplay,
      refresh,
      router,
      search,
      titleParam,
      backUrlParam,
      dialogVisible,
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
</style>
