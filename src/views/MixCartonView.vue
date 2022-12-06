<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back()">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Mix Carton</span>
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="carton-info">
      <span>{{ cartonID }}</span>

      <span>Item count: {{ itemCount }}</span>
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
        <q-btn no-caps style="width: 48%" flat push type="submit">Add</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="complete"
          >Complete</q-btn
        >
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import { CartonRendering } from "@/models/profile";
import { popupSuccessMsg } from "@/plugin/popupPlugins";
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
const MixCartonView = defineComponent({
  setup() {
    const pageViews = ref([] as PageView[]);
    const cartonID = ref("");
    const itemCount = ref(0);
    const $q = useQuasar();
    let hasRendered = false;
    const completeMixCarton = ref(false);
    let result = {} as CartonRendering;
    const inputRef = ref(null);
    bridge.register("closeMixCarton", () => {
      back();
    });
    if (hasRendered == false) {
      bridge.register("getMixCartonProfile", (res: string) => {
        result = JSON.parse(res);
        if (!hasRendered) {
          hasRendered = true;
          result.profileDetailList.forEach((t) => {
            pageViews.value.push(composeViews(t));
          });
        }
        cartonID.value = result.cartonID;
        itemCount.value = 0;
      });
    }
    const composeViews = (attr: any) => {
      const view = {} as PageView;
      view.name = attr.dataFieldName;
      view.mandatory = attr.mandatory;
      view.value = ref(null);
      view.ref = ref(null);
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
    const complete = () => {
      pageViews.value.forEach((t) => {
        const funtion = t.rule as any;
        funtion(t.value).then((resolve: any) => {
          if (resolve == true) {
            completeMixCarton.value = true;
            onSubmit();
          } else {
            bridge.call("completeMixCarton", null, () => {
              nextTick(() => {
                reset(inputRef.value);
              });
            });
          }
        });
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
    const onSubmit = () => {
      const args: any = {
        cartonID: cartonID.value,
        UPC: "",
        Style: "",
        SKU: "",
        Color: "",
        Size: "",
        Quantity: "",
      };
      pageViews.value.forEach((t) => {
        switch (t.name) {
          case "UPC":
            args["UPC"] = t.value;
            break;
          case "Style":
            args["Style"] = t.value;
            break;
          case "SKU":
            args["SKU"] = t.value;
            break;
          case "Color":
            args["Color"] = t.value;
            break;
          case "Size":
            args["Size"] = t.value;
            break;
          case "Quantity":
            args["Quantity"] = t.value;
            break;
        }
      });
      bridge.call("addMixCarton", args, () => {
        nextTick(() => {
          reset(inputRef.value);
        });
        itemCount.value++;
        if (completeMixCarton.value) {
          // popupSuccessMsg($q, "Add Complete");
          completeMixCarton.value = false;
          bridge.call("completeMixCarton", null, () => {
            nextTick(() => {
              reset(inputRef.value);
            });
          });
        } else {
          popupSuccessMsg($q, "Add success");
        }
      });
    };

    const back = () => {
      reset(inputRef.value);
      bridge.call("completeMixCarton", null);
    };
    return {
      onSubmit,
      complete,
      pageViews,
      itemCount,
      cartonID,
      inputRef,
      back,
    };
  },
});
export default MixCartonView;
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
