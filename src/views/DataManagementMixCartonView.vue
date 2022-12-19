<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Data Management</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <div class="task-id">
        <span>{{ taskId }}</span>
      </div>
    </div>
    <div class="mix-carton-container">
      <div v-for="(item, i) in dynamicViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.displayName }}
          </span>
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
            style="padding: 0px 16px"
          >
            <template v-slot:append>
              <q-avatar v-if="item.scan == 1" @click="scan(item.dataFieldName)">
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
    </div>
    <div class="bottom">
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        label="Save"
        @click="handleSave"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 48%"
        flat
        push
        label="Delete"
        @click="handleDelete"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        style="width: 52%"
        flat
        type="submit"
        push
        label="Cancel"
        @click="back"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useI18n } from "@/plugin/i18nPlugins";
import { useRoute, useRouter } from "vue-router";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { ProfileDisplayAttribute, MixCartonProduct } from "@/models/profile";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { composeReg } from "@/utils/profile.render";
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}
const enum ProfileDisplayAttributesLevel {
  CARTON_UPC = "cartonupc",
}
type ViewElement = {
  dataFieldName: string;
  displayName: string;
  mandatory: number;
  model: Ref<unknown>;
  reg: RegExp;
  scan: number;
  length: number;
  editable: boolean;
  valid: (val: string) => Promise<unknown>;
};
const DataManagementMixCartonView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const $q = useQuasar();
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const lpId = ref(route.query.lpId);
    const taskId = ref(route.query.taskId);
    const cartonId = ref(route.query.cartonId);
    const scanType = ref("");
    const inputRef = ref(null);
    const dynamicViews: Ref<ViewElement[]> = ref([]);
    const mixCartonProduct = ref();
    const profileAttrListDisplay: Ref<ProfileDisplayAttribute[]> = ref([]);
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });
    onMounted(() => {
      if (route.query.taskId) {
        scanType.value =
          route.query.taskId.indexOf(ScanType.RECEIVING) !== -1
            ? ScanType.RECEIVING
            : ScanType.STUFFING;
      }
      getProfile();
      mixCartonProduct.value = JSON.parse(
        localStorage.getItem("mixCartonProduct") as never
      ) as MixCartonProduct;
    });
    const getProfile = () => {
      const args = {
        taskId: taskId.value,
      };
      bridge.call("fetchProfileByProfileCode", args, (res: string) => {
        profileAttrListDisplay.value = JSON.parse(
          res
        ) as ProfileDisplayAttribute[];
        profileAttrListDisplay.value.forEach(
          (attr: ProfileDisplayAttribute) => {
            if (
              attr.type == scanType.value &&
              attr.level == ProfileDisplayAttributesLevel.CARTON_UPC &&
              (attr.dataFieldName == "UPC" ||
                attr.dataFieldName == "Color" ||
                attr.dataFieldName == "Size" ||
                attr.dataFieldName == "Quantity")
            ) {
              dynamicViews.value.push(composeViewElements(attr));
            }
          }
        );
      });
    };
    const composeViewElements = (attr: ProfileDisplayAttribute) => {
      const viewElement = {} as ViewElement;
      viewElement.dataFieldName = attr.dataFieldName;
      viewElement.displayName = attr.dataFieldName;
      viewElement.mandatory = attr.mandatory;
      viewElement.model = ref("");
      viewElement.reg = new RegExp(composeReg(attr.format));
      viewElement.scan = attr.scan == "1" ? 1 : 0;
      viewElement.length = Math.abs(attr.maxLength);
      viewElement.editable = true;

      switch (viewElement.dataFieldName) {
        case "UPC":
          viewElement.model.value = mixCartonProduct.value.upc;
          viewElement.displayName = "UPC code";
          break;
        case "Color":
          viewElement.model.value = mixCartonProduct.value.color;
          break;
        case "Size":
          viewElement.model.value = mixCartonProduct.value.size;
          break;
        case "Quantity":
          viewElement.model.value = mixCartonProduct.value.quantity;
          viewElement.displayName = "QTY";
          break;
        default:
          break;
      }

      viewElement.valid = (val: string) => {
        return new Promise((resolve) => {
          if (viewElement.mandatory == 1 && !val) {
            resolve(`Please input ${viewElement.dataFieldName}`);
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
    const scan = (dataFieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: dataFieldName,
      };
      bridge.call("scanForInput", reqParams);
    };
    bridge.register("getScanResult", (res: string) => {
      dynamicViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.dataFieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.model = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });
    const back = () => {
      router.push({
        path: "/dataManagementMixCartonList",
        query: {
          taskId: taskId.value,
          cartonId: cartonId.value,
        },
      });
    };
    const handleSave = () => {
      const args = composeSaveApiArgs();
      bridge.call("updateCartonProduct", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, "Successfully saved");
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const composeSaveApiArgs = () => {
      let args = {
        lpId: lpId.value,
        upc: mixCartonProduct.value.upc,
        color: mixCartonProduct.value.color,
        size: mixCartonProduct.value.size,
        qty: mixCartonProduct.value.qty,
      };
      dynamicViews.value.forEach((viewElement: ViewElement) => {
        switch (viewElement.dataFieldName) {
          case "UPC":
            args.upc = viewElement.model;
            break;
          case "Color":
            args.color = viewElement.model;
            break;
          case "Size":
            args.size = viewElement.model;
            break;
          case "Quantity":
            args.qty = viewElement.model;
            break;
          default:
            break;
        }
      });
      return args;
    };
    const handleDelete = () => {
      const args = {
        lpId: lpId.value,
      };
      bridge.call("deleteCartonProduct", args, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          popupSuccessMsg($q, "Successfully deleted");
          router.push({
            path: "/dataManagementMixCartonList",
            query: {
              taskId: taskId.value,
              cartonId: cartonId.value,
            },
          });
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };

    function composeReg(format: string) {
      let reg = "";
      for (let i = 0; i < format.length; i++) {
        switch (format[i]) {
          case "A":
            reg += "[\\s\\S]";
            break;
          case "9":
            reg += "[0-9]";
            break;
          case "#":
            reg += "[0-9\\s]";
            break;
          case "X":
            reg += "[a-zA-Z]";
            break;
          default:
            reg += format[i];
        }
      }
      return reg;
    }

    return {
      back,
      dynamicViews,
      handleSave,
      handleDelete,
      inputRef,
      router,
      scan,
      taskId,
    };
  },
});
export default DataManagementMixCartonView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  position: relative;
  .header {
    display: sticky;
    top: 0;
    width: 100%;
    background-color: #ffffff;
    z-index: 1;
  }
  .q-item {
    background-color: #ffffff;
    height: 60px;
    width: 100%;
  }
  .task-id {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    background: #00243d;
    color: #fff;
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
}
</style>
