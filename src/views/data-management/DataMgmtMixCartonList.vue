<template>
  <LoadingComponent :visible="loadingStatus"> </LoadingComponent>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="() => router.push('/dataMgmtCartonDetail')"
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
        <div v-for="(item, index) in pageView" :key="index">
          <div
            class="common-card-2"
            @click="onDetail(item)"
            v-touch-hold:1800="handleHold"
          >
            <q-checkbox
              class="checkbox"
              v-model="item.isSelected"
              v-if="isEditMode"
              checked-icon="app:checkboxOn"
              unchecked-icon="app:checkboxOff"
            />
            <div class="label mb-lg">
              {{ item.displayName }}
            </div>
            <div class="value">
              {{ item.attribute.upc }}
            </div>
            <div class="value mt-sm">
              {{ item.attribute.style
              }}<span class="separator" v-if="item.attribute.color"
                >&nbsp;|&nbsp;</span
              >{{ item.attribute.color
              }}<span class="separator" v-if="item.attribute.size"
                >&nbsp;|&nbsp;</span
              >{{ item.attribute.size }}
              <span class="separator" v-if="item.attribute.quantity"
                >&nbsp;|&nbsp;</span
              >{{ item.attribute.quantity }}
            </div>
          </div>
        </div>
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
import { ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import { ProfileElementLevel } from "@/utils/profile.render";
import bridge from "dsbridge";
import { computed, defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useI18n } from "vue-i18n";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { setContentHeightWithBtn } from "@/utils/screen.util";
import LoadingComponent from "@/components/LoadingComponent.vue";
const DataMgmtMixCartonList = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    LoadingComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const label = ref(i18n.t("dataManagement.add"));
    const titles = [store.state.dataMgmtModule.cartonItem.cartonID, "Detail"];
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const pageView = ref([] as any[]);
    const isEditMode = ref(false);
    const pressDelete = ref(false);
    const pressHome = ref(false);
    const noRecord = ref(false);
    const deleteDialogSuccess = ref(false);
    const scrollArea = ref();
    const loadingStatus = ref(false);
    onBeforeMount(() => {
      loadingStatus.value = true;
      setTimeout(() => {
        getData();
      }, 200);
    });
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
    });
    const onSubmit = () => {
      if (isEditMode.value) {
        pressDelete.value = true;
        showDeleteDialog();
      } else {
        router.push({
          name: "dataMgmtMixCarton",
          params: {
            profileName: store.state.dataMgmtModule.dataMgmt.profileName,
            cartonID: store.state.dataMgmtModule.cartonItem.cartonID,
            taskID: store.state.dataMgmtModule.dataMgmt.taskID,
            scanType: store.state.dataMgmtModule.dataMgmt.scanType,
            itemCount: pageView.value.length + 1,
          },
        });
      }
    };
    const handleHold = () => {
      clearCheckbox();
      isEditMode.value = true;
      label.value = i18n.t("common.delete");
      setContentHeightWithBtn("scroll-area");
    };
    const onDetail = (item: any) => {
      if (!isEditMode.value) {
        store.dispatch("dataMgmtModule/saveMixCartonItem", item).then(() => {
          router.push({
            name: "dataMgmtMixCartonDetail",
            params: {
              cartonID: store.state.dataMgmtModule.cartonItem.cartonID,
            },
          });
        });
      }
    };
    const isButtonDisabled = computed(() => {
      return isEditMode.value == true
        ? !pageView.value.some((item: any) => item["isSelected"])
        : false;
    });
    const cancelEditMode = () => {
      isEditMode.value = false;
      label.value = i18n.t("dataManagement.add");
      clearCheckbox();
      setContentHeightWithBtn("scroll-area");
    };
    const clearCheckbox = () => {
      pageView.value.forEach((item: any) => {
        item["isSelected"] = false;
      });
    };
    const showDeleteDialog = () => {
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.delete_dialog_message");
    };
    const showDeleteSuccessDialog = () => {
      deleteDialogSuccess.value = true;
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.delete_success");
    };
    const onConfirmDialog = () => {
      if (deleteDialogSuccess.value) {
        dialogVisible.value = false;
      } else {
        if (pressHome.value) {
          dialogVisible.value = false;
          router.push("/home");
        } else if (pressDelete.value) {
          dialogVisible.value = false;
          let idList: any = [];
          pageView.value.forEach((item: any) => {
            if (item["isSelected"] == true) {
              idList.push(item.id);
            }
          });
          const apiParams = {
            idList: idList,
          };
          bridge.call("deleteCartonProducts", apiParams, (res: string) => {
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
    const getData = () => {
      pageView.value = [];
      bridge.call(
        "fetchMixCartonItemsForDM",
        {
          cartonID: store.state.dataMgmtModule.cartonItem.cartonID,
          taskID: store.state.dataMgmtModule.dataMgmt.taskID,
        },
        (res) => {
          loadingStatus.value = false;
          const apiResult = JSON.parse(res) as any[];
          apiResult.forEach((mixItem: any, index: number) => {
            let number = index + 1;
            const viewElement = {
              displayName: "item" + number,
              id: mixItem.id,
              lpId: mixItem.lpId,
              attribute: {
                upc: "",
                color: "",
                style: "",
                size: "",
                quantity: "",
              },
            };
            store.state.dataMgmtModule.profile.forEach(
              (item: ProfileDisplayAttribute) => {
                if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
                  if (item.level == ProfileElementLevel.CARTON_UPC) {
                    switch (item.displayDataFieldName) {
                      case "UPC":
                        viewElement.attribute.upc = ref(mixItem.upc);
                        break;
                      case "Color":
                        viewElement.attribute.color = ref(mixItem.color);
                        break;
                      case "Style":
                        viewElement.attribute.style = ref(mixItem.style);
                        break;
                      case "Size":
                        viewElement.attribute.size = ref(mixItem.size);
                        break;
                      case "Quantity":
                        viewElement.attribute.quantity = ref(mixItem.quantity);
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
            );
            pageView.value.push(viewElement);
          });
          if (pageView.value.length == 0) {
            noRecord.value = true;
          }
        }
      );
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      titles,
      router,
      pageView,
      onDetail,
      label,
      handleHold,
      isEditMode,
      cancelEditMode,
      dialogVisible,
      type,
      msg,
      isButtonDisabled,
      onSubmit,
      onConfirmDialog,
      home,
      noRecord,
      scrollArea,
      loadingStatus,
    };
  },
});
export default DataMgmtMixCartonList;
</script>
