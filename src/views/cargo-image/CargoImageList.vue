<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('image.access_image_header')]"
      :icons="['back', 'home', 'search']"
      @onBack="back"
      @onHome="home"
      v-model:searchValue="search"
      @onOpenSearch="openSearch"
      @onCloseSearch="closeSearch"
    />
    <div class="page-content">
      <q-scroll-area
        ref="scrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <template v-else>
          <q-infinite-scroll @load="onLoad" :offset="20" ref="infiniteScroll">
            <div v-for="(item, index) in pageView" :key="index">
              <div
                class="common-card-2"
                @click="onDetail(item)"
                v-touch-hold:1800="handleHold"
              >
                <q-checkbox
                  v-show="isEditMode"
                  class="checkbox"
                  v-model="item.isSelected"
                  checked-icon="app:checkboxOn"
                  unchecked-icon="app:checkboxOff"
                />
                <div class="label mb-lg">
                  {{ item.cid }}
                </div>
                <div class="value">
                  {{ item.so }}<span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.po }}<span class="separator">&nbsp;|&nbsp;</span
                  >{{ item.clientCode }}
                </div>
                <div class="value mt-sm">
                  {{ item.createDatetime }}
                </div>
              </div>
            </div>
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </template>
          </q-infinite-scroll>
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        v-show="isEditMode"
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator v-show="isEditMode" vertical inset color="white" />
      <q-btn
        no-caps
        unelevated
        :ripple="false"
        class="full-width"
        :disable="isButtonDisabled"
        @click="onSubmit"
      >
        {{ label }}
      </q-btn>
    </div>
    <PopupComponent
      :visible="dialogVisible"
      :message="msg"
      :type="type"
      @close="onConfirmDialog"
      @cancel="dialogVisible = false"
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
import { defineComponent, onMounted } from "@vue/runtime-core";
import bridge from "dsbridge";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImageModel } from "../../models/image";
import {
  setContentHeight,
  setContentHeightInSearch,
  setContentHeightOutSearch,
  setContentHeightWithBtn,
} from "@/utils/screen.util";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { PAGESIZE } from "@/models/constant";
import { useI18n } from "vue-i18n";
import LoadingComponent from "@/components/LoadingComponent.vue";
import { useStore } from "@/store";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
const CargoImageList = defineComponent({
  components: {
    LoadingComponent,
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const i18n = useI18n();
    const router = useRouter();
    const store = useStore();
    const pageView = ref([] as ImageModel[]);
    const apiPageNumber = ref(0);
    const searchPageNumber = ref(0);
    const searchResult = ref([] as ImageModel[]);
    const apiResult = ref([] as ImageModel[]);
    const search = ref();
    const infiniteScroll = ref();
    const scrollArea = ref();
    const noRecord = ref(false);
    const input = ref();
    const loadingStatus = ref(false);
    const searchMode = ref(false);
    const dialogVisible = ref(false);
    const msg = ref("");
    const type = ref("");
    const label = ref(i18n.t("image.access_image_button"));
    const pressDelete = ref(false);
    const route = useRoute();
    const isEditMode = ref(false);
    const notifyVisible = ref(false);
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
      if (route.params.from) {
        apiResult.value = store.state.cargoImageModule.cargoImages;
        processData();
      } else {
        loadingStatus.value = true;
        setTimeout(() => {
          getData();
        }, 200);
      }
    });
    const onSubmit = () => {
      if (isEditMode.value) {
        pressDelete.value = true;
        showDeleteDialog();
      } else {
        store
          .dispatch("cargoImageModule/saveCargoImages", apiResult)
          .then(() => {
            router.push("/cargoImage");
          });
      }
    };
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      label.value = i18n.t("common.delete");
      setContentHeightWithBtn("scroll-area");
    };
    const onDetail = (item: ImageModel) => {
      const args = {
        cartonID: item.cid,
        taskID: item.taskID,
      };
      store.dispatch("cargoImageModule/saveCargoImages", apiResult).then(() => {
        bridge.call("enterCargoImage", args);
        router.push("/nativeBridge");
      });
    };
    const isButtonDisabled = computed(() => {
      return isEditMode.value == true
        ? !pageView.value.some((item: any) => item["isSelected"])
        : false;
    });
    const cancelEditMode = () => {
      isEditMode.value = false;
      label.value = i18n.t("image.access_image_button");
      clearCheckbox();
      setContentHeight("scroll-area");
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      pressDelete.value = true;
      msg.value = i18n.t("common.delete_dialog_message");
    };
    const onConfirmDialog = () => {
      if (pressDelete.value) {
        dialogVisible.value = false;
        let idList: any = [];
        pageView.value.forEach((item: any) => {
          if (item["isSelected"] == true) {
            idList.push(item.cartonID);
          }
        });
        const apiParams = {
          idList: idList,
        };
        bridge.call("deleteCartonProducts", apiParams, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            notifyVisible.value = true;
            msg.value = i18n.t("common.delete_success");
            scrollArea.value.setScrollPosition("vertical", 0);
            cancelEditMode();
            getData();
          }
        });
      }
    };
    const onLoad = (index: any, done: any) => {
      // setTimeout for more friendly UIUX?
      if (searchMode.value) {
        if (
          searchResult.value.length >
          (searchPageNumber.value + 1) * PAGESIZE
        ) {
          pageView.value = searchResult.value.slice(
            searchPageNumber.value * PAGESIZE,
            (searchPageNumber.value + 1) * PAGESIZE
          );
          searchPageNumber.value++;
        } else {
          pageView.value = searchResult.value.slice(
            0,
            searchResult.value.length
          );
          infiniteScroll.value.stop();
        }
        setTimeout(() => {
          done();
        }, 200);
      } else {
        // setTimeout for more friendly UIUX?
        if (apiResult.value.length > (apiPageNumber.value + 1) * PAGESIZE) {
          pageView.value = apiResult.value.slice(
            apiPageNumber.value * PAGESIZE,
            (apiPageNumber.value + 1) * PAGESIZE
          );
          apiPageNumber.value++;
        } else {
          pageView.value = apiResult.value.slice(0, apiResult.value.length);
          infiniteScroll.value.stop();
        }
        if (isEditMode.value) {
          clearCheckbox();
        }
        setTimeout(() => {
          done();
        }, 200);
      }
    };
    const getData = () => {
      bridge.call("retrieveCargoImages", {}, (data: any) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as ImageModel[];
        processData();
      });
    };
    const processData = () => {
      if (apiResult.value.length == 0) {
        noRecord.value = true;
        pageView.value = [];
      } else {
        if (apiResult.value.length > PAGESIZE) {
          pageView.value = apiResult.value.slice(0, PAGESIZE);
          apiPageNumber.value++;
          infiniteScroll.value.resume();
        } else {
          pageView.value = apiResult.value;
          infiniteScroll.value.stop();
        }
      }
    };
    watch(search, () => {
      if (search.value.length > 0) {
        onSearch();
      } else {
        onClear();
      }
    });
    const onClear = () => {
      search.value = "";
      searchMode.value = false;
      scrollArea.value.setScrollPosition("vertical", 0);
      processData();
    };
    const onSearch = () => {
      searchMode.value = true;
      if (apiResult.value.length > 0) {
        scrollArea.value.setScrollPosition("vertical", 0);
        searchResult.value = apiResult.value.filter(
          (item) =>
            item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
            item.po.toLowerCase().indexOf(search.value.toLowerCase()) > -1
        );
        if (searchResult.value.length > 0) {
          noRecord.value = false;
          if (searchResult.value.length > PAGESIZE) {
            pageView.value = searchResult.value.slice(0, PAGESIZE);
            searchPageNumber.value++;
            infiniteScroll.value.resume();
          } else {
            pageView.value = searchResult.value;
            infiniteScroll.value.stop();
          }
        } else {
          noRecord.value = true;
          pageView.value = [];
        }
      } else {
        noRecord.value = true;
        pageView.value = [];
      }
    };
    const home = () => {
      router.push("/home");
    };
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
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
      onClear,
      back,
      onDetail,
      onSubmit,
      search,
      onSearch,
      onLoad,
      infiniteScroll,
      noRecord,
      input,
      scrollArea,
      loadingStatus,
      pageView,
      isEditMode,
      home,
      handleHold,
      msg,
      type,
      dialogVisible,
      label,
      isButtonDisabled,
      cancelEditMode,
      onConfirmDialog,
      openSearch,
      closeSearch,
      notifyVisible,
      onCloseNotify,
    };
  },
});
export default CargoImageList;
</script>
