<template>
  <div class="wrapper">
    <div class="header">
      <div style="width: 100%">
        <q-item clickable>
          <div v-if="isShowIcon">
            <q-item-section avatar @click="back">
              <q-icon name="arrow_back" />
            </q-item-section>
          </div>

          <q-item-section>
            <span style="font-size: 21px">Change Password</span></q-item-section
          >
          <!-- <div v-if="isShowIcon">
            <q-item-section avatar @click="home">
              <q-icon name="home" />
            </q-item-section>
          </div> -->
        </q-item>
      </div>
    </div>
    <div style="width: 95%; margin: 0 auto">
      <q-input
        v-model="currentPassword"
        filled
        placeholder="Current Password"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please input current password',
        ]"
      />
      <q-input
        v-model="newPassword"
        filled
        placeholder="New Password"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please input new password',
        ]"
      />
      <q-input
        v-model="reNewPassword"
        filled
        placeholder="Retype New Password"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Please input new password again',
        ]"
      />
    </div>
    <div
      style="
        position: fixed;
        bottom: 0px;
        width: 100%;
        display: flex;
        background: #027be3;
      "
    >
      <q-btn type="submit" color="primary" class="full-width" label="Cancel" />
      <div style="border: 1px solid white"></div>
      <q-btn type="submit" color="primary" class="full-width" label="Save" />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ProfileMaster } from "../models/profile";
const ChangePasswordView = defineComponent({
  setup() {
    const route = useRoute();
    const currentPassword = ref("");
    const newPassword = ref("");
    const reNewPassword = ref("");
    const isShowIcon = ref(true);
    onMounted(() => {
      const from = route.params.from;
      if (from == "Login") {
        isShowIcon.value = false;
      }
    });
    return {
      currentPassword,
      newPassword,
      reNewPassword,
      isShowIcon,
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
}
.header {
  background: #027be3;
  padding-top: 1px;
  padding-bottom: 1px;
  display: flex;
  color: #fff;
  justify-content: space-around;
  margin-bottom: 10px;
}
</style>
