<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("lp.lp_search") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="content">
      <q-form @submit="onSubmit">
        <q-input
          class="common-input mb-15 mt-15"
          v-model="profileName"
          :prefix="$t('profile.profile_text')"
          input-class="text-right"
          readonly
          borderless
          dense
        />
        <div class="item-container mb-15">
          <div class="label">{{ $t("lp.scan_type") }}</div>
          <div class="input">
            <q-radio
              v-if="receivingFlag"
              v-model="scanType"
              val="Receiving"
              :label="$t('common.receiving')"
              @click="changeScanType('Receiving')"
            />
            <q-radio
              v-if="stuffingFlag"
              v-model="scanType"
              val="Stuffing"
              :label="$t('common.stuffing')"
              @click="changeScanType('Stuffing')"
            />
          </div>
        </div>
        <div v-for="(item, i) in pageViews" :key="i">
          <div v-if="item.display == 1">
            <div class="item-container mb-15">
              <div>
                {{ item.displayFieldName }}
              </div>
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
                dense
                class="common-input no-shadow"
              >
                <template v-slot:append>
                  <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                    <q-icon name="qr_code_scanner" size="22px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <div class="button-bottom">
          <q-btn
            no-caps
            unelevated
            type="submit"
            class="full-width"
            color="secondary"
          >
            {{ bottomButtonLable }}
          </q-btn>
        </div>
      </q-form>
    </div>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  ProfileDisplayAttribute,
  ProfileCartonCommonLevel,
  ProfileDetail,
  ProfileOrderLevel,
} from "@/models/profile";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import {
  popupErrorMsg,
  popupInfoMsg,
  popupSuccessMsg,
} from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ViewDisplayAttribute,
  composeViewElement,
  ProfileElementLevel,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import { useI18n } from "vue-i18n";
import homeImg from "../assets/images/home.svg";
import arrow from "../assets/images/arrow.svg";
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
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const receivingViews = ref([] as ViewDisplayAttribute[]);
    const stuffingViews = ref([] as ViewDisplayAttribute[]);
    // Define Receiving or Stuffing Radio Status
    const receivingFlag = ref(false);
    const stuffingFlag = ref(false);
    const mode = route.params.id as string;
    const homeIcon = homeImg;
    const arrowIcon = arrow;
    const bottomButtonLable =
      mode == "online" ? i18n.t("lp.generate") : i18n.t("lp.start_scan");
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    onMounted(() => {
      const initData = JSON.parse(
        localStorage.getItem("profile") as never
      ) as ProfileDetail;
      clientName.value = initData.client;
      profileName.value = initData.profileCode;
      clientCode.value = initData.profileName;
      receivingFlag.value = initData.receivingScanFlag == 1 ? true : false;
      stuffingFlag.value = initData.stuffingScanFlag == 1 ? true : false;
      scanType.value =
        receivingFlag.value == true ? ScanType.RECEIVING : ScanType.STUFFING;
      initData.attributes.forEach((item: ProfileDisplayAttribute) => {
        if (
          item.level == ProfileElementLevel.CARTON_COMMON ||
          item.level == ProfileElementLevel.ORDER
        ) {
          const element = composeViewElement(item);
          if (item.type == ScanType.RECEIVING) {
            receivingViews.value.push(element);
          } else {
            stuffingViews.value.push(element);
          }
        }
      });
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    });
    const composeRouteParam = (routeParams: any, source: any) => {
      source.forEach((view: ViewDisplayAttribute) => {
        if (view.display == 1) {
          routeParams[view.displayFieldName] = view.model;
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
      source.forEach((view: ViewDisplayAttribute) => {
        for (j in profileOrderLevel) {
          if (j == view.fieldName) {
            if (view.model) {
              apiParams[j] = view.model;
            }
          }
        }
        for (k in profileCartonCommonLevel) {
          if (k == view.fieldName) {
            if (view.model) {
              apiParams[k] = view.model;
            }
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
    const changeScanType = (val: string) => {
      if (
        (receivingFlag.value && val == ScanType.RECEIVING) ||
        (stuffingFlag.value && val == ScanType.STUFFING)
      ) {
        nextTick(() => {
          reset(inputRef.value);
        });
        pageViews.value =
          scanType.value == ScanType.RECEIVING
            ? receivingViews.value
            : stuffingViews.value;
      }
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
          const androidResponse = JSON.parse(res) as AndroidResponse<any>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            routeParams.scanned = androidResponse.data.scanned;
            routeParams.total = androidResponse.data.total;
            routeParams.taskID = androidResponse.data.taskID;
            routeParams.type = scanType.value;
            const message = i18n.t("messageCode.E93-05-0005");
            popupSuccessMsg($q, message);
            setTimeout(() => {
              router.push({
                name: "scan",
                params: routeParams,
              });
            }, 2000);
          } else if (androidResponse.status == AndroidResponseStatus.INFO) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupInfoMsg($q, message);
          } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
            const message = i18n.t(
              "messageCode." + androidResponse.messageCode
            );
            popupErrorMsg($q, message);
          }
        });
      } else {
        bridge.call("createTask", apiParams);
        closeLoading($q);
        pageViews.value.forEach((t) => {
          t.model = "";
        });
        nextTick(() => {
          reset(inputRef.value);
        });
      }
    };
    // 4- Convert the input data value into upper case if it is not
    const multiWatchSources = [receivingViews.value, stuffingViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const back = () => {
      router.push("/profile/" + route.params.id);
    };
    const home = () => {
      router.push("/home");
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
    };
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      if (scanType.value == ScanType.RECEIVING) {
        receivingViews.value.forEach((receivingView: any) => {
          const key = scanType.value + "_" + receivingView.fieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            receivingView.model = res.substring(res.lastIndexOf("_") + 1);
            scanFieldName = receivingView.fieldName;
          }
        });
        param.forEach((t: any, i: number) => {
          if (receivingViews.value[i].fieldName == scanFieldName) {
            t.validate(receivingViews.value[i].model);
          }
        });
      } else {
        stuffingViews.value.forEach((stuffingView: any) => {
          const key = scanType.value + "_" + stuffingView.fieldName;
          if (key == res.substring(0, res.lastIndexOf("_"))) {
            stuffingView.model = res.substring(res.lastIndexOf("_") + 1);
            scanFieldName = stuffingView.fieldName;
          }
        });
        param.forEach((t: any, i: number) => {
          if (receivingViews.value[i].fieldName == scanFieldName) {
            t.validate(receivingViews.value[i].model);
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
      changeScanType,
      scan,
      inputRef,
      validPaste,
      bottomButtonLable,
      homeIcon,
      arrowIcon,
    };
  },
});
export default LpSearchView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
  margin-top: 26px;
}
.common-input {
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  font-size: 18px;
  height: 50px;
  padding-top: 5px;
  padding-left: 15px;
  padding-right: 15px;
  &.no-shadow {
    box-shadow: none;
  }
}
.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
}
.mb-15 {
  margin-bottom: 20px;
}
.item-container {
  text-align: left;
  height: 50px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
}
</style>
