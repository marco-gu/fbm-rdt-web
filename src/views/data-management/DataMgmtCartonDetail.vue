<template>
  <div class="wrapper">
    <common-header-component
      :titles="titles"
      :icons="icons"
      @onHome="home"
      @onBack="back"
      @onMixed="onDetail"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, index) in pageView" :key="index">
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
                :rules="[item.valid]"
                :maxlength="item.length"
                borderless
                :readonly="!isEditMode || !item.editable"
                :disable="!isEditMode || !item.editable"
              >
                <template
                  v-if="item.scan == 1 && isEditMode == true"
                  v-slot:append
                >
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
        :ripple="false"
        no-caps
        unelevated
        class="full-width"
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
  </div>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  ProfileCartonDetailLevel,
  ProfileDisplayAttribute,
} from "@/models/profile";
import router from "@/router";
import { useStore } from "@/store";
import {
  composeViewElement,
  ProfileElementLevel,
  validPasteInput,
  ViewDisplayAttribute,
} from "@/utils/profile.render";
import { setContentHeightWithBtn } from "@/utils/screen.util";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import inputScan from "../../assets/icon/compress-solid.svg";
type ViewElement = {
  displayFieldName: string;
  fieldName: string;
  model: string;
  scan: number;
  editable: boolean;
};
const DataMgmtCartonDetail = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const store = useStore();
    const i18n = useI18n();
    const inputRef = ref();
    const pageView = ref([] as ViewElement[]);
    const titles = [
      store.state.dataMgmtModule.cartonItem.so,
      store.state.dataMgmtModule.cartonItem.cartonID,
    ];
    const icons = ref(["back", "home", "mixed"]);
    const myForm = ref();
    const inputScanIcon = inputScan;
    const isEditMode = ref(false);
    const label = ref(i18n.t("common.edit"));
    const type = ref("");
    const msg = ref("");
    const dialogVisible = ref(false);
    const pressHome = ref(false);
    const pressSave = ref(false);
    const editDialogSuccess = ref(false);
    onBeforeMount(() => {
      composeView();
    });
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
    });
    const composeView = () => {
      pageView.value.push({
        displayFieldName: "Client",
        fieldName: "Client",
        model: store.state.dataMgmtModule.cartonItem.client,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Operation",
        fieldName: "Operation",
        model: store.state.dataMgmtModule.cartonItem.operation,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Shipping Order",
        fieldName: "SO",
        model: store.state.dataMgmtModule.cartonItem.so,
        scan: 0,
        editable: false,
      });
      pageView.value.push({
        displayFieldName: "Purchase Order",
        fieldName: "PO",
        model: store.state.dataMgmtModule.cartonItem.po,
        scan: 0,
        editable: false,
      });
      store.state.dataMgmtModule.profile.forEach(
        (item: ProfileDisplayAttribute) => {
          if (item.type == store.state.dataMgmtModule.dataMgmt.scanType) {
            if (item.level == ProfileElementLevel.CARTON_INDIVIDUAL) {
              const element = composeViewElement(item);
              let canAdd = false;
              element.editable = true;
              // fieldName from Profile
              switch (item.displayDataFieldName) {
                case "CID":
                  element.model = ref(
                    store.state.dataMgmtModule.cartonItem.cartonID
                  );
                  element.displayFieldName = "Carton ID";
                  element.scan = 1;
                  canAdd = true;
                  break;
                case "Quantity":
                  element.model = ref(
                    store.state.dataMgmtModule.cartonItem.quantity
                  );
                  canAdd = true;
                  break;
                case "Style":
                  element.model = ref(
                    store.state.dataMgmtModule.cartonItem.style
                  );
                  canAdd = true;
                  break;
                case "HUB":
                  element.model = ref(
                    store.state.dataMgmtModule.cartonItem.hub
                  );
                  canAdd = true;
                  break;
                case "SKU":
                  element.model = ref(
                    store.state.dataMgmtModule.cartonItem.sku
                  );
                  canAdd = true;
                  break;
              }
              if (canAdd) {
                pageView.value.push(element as never);
                canAdd = false;
              }
            }
          }
        }
      );
      pageView.value.push({
        displayFieldName: "Scan Date",
        fieldName: "ScanDate",
        model: store.state.dataMgmtModule.cartonItem.scanDate,
        scan: 0,
        editable: false,
      });
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
    const showSuccessDialog = () => {
      editDialogSuccess.value = true;
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.modify_success");
    };
    const onConfirmDialog = () => {
      if (editDialogSuccess.value) {
        dialogVisible.value = false;
        router.push("/dataMgmtCartonList");
      } else {
        dialogVisible.value = false;
        if (pressHome.value) {
          router.push("/home");
        } else if (pressSave.value) {
          const apiParams = {
            LPID: store.state.dataMgmtModule.cartonItem.lpID,
            CartonID: "",
            Style: "",
            Quantity: "",
            HUB: "",
          };
          composeApiParam(apiParams, pageView.value);
          bridge.call("updateCarton", apiParams, (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              showSuccessDialog();
            }
          });
        }
      }
    };
    const composeApiParam = (apiParams: any, source: any[]) => {
      let j: keyof ProfileCartonDetailLevel;
      source.forEach((view: ViewDisplayAttribute) => {
        const profileCartonDetailLevel = new ProfileCartonDetailLevel();
        for (j in profileCartonDetailLevel) {
          if (j == view.fieldName) {
            apiParams[j] = view.model;
          }
        }
      });
    };
    const cancelEditMode = () => {
      pageView.value.forEach((t) => {
        switch (t.fieldName) {
          case "CartonID":
            t.model = store.state.dataMgmtModule.cartonItem.cartonID;
            break;
          case "Quantity":
            t.model = store.state.dataMgmtModule.cartonItem.quantity;
            break;
          case "Style":
            t.model = store.state.dataMgmtModule.cartonItem.style;
            break;
          case "HUB":
            t.model = store.state.dataMgmtModule.cartonItem.hub;
            break;
          case "SKU":
            t.model = store.state.dataMgmtModule.cartonItem.sku;
            break;
          default:
            break;
        }
      });
      isEditMode.value = false;
      icons.value = ["back", "home", "mixed"];
      label.value = i18n.t("common.edit");
    };
    const onDetail = () => {
      router.push("/dataMgmtMixCartonList");
      // const item = {
      //   taskID: store.state.dataMgmtModule.dataMgmt.taskID,
      //   cartonID: store.state.dataMgmtModule.cartonItem.cartonID,
      // };
      // store
      //   .dispatch("dataMgmtModule/saveSelectedCartonHeader", item)
      //   .then(() => {
      //     router.push("/dataMgmtCartonMixed");
      //   });
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const back = () => {
      router.push({
        name: "dataMgmtCartonList",
        params: {
          from: "true",
        },
      });
    };
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
    return {
      pageView,
      titles,
      router,
      inputScanIcon,
      label,
      onSubmit,
      isEditMode,
      myForm,
      type,
      msg,
      dialogVisible,
      onConfirmDialog,
      onDetail,
      icons,
      cancelEditMode,
      home,
      back,
      inputRef,
      onInputKeyUp,
      validPaste,
      scan,
    };
  },
});
export default DataMgmtCartonDetail;
</script>
