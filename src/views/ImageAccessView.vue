<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("image.access_image_header") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
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
    </div>
    <div class="content">
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
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const ImageAccessView = defineComponent({
  setup() {
    const pageTitle = "Cargo Images";
    const images = ref([] as ImageModel[]);
    const router = useRouter();
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
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
    const home = () => {
      router.push("/home");
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
      home,
      onScan,
      onSearch,
      onClick,
      images,
      onAdd,
      homeIcon,
      arrowIcon,
    };
  },
});
export default ImageAccessView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-with-search;
}
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
.bottom {
  position: fixed;
  bottom: 20px;
}
</style>
