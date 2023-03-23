<template>
  <q-dialog
    v-model="persistent"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <template v-if="msgType == 'error'">
      <q-card style="min-width: 250px; background-color: #ef5350">
        <div style="display: flex; padding: 10px; justify-content: center">
          <div>
            <q-icon
              name="error_outline"
              size="18px"
              color="white"
              style="padding-bottom: 1px"
            />
          </div>
          <div style="margin-left: 10px; color: white">
            <div class="text-h7">{{ msg }}</div>
          </div>
        </div>
      </q-card>
    </template>
    <template v-if="msgType == 'success'">
      <q-card style="min-width: 250px; background-color: #21ba45">
        <div style="display: flex; padding: 10px; justify-content: center">
          <div>
            <q-icon
              name="check_circle"
              size="18px"
              style="padding-bottom: 1px"
              color="white"
            />
          </div>
          <div style="margin-left: 10px; color: white">
            <div class="text-h7">{{ msg }}</div>
          </div>
        </div>
      </q-card>
    </template>
    <template v-if="msgType == 'info'">
      <q-card style="min-width: 250px; background-color: #42a5f5">
        <div style="display: flex; padding: 10px; justify-content: center">
          <div>
            <q-icon
              name="info"
              size="18px"
              color="white"
              style="padding-bottom: 1px"
            />
          </div>
          <div style="margin-left: 10px; color: white">
            <div class="text-h7">{{ msg }}</div>
          </div>
        </div>
      </q-card>
    </template>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
const PopupComponent = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  emits: ["close"],
  setup(props, context) {
    const persistent = ref(false);
    const msg = ref("");
    const msgType = ref("");
    const { visible, message, type } = toRefs(props);
    watch(
      type,
      (newValue) => {
        msgType.value = newValue as string;
      },
      { immediate: true }
    );
    watch(
      message,
      (newValue) => {
        msg.value = newValue as string;
      },
      { immediate: true }
    );
    watch(
      visible,
      (newValue) => {
        persistent.value = newValue;
        if (persistent.value) {
          setTimeout(() => {
            context.emit("close");
          }, 1500);
        }
      },
      { immediate: true }
    );
    return {
      msg,
      persistent,
      msgType,
    };
  },
});
export default PopupComponent;
</script>
