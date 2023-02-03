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
              ><span class="toolbar-title">{{
                $t("login.forgot_password")
              }}</span>
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
              outlined
              dense
              v-model="mail"
              :placeholder="$t('login.forgot_password_hint')"
              type="email"
              lazy-rules
              :rules="[mailRule]"
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
            <div class="button-container">
              <q-btn no-caps unelevated type="submit" color="secondary">
                {{ $t("common.confirm") }}
              </q-btn>
            </div>
          </q-card-section>
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

import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
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
    const mail = ref("");
    const visible = ref(false);

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
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          context.emit("confirm");
          const message = i18n.t("messageCode.E93-03-0001");
          popupSuccessMsg($q, message);
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          const message = i18n.t("messageCode." + androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    const mailRule = (val: string) => {
      return new Promise((resolve) => {
        const reg =
          /[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/g;
        if (!val) {
          const errMsg = i18n.t("messageCode.E93-03-0003");
          resolve(errMsg);
        } else {
          if (!reg.test(mail.value)) {
            const errMsg = i18n.t("messageCode.E93-03-0002");
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
<style lang="scss" scoped>
.toolbar-title {
  font-size: 17px;
  font-weight: normal;
}
.q-card__section--vert {
  padding: 0 12px;
}
.button-container {
  width: 100%;
  padding-bottom: 12px;
  button {
    width: 100%;
  }
}
</style>
