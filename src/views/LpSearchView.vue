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
          <div v-if="receivingType">
            <q-radio
              v-model="scanType"
              val="Receiving"
              label="Receiving"
              @click="onClick"
            />
          </div>
          <div v-if="!receivingType">
            <q-radio
              disable
              v-model="scanType"
              val="Receiving"
              label="Receiving"
              @click="onClick"
            />
          </div>
          <div v-if="stuffingType">
            <q-radio
              v-model="scanType"
              val="Stuffing"
              label="Stuffing"
              @click="onClick"
            />
          </div>
          <div v-if="!stuffingType">
            <q-radio
              disable
              v-model="scanType"
              val="Stuffing"
              label="Stuffing"
              @click="onClick"
            />
          </div>
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
              v-model="item.model"
              clearable
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
import { Attribute, ProfileDeail } from "@/models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import {
  popupErrorMsg,
  popupInfoMsg,
  popupSuccessMsg,
} from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
const enum InterfaceMandatoryField {
  SO = "SO",
  PO = "PO",
  SKU = "SKU",
}
const LpSearchView = defineComponent({
  setup() {
    const router = useRouter();
    const profileName = ref("");
    const clientCode = ref("");
    const scanType = ref("");
    const receivingViews = ref([]);
    const stuffingViews = ref([]);
    const pageViews = ref([]);
    const receivingType = ref(false);
    const stuffingType = ref(false);
    const i18n = useI18n();
    const clientName = ref("");
    i18n.category.value = "LpSearchView";
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    // 2- Search criteria input supports both manual type-in or scanning for PO/SO/SKU/Container, the rests are based on scan profile definition
    const scanOrTypeInList = ["PO", "SO", "SKU", "Container"];
    const $q = useQuasar();
    onMounted(() => {
      const initData = JSON.parse(
        localStorage.getItem("profile") as never
      ) as ProfileDeail;
      clientName.value = initData.client;
      bridge.call("getSettingLanguage", null, (res: string) => {
        i18n.locale.value = res;
      });
      profileName.value = initData.profileCode;
      clientCode.value = initData.profileName;
      receivingType.value = initData.receivingScanFlag == 1 ? true : false;
      stuffingType.value = initData.stuffingScanFlag == 1 ? true : false;
      scanType.value =
        receivingType.value == true ? ScanType.RECEIVING : ScanType.STUFFING;
      initData.attributes.forEach((attr: Attribute) => {
        if (attr.type == ScanType.RECEIVING) {
          receivingViews.value.push(composeViewElements(attr) as never);
        } else if (attr.type == ScanType.STUFFING) {
          stuffingViews.value.push(composeViewElements(attr) as never);
        }
      });
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    });
    const composeViewElements = (attr: Attribute) => {
      const viewElement = {} as any;
      viewElement.dataFieldName = attr.dataFieldName;
      viewElement.mandatory = attr.mandatory;
      viewElement.model = ref("");
      viewElement.reg = new RegExp(composeReg(attr.format));
      viewElement.display = attr.combo;
      viewElement.scan = attr.scan == "1" ? 1 : 0;
      scanOrTypeInList.forEach((t) => {
        if (t == viewElement.dataFieldName) {
          viewElement.scan = 1;
        }
      });
      /* 3- Validate the input data of the search criteria whether in right format
       * as per Scan Profile rule, i.e. data in charater, numeric or alphanumeric,
       * max length matched or not, the field is mandatory or not. detail refers to the client scan profile rule.
       */
      viewElement.valid = (val: string) => {
        return new Promise((resolve) => {
          if (viewElement.mandatory == 1 && !val) {
            resolve(`Please input ${viewElement.dataFieldName}`);
          } else {
            if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
              resolve(
                `Please input not more than ${attr.maxLength} charactors`
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
    };
    const composeReg = (format: string) => {
      let reg = "";
      for (let i = 0; i < format.length; i++) {
        switch (format[i]) {
          case "A":
            reg += "[a-zA-Z]";
            break;
          case "9":
            reg += "[0-9]";
            break;
          case "#":
            reg += "[0-9]|[\\s]";
            break;
          case "X":
            reg += "[.]";
            break;
        }
      }
      return reg;
    };
    const composeApiAndRouteParams = (
      apiParams: any,
      routeParams: any,
      source: any
    ) => {
      source.forEach((view: any) => {
        if (view.display == 1) {
          routeParams[view.dataFieldName] = view.model;
        }
        switch (view.dataFieldName) {
          case InterfaceMandatoryField.SO:
            apiParams.so = view.model;
            break;
          case InterfaceMandatoryField.PO:
            apiParams.po = view.model;
            break;
          case InterfaceMandatoryField.SKU:
            apiParams.sku = view.model;
        }
      });
      // return apiParams;
    };
    const onClick = () => {
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    };
    // 6- Submit the search criteria and download the LP from LNS web.
    const onSubmit = () => {
      showLoading($q);
      const apiParams = {
        profileName: profileName.value,
        clientCode: clientCode.value,
        so: "",
        po: "",
        sku: "",
        scanType: scanType.value == ScanType.RECEIVING ? 0 : 1,
        validationType: 0,
      };
      const routeParams = {
        scanned: "0",
        total: "0",
        taskID: "",
        clientCode: "",
        profile: profileName.value,
        type: "",
        clientName: "",
      };
      composeApiAndRouteParams(apiParams, routeParams, pageViews.value);
      bridge.call("fetchLp", apiParams, (res: string) => {
        closeLoading($q);
        i18n.category.value = "MessageCode";
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          routeParams.scanned = androidResponse.data.scanned;
          routeParams.total = androidResponse.data.total;
          routeParams.taskID = androidResponse.data.taskID;
          routeParams.clientCode = clientCode.value;
          routeParams.type = scanType.value;
          routeParams.clientName = clientName.value;
          router.push({
            name: "scan",
            params: routeParams,
          });
          const message = i18n.$t("E93-05-0005");
          popupSuccessMsg($q, message);
        } else if (androidResponse.status == AndroidResponseStatus.INFO) {
          const message = i18n.$t(androidResponse.messageCode);
          popupInfoMsg($q, message);
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
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
        } else if (stuffingViews.value.length > 0) {
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
      router.push("/profile");
    };
    const home = () => {
      router.push("/home");
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
    return {
      i18n,
      router,
      profileName,
      scanType,
      onSubmit,
      back,
      home,
      receivingType,
      stuffingType,
      pageViews,
      onClick,
      scan,
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
