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
              ><span class="text-weight-bold">Forgot Password</span>
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
              filled
              v-model="mail"
              type="email"
              prefix="Email:"
              lazy-rules
              :rules="[mailFormatRule]"
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat label="Confirm" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import { ApiResponseDto, ApiResponseStatus } from "@/models/api.response";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, ref, toRefs, watch } from "vue";
const ForgotPasswordComponent = defineComponent({
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "confirm"],
  setup(props, context) {
    const { dialogVisible } = toRefs(props);
    const visible = ref(false);
    const errMsg = ref("");
    const mail = ref("");
    const $q = useQuasar();
    const onClose = () => {
      mail.value = "";
      context.emit("close");
    };
    const alertErrorMessage = (message: string) => {
      $q.notify({
        position: "center",
        color: "red-5",
        textColor: "white",
        icon: "error",
        timeout: 2000,
        message: message,
      });
    };
    const alertSuccessMessage = (message: string) => {
      $q.notify({
        position: "center",
        type: "positive",
        timeout: 2000,
        message: message,
      });
    };
    const onConfirm = () => {
      // call native JS to valid mail
      $q.loading.show({
        delay: 400, // ms
      });
      const args = {
        mail: mail.value,
      };
      bridge.call("forgotPassword", args, (res: string) => {
        const apiResponse = JSON.parse(res) as ApiResponseDto<any>;
        $q.loading.hide();
        if (apiResponse.status == ApiResponseStatus.SUCCESS) {
          context.emit("confirm");
          alertSuccessMessage("Please check your mail");
        } else {
          errMsg.value = apiResponse.messageCode;
          alertErrorMessage(errMsg.value);
        }
      });
    };
    const mailFormatRule = (val: string) => {
      return new Promise((resolve) => {
        const reg =
          /[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/g;
        if (!val) {
          resolve("Please input mail");
        } else {
          if (!reg.test(mail.value)) {
            resolve("Please input correct format mail");
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
      errMsg,
      mail,
      visible,
      onClose,
      onConfirm,
      mailFormatRule,
    };
  },
});
export default ForgotPasswordComponent;
</script>
