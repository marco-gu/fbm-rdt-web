<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">LP Search</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <q-form @submit="onSubmit" style="background: #fff">
      <q-input
        v-model="profileName"
        prefix="Profile"
        input-class="text-right"
        readonly
        borderless
        style="padding: 0px 16px"
      >
      </q-input>
      <q-separator color="grey-5" />
      <q-field borderless style="padding: 0px 16px" item-aligned>
        <template v-slot:control>
          <div>
            <span>Scan Type</span>
          </div>
        </template>
        <div style="display: flex; color: black; align-items: center">
          <q-radio
            :disable="!receivingFlag"
            v-model="scanType"
            val="Receiving"
            label="Receiving"
            @click="onClick"
          />
          <q-radio
            :disable="!stuffingFlag"
            v-model="scanType"
            val="Stuffing"
            label="Stuffing"
            @click="onClick"
          />
        </div>
      </q-field>
      <q-separator color="grey-5" />
      <div v-for="(item, i) in pageViews" :key="i">
        <div v-if="item.display == 1">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span style="padding-left: 1rem; color: black">
              {{ item.dataFieldName }}
            </span>
            <q-input
              ref="inputRef"
              v-model="item.model"
              @paste="validPaste($event, i)"
              clearable
              :maxlength="item.length"
              input-class="text-right"
              lazy-rules
              :rules="[item.valid]"
              borderless
              style="padding: 0px 16px"
            >
              <template v-slot:append>
                <q-avatar
                  v-if="item.scan == 1"
                  @click="scan(item.dataFieldName)"
                >
                  <q-icon name="qr_code_scanner" />
                </q-avatar>
              </template>
            </q-input>
          </div>
          <q-separator color="grey-5" />
        </div>
      </div>
      <div style="position: fixed; bottom: 0px; width: 100%">
        <q-btn
          no-caps
          type="submit"
          class="full-width"
          label="Generate"
          style="background: #42b0d5; color: #fff; height: 40px"
        />
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  DisplayAttribute,
  ProfileCartonCommonLevel,
  ProfileDeail,
  ProfileOrderLevel,
} from "@/models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import {
  popupErrorMsg,
  popupInfoMsg,
  popupSuccessMsg,
} from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { composeReg } from "../utils/regUtil";
// Define Scan Type
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
// Define Validation Type
const enum ValidationType {
  PREVALIDATION = "PreValidation",
  OFFLINE = "Offline",
}
// Define Display Attribute
const enum DisplayAttributesLevel {
  ORDER = "order",
  CARTON_COMMON = "cartoncommon",
}
type ViewElement = {
  dataFieldName: string;
  level: string;
  mandatory: number;
  model: Ref<unknown>;
  reg: RegExp;
  display: number;
  scan: number;
  length: number;
  valid: (val: string) => Promise<unknown>;
};
// Define fields for both manual type-in or scanning for PO/SO/SKU/Container, the rests are based on scan profile definition
const scanOrTypeInList = ["PO", "SO", "SKU", "ContainerNumber"];
const LpSearchView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();
    const inputRef = ref(null);
    const i18n = useI18n();
    const profileName = ref("");
    const clientCode = ref("");
    const scanType = ref("");
    const clientName = ref("");
    // Define Page Elements
    const pageViews = ref([] as ViewElement[]);
    const receivingViews = ref([] as ViewElement[]);
    const stuffingViews = ref([] as ViewElement[]);
    // Define Receiving or Stuffing Radio Status
    const receivingFlag = ref(false);
    const stuffingFlag = ref(false);
    const mode = route.params.id as string;
    i18n.category.value = "LpSearchView";
    // const pageID = route.params.id;
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    onMounted(() => {
      const initData = JSON.parse(
        localStorage.getItem("profile") as never
      ) as ProfileDeail;
      clientName.value = initData.client;
      profileName.value = initData.profileCode;
      clientCode.value = initData.profileName;
      receivingFlag.value = initData.receivingScanFlag == 1 ? true : false;
      stuffingFlag.value = initData.stuffingScanFlag == 1 ? true : false;
      scanType.value =
        receivingFlag.value == true ? ScanType.RECEIVING : ScanType.STUFFING;
      initData.attributes.forEach((attr: DisplayAttribute) => {
        if (attr.type == ScanType.RECEIVING) {
          const element = composeViewElements(attr);
          if (element) {
            receivingViews.value.push(element);
          }
        } else if (attr.type == ScanType.STUFFING) {
          const element = composeViewElements(attr);
          if (element) {
            stuffingViews.value.push(element);
          }
        }
      });
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    });
    // Compose View
    const composeViewElements = (attr: DisplayAttribute) => {
      if (
        attr.level == DisplayAttributesLevel.CARTON_COMMON ||
        attr.level == DisplayAttributesLevel.ORDER
      ) {
        const viewElement = {} as ViewElement;
        viewElement.dataFieldName = attr.dataFieldName;
        viewElement.level = attr.level;
        viewElement.mandatory = attr.mandatory;
        viewElement.model = ref("");
        viewElement.reg = new RegExp(composeReg(attr.format));
        viewElement.display = attr.combo;
        viewElement.scan = attr.scan == "1" ? 1 : 0;
        viewElement.length = Math.abs(attr.maxLength);
        scanOrTypeInList.forEach((t) => {
          if (t == viewElement.dataFieldName) {
            viewElement.scan = 1;
          }
        });
        viewElement.valid = (val: string) => {
          return new Promise((resolve) => {
            if (viewElement.mandatory == 1 && !val) {
              resolve(`Please input ${viewElement.dataFieldName}`);
            } else {
              if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
                resolve(
                  `Please input not more than ${Math.abs(
                    attr.maxLength
                  )} charactors`
                );
              } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
                resolve(
                  `Please input not more or less than ${attr.maxLength} charactors`
                );
              } else if (!viewElement.reg.test(val)) {
                resolve("Please input correct format");
              } else {
                resolve(true);
              }
            }
          });
        };
        return viewElement;
      }
    };
    const composeRouteParam = (routeParams: any, source: any) => {
      source.forEach((view: ViewElement) => {
        if (view.display == 1) {
          routeParams[view.dataFieldName] = view.model;
        }
      });
    };
    const composeApiParam = (apiParams: any, source: any, mode: string) => {
      if (mode == "online") {
        apiParams.validationType = ValidationType.PREVALIDATION;
      } else {
        apiParams.validationType = ValidationType.OFFLINE;
      }
      const profileOrderLevel = new ProfileOrderLevel();
      const profileCartonCommonLevel = new ProfileCartonCommonLevel();
      let j: keyof ProfileOrderLevel;
      let k: keyof ProfileCartonCommonLevel;
      for (j in profileOrderLevel) {
        apiParams[j] = "";
      }
      for (k in profileCartonCommonLevel) {
        apiParams[k] = "";
      }
      source.forEach((view: ViewElement) => {
        for (j in profileOrderLevel) {
          if (j == view.dataFieldName) {
            apiParams[j] = view.model;
          }
        }
        for (k in profileCartonCommonLevel) {
          if (k == view.dataFieldName) {
            apiParams[k] = view.model;
          }
        }
      });
    };
    const reset = (param: any) => {
      param.forEach((t: any) => {
        if (t.modelValue == "") {
          t.resetValidation();
        } else {
          t.validate(t.modelValue);
        }
      });
    };
    const onClick = () => {
      nextTick(() => {
        reset(inputRef.value);
      });
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    };
    const onSubmit = () => {
      showLoading($q);
      // the same for online & offline
      const routeParams = {
        scanned: 0,
        total: 0,
        taskID: "",
        profileCode: profileName.value,
        type: "",
      };
      // the same for online & offline
      const apiParams = {
        profileName: profileName.value,
        clientCode: clientCode.value,
        clientName: clientName.value,
        scanType: scanType.value,
        validationType: "",
      };
      composeApiParam(apiParams, pageViews.value, mode);
      composeRouteParam(routeParams, pageViews.value);
      if (mode == "online") {
        bridge.call("fetchLp", apiParams, (res: string) => {
          closeLoading($q);
          i18n.category.value = "MessageCode";
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            routeParams.scanned = androidResponse.data.scanned;
            routeParams.total = androidResponse.data.total;
            routeParams.taskID = androidResponse.data.taskID;
            routeParams.type = scanType.value;
            const message = i18n.$t("E93-05-0005");
            popupSuccessMsg($q, message);
            setTimeout(() => {
              router.push({
                name: "scan",
                params: routeParams,
              });
            }, 2000);
          } else if (androidResponse.status == AndroidResponseStatus.INFO) {
            const message = i18n.$t(androidResponse.messageCode);
            popupInfoMsg($q, message);
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.$t(androidResponse.messageCode);
            popupErrorMsg($q, message);
          }
        });
      } else {
        bridge.call("createTask", apiParams, (res: string) => {
          closeLoading($q);
          i18n.category.value = "MessageCode";
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            // routeParams.scanned = androidResponse.data.scanned;
            // routeParams.total = androidResponse.data.total;
            routeParams.taskID = androidResponse.data.taskID;
            routeParams.type = scanType.value;
            const message = i18n.$t("E93-05-0007");
            popupSuccessMsg($q, message);
            setTimeout(() => {
              router.push({
                name: "scan",
                params: routeParams,
              });
            }, 2000);
          } else if (androidResponse.status == AndroidResponseStatus.INFO) {
            const message = i18n.$t(androidResponse.messageCode);
            popupInfoMsg($q, message);
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.$t(androidResponse.messageCode);
            popupErrorMsg($q, message);
          }
        });
      }
    };
    // 4- Convert the input data value into upper case if it is not
    const multiWatchSources = [receivingViews.value, stuffingViews.value];
    watch(
      multiWatchSources,
      () => {
        if (receivingViews.value.length > 0) {
          receivingViews.value.forEach((t: any) => {
            if (t.model != null && t.model.length > 1) {
              t.model = t.model.toUpperCase();
            }
          });
        }
        if (stuffingViews.value.length > 0) {
          stuffingViews.value.forEach((t: any) => {
            if (t.model != null && t.model.length > 1) {
              t.model = t.model.toUpperCase();
            }
          });
        }
      },
      { immediate: true }
    );
    const back = () => {
      router.push("/profile/" + route.params.id);
    };
    const home = () => {
      router.push("/home");
    };
    const validPaste = (event: any, index: number) => {
      if (event.clipboardData && event.clipboardData.getData("Text")) {
        const text = event.clipboardData.getData("Text");
        const param = inputRef.value as any;
        param.forEach((t: any, i: number) => {
          if (index - 1 == i) {
            t.validate(text);
          }
        });
      }
    };
    const scan = (dataFieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: dataFieldName,
      };
      bridge.call("scanForInput", reqParams);
    };

    bridge.register("getScanResult", (res: string) => {
      if (scanType.value == ScanType.RECEIVING) {
        receivingViews.value.forEach((receivingView: any) => {
          const key = scanType.value + "_" + receivingView.dataFieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            receivingView.model = res.substring(res.lastIndexOf("_") + 1);
          }
        });
      } else {
        stuffingViews.value.forEach((stuffingView: any) => {
          const key = scanType.value + "_" + stuffingView.dataFieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            stuffingView.model = res.substring(res.lastIndexOf("_") + 1);
          }
        });
      }
    });
    onUnmounted(() => {
      closeLoading($q);
    });
    return {
      profileName,
      scanType,
      onSubmit,
      back,
      home,
      receivingFlag,
      stuffingFlag,
      pageViews,
      onClick,
      scan,
      inputRef,
      validPaste,
    };
  },
});
export default LpSearchView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
  background: rgb(233, 229, 229);
}
.header {
  display: flex;
  background: #fff;
  justify-content: space-around;
  height: 60px;
  align-items: center;
}
</style>
