<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="cancel()">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Carton Detail</span>
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="carton-info">
      <span>{{ cartonID }}</span>
    </div>
    <q-form style="background: #fff" @submit="onSubmit">
      <div v-for="(item, i) in pageViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.name }}
          </span>

          <q-input
            ref="inputRef"
            v-model="item.value"
            clearable
            input-class="text-right"
            lazy-rules
            :rules="[item.rule]"
            :maxlength="item.length"
            borderless
            style="padding: 0px 16px"
          >
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div class="bottom">
        <q-btn no-caps style="width: 48%" flat push type="submit">Save</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="cancel"
          >Cancel</q-btn
        >
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import {
  CartonRendering,
  ProfileCartonIndividualLevel,
} from "@/models/profile";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, nextTick, ref } from "vue";
import { composeReg } from "../utils/regUtil";
interface PageView {
  name: string;
  value: unknown;
  mandatory: number;
  format: RegExp;
  rule: unknown;
  canScan: number;
  ref: unknown;
  length: number;
}
const CartonDetailView = defineComponent({
  setup() {
    const cartonID = ref();
    const $q = useQuasar();
    const pageViews = ref([] as PageView[]);
    let hasRendered = false;
    let result = {} as CartonRendering;
    const inputRef = ref(null);
    bridge.register("closeCartonDetail", () => {
      cancel();
    });
    if (hasRendered == false) {
      bridge.register("getCartonDetail", (res: string) => {
        result = JSON.parse(res);
        if (!hasRendered) {
          hasRendered = true;
          result.profileDetailList.forEach((t) => {
            const element = composeViews(t);
            if (element) {
              pageViews.value.push(composeViews(t));
            }
          });
        }
        cartonID.value = result.cartonID;
      });
    }
    const composeViews = (attr: any) => {
      const view = {} as PageView;
      view.name = attr.dataFieldName;
      view.mandatory = attr.mandatory;
      view.value = ref("");
      view.format = new RegExp(composeReg(attr.format));
      view.length = Math.abs(attr.maxLength);
      view.rule = (val: string) => {
        return new Promise((resolve) => {
          if (view.mandatory == 1 && !val) {
            resolve(`Please input ${view.name}`);
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
            } else if (!view.format.test(val)) {
              resolve("Please input correct format");
            } else {
              resolve(true);
            }
          }
        });
      };
      return view;
    };
    const composeApiParam = (apiParams: any, source: any) => {
      const profileCartonIndividualLevel = new ProfileCartonIndividualLevel();
      let j: keyof ProfileCartonIndividualLevel;
      for (j in profileCartonIndividualLevel) {
        apiParams[j] = "";
      }
      source.forEach((view: any) => {
        for (j in profileCartonIndividualLevel) {
          if (j == view.name) {
            apiParams[j] = view.value;
          }
        }
      });
    };
    const reset = (param: any) => {
      param.forEach((t: any) => {
        if (t) {
          t.resetValidation();
        }
      });
      pageViews.value.forEach((t) => {
        t.value = "";
      });
    };
    const cancel = () => {
      nextTick(() => {
        reset(inputRef.value);
      });
      pageViews.value.forEach((t) => {
        const funtion = t.rule as any;
        funtion(t.value).then((resolve: any) => {
          if (resolve == true) {
            bridge.call("completeCartonDetail");
          } else {
            popupErrorMsg($q, resolve);
          }
        });
      });
    };
    const onSubmit = () => {
      const apiParams = {
        cartonID: cartonID.value,
      };
      composeApiParam(apiParams, pageViews.value);
      bridge.call("addCartonDetail", apiParams, () => {
        nextTick(() => {
          reset(inputRef.value);
        });
      });
    };
    return {
      cartonID,
      pageViews,
      cancel,
      onSubmit,
      inputRef,
    };
  },
});
export default CartonDetailView;
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
.carton-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #00243d;
  color: #fff;
  flex-flow: column;
}

.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
</style>
