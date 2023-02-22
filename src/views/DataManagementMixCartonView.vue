<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("dataManagement.mix_title") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
      <div class="card-sub-title">{{ taskId }} Mix carton</div>
    </div>
    <div class="content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="showUpdateDialog = true" ref="myForm">
          <div v-for="(item, i) in dynamicViews" :key="i">
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
                  <q-avatar v-if="item.scan == 1" @click="scan(item.fieldName)">
                    <q-icon name="qr_code_scanner" size="16px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="button-bottom row" id="bottom-button">
      <q-btn
        class="col"
        no-caps
        flat
        push
        :label="$t('common.save')"
        @click="showUpdateDialog = true"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        flat
        push
        :label="$t('common.delete')"
        @click="showDeleteDialog = true"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        flat
        type="submit"
        push
        :label="$t('common.cancel')"
        @click="back"
      />
    </div>
  </div>
  <q-dialog v-model="showDeleteDialog" persistent>
    <div class="dialog-container">
      <div class="dialog-container__title">
        {{ $t("common.confirm") }}
        <q-icon name="close" v-close-popup />
      </div>
      <div class="dialog-container__content">
        {{ $t("dataManagement.delete_dialog_message") }}
      </div>
      <div class="dialog-container__button">
        <button class="dialog-button cancel" v-close-popup>
          {{ $t("common.cancel") }}
        </button>
        <button class="dialog-button confirm" @click="handleDelete">
          {{ $t("common.delete") }}
        </button>
      </div>
    </div>
  </q-dialog>
  <q-dialog v-model="showUpdateDialog" persistent>
    <div class="dialog-container">
      <div class="dialog-container__title">
        {{ $t("common.confirm") }}
        <q-icon name="close" v-close-popup />
      </div>
      <div class="dialog-container__content">
        {{ $t("dataManagement.update_dialog_message") }}
      </div>
      <div class="dialog-container__button">
        <button class="dialog-button cancel" v-close-popup>
          {{ $t("common.cancel") }}
        </button>
        <button class="dialog-button confirm" @click="handleSave">
          {{ $t("common.save") }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import {
  ViewDisplayAttribute,
  composeViewElement,
  ProfileElementLevel,
} from "@/utils/profile.render";
import { ProfileDisplayAttribute, MixCartonProduct } from "@/models/profile";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const enum ScanType {
  RECEIVING = "Receiving",
  STUFFING = "Stuffing",
}

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
    const dynamicViews: Ref<ViewDisplayAttribute[]> = ref([]);
    const mixCartonProduct = ref();
    const profileAttrListDisplay: Ref<ProfileDisplayAttribute[]> = ref([]);
    const pageTitle = ref("");
    const cancelLabel = ref("");
    const deleteLabel = ref("");
    const saveLabel = ref("");
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const showDeleteDialog = ref(false);
    const showUpdateDialog = ref(false);
    const myForm = ref();
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const bottom = document.getElementById("bottom-button") as any;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
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
              attr.level == ProfileElementLevel.CARTON_UPC
            ) {
              const element = composeViewElement(attr);

              switch (element.fieldName) {
                case "UPC":
                  element.model.value = mixCartonProduct.value.upc;
                  break;
                case "Color":
                  element.model.value = mixCartonProduct.value.color;
                  break;
                case "Style":
                  element.model.value = mixCartonProduct.value.style;
                  break;
                case "Size":
                  element.model.value = mixCartonProduct.value.size;
                  break;
                case "Quantity":
                  element.model.value = mixCartonProduct.value.quantity;
                  break;
                default:
                  break;
              }

              dynamicViews.value.push(element);
            }
          }
        );
      });
    };

    const scan = (fieldName: string) => {
      const reqParams = {
        scanType: scanType.value,
        fieldName: fieldName,
      };
      bridge.call("scanForInput", reqParams);
    };

    bridge.register("getScanResult", (res: string) => {
      dynamicViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.fieldName;
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
      myForm.value.validate().then((success: any) => {
        if (success) {
          showUpdateDialog.value = false;
          const args = composeSaveApiArgs();
          bridge.call("updateCartonProduct", args, (res: string) => {
            const androidResponse = JSON.parse(res) as AndroidResponse<any>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              popupSuccessMsg($q, "Successfully saved");
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              const message = i18n.t(androidResponse.messageCode);
              popupErrorMsg($q, message);
            }
          });
        }
      });
    };
    const composeSaveApiArgs = () => {
      let args = {
        id: mixCartonProduct.value.id,
        lpId: lpId.value,
        upc: mixCartonProduct.value.upc,
        color: mixCartonProduct.value.color,
        size: mixCartonProduct.value.size,
        qty: mixCartonProduct.value.qty,
        style: mixCartonProduct.value.style,
      };
      dynamicViews.value.forEach((viewElement: ViewDisplayAttribute) => {
        switch (viewElement.fieldName) {
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
          case "Style":
            args.style = viewElement.model;
            break;
          default:
            break;
        }
      });
      return args;
    };
    const handleDelete = () => {
      showDeleteDialog.value = false;
      const args = {
        id: mixCartonProduct.value.id,
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
          const message = i18n.t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    return {
      back,
      cancelLabel,
      deleteLabel,
      dynamicViews,
      handleSave,
      handleDelete,
      inputRef,
      pageTitle,
      router,
      saveLabel,
      scan,
      taskId,
      homeIcon,
      arrowIcon,
      showDeleteDialog,
      showUpdateDialog,
      myForm,
    };
  },
});
export default DataManagementMixCartonView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-with-subtitle;
}
.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 46px);
  margin-left: 23px;
  background: #42b0d5;
  color: white;
  color: #ffffff;
  border-radius: 3px;
}
</style>
