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
                <q-avatar v-if="item.scan == 1">
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
import { ApiResponseDto } from "@/models/api.response";
import { Attribute, ProfileDeail } from "@/models/profile";
import { useStore } from "@/store";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
export const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
export const enum InterfaceMandatoryField {
  SO = "SO",
  PO = "PO",
  SKU = "SKU",
}
const LpSearchView = defineComponent({
  setup() {
    const router = useRouter();
    const store = useStore();
    const profileName = ref("");
    const clientCode = ref("");
    const scanType = ref("");
    const receivingViews = ref([]);
    const stuffingViews = ref([]);
    const pageViews = ref([]);
    const receivingType = ref(false);
    const stuffingType = ref(false);
    // 2- Search criteria input supports both manual type-in or scanning for PO/SO/SKU/Container, the rests are based on scan profile definition
    const scanOrTypeInList = ["PO", "SO", "SKU", "Container"];
    const $q = useQuasar();
    const alertErrorMessage = (message: any) => {
      $q.notify({
        position: "center",
        color: "red-5",
        textColor: "white",
        icon: "error",
        timeout: 2000,
        message: message,
      });
    };
    onMounted(() => {
      const initData = JSON.parse(
        store.state.profileModule.profile
      ) as ProfileDeail;
      profileName.value = initData.client;
      clientCode.value = initData.clientCode;
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
    const composeRequestAndRouteParams = (
      reqParams: any,
      routeParams: any,
      source: any
    ) => {
      source.forEach((view: any) => {
        if (view.display == 1) {
          routeParams[view.dataFieldName] = view.model;
        }
        switch (view.dataFieldName) {
          case InterfaceMandatoryField.SO:
            reqParams.so = view.model;
            break;
          case InterfaceMandatoryField.PO:
            reqParams.po = view.model;
            break;
          case InterfaceMandatoryField.SKU:
            reqParams.sku = view.model;
        }
      });
      return reqParams;
    };
    const onClick = () => {
      pageViews.value =
        scanType.value == ScanType.RECEIVING
          ? receivingViews.value
          : stuffingViews.value;
    };
    // 6- Submit the search criteria and download the LP from LNS web.
    const onSubmit = () => {
      $q.loading.show({});
      const reqParams = {
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
      };
      composeRequestAndRouteParams(reqParams, routeParams, pageViews.value);
      bridge.call("fetchLp", reqParams, (res: string) => {
        const apiResponse = JSON.parse(res) as ApiResponseDto<any>;
        $q.loading.hide();
        if (apiResponse.statusCode == 200) {
          routeParams.scanned = apiResponse.data.scanned;
          routeParams.total = apiResponse.data.total;
          router.push({
            name: "scan",
            params: routeParams,
          });
        } else {
          alertErrorMessage(apiResponse.errorMessage);
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
    return {
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
