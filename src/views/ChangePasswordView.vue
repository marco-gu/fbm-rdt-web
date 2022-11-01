<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable>
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span class="header-title">Change Password</span></q-item-section
        >
      </q-item>
    </div>
    <q-separator />
    <q-card class="content-card">
      <q-form @submit="onSubmit">
        <div class="content-input">
          <q-input
            v-model="currentPassword"
            filled
            :type="isPwd ? 'password' : 'text'"
            placeholder="Current Password"
            lazy-rules
            :rules="[oldPasswordRule]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            v-model="newPassword"
            filled
            :type="isPwd ? 'password' : 'text'"
            placeholder="New Password"
            lazy-rules
            :rules="[newPasswordRule]"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
          <q-input
            v-model="reNewPassword"
            filled
            :type="isPwd ? 'password' : 'text'"
            placeholder="Retype New Password"
            lazy-rules
            :rules="[reNewPasswordRule]"
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
        <div class="bottom">
          <q-btn
            no-caps
            style="width: 48%"
            flat
            push
            label="Cancel"
            @click="cancel"
          />
          <q-separator vertical inset color="white" />
          <q-btn
            no-caps
            style="width: 52%"
            flat
            type="submit"
            push
            label="Save"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>
<script lang="ts">
import { ApiResponseDto } from "@/models/api.response";
import { LogoutResponse, UpdateLoginUser } from "@/models/login.response";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import md5 from "md5";

const ChangePasswordView = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    // username & password from Current Page
    const currentPassword = ref("");
    const newPassword = ref("");
    const reNewPassword = ref("");
    // username & password from Login Page
    const username = ref("");
    const oldPassword = ref();
    const from = ref("");
    const $q = useQuasar();
    onMounted(() => {
      from.value = route.params.from as string;
      username.value = route.params.username as string;
      oldPassword.value = route.params.password as string;
    });
    const oldPasswordRule = (val: string) => {
      return new Promise((resolve) => {
        if (!val) {
          resolve("Please input old Password");
        } else {
          if (currentPassword.value != oldPassword.value) {
            resolve("Password is not Correct");
          } else {
            resolve(true);
          }
        }
      });
    };
    const newPasswordRule = (val: string) => {
      return new Promise((resolve) => {
        const reg = /[A-Z]+/g;
        const reg2 = /[0-9]+/g;
        if (!val) {
          resolve("Please input New Password");
        } else {
          if (newPassword.value.length < 8) {
            resolve("Please input at least eigth charactors");
          } else {
            if (!reg.test(newPassword.value)) {
              resolve("Please input at least one upper");
            } else if (!reg2.test(newPassword.value)) {
              resolve("Please input at least one number");
            } else {
              resolve(true);
            }
          }
        }
      });
    };
    const reNewPasswordRule = (val: string) => {
      return new Promise((resolve) => {
        if (!val) {
          resolve("Please input New Password again");
        } else {
          if (newPassword.value != reNewPassword.value) {
            resolve("Two Password is different");
          } else {
            resolve(true);
          }
        }
      });
    };
    const cancel = () => {
      if (from.value == "LoginView") {
        bridge.call("logout", null, (data: string) => {
          const apiResponse = JSON.parse(
            data
          ) as ApiResponseDto<LogoutResponse>;
          if (apiResponse.data.isSuccess) {
            $q.notify({
              position: "center",
              color: "blue-5",
              textColor: "white",
              icon: "info",
              timeout: 2000,
              message: "Logout success",
            });
            router.push("/");
          }
        });
      }
    };
    const back = () => {
      if (from.value == "LoginView") {
        cancel();
      }
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
    return {
      isPwd: ref(true),
      cancel,
      back,
      onSubmit() {
        $q.loading.show({
          delay: 400,
        });
        const args: UpdateLoginUser = {
          username: username.value,
          password: md5(newPassword.value),
          autoGeneratedPassword: false,
        };
        bridge.call("resetPassword", args, (res: string) => {
          const apiResponse = JSON.parse(res) as ApiResponseDto<any>;
          $q.loading.hide();
          if (apiResponse.statusCode == 200) {
            router.push("/home");
          } else {
            alertErrorMessage(apiResponse.errorMessage);
          }
        });
      },
      currentPassword,
      newPassword,
      reNewPassword,
      oldPasswordRule,
      newPasswordRule,
      reNewPasswordRule,
    };
  },
});
export default ChangePasswordView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
  background-color: #dbdbdb;
}
.header {
  padding-top: 1px;
  padding-bottom: 1px;
  width: 100%;
  background-color: white;
  color: gray;
}
.header-title {
  font-size: 21px;
  color: black;
  margin-left: -10%;
}
.content-card {
  padding-top: 20px;
  padding-bottom: 5px;
}
.content-input {
  width: 95%;
  margin: 0 auto;
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
</style>
