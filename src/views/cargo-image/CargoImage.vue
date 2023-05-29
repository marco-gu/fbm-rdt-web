<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('image.access_image_detail')]"
      :icons="['back', 'home', 'empty']"
      @onBack="back"
      @onHome="home"
      @onSearch="onSearch($event)"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div v-for="(item, i) in pageView" :key="i">
            <div class="field">
              <div class="input-title">
                <span class="text"> {{ item.displayFieldName }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                ref="inputRef"
                v-model="item.model"
                @keyup.enter="onInputKeyUp($event, i)"
                @paste="validPaste($event, i)"
                lazy-rules
                :rules="[item.valid]"
                borderless
              >
                <template v-slot:append>
                  <q-avatar
                    class="btn-img"
                    @click="scan(item.fieldName, $event)"
                  >
                    <q-img
                      no-transition
                      no-spinner
                      :src="inputScanIcon"
                      width="12px"
                    />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
          <div class="field">
            <div>
              <div class="input-title">
                <span class="text">{{ $t("image.add_image_reason") }}</span>
              </div>
              <q-select
                behavior="menu"
                borderless
                class="select-field"
                v-model="reason"
              />
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('image.add_image_save')"
        @click="onSubmit"
      />
    </div>
    <PopupComponent
      :visible="dialogVisible"
      :message="msg"
      :type="type"
      @close="onConfirmDialog"
    ></PopupComponent>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import inputScan from "../../assets/icon/compress-solid.svg";
import PopupComponent from "@/components/PopupComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import { setContentHeightWithBtn, softKeyPopUp } from "@/utils/screen.util";
import {
  toUpperCaseElementInput,
  validPasteInput,
  ViewDisplayAttribute,
} from "@/utils/profile.render";
const cargoImageView = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    const reason = ref(i18n.t("image.damage"));
    const pageView = ref([] as ViewDisplayAttribute[]);
    const myForm = ref();
    const inputScanIcon = inputScan;
    const type = ref("");
    const msg = ref("");
    const dialogVisible = ref(false);
    const inputRef = ref();
    const pressHome = ref();
    onBeforeMount(() => {
      composeView();
    });
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
      // softkey popup
      const deviceHeight = store.state.screenModule.screenHeight;
      softKeyPopUp(deviceHeight, "scroll-area", "bottom-button");
    });
    const composeView = () => {
      const so = {
        displayFieldName: "Shipping order",
        fieldName: "so",
        model: ref(""),
        reg: new RegExp(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input Shipping order`);
            } else {
              resolve(true);
            }
          });
        },
      };
      pageView.value.push(so);
      const po = {
        displayFieldName: "Purchase Order",
        fieldName: "po",
        model: ref(""),
        reg: new RegExp(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input Purchase Order`);
            } else {
              resolve(true);
            }
          });
        },
      };
      pageView.value.push(po);
      const cartonID = {
        displayFieldName: "Carton ID",
        fieldName: "cartonID",
        model: ref(""),
        reg: new RegExp(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input CartonID`);
            } else {
              resolve(true);
            }
          });
        },
      };
      pageView.value.push(cartonID);
    };
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          let cartonID = "";
          const param = {
            so: "",
            po: "",
            cartonID: "",
          };
          pageView.value.forEach((t: any) => {
            switch (t.fieldName) {
              case "po":
                param.po = t.model;
                break;
              case "so":
                param.so = t.model;
                break;
              case "cartonID":
                param.cartonID = t.model;
                cartonID = t.model;
                break;
            }
          });
          bridge.call("checkImageInputCondition", param, (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.ERROR) {
              type.value = "error";
              dialogVisible.value = true;
              msg.value = i18n.t("messageCode." + androidResponse.messageCode);
            } else {
              bridge.call("createCargoImageTask", {
                cartonID: cartonID,
                taskID: androidResponse.data,
              });
              setTimeout(() => {
                router.push({
                  name: "cargoImageList",
                  params: {
                    from: "true",
                  },
                });
              }, 500);
            }
          });
        }
      });
    };
    const scan = (fieldName: string, event: Event) => {
      const isCamera = store.state.commonModule.scanDevice === "camera";
      if (isCamera) {
        const reqParams = {
          scanType: "images",
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    bridge.register("getScanResult", (res: string) => {
      pageView.value.forEach((view: any) => {
        const key = "images_" + view.fieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });
    const onInputKeyUp = (event: KeyboardEvent, index: number) => {
      if (event.code === "Enter" || event.which === 13) {
        const param = inputRef.value as any;
        param.forEach((t: any, i: number) => {
          if (i === index) {
            const inputText = t.$props.modelValue;
            t.validate(inputText).then(() => {
              if (param.length > index + 1) {
                param[index + 1].focus();
              }
            });
          }
        });
      }
    };
    const validPaste = (event: any, index: number) => {
      validPasteInput(inputRef, event, index);
    };
    const back = () => {
      router.push({
        name: "cargoImageList",
        params: {
          from: "true",
        },
      });
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (pressHome.value) {
        router.push("/home");
      }
    };
    const multiWatchSources = [pageView.value];
    toUpperCaseElementInput(multiWatchSources);
    return {
      pageView,
      reason,
      onSubmit,
      scan,
      myForm,
      inputScanIcon,
      back,
      type,
      dialogVisible,
      msg,
      onInputKeyUp,
      validPaste,
      inputRef,
      home,
      onConfirmDialog,
    };
  },
});
export default cargoImageView;
</script>
