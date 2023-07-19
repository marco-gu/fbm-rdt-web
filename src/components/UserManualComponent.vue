<template>
  <div class="wrapper">
    <common-header-component
      :titles="[$t('home.user_manual')]"
      :icons="['back', 'empty', 'home']"
      @onBack="() => router.push('/home')"
      @onHome="() => router.push('/home')"
    />
    <div class="page-content image-gallery" style="padding-top: 0px">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div class="image-container" v-for="image in images" :key="image">
          <img :src="image" alt="Image" class="full-page-image" />
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, Ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { setContentHeight } from "@/utils/screen.util";
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";

const UserManual = defineComponent({
  components: {
    CommonHeaderComponent,
  },

  setup() {
    const router = useRouter();
    const store = useStore();
    const images: Ref<string[]> = ref([]);

    onMounted(() => {
      const deviceHeight = store.state.screenModule.screenHeight;
      setContentHeight("scroll-area", deviceHeight);

      images.value = Array.from({ length: 21 }, (_, index) =>
        require(`@/assets/LNS_Scanapp_User_Manual/LNS_Scanapp_User_Manual-${(
          index + 1
        )
          .toString()
          .padStart(2, "0")}.png`)
      );
    });

    return {
      router,
      images,
    };
  },
});
export default UserManual;
</script>
<style lang="scss" scoped>
.wrapper {
  background-color: #eee;
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
