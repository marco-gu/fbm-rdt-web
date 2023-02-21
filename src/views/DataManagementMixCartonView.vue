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
    </div>
    <div class="content">
      <div class="taskIdHeader">{{ taskId }} mix carton</div>
      <q-form @submit="showUpdateDialog = true">
        <div v-for="(item, i) in dynamicViews" :key="i">
          <div v-if="item.display == 1">
            <div class="item-container mb-15">
              <div class="input-title">
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
                    <q-icon name="qr_code_scanner" size="22px" />
                  </q-avatar>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <div class="button-bottom row">
          <q-btn
            class="col"
            no-caps
            flat
            push
            :label="$t('common.save')"
            type="submit"
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
      </q-form>
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
    };
  },
});
export default DataManagementMixCartonView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
  margin-top: 26px;
}
.taskIdHeader {
  margin-bottom: 23px;
  background-color: #00243d;
  padding: 6px 15px;
  font-size: 18px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #ffffff;
  line-height: 22px;
  border-radius: 5px 5px 5px 5px;
  word-break: break-all;
}

.common-input {
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  font-size: 18px;
  height: 50px;
  padding-top: 5px;
  padding-left: 15px;
  &.no-shadow {
    box-shadow: none;
  }
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

.button-bottom {
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
  background: #42b0d5;
  color: white;
  font-size: 20px;
  color: #ffffff;
  line-height: 23px;
  border-radius: 3px;
}

.dialog-container {
  width: 86%;
  border-radius: 5px;
  border: 0px solid #757575;
  font-size: 17px;
  background-color: #ffffff;
  &__title {
    padding: 15px 15px 0 15px;
    font-weight: bold;
    .q-icon {
      float: right;
      right: 0;
      top: 0;
    }
  }
  &__content {
    padding: 0 15px;
    margin: 23px 0;
  }
  &__button {
    padding: 15px;
    text-align: right;
    background: #f7f7f7;
    border-radius: 0px 0px 5px 5px;
    border: 0px solid #878787;
    .dialog-button {
      min-width: 99px;
      padding: 8px;
      border-radius: 5px;
      font-size: 18px;

      &.confirm {
        background: #00243d;
        color: #ffffff;
      }

      &.cancel {
        border: 1px solid #42b0d5;
        color: #42b0d5;
        margin-right: 15px;
        background: #ffffff;
      }
    }
  }
}
</style>
