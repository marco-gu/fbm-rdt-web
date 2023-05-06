<template>
  <q-dialog
    v-model="persistent"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <div class="dialog-container">
      <div class="dialog-container__title">
        <q-icon :name="iconName" :color="iconColor" />
        {{ title }}
      </div>
      <div class="dialog-container__content">
        {{ prompt }}
      </div>
      <div class="dialog-container__button">
        <template v-if="dialogType == 'action'">
          <button
            class="dialog-button cancel"
            style="margin-right: 10px"
            @click="cancel"
          >
            {{ $t("common.cancel") }}
          </button>
        </template>
        <button class="dialog-button confirm" @click="confirm">
          {{ label }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
enum DialogType {
  INFO = "info",
  ERROR = "error",
  SUCCESS = "success",
  ALERT = "alert",
  ACTION = "action",
}
enum DialogIconColor {
  GREEN = "green",
  RED = "red",
  BLUE = "secondary",
}
const PopupComponent = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    messageCode: {
      type: String,
      default: "",
    },
    message: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  emits: ["cancel", "close"],
  setup(props, context) {
    const router = useRouter();
    const { visible, message, messageCode, type } = toRefs(props);
    const label = ref("");
    const prompt = ref("");
    const i18n = useI18n();
    const iconName = ref("");
    const iconColor = ref("");
    const title = ref("");
    const returnHome = ref(false);
    const persistent = ref(false);
    const dialogType = ref("");
    const cancel = () => {
      persistent.value = false;
      context.emit("cancel");
    };
    const confirm = () => {
      persistent.value = false;
      if (returnHome.value) {
        router.push("/");
      } else {
        context.emit("close");
      }
    };
    watch(
      visible,
      (newValue) => {
        persistent.value = newValue;
        if (persistent.value) {
          prompt.value = message.value as string;
          switch (type.value) {
            case DialogType.SUCCESS:
              iconName.value = "check_circle";
              iconColor.value = DialogIconColor.GREEN;
              title.value = i18n.t("common.success");
              label.value = i18n.t("common.confirm");
              break;
            case DialogType.INFO:
              iconName.value = "info";
              iconColor.value = DialogIconColor.GREEN;
              title.value = i18n.t("common.info");
              label.value = i18n.t("common.confirm");
              break;
            case DialogType.ACTION:
              iconName.value = "info";
              iconColor.value = DialogIconColor.BLUE;
              title.value = i18n.t("common.info");
              label.value = i18n.t("common.confirm");
              dialogType.value = DialogType.ACTION;
              break;
            case DialogType.ERROR:
              iconName.value = "error_outline";
              iconColor.value = DialogIconColor.RED;
              title.value = i18n.t("common.error");
              if (
                messageCode.value == "E92-99-0003" ||
                messageCode.value == "E92-99-0004"
              ) {
                returnHome.value = true;
                label.value = i18n.t("common.ok");
              } else {
                label.value = i18n.t("common.cancel");
              }
              break;
          }
        }
      },
      { immediate: true }
    );
    return {
      prompt,
      persistent,
      label,
      iconName,
      title,
      confirm,
      iconColor,
      dialogType,
      cancel,
    };
  },
});
export default PopupComponent;
</script>
