<template>
  <q-dialog v-model="visible" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
        <span class="q-ml-sm">Do you want to add another mix carton?</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          v-close-popup
          @click="onClose"
        />
        <q-btn
          flat
          label="Confirm"
          color="primary"
          v-close-popup
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
const DialogComponent = defineComponent({
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
    const onClose = () => {
      context.emit("close");
    };
    const onConfirm = () => {
      context.emit("confirm");
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
      onClose,
      onConfirm,
    };
  },
});
export default DialogComponent;
</script>
