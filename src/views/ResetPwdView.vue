<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("login.change_password") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="setting-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div class="input-label">{{ $t("login.current_password") }}</div>
          <q-input
            v-model="currentPwd"
            outlined
            dense
            :type="isPwd ? 'password' : 'text'"
            :placeholder="$t('login.current_password_hint')"
            lazy-rules
            :rules="[initPwdRule]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="input-label">{{ $t("login.new_password") }}</div>
          <q-input
            v-model="newPwd"
            outlined
            dense
            :type="isPwd ? 'password' : 'text'"
            :placeholder="$t('login.new_password_hint')"
            lazy-rules
            :rules="[newPwdRule]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <div class="input-label">{{ $t("login.retype_password") }}</div>
          <q-input
            v-model="reNewPwd"
            outlined
            dense
            :type="isPwd ? 'password' : 'text'"
            :placeholder="$t('login.retype_password_hint')"
            lazy-rules
            :rules="[reNewPwdRule]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.cancel')"
        @click="cancel"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('common.save')"
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
import { LogoutResponse, UpdateLoginUser } from "@/models/login.response";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import md5 from "md5";
import { popupErrorMsg, popupSuccessMsg } from "@/plugin/popupPlugins";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { useI18n } from "vue-i18n";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const ResetPwdView = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();
    const i18n = useI18n();
    const currentPwd = ref("");
    const newPwd = ref("");
    const reNewPwd = ref("");
    const username = ref("");
    const initPwd = ref();
    const from = ref("");
    const isPwd = ref(true);
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const myForm = ref();
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
      from.value = route.params.from as string;
      username.value = route.params.username as string;
      initPwd.value = route.params.password as string;
    });
    const onSubmit = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          showLoading($q);
          const args: UpdateLoginUser = {
            username: username.value,
            password: md5(newPwd.value),
            autoGeneratedPassword: false,
          };
          bridge.call("resetPassword", args, (res: string) => {
            closeLoading($q);
            const androidResponse = JSON.parse(res) as AndroidResponse<unknown>;
            if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
              const message = i18n.t("messageCode.E93-02-0001");
              if (from.value == "LoginView") {
                router.push("/home");
              } else if (from.value == "SettingView") {
                router.push("/setting");
              }
              popupSuccessMsg($q, message);
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              const message = i18n.t(
                "messageCode." + androidResponse.messageCode
              );
              popupErrorMsg($q, message);
            }
          });
        }
      });
    };
    const initPwdRule = (val: string) => {
      return new Promise((resolve) => {
        if (!val) {
          const message = i18n.t("messageCode.E93-02-0005");
          resolve(message);
        } else {
          if (from.value === "SettingView") {
            if (md5(currentPwd.value) != initPwd.value) {
              const message = i18n.t("messageCode.E93-02-0003");
              resolve(message);
            } else {
              resolve(true);
            }
          } else {
            if (currentPwd.value != initPwd.value) {
              const message = i18n.t("messageCode.E93-02-0003");
              resolve(message);
            } else {
              resolve(true);
            }
          }
        }
      });
    };
    const newPwdRule = (val: string) => {
      return new Promise((resolve) => {
        const reg = /[A-Z]+/g;
        const reg2 = /[0-9]+/g;
        if (!val) {
          const message = i18n.t("messageCode.E93-02-0006");
          resolve(message);
        } else {
          if (newPwd.value.length < 8) {
            const message = i18n.t("messageCode.E93-02-0004");
            resolve(message);
          } else {
            if (!reg.test(newPwd.value)) {
              const message = i18n.t("messageCode.E93-02-0004");
              resolve(message);
            } else if (!reg2.test(newPwd.value)) {
              const message = i18n.t("messageCode.E93-02-0004");
              resolve(message);
            } else {
              resolve(true);
            }
          }
        }
      });
    };
    const reNewPwdRule = (val: string) => {
      return new Promise((resolve) => {
        if (!val) {
          const message = i18n.t("messageCode.E93-02-0007");
          resolve(message);
        } else {
          if (newPwd.value != reNewPwd.value) {
            const message = i18n.t("messageCode.E93-02-0002");
            resolve(message);
          } else {
            resolve(true);
          }
        }
      });
    };
    const cancel = () => {
      if (from.value == "LoginView") {
        bridge.call("logout", null, (data: string) => {
          const androidResponse = JSON.parse(
            data
          ) as AndroidResponse<LogoutResponse>;
          if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
            const message = i18n.t("messageCode.E93-06-0001");
            router.push("/");
            popupSuccessMsg($q, message);
          }
        });
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    const back = () => {
      if (from.value == "LoginView") {
        cancel();
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    return {
      isPwd,
      onSubmit,
      cancel,
      back,
      currentPwd,
      newPwd,
      reNewPwd,
      initPwdRule,
      newPwdRule,
      reNewPwdRule,
      homeIcon,
      arrowIcon,
      myForm,
    };
  },
});
export default ResetPwdView;
</script>
<style lang="scss" scoped>
.setting-content {
  margin-top: $--page-content-margin-top-no-search;
}
.input-label {
  color: black;
  text-align: left;
  font-size: $--card-font-size;
}
// .bottom {
//   position: fixed;
//   bottom: $--page-bottom-margin-bottom;
//   .q-btn:nth-child(2) {
//     margin-top: 10px;
//   }
// }
</style>
