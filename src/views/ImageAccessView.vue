<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="search">
        <q-input
          v-model="search"
          outlined
          dense
          :placeholder="$t('common.search')"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div v-for="(item, index) in images" :key="index">
          <q-item class="card-item">
            <div class="card-item-labels" @click="onClick(item)">
              <q-item-label>Reason: {{ item.reason }}</q-item-label>
              <q-item-label>SO: {{ item.so }}</q-item-label>
              <q-item-label>PO: {{ item.po }}</q-item-label>
              <q-item-label>CID: {{ item.cid }}</q-item-label>
            </div>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </q-item>
        </div>
      </q-scroll-area>
    </div>
    <div class="bottom-button" id="bottom-button">
      <q-btn
        no-caps
        flat
        unelevated
        @click="onAdd"
        class="full-width"
        :label="$t('image.access_image_button')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "@vue/runtime-core";
import bridge from "dsbridge";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ImageModel } from "../models/image";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
const ImageAccessView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const pageTitle = "Cargo Images";
    const images = ref([] as ImageModel[]);
    const router = useRouter();
    const i18n = useI18n();
    const titleParam = i18n.t("image.access_image_header");
    bridge.register("refreshCargoImages", () => {
      bridge.call("retrieveCargoImages", null, (data: string) => {
        images.value = JSON.parse(data) as ImageModel[];
      });
    });
    onMounted(() => {
      // calculate scroll area
      const scrollArea = document.getElementById("scroll-area") as any;
      const bottom = document.getElementById("bottom-button") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
      // retrieve
      bridge.call("retrieveCargoImages", null, (data: any) => {
        images.value = JSON.parse(data) as ImageModel[];
      });
    });
    const onScan = () => {
      alert("scan");
    };
    const onSearch = () => {
      alert("search");
    };
    const back = () => {
      router.push({
        path: "/home",
        query: {
          leftDrawerOpen: "true",
        },
      });
    };
    const onClick = (item: ImageModel) => {
      const args = {
        cartonID: item.cid,
        taskID: item.taskID,
      };
      bridge.call("enterCargoImage", args);
    };
    const onAdd = () => {
      router.push("/cargoImage");
    };
    return {
      back,
      pageTitle,
      onScan,
      onSearch,
      onClick,
      images,
      onAdd,
      titleParam,
    };
  },
});
export default ImageAccessView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
  .card-item-labels {
    width: 100%;
    text-align: left;
    align-items: center;
  }
}
.show {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
