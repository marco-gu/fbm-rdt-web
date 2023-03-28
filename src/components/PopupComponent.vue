<template>
  <q-dialog
    v-model="persistent"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <template v-if="msgType == 'error'">
      <div class="dialog-container">
        <div
          style="
            padding: 15px 18px 0px 11px;
            font-size: 17px;
            font-weight: bold;
          "
        >
          <q-icon
            name="error_outline"
            size="18px"
            color="red"
            style="padding-bottom: 2px"
          />

          {{ $t("common.error") }}
        </div>
        <div class="dialog-container__content">
          {{ msg }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button confirm" @click="cancel">
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </template>
    <template v-if="msgType == 'success'">
      <div class="dialog-container">
        <div
          style="
            padding: 15px 18px 0px 11px;
            font-size: 17px;
            font-weight: bold;
          "
        >
          <q-icon
            name="check_circle"
            size="18px"
            color="green"
            style="padding-bottom: 2px"
          />

          {{ $t("common.success") }}
        </div>
        <div class="dialog-container__content">
          {{ msg }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button confirm" @click="cancel">
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </template>
    <template v-if="msgType == 'info'">
      <div class="dialog-container">
        <div
          style="
            padding: 15px 18px 0px 11px;
            font-size: 17px;
            font-weight: bold;
          "
        >
          <q-icon
            name="info"
            size="18px"
            color="green"
            style="padding-bottom: 2px"
          />

          {{ $t("common.info") }}
        </div>
        <div class="dialog-container__content">
          {{ msg }}
        </div>
        <div class="dialog-container__button">
          <button class="dialog-button confirm" @click="cancel">
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
      <!-- <q-card style="min-width: 250px; background-color: #42a5f5">
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
      </q-card> -->
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
    const cancel = () => {
      context.emit("close");
    };
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
      },
      { immediate: true }
    );
    return {
      msg,
      persistent,
      msgType,
      cancel,
    };
  },
});
export default PopupComponent;
</script>
