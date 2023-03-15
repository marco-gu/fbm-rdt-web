<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div class="card-item-select">
            {{ $t("image.add_image_reason") }}
            <q-select
              hide-bottom-space
              borderless
              v-model="reason"
              :options="options"
              behavior="menu"
            />
          </div>
          <div v-for="(item, i) in pageViews" :key="i">
            <div class="card-item-input">
              <div>
                {{ item.displayFieldName }}
              </div>
              <q-input
                class="card-item-input-field no-shadow"
                :input-style="{ fontSize: '15px' }"
                input-class="text-right"
                v-model="item.value"
                lazy-rules
                :rules="[item.valid]"
                clearable
                borderless
                dense
              >
                <template v-slot:append>
                  <q-avatar @click="scan(item.displayFieldName)">
                    <q-img no-transition :src="inputScanIcon" width="16px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('image.add_image_cancel')"
        @click="back"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('image.add_image_save')"
        @click="onSubmit"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { useI18n } from "vue-i18n";
import inputScan from "../assets/images/input_scan.svg";
const cargoImageView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const router = useRouter();
    const reason = ref(i18n.t("image.damage"));
    const $q = useQuasar();
    const pageViews = ref([] as any);
    const options = [i18n.t("image.damage"), i18n.t("image.other")];
    const scanType = ref("CargoImage");
    const titleParam = i18n.t("image.add_image");
    const backUrlParam = "/imageAccess";
    const myForm = ref();
    const inputScanIcon = inputScan;
    pageViews.value = [
      {
        displayFieldName: "SO",
        value: ref(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input SO`);
            } else {
              resolve(true);
            }
          });
        },
      },
      {
        displayFieldName: "PO",
        value: ref(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input PO`);
            } else {
              resolve(true);
            }
          });
        },
      },
      {
        displayFieldName: "CID",
        value: ref(""),
        valid: (val: string) => {
          return new Promise((resolve) => {
            if (!val) {
              resolve(`Please input CID`);
            } else {
              resolve(true);
            }
          });
        },
      },
    ];
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      window.onresize = () => {
        // get resize height and recalculate scroll area
        const resizeHeight = window.innerHeight;
        const scrollArea = document.getElementById("scroll-area") as any;
        scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
        const bottom = document.getElementById("bottom-button") as any;
        if (deviceHeight - resizeHeight > 0) {
          bottom.style.visibility = "hidden";
        } else {
          bottom.style.visibility = "visible";
        }
      };
    });
    watch(
      pageViews,
      () => {
        pageViews.value.forEach((t: any) => {
          if (t.value != null && t.value != "") {
            t.value = t.value.toUpperCase();
          }
        });
      },
      { immediate: true, deep: true }
    );
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          let cartonID = "";
          const param = {
            so: "",
            po: "",
            cid: "",
          };
          pageViews.value.forEach((t: any) => {
            switch (t.displayFieldName) {
              case "PO":
                param.po = t.value;
                break;
              case "SO":
                param.so = t.value;
                break;
              case "CID":
                param.cid = t.value;
                cartonID = t.value;
                break;
            }
          });
          bridge.call("checkImageInputCondition", param, (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.ERROR) {
              const message = i18n.t(
                "messageCode." + androidResponse.messageCode
              );
              popupErrorMsg($q, message);
            } else {
              const param2 = {
                cartonID: cartonID,
                taskID: androidResponse.data.taskId,
              };
              bridge.call("createCargoImageTask", param2);
              setTimeout(() => {
                router.push("/imageAccess");
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
          scanType: scanType.value,
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    bridge.register("getScanResult", (res: string) => {
      pageViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.displayFieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.value = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });
    return {
      pageViews,
      reason,
      onSubmit,
      scan,
      options,
      titleParam,
      backUrlParam,
      myForm,
      inputScanIcon,
    };
  },
});
export default cargoImageView;
</script>
