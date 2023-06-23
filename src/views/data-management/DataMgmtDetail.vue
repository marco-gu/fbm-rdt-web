<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="icons"
      @onHome="home"
      @onBack="back"
      @onDetail="onDetail"
    />
    <div class="page-content">
      <q-scroll-area
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
        ref="scrollAreaRef"
      >
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, i) in pageView" :key="i">
            <div class="field">
              <div class="input-title">
                <span class="text"> {{ item.displayFieldName }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                ref="inputRef"
                v-model="item.model"
                @keyup.enter="onInputKeyUp($event, i)"
                @paste="validPaste($event, i)"
                lazy-rules
                @focus="onFocus(i)"
                :rules="[item.valid]"
                :maxlength="item.length"
                borderless
                :readonly="!isEditMode || !item.editable"
                :disable="!isEditMode || !item.editable"
              >
                <template v-if="item.scan == 1 && isEditMode" v-slot:append>
                  <q-avatar
                    class="btn-img"
                    @click="scan(item.fieldName, $event)"
                  >
                    <q-img
                      no-transition
                      no-spinner
                      :src="inputScanIcon"
                      width="12px"
                    />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        v-show="isEditMode"
        no-caps
        unelevated
        :ripple="false"
        class="full-width"
        @click="cancelEditMode"
        :label="$t('common.cancel')"
      />
      <q-separator v-show="isEditMode" vertical inset color="white" />
      <q-btn
        no-caps
        unelevated
        :ripple="false"
        class="full-width"
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
  <NotifyComponent
    :visible="notifyVisible"
    :message="msg"
    @close="onCloseNotify"
  >
  </NotifyComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { DataMgmt } from "@/models/data.management";
import { ProfileCartonLevel, ProfileDisplayAttribute } from "@/models/profile";
import router from "@/router";
import { useStore } from "@/store";
import {
  composeViewElement,
  ProfileElementLevel,
  toUpperCaseElementInput,
  validPasteInput,
  ViewDisplayAttribute,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import inputScan from "../../assets/icon/compress-solid.svg";
import { setContentHeightWithBtn, softKeyPopUp } from "../../utils/screen.util";
const DataMgmtDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
    NotifyComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const inputRef = ref();
    const pageView = ref([] as any[]);
    const dataMgmtView = ref(store.state.dataMgmtModule.dataMgmt);
    const titles = [dataMgmtView.value.client, dataMgmtView.value.so];
    const icons = ref(["back", "home", "detail"]);
    const myForm = ref();
    const inputScanIcon = inputScan;
    const isEditMode = ref(false);
    const label = ref(i18n.t("common.edit"));
    const type = ref("");
    const msg = ref("");
    const dialogVisible = ref(false);
    const pressHome = ref(false);
    const pressSave = ref(false);
    const notifyVisible = ref(false);
    const scrollAreaRef = ref(null);
    onBeforeMount(() => {
      composeView(dataMgmtView.value);
    });
    onMounted(() => {
      const deviceHeight = window.innerHeight;
      setContentHeightWithBtn("scroll-area");
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
    });
    const composeView = (obj: DataMgmt) => {
      bridge.call(
        "fetchProfileByProfileCode",
        { taskId: obj.taskID, type: obj.scanType },
        (res: any) => {
          const profile = JSON.parse(res) as ProfileDisplayAttribute[];
          store.dispatch("dataMgmtModule/saveProfile", profile);
          pageView.value.push({
            displayFieldName: "Client",
            model: dataMgmtView.value.client,
          });
          pageView.value.push({
            displayFieldName: "Operation",
            model: dataMgmtView.value.scanType,
          });
          profile.forEach((item: ProfileDisplayAttribute) => {
            if (item.type == obj.scanType) {
              if (
                item.level == ProfileElementLevel.CARTON_COMMON ||
                item.level == ProfileElementLevel.ORDER
              ) {
                const element = composeViewElement(item);
                element.editable = true;
                // fieldName from Profile
                switch (element.fieldName) {
                  case "SO":
                    element.model = ref(obj.so);
                    break;
                  case "PO":
                    element.model = ref(obj.po);
                    break;
                  case "SKU":
                    element.model = ref(obj.sku);
                    break;
                  case "ContainerNumber":
                    element.model = ref(obj.containerNumber);
                    break;
                  case "TotalCBM":
                    element.model = ref(obj.totalCBM);
                    break;
                  case "TotalWeight":
                    element.model = ref(obj.totalWeight);
                    break;
                  default:
                    break;
                }
                pageView.value.push(element);
              }
            }
          });
          pageView.value.push({
            displayFieldName: "Scanned Carton",
            model:
              dataMgmtView.value.scannedCartonNumber +
              "/" +
              dataMgmtView.value.allCartonNumber,
          });
          pageView.value.push({
            displayFieldName: "Updated Date",
            model: dataMgmtView.value.updateDatetime,
          });
        }
      );
    };
    const onSubmit = () => {
      if (isEditMode.value) {
        myForm.value.validate().then((success: any) => {
          if (success) {
            pressSave.value = true;
            type.value = "action";
            dialogVisible.value = true;
            msg.value = i18n.t("dataManagement.update_dialog_message");
          }
        });
      } else {
        isEditMode.value = true;
        icons.value = ["back", "home", "empty"];
        label.value = i18n.t("common.save");
      }
    };
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      } else if (pressSave.value) {
        const apiParams = {
          taskId: dataMgmtView.value.taskID,
          SO: "",
          PO: "",
          SKU: "",
          ContainerNumber: "",
          TotalCBM: "",
          TotalWeight: "",
        };
        composeApiParam(apiParams, pageView.value);
        bridge.call("updateTaskForDataManagement", apiParams, (res: string) => {
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            notifyVisible.value = true;
            msg.value = i18n.t("common.modify_success");
          }
        });
      }
    };
    const composeApiParam = (apiParams: any, source: any[]) => {
      let j: keyof ProfileCartonLevel;
      source.forEach((view: ViewDisplayAttribute) => {
        const profileCartonLevel = new ProfileCartonLevel();
        for (j in profileCartonLevel) {
          if (j == view.fieldName) {
            apiParams[j] = view.model;
          }
        }
      });
    };
    const cancelEditMode = () => {
      pageView.value.forEach((t) => {
        switch (t.fieldName) {
          case "PO":
            t.model = store.state.dataMgmtModule.dataMgmt.po;
            break;
          case "SO":
            t.model = store.state.dataMgmtModule.dataMgmt.so;
            break;
          case "SKU":
            t.model = store.state.dataMgmtModule.dataMgmt.sku;
            break;
          case "ContainerNumber":
            t.model = store.state.dataMgmtModule.dataMgmt.containerNumber;
            break;
          case "TotalCBM":
            t.model = store.state.dataMgmtModule.dataMgmt.totalCBM;
            break;
          case "TotalWeight":
            t.model = store.state.dataMgmtModule.dataMgmt.totalWeight;
            break;
          default:
            break;
        }
      });
      isEditMode.value = false;
      label.value = i18n.t("common.edit");
      icons.value = ["back", "home", "detail"];
    };
    const onDetail = () => {
      router.push("/dataMgmtCartonList");
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const back = () => {
      router.push("/dataMgmtList");
    };
    const multiWatchSources = [pageView.value];
    toUpperCaseElementInput(multiWatchSources);
    const scan = (fieldName: string, event: Event) => {
      const isCamera = store.state.commonModule.scanDevice === "camera";
      if (isCamera) {
        const reqParams = {
          scanType: "DM",
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      pageView.value.forEach((view: any) => {
        const key = "DM_" + view.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
          scanFieldName = view.fieldName;
        }
      });
      param.forEach((t: any, i: number) => {
        if (pageView.value[i].fieldName == scanFieldName) {
          t.validate(pageView.value[i].model);
        }
      });
    });
    const onInputKeyUp = (event: KeyboardEvent, index: number) => {
      if (event.code === "Enter" || event.which === 13) {
        const param = inputRef.value as any;
        param.forEach((t: any, i: number) => {
          if (i === index) {
            const inputText = t.$props.modelValue;
            t.validate(inputText).then(() => {
              if (param.length > index + 1) {
                param[index + 1].focus();
              }
            });
          }
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
      router.push("/dataMgmtList");
    };
    const onFocus = (position: any) => {
      popupSoftKey(position);
    };
    // softkey popup auto scroll
    const popupSoftKey = (position: any) => {
      const scrollRef = scrollAreaRef.value as any;
      setTimeout(() => {
        if (position > 4) {
          scrollRef.setScrollPercentage("vertical", 0.95);
        }
      }, 600);
    };
    return {
      titles,
      pageView,
      router,
      onSubmit,
      label,
      isEditMode,
      inputScanIcon,
      myForm,
      type,
      dialogVisible,
      msg,
      onConfirmDialog,
      home,
      icons,
      cancelEditMode,
      back,
      onDetail,
      scan,
      inputRef,
      onInputKeyUp,
      validPaste,
      notifyVisible,
      onCloseNotify,
      onFocus,
      scrollAreaRef,
    };
  },
});
export default DataMgmtDetail;
</script>
