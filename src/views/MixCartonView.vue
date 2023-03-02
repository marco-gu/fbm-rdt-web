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
      <div class="card-sub-title">
        <div>{{ cartonID }}</div>
        <div>Item count: {{ itemCount }}</div>
      </div>
    </div>
    <div class="content">
      <q-form @submit="onSubmit" ref="myForm">
        <div v-for="(item, i) in pageViews" :key="i">
          <div v-if="item.display == 1">
            <div class="card-item-input">
              <div>
                {{ item.displayFieldName }}
              </div>
              <q-input
                class="card-item-input-field no-shadow"
                :input-style="{ fontSize: '15px' }"
                input-class="text-right"
                ref="inputRef"
                v-model="item.model"
                @paste="validPaste($event, i)"
                clearable
                :maxlength="item.length"
                lazy-rules
                :rules="[item.valid]"
                borderless
                dense
              >
                <template v-slot:append>
                  <q-avatar
                    v-if="item.scan == 1"
                    @click="scan(item.fieldName, $event)"
                  >
                    <q-icon name="qr_code_scanner" size="16px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-form>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.mix_carton_add')"
        @click="onSubmit"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.mix_carton_complete')"
        @click="complete"
      />
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
import { defineComponent, nextTick, ref, onMounted } from "vue";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const MixCartonView = defineComponent({
  components: {
    DialogComponent,
  },
  setup() {
    window.onresize = () => {
      const bottom = document.getElementById("bottom-button") as any;
      if (originalHeight - window.innerHeight > 0) {
        bottom.style.visibility = "hidden";
      } else {
        bottom.style.visibility = "visible";
      }
    };
    const originalHeight = window.innerHeight;
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const cartonID = ref("");
    const itemCount = ref(0);
    const $q = useQuasar();
    const inputRef = ref(null);
    const dialogVisible = ref(false);
    const scanType = ref("");
    let firstRender = false;
    const completeMixCarton = ref(false);
    let mixCartonView = {} as CartonDetailAttribute;
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const myForm = ref();
    let isCamera = true;
    onMounted(() => {
      bridge.call("getScanDevice", (res: string) => {
        isCamera = res === "camera";
      });
      nextTick(() => {
        if (!isCamera) {
          const param = inputRef.value as any;
          if (param && param.length > 0) {
            param[0].focus();
          }
        }
      });
    });
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
      scanType.value = mixCartonView.scanType;
    });
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
    const scan = (fieldName: string, event: Event) => {
      if (!isCamera) {
        const reqParams = {
          scanType: "Default",
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
            scanType: scanType.value,
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
          bridge.call("addMixCarton", args, (arg) => {
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
.content {
  margin-top: $--page-content-margin-top-no-search;
}
</style>
