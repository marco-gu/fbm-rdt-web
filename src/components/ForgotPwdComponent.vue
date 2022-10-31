<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="visible"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card>
        <q-form @submit="onConfirm">
          <q-toolbar>
            <q-toolbar-title
              ><span class="text-weight-bold">{{ forgotPwdLabel }}</span>
            </q-toolbar-title>
            <q-btn
              @click="onClose"
              flat
              round
              dense
              icon="close"
              v-close-popup
            />
          </q-toolbar>
          <q-card-section>
            <q-input
              clearable
              filled
              v-model="mail"
              type="email"
              prefix="Email:"
              lazy-rules
              :rules="[mailRule]"
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat type="submit"> {{ confirmLabel }}</q-btn>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { useI18n } from "@/plugin/i18nPlugins";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, ref, toRefs, watch } from "vue";
const ForgotPwdComponent = defineComponent({
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "confirm"],
  setup(props, context) {
    const { dialogVisible } = toRefs(props);
    const i18n = useI18n();
    const $q = useQuasar();
    const forgotPwdLabel = ref("");
    const confirmLabel = ref("");
    const mail = ref("");
    const visible = ref(false);
    bridge.call("getSystemLangugae", null, (res: string) => {
      i18n.category.value = "ForgotPwdComponent";
      i18n.locale.value = res;
      forgotPwdLabel.value = i18n.$t("forgotPassword");
      confirmLabel.value = i18n.$t("confirm");
    });
    const onClose = () => {
      mail.value = "";
      context.emit("close");
    };
    const onConfirm = () => {
      showLoading($q);
      const args = {
        mail: mail.value,
      };
      bridge.call("forgotPassword", args, (res: string) => {
        closeLoading($q);
        const androidResponse = JSON.parse(res) as AndroidResponse<unknown>;
        i18n.category.value = "MessageCode";
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          context.emit("confirm");
          const message = i18n.$t("E00-01-0009");
          popupSuccessMsg($q, message);
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const mailRule = (val: string) => {
      i18n.category.value = "MessageCode";
      return new Promise((resolve) => {
        const reg =
          /[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/g;
        if (!val) {
          const errMsg = i18n.$t("E00-01-0008");
          resolve(errMsg);
        } else {
          if (!reg.test(mail.value)) {
            const errMsg = i18n.$t("E00-01-0007");
            resolve(errMsg);
          } else {
            resolve(true);
          }
        }
      });
    };
    watch(
      dialogVisible,
      (newValue) => {
        visible.value = newValue;
      },
      { immediate: true }
    );
    return {
      forgotPwdLabel,
      confirmLabel,
      mail,
      visible,
      onClose,
      onConfirm,
      mailRule,
    };
  },
});
export default ForgotPwdComponent;
</script>
