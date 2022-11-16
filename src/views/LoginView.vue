<template>
  <div class="container">
    <q-img
      :src="maerskLogo"
      no-spinner
      style="max-width: 300px; max-height: 180px"
    />
    <q-form @submit="onSubmit">
      <div class="login-form">
        <q-input
          clearable
          v-model="username"
          filled
          placeholder="Username"
          lazy-rules
          :rules="[userNameRule]"
        />
        <q-input
          style="margin-top: 5px"
          clearable
          v-model="password"
          filled
          placeholder="Password"
          :type="isPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[passwordRule]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <q-btn class="login-button" push type="submit">
        {{ loginLabel }}
      </q-btn>
      <div class="login-link">
        <span @click="clickUserManual">
          <a href="#">{{ helpLabel }}</a>
        </span>
        <span @click="clickForgotPwd">
          <a href="#">{{ forgotPwdLabel }}?</a>
        </span>
      </div>
    </q-form>
    <UserManual :dialogVisible="userManualVisible" @close="onCloseUserManual">
    </UserManual>
    <ForgotPwdComponent
      :dialogVisible="forgotPwdVisible"
      @confirm="onConfirmForgotPassword"
      @close="onCloseForgotPassword"
    >
    </ForgotPwdComponent>
    <div class="login-bottom">
      <q-badge transparent align="middle" color="orange" outline>
        Ver 0.1 Beta, Prod
      </q-badge>
    </div>
  </div>
</template>
<script lang="ts">
import { useRouter } from "vue-router";
import bridge from "dsbridge";
import { defineComponent, onMounted, ref, watch } from "vue";
import logo from "../assets/images/Maersk_Logo_RGB.svg";
import { useQuasar } from "quasar";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "../models/android.response";
import { LoginResponse } from "../models/login.response";
import md5 from "md5";
import ForgotPwdComponent from "@/components/ForgotPwdComponent.vue";
import UserManual from "@/components/UserManualComponent.vue";
import { useI18n } from "@/plugin/i18nPlugins";
import { showLoading, closeLoading } from "@/plugin/loadingPlugins";
import { popupErrorMsg } from "@/plugin/popupPlugins";
const LoginView = defineComponent({
  components: {
    UserManual,
    ForgotPwdComponent,
  },
  setup() {
    const router = useRouter();
    const i18n = useI18n();
    const $q = useQuasar();
    const maerskLogo = logo;
    const loginLabel = ref("");
    const helpLabel = ref("");
    const forgotPwdLabel = ref("");
    const username = ref("");
    const password = ref("");
    const forgotPwdVisible = ref(false);
    const userManualVisible = ref(false);
    const isPwd = ref(true);
    onMounted(() => {
      bridge.call("getSettingLanguage", null, (res: string) => {
        i18n.category.value = "LoginView";
        i18n.locale.value = res;
        loginLabel.value = i18n.$t("login");
        helpLabel.value = i18n.$t("help");
        forgotPwdLabel.value = i18n.$t("forgotPassword");
      });
      bridge.call("checkUserUid", null, (res: string) => {
        if (res) {
          username.value = res.toUpperCase();
        }
      });
    });
    const clickUserManual = () => {
      userManualVisible.value = true;
    };
    const onCloseUserManual = () => {
      userManualVisible.value = false;
    };
    const clickForgotPwd = () => {
      forgotPwdVisible.value = true;
    };
    const onCloseForgotPassword = () => {
      forgotPwdVisible.value = false;
    };
    const onConfirmForgotPassword = () => {
      forgotPwdVisible.value = false;
    };
    const userNameRule = (val: string) => {
      i18n.category.value = "MessageCode";
      return new Promise((resolve) => {
        if (!val) {
          const errMsg = i18n.$t("E00-01-0005");
          resolve(errMsg);
        } else {
          resolve(true);
        }
      });
    };
    const passwordRule = (val: string) => {
      i18n.category.value = "MessageCode";
      return new Promise((resolve) => {
        if (!val) {
          const errMsg = i18n.$t("E00-01-0006");
          resolve(errMsg);
        } else {
          resolve(true);
        }
      });
    };
    watch(
      username,
      () => {
        if (username.value != null) {
          username.value = username.value.toUpperCase();
        }
      },
      { immediate: true }
    );
    const onSubmit = () => {
      showLoading($q);
      const args = {
        username: username.value.toUpperCase(),
        password: md5(password.value),
      };
      bridge.call("login", args, (res: string) => {
        closeLoading($q);
        const androidResponse = JSON.parse(
          res
        ) as AndroidResponse<LoginResponse>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          if (androidResponse.data.autoGeneratedPassword) {
            router.push({
              name: "resetPwd",
              params: {
                from: "LoginView",
                username: username.value,
                password: password.value,
              },
            });
          } else {
            router.push("/home");
          }
        } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
          i18n.category.value = "MessageCode";
          const message = i18n.$t(androidResponse.messageCode);
          popupErrorMsg($q, message);
        }
      });
    };
    return {
      username,
      userNameRule,
      password,
      passwordRule,
      forgotPwdLabel,
      loginLabel,
      helpLabel,
      maerskLogo,
      isPwd,
      forgotPwdVisible,
      userManualVisible,
      onSubmit,
      clickUserManual,
      onCloseUserManual,
      clickForgotPwd,
      onCloseForgotPassword,
      onConfirmForgotPassword,
    };
  },
});
export default LoginView;
</script>
<style scoped>
.container {
  position: relative;
  width: 360px;
  padding: 15% 0 0;
  margin: auto;
  min-height: 600px;
  height: 100vh;
}
.login-form {
  width: 85%;
  margin: auto;
}
.login-link {
  width: 84%;
  margin: auto;
  display: flex;
  justify-content: space-between;
}
.login-link a {
  color: black;
}
.login-button {
  width: 85%;
  height: 50px;
  margin: 15px auto 10px;
  background-color: #00243d;
  color: white;
}
.login-bottom {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
}
</style>
