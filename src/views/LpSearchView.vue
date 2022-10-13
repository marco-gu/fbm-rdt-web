<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">LP Search</span></q-item-section
        >
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
              disable
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
      <div v-for="(item, i) in receivingViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
          v-if="item.display == 1 && scanType == 'Receiving'"
        >
          <lable style="padding-left: 1rem; color: black">{{
            item.dataFieldName
          }}</lable>
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
              <q-avatar>
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div v-for="(item, i) in stuffingViews" :key="i">
        <div
          v-if="item.display == 1 && scanType == 'Stuffing'"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <lable style="padding-left: 1rem; color: black">{{
            item.dataFieldName
          }}</lable>
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
              <q-avatar>
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <q-separator color="grey-5" />
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
import bridge from "dsbridge";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
export const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
const LpSearchView = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const profileName = ref("");
    // Define Scan Type
    const scanType = ref("");
    // Receiving View List
    const receivingViews = ref([]);
    // Stuffing View List
    const stuffingViews = ref([]);
    // Whether Receving type exist
    const receivingType = ref(false);
    // Whether Stuffing type exist
    const stuffingType = ref(false);
    const profileFromRoute = ref();
    onMounted(() => {
      const data = JSON.parse(route.params.profile as string) as ProfileDeail;
      profileFromRoute.value = data;
      alert(data.client);
      profileName.value = data.client;
      // Configure Scan type
      receivingType.value = data.receivingScanFlag == 1 ? true : false;
      stuffingType.value = data.stuffingScanFlag == 1 ? true : false;
      scanType.value =
        receivingType.value == true ? ScanType.RECEIVING : ScanType.STUFFING;
      data.attributes.forEach((attr: Attribute) => {
        if (attr.type == ScanType.RECEIVING) {
          receivingViews.value.push(composeViewElements(attr) as never);
        } else {
          stuffingViews.value.push(composeViewElements(attr) as never);
        }
      });
    });
    const composeReg = (format: string) => {
      let result = "";
      for (let i = 0; i < format.length; i++) {
        switch (format[i]) {
          case "A":
            result += "[a-zA-Z]";
            break;
          case "9":
            result += "[0-9]";
            break;
          case "#":
            result += "[\\s]|[0-9]";
            break;
          case "X":
            result += "[.]";
            break;
        }
      }
      return result;
    };
    const composeViewElements = (attr: Attribute) => {
      const view = {} as any;
      view.dataFieldName = attr.dataFieldName;
      view.mandatory = attr.mandatory;
      view.model = ref("");
      const reg = composeReg(attr.format);
      view.reg = new RegExp(reg);
      // TODO Check combo
      // element.display = temp.combo;
      view.display = 1;
      view.valid = (val: string) => {
        return new Promise((resolve) => {
          if (view.mandatory == 1 && !val) {
            resolve(`Please input ${view.dataFieldName}`);
          } else {
            if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
              resolve(
                `Please input not more than ${attr.maxLength} charactors`
              );
            } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
              resolve(
                `Please input not more or less than ${attr.maxLength} charactors`
              );
            } else if (!view.reg.test(val)) {
              resolve("Please input correct format");
            } else {
              resolve(true);
            }
          }
        });
      };
      return view;
    };
    const onSubmit = () => {
      const routeParams = {} as any;
      if (scanType.value == ScanType.RECEIVING) {
        receivingViews.value.forEach((view: any) => {
          routeParams[view.dataFieldName] = view.model;
          routeParams.scanned = 0;
          routeParams.total = 0;
        });
        router.push({
          name: "scan",
          params: routeParams,
        });
      } else {
        stuffingViews.value.forEach((view: any) => {
          routeParams[view.dataFieldName] = view.model;
          routeParams.scanned = 0;
          routeParams.total = 0;
        });
        router.push({
          name: "scan",
          params: routeParams,
        });
      }
      // $q.loading.show({
      //   delay: 400,
      // });
      // const args = {
      //   // TODO clientCode
      //   clientCode: "WOLV",
      //   so: soNumber.value,
      //   po: poNumber.value,
      //   sku: skuNumber.value,
      // };
      // bridge.call("fetchLp", args, (res: string) => {
      //   const apiResponse = JSON.parse(res) as ApiResponseDto<any>;
      //   $q.loading.hide();
      //   if (apiResponse.statusCode == 200) {
      //     alert("success");
      //   } else {
      //     alertErrorMessage(apiResponse.errorMessage);
      //   }
      // });
    };
    const back = () => {
      router.go(-1);
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
      receivingViews,
      stuffingViews,
      receivingType,
      stuffingType,
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
