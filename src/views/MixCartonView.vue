<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("carton.mix_carton_header") }}
        </div>
      </div>
    </div>
    <div class="content">
      <div class="carton-info">
        <span>{{ cartonID }}</span>

        <span>Item count: {{ itemCount }}</span>
      </div>
      <q-form @submit="onSubmit" ref="myForm">
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
                    <q-icon name="qr_code_scanner" size="18px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <!-- <div v-for="(item, i) in pageViews" :key="i">
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
        </div> -->
        <!-- <div class="bottom">
        <q-btn no-caps style="width: 48%" flat push type="submit">Add</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat push @click="complete"
          >Complete</q-btn
        >
      </div> -->
      </q-form>
    </div>
    <div class="button-bottom">
      <div>
        <q-btn
          no-caps
          unelevated
          @click="onSubmit"
          class="full-width"
          color="secondary"
          :label="$t('carton.mix_carton_add')"
        />
      </div>
      <div class="mt-23">
        <q-btn
          no-caps
          unelevated
          @click="complete"
          class="full-width"
          text-color="#757575"
          color="white"
          outline
          :label="$t('carton.mix_carton_complete')"
        />
      </div>
    </div>
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
    const myForm = ref();
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
      myForm.value.validate().then((success: any) => {
        if (success) {
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
      myForm,
    };
  },
});
export default MixCartonView;
</script>
<style lang="scss" scoped>
// .button-bottom {
//   // margin-left: 20px;
//   // position: fixed;
//   // bottom: 20px;
//   position: absolute;
//   margin: 0 20px;
//   bottom: 20px;
//   width: calc(100% - 40px);
// }
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

.content {
  padding: 0 20px;
  margin-top: 26px;
  min-height: 600px;
}
.carton-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65px;
  width: 100%;
  background: #00243d;
  color: #fff;
  flex-flow: column;
  margin-bottom: 23px;
  border-radius: 5px;
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
  position: absolute;
  margin: 0 20px;
  bottom: 20px;
  width: calc(100% - 40px);
}
.mt-23 {
  margin-top: 20px;
}
</style>
