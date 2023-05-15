<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'search']"
      @onBack="() => router.push('/dataMgmtDetail')"
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
        <div v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </div>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="infiniteScroll">
          <div v-for="(item, index) in pageView" :key="index">
            <div
              class="common-card-2"
              v-touch-hold:1800="handleHold"
              @click="onDetail(item)"
            >
              <q-checkbox
                class="checkbox"
                v-model="item.isSelected"
                v-if="isEditMode"
                checked-icon="app:checkboxOn"
                unchecked-icon="app:checkboxOff"
              />
              <div class="label mb-lg">
                {{ item.cartonId }}
              </div>
              <div class="value">
                {{ item.so }}<span class="separator">&nbsp;|&nbsp;</span
                >{{ item.po
                }}<span class="separator" v-if="item.sku">&nbsp;|&nbsp;</span
                >{{ item.sku }}
              </div>
              <div class="value mt-sm">
                {{ item.scanDate }}
              </div>
            </div>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button" v-show="isEditMode">
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        :ripple="false"
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.delete')"
        :disable="isButtonDisabled"
        @click="showDeleteDialog"
      />
    </div>
  </div>
  <PopupComponent
    :visible="dialogVisible"
    :message="msg"
    :type="type"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { Carton, CartonItem } from "@/models/profile";
import { useStore } from "@/store";
import bridge from "dsbridge";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import router from "@/router";
import { useI18n } from "vue-i18n";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  setContentHeight,
  setContentHeightInSearch,
  setContentHeightOutSearch,
  setContentHeightWithBtn,
} from "@/utils/screen.util";
import { useRoute } from "vue-router";
import { PAGESIZE } from "@/models/constant";
import LoadingComponent from "@/components/LoadingComponent.vue";
const DataMgmtCartonList = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const pageView = ref([] as Carton[]);
    const apiResult = ref([] as Carton[]);
    const searchResult = ref([] as Carton[]);
    const dataMgmt = ref(store.state.dataMgmtModule.dataMgmt);
    const titles = [dataMgmt.value.so, "Detail"];
    const noRecord = ref(false);
    const apiPageNumber = ref(0);
    const searchPageNumber = ref(0);
    const scrollArea = ref();
    const infiniteScroll = ref();
    const isEditMode = ref(false);
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pressHome = ref(false);
    const loadingStatus = ref(false);
    const route = useRoute();
    const searchMode = ref(false);
    const deleteDialogSuccess = ref(false);
    const search = ref("");
    onMounted(() => {
      setContentHeight("scroll-area");
      if (route.params.from) {
        apiResult.value = store.state.dataMgmtModule.cartonList;
        processData();
      } else {
        loadingStatus.value = true;
        // First time initial data, setTimeout for more friendly UIUX?
        setTimeout(() => {
          getData();
        }, 200);
      }
    });
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      setContentHeightWithBtn("scroll-area");
    };
    const onDetail = (item: Carton) => {
      if (!isEditMode.value) {
        const carton = {} as CartonItem;
        carton.client = dataMgmt.value.client;
        carton.so = dataMgmt.value.so;
        carton.po = dataMgmt.value.po;
        carton.sku = dataMgmt.value.sku || "";
        carton.operation = dataMgmt.value.scanType;
        carton.cartonID = item.cartonId;
        carton.scanDate = item.scanDate;
        carton.hub = item.hub;
        carton.quantity = item.quantity;
        carton.style = item.style;
        carton.lpID = item.lpId;
        store.dispatch("dataMgmtModule/saveCartonList", apiResult).then(() => {
          store.dispatch("dataMgmtModule/saveCartonItem", carton).then(() => {
            router.push("/dataMgmtCartonDetail");
          });
        });
      }
    };
    const isButtonDisabled = computed(() => {
      return !pageView.value.some((item: any) => item["isSelected"]);
    });
    const cancelEditMode = () => {
      clearCheckbox();
      isEditMode.value = false;
      setContentHeight("scroll-area");
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      deleteDialogSuccess.value = true;
      type.value = "action";
      msg.value = i18n.t("common.delete_dialog_message");
    };
    const showDeleteSuccessDialog = () => {
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.delete_success");
    };
    const onConfirmDialog = () => {
      if (deleteDialogSuccess.value) {
        alert(dialogVisible.value);
        dialogVisible.value = false;
      } else {
        if (pressHome.value) {
          router.push("/home");
        } else {
          dialogVisible.value = false;
          let idList: any = [];
          pageView.value.forEach((item: any) => {
            if (item["isSelected"] == true) {
              idList.push(item.lpId);
            }
          });
          const apiParams = {
            idList: idList,
          };
          bridge.call("deleteCartons", apiParams, (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              showDeleteSuccessDialog();
              scrollArea.value.setScrollPosition("vertical", 0);
              cancelEditMode();
              getData();
            }
          });
        }
      }
    };
    const onLoad = (index: any, done: any) => {
      // setTimeout for more friendly UIUX?
      if (searchMode.value) {
        if (
          searchResult.value.length >
          (searchPageNumber.value + 1) * PAGESIZE
        ) {
          const index = apiPageNumber.value + 1;
          pageView.value = searchResult.value.slice(0, index * PAGESIZE);
          searchPageNumber.value++;
        } else {
          pageView.value = searchResult.value.slice(
            0,
            searchResult.value.length
          );
          infiniteScroll.value.stop();
        }
        done();
      } else {
        // setTimeout for more friendly UIUX?
        if (apiResult.value.length > (apiPageNumber.value + 1) * PAGESIZE) {
          const index = apiPageNumber.value + 1;
          pageView.value = apiResult.value.slice(0, index * PAGESIZE);
          apiPageNumber.value++;
        } else {
          pageView.value = apiResult.value.slice(0, apiResult.value.length);
          infiniteScroll.value.stop();
        }
        if (isEditMode.value) {
          clearCheckbox();
        }
        done();
      }
    };
    const getData = () => {
      const args = {
        taskId: dataMgmt.value.taskID,
      };
      bridge.call("fetchLPByTaskIdForDataManagement", args, (data: string) => {
        loadingStatus.value = false;
        apiResult.value = JSON.parse(data) as Carton[];
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
            item.cartonId.toLowerCase().indexOf(search.value.toLowerCase()) > -1
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
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const openSearch = () => {
      setContentHeightInSearch("scroll-area");
    };
    const closeSearch = () => {
      setContentHeightOutSearch("scroll-area");
    };
    return {
      titles,
      pageView,
      onDetail,
      router,
      noRecord,
      handleHold,
      isEditMode,
      isButtonDisabled,
      showDeleteDialog,
      onConfirmDialog,
      cancelEditMode,
      dialogVisible,
      type,
      msg,
      home,
      scrollArea,
      onLoad,
      search,
      openSearch,
      closeSearch,
      infiniteScroll,
      loadingStatus,
    };
  },
});
export default DataMgmtCartonList;
</script>
