<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="visible"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <div class="dialog-container">
        <div class="dialog-container__title">
          {{ $t("login.forgot_password") }}
          <q-btn @click="onClose" flat round dense icon="close" v-close-popup />
        </div>
        <q-form @submit="onConfirm" ref="myForm">
          <div class="dialog-container__content">
            <div class="field">
              <div class="input-title">
                <span class="text">{{ $t("login.email_address") }}</span>
              </div>
              <q-input
                class="input-field"
                input-class="text-left"
                v-model="mail"
                lazy-rules
                :rules="[mailRule]"
                borderless
                :placeholder="$t('login.forgot_password_hint')"
              />
            </div>
          </div>
          <div class="dialog-container__button">
            <button class="dialog-button confirm" type="submit">
              {{ $t("common.confirm") }}
            </button>
          </div>
        </q-form>
      </div>
    </q-dialog>
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="popupVisible = false"
    ></PopupComponent>
    <NotifyComponent
      :visible="notifyVisible"
      :message="msg"
      @close="notifyVisible = false"
    >
    </NotifyComponent>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";

import bridge from "dsbridge";
import { defineComponent, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import PopupComponent from "@/components/PopupComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
const ForgotPwdComponent = defineComponent({
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PopupComponent,
    NotifyComponent,
  },
  emits: ["close", "confirm", "showLoading", "closeLoading"],
  setup(props, context) {
    const { dialogVisible } = toRefs(props);
    const i18n = useI18n();
    const mail = ref("");
    const msg = ref("");
    const myForm = ref();
    const notifyVisible = ref(false);
    const popupVisible = ref(false);
    const type = ref("");
    const visible = ref(false);
    const onClose = () => {
      mail.value = "";
      context.emit("close");
    };
    const onConfirm = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          context.emit("showLoading");
          const args = {
            mail: mail.value,
          };
          bridge.call("forgotPassword", args, (res: string) => {
            context.emit("closeLoading");
            const androidResponse = JSON.parse(res) as AndroidResponse<unknown>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              context.emit("confirm");
              const message = i18n.t("messageCode.E93-03-0001");
              msg.value = message;
              notifyVisible.value = true;
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              const message = i18n.t(
                "messageCode." + androidResponse.messageCode
              );
              type.value = "error";
              msg.value = message;
              popupVisible.value = true;
            }
          });
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
      mailRule,
      msg,
      myForm,
      notifyVisible,
      onClose,
      onConfirm,
      popupVisible,
      type,
      visible,
    };
  },
});
export default ForgotPwdComponent;
</script>
<style lang="scss" scoped>
.dialog-container {
  font-family: "Maersk Text";
  &__title {
    padding-left: 15px;
    padding-right: 6px;
    .q-btn {
      float: right;
      font-size: 14px;
      padding-bottom: 14px;
    }
  }
  &__content {
    padding: 0;
  }
  &__button {
    text-align: center;
    background: #ffffff;
    padding: 15px;
    .dialog-button {
      &.confirm {
        width: 100%;
      }
    }
  }
}
.field {
  margin: 0 15px;
}
.q-field {
  height: 43px;
}
</style>
