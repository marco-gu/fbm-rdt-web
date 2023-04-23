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
        <button class="dialog-button confirm" @click="close">
          {{ buttonLabel }}
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
}
enum DialogIconColor {
  GREEN = "green",
  RED = "red",
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
  emits: ["close"],
  setup(props, context) {
    const router = useRouter();
    const { visible, message, messageCode, type } = toRefs(props);
    const buttonLabel = ref("");
    const prompt = ref("");
    const i18n = useI18n();
    const iconName = ref("");
    const iconColor = ref("");
    const title = ref("");
    const returnHome = ref(false);
    const persistent = ref(false);
    const close = () => {
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
              buttonLabel.value = i18n.t("common.ok");
              break;
            case DialogType.INFO:
              iconName.value = "info";
              iconColor.value = DialogIconColor.GREEN;
              title.value = i18n.t("common.info");
              buttonLabel.value = i18n.t("common.ok");
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
                buttonLabel.value = i18n.t("common.ok");
              } else {
                buttonLabel.value = i18n.t("common.cancel");
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
      buttonLabel,
      iconName,
      title,
      close,
      iconColor,
    };
  },
});
export default PopupComponent;
</script>
