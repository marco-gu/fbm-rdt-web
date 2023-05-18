<template>
  <div class="wrapper">
    <!-- <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component> -->
    <common-header-component
      :titles="titleParam"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="back"
    />
    <div class="setting-page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form @submit="onSubmit" ref="myForm">
          <div class="field">
            <div class="input-title">
              <span class="text">{{ $t("login.current_password") }}</span>
            </div>
            <q-input
              class="input-field"
              :input-style="{ fontSize: '15px', padding: '3px 0 0 0px' }"
              input-class="text-left"
              v-model="currentPwd"
              lazy-rules
              :rules="[initPwdRule]"
              borderless
              :type="isPwd ? 'password' : 'text'"
            >
              <template v-slot:append>
                <q-icon
                  :color="isPwd ? 'gray' : 'secondary'"
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="field">
            <div class="input-title">
              <span class="text">{{ $t("login.new_password") }}</span>
            </div>
            <q-input
              class="input-field"
              :input-style="{ fontSize: '15px', padding: '3px 0 0 0px' }"
              input-class="text-left"
              v-model="newPwd"
              lazy-rules
              :rules="[newPwdRule]"
              borderless
              :type="isNewPwd ? 'password' : 'text'"
            >
              <template v-slot:append>
                <q-icon
                  :color="isNewPwd ? 'gray' : 'secondary'"
                  :name="isNewPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isNewPwd = !isNewPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="field">
            <div class="input-title">
              <span class="text">{{ $t("login.retype_password") }}</span>
            </div>
            <q-input
              class="input-field"
              :input-style="{ fontSize: '15px', padding: '3px 0 0 0px' }"
              input-class="text-left"
              v-model="reNewPwd"
              lazy-rules
              :rules="[reNewPwdRule]"
              borderless
              :type="isNewRePwd ? 'password' : 'text'"
            >
              <template v-slot:append>
                <q-icon
                  :color="isNewRePwd ? 'gray' : 'secondary'"
                  :name="isNewRePwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isNewRePwd = !isNewRePwd"
                />
              </template>
            </q-input>
          </div>
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
    <PopupComponent
      :visible="popupVisible"
      :message="msg"
      :type="type"
      @close="popupConfirm"
    ></PopupComponent>
    <NotifyComponent
      :visible="notifyVisible"
      :message="msg"
      @close="onCloseNotify"
    >
    </NotifyComponent>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { UpdateLoginUser } from "@/models/login.response";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import md5 from "md5";
import { closeLoading, showLoading } from "@/plugin/loadingPlugins";
import { useI18n } from "vue-i18n";
// import HeaderComponent from "@/components/HeaderComponent.vue";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import NotifyComponent from "@/components/NotifyComponent.vue";
const ResetPwdView = defineComponent({
  components: {
    // HeaderComponent,
    CommonHeaderComponent,
    PopupComponent,
    NotifyComponent,
  },
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
    const isNewPwd = ref(true);
    const isNewRePwd = ref(true);
    const myForm = ref();
    var titleParam: Ref<string[]> = ref([i18n.t("setting.reset_password")]);
    const type = ref("");
    const msg = ref("");
    const popupVisible = ref(false);
    const notifyVisible = ref(false);
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
      if (from.value == "LoginView") {
        currentPwd.value = initPwd.value;
      } else if (from.value == "SettingView") {
        titleParam.value = [
          i18n.t("setting.setting_header"),
          i18n.t("setting.reset_password"),
        ];
      }
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
              notifyVisible.value = true;
              msg.value = i18n.t("messageCode.E93-02-0001");
            } else if (androidResponse.status == AndroidResponseStatus.ERROR) {
              type.value = "error";
              popupVisible.value = true;
              msg.value = i18n.t("messageCode." + androidResponse.messageCode);
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
        const regHasNum = /[0-9]/g;
        const regHasLetter = /[a-z]|[A-Z]/g;
        const regHasLowercaseLetter = /[a-z]/g;
        const regHasUppercaseLetter = /[A-Z]/g;
        if (!val) {
          const message = i18n.t("messageCode.E93-02-0006");
          resolve(message);
        } else {
          if (newPwd.value.length < 8) {
            const message = i18n.t("messageCode.E93-02-0004");
            resolve(message);
          } else {
            if (
              !regHasLetter.test(newPwd.value) ||
              !regHasNum.test(newPwd.value)
            ) {
              const message = i18n.t("messageCode.E93-02-0008");
              resolve(message);
            } else if (
              !regHasLowercaseLetter.test(newPwd.value) ||
              !regHasUppercaseLetter.test(newPwd.value)
            ) {
              const message = i18n.t("messageCode.E93-02-0009");
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
        router.push("/home");
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    const back = () => {
      if (from.value == "LoginView") {
        router.push("/home");
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    const popupConfirm = () => {
      popupVisible.value = false;
      if (from.value == "LoginView") {
        router.push("/home");
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    const home = () => {
      router.push({
        path: "/home",
      });
    };
    const onCloseNotify = () => {
      notifyVisible.value = false;
      if (from.value == "LoginView") {
        router.push("/home");
      } else if (from.value == "SettingView") {
        router.push("/setting");
      }
    };
    return {
      titleParam,
      isPwd,
      onSubmit,
      cancel,
      close,
      back,
      currentPwd,
      newPwd,
      reNewPwd,
      initPwdRule,
      newPwdRule,
      reNewPwdRule,
      myForm,
      type,
      popupVisible,
      msg,
      isNewPwd,
      isNewRePwd,
      popupConfirm,
      home,
      onCloseNotify,
      notifyVisible,
    };
  },
});
export default ResetPwdView;
</script>
<style lang="scss" scoped>
.input-label {
  color: black;
  text-align: left;
  font-size: $--card-font-size;
}
.q-field {
  height: 43px;
  padding: 0 0 0 10px;
}
</style>
