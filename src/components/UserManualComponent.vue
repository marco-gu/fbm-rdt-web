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
        <div class="image-gallery">
          <div class="image-container" v-for="image in images" :key="image">
            <img :src="image" alt="Image" class="full-page-image" />
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, toRefs, watch, onMounted, Ref } from "vue";
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

    const images: Ref<string[]> = ref([]);

    onMounted(() => {
      images.value = Array.from({ length: 21 }, (_, index) =>
        require(`@/assets/LNS_Scanapp_User_Manual/LNS_Scanapp_User_Manual-${(
          index + 1
        )
          .toString()
          .padStart(2, "0")}.png`)
      );
    });
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
      images,
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

.image-gallery {
  overflow-y: scroll;
  height: 100vh;
}

.image-container {
  width: 100%;
  height: auto;
}

.full-page-image {
  width: 100%;
  height: auto;
}
</style>
