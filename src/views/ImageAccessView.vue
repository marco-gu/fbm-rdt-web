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
      <div v-for="(item, index) in images" :key="index">
        <q-card class="my-card" @click="onClick(item)">
          <div class="card-left">
            <div>
              <span>Reason: &nbsp;</span>
              <span>{{ item.reason }}</span>
            </div>
            <div class="mt-8">
              <span>SO: &nbsp;</span>
              <span>{{ item.so }}</span>
            </div>
          </div>
          <div>
            <div>
              <span>CID: &nbsp;</span>
              <span>{{ item.cid }}</span>
            </div>
            <div class="mt-8">
              <span>PO: &nbsp;</span>
              <span>{{ item.po }}</span>
            </div>
          </div>
          <div>
            <q-item-section side>
              <q-icon name="chevron_right" color="black" />
            </q-item-section>
          </div>
        </q-card>
      </div>
    </div>
    <div class="button-bottom">
      <q-btn
        no-caps
        @click="onAdd"
        class="full-width"
        :label="$t('image.access_image_button')"
        color="secondary"
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
      // retrieve
      bridge.call("retrieveCargoImages", null, (data: string) => {
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
  padding: 0 20px;
  margin-top: 13px;
}
.my-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 15px;
  margin-bottom: 10px;
  text-align: left;
  .card-left {
    padding: 8px 0px 8px 15px;
  }
  .mt-8 {
    margin-top: 8px;
  }
}

// .table-header {
//   background: #00243d;
//   color: #ffffff;
//   height: 48.3px;
//   text-align: center;
//   font-size: 16px;
// }
// .images-content {
//   background: #ffffff;
//   color: gray;
//   height: 50.6px;
//   text-align: center;
//   font-size: 16px;
// }
.show {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.button-bottom {
  margin-left: 20px;
  position: fixed;
  bottom: 20px;
  width: calc(100% - 40px);
}
</style>
