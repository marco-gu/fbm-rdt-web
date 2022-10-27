<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="visible"
      :maximized="maximizedToggle"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <div class="wrapper">
        <div class="header">
          <q-item clickable>
            <q-item-section avatar @click="onClose" v-close-popup>
              <q-icon name="arrow_back" />
            </q-item-section>
            <q-item-section>
              <span class="header-title">User Manual</span></q-item-section
            >
          </q-item>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
const UserManual = defineComponent({
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, context) {
    const { dialogVisible } = toRefs(props);
    const visible = ref(false);
    const maximizedToggle = ref(true);
    const onClose = () => {
      context.emit("close");
    };
    watch(
      dialogVisible,
      (newValue) => {
        visible.value = newValue;
      },
      { immediate: true }
    );
    return {
      visible,
      maximizedToggle,
      onClose,
    };
  },
});
export default UserManual;
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
  color: black;
}
.header-title {
  font-size: 21px;
  color: black;
  margin-left: -10%;
}
</style>
