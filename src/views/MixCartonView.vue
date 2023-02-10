<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <q-img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("carton.mix_carton_header") }}
        </div>
      </div>
    </div>
    <!-- <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back()">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Mix Carton</span>
        </q-item-section>
      </q-item>
    </div> -->
    <div class="carton-info">
      <span>{{ cartonID }}</span>

      <span>Item count: {{ itemCount }}</span>
    </div>
    <q-form @submit="onSubmit">
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
              {{ item.displayFieldName }}
            </span>
            <q-input
              ref="inputRef"
              v-model="item.model"
              @paste="validPaste($event, i)"
              clearable
              input-class="text-right"
              lazy-rules
              :rules="[item.valid]"
              :maxlength="item.length"
              borderless
              style="padding: 0px 16px"
            >
              <template v-slot:append>
                <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                  <q-icon name="qr_code_scanner" />
                </q-avatar>
              </template>
            </q-input>
          </div>
          <q-separator color="grey-5" />
        </div>
      </div>
      <div class="bottom">
        <q-btn no-caps style="width: 48%" flat push type="submit">Add</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="complete"
          >Complete</q-btn
        >
      </div>
    </q-form>
    <DialogComponent
      :dialogVisible="dialogVisible"
      @confirm="onConfirm"
      @close="onClose"
    >
    </DialogComponent>
  </div>
</template>
<script lang="ts">
import DialogComponent from "@/components/DialogComponent.vue";
import { CartonDetailAttribute } from "@/models/profile";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import {
  composeViewElement,
  ProfileElementLevel,
  ViewDisplayAttribute,
  toUpperCaseElementInput,
  validPasteInput,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, nextTick, ref } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const MixCartonView = defineComponent({
  components: {
    DialogComponent,
  },
  setup() {
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref("");
    const itemCount = ref(0);
    const $q = useQuasar();
    const inputRef = ref(null);
    const dialogVisible = ref(false);
    let firstRender = false;
    const completeMixCarton = ref(false);
    let mixCartonView = {} as CartonDetailAttribute;
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    bridge.register("closeMixCarton", () => {
      back();
    });
    // if (!firstRender) {
    bridge.register("getMixCartonProfile", (res: string) => {
      mixCartonView = JSON.parse(res);
      if (!firstRender) {
        firstRender = true;
        mixCartonView.profileDetails.forEach((item) => {
          if (item.level == ProfileElementLevel.CARTON_UPC) {
            const element = composeViewElement(item);
            pageViews.value.push(element);
          }
        });
      }
      if (cartonID.value && cartonID.value == mixCartonView.cartonID) {
        itemCount.value++;
      } else {
        cartonID.value = mixCartonView.cartonID;
        itemCount.value = 0;
      }
    });
    // }
    const complete = () => {
      const param = inputRef.value as any;
      let invalid = false;
      param.forEach((t: any, i: number) => {
        t.validate(t.modelValue).then((resovle: any) => {
          if (i < param.length - 1) {
            if (resovle == false && invalid == false) {
              invalid = true;
            }
          } else {
            if (resovle != false && invalid == false) {
              completeMixCarton.value = true;
              onSubmit();
            }
          }
        });
      });
    };
    const reset = (param: any) => {
      pageViews.value.forEach((t) => {
        t.model = "";
      });
      param.forEach((t: any) => {
        if (t) {
          t.resetValidation();
        }
      });
    };
    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: "Default",
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
    };
    bridge.register("getScanResult", (res: string) => {
      const param = inputRef.value as any;
      let scanFieldName = "";
      pageViews.value.forEach((pageView: any) => {
        const key = "Default_" + pageView.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          pageView.model = res.substring(res.lastIndexOf("_") + 1);
          scanFieldName = pageView.fieldName;
        }
      });
      param.forEach((t: any, i: number) => {
        if (pageViews.value[i].fieldName == scanFieldName) {
          t.validate(pageViews.value[i].model);
        }
      });
    });
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
        switch (t.fieldName) {
          case "UPC":
            args["UPC"] = t.model;
            break;
          case "Style":
            args["Style"] = t.model;
            break;
          case "SKU":
            args["SKU"] = t.model;
            break;
          case "Color":
            args["Color"] = t.model;
            break;
          case "Size":
            args["Size"] = t.model;
            break;
          case "Quantity":
            args["Quantity"] = t.model;
            break;
        }
      });
      bridge.call("addMixCarton", args, () => {
        if (completeMixCarton.value) {
          completeMixCarton.value = false;
          bridge.call("completeMixCarton", null, () => {
            itemCount.value++;
            nextTick(() => {
              reset(inputRef.value);
            });
          });
        } else {
          dialogVisible.value = true;
        }
      });
    };

    const back = () => {
      let allowReturn = true;
      pageViews.value.forEach((view) => {
        if (view.mandatory == 1) {
          allowReturn = false;
          return;
        }
      });
      if (!allowReturn) {
        const message = "Don't allow to miss the input";
        popupErrorMsg($q, message);
      } else {
        bridge.call("completeMixCarton", null, () => {
          reset(inputRef.value);
          // nextTick(() => {
          //   reset(inputRef.value);
          // });
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const multiWatchSources = [pageViews.value];
    toUpperCaseElementInput(multiWatchSources);
    const onConfirm = () => {
      dialogVisible.value = false;
      nextTick(() => {
        reset(inputRef.value);
      });
      itemCount.value++;
    };
    const onClose = () => {
      dialogVisible.value = false;
      bridge.call("completeMixCarton", null, () => {
        itemCount.value++;
        nextTick(() => {
          reset(inputRef.value);
        });
      });
    };
    return {
      onClose,
      onConfirm,
      onSubmit,
      complete,
      pageViews,
      itemCount,
      cartonID,
      inputRef,
      back,
      validPaste,
      scan,
      dialogVisible,
      homeIcon,
      arrowIcon,
    };
  },
});
export default MixCartonView;
</script>
<style lang="scss" scoped>
// .wrapper {
//   height: 100vh;
//   display: flex;
//   flex-flow: column;
//   background: rgb(233, 229, 229);
// }
// .header {
//   display: flex;
//   background: #fff;
//   justify-content: space-around;
//   height: 60px;
//   align-items: center;
// }
.carton-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 100%;
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
