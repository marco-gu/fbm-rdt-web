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
        <template v-if="imagesDisplay.length > 0">
          <div v-for="(item, index) in imagesDisplay" :key="index">
            <q-item class="card-item">
              <div class="card-item-labels" @click="onClick(item)">
                <q-item-label
                  >{{ $t("image.add_image_reason") }}:
                  {{ item.reason }}</q-item-label
                >
                <q-item-label>ClientCode: {{ item.clientCode }}</q-item-label>
                <q-item-label>SO: {{ item.so }}</q-item-label>
                <q-item-label>PO: {{ item.po }}</q-item-label>
                <q-item-label>CID: {{ item.cid }}</q-item-label>
              </div>
              <q-item-section side>
                <q-icon name="chevron_right" color="black" />
              </q-item-section>
            </q-item>
          </div>
        </template>
        <template v-else>
          <div class="no-record">{{ $t("image.no_record") }}</div>
        </template>
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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ImageModel } from "../models/image";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
const ImageAccessView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const imagesDisplay = ref([] as ImageModel[]);
    const imageResponse = ref([] as ImageModel[]);
    const router = useRouter();
    const i18n = useI18n();
    const titleParam = i18n.t("image.access_image_header");
    const search = ref();
    bridge.register("refreshCargoImages", () => {
      bridge.call("retrieveCargoImages", null, (data: string) => {
        imageResponse.value = JSON.parse(data) as ImageModel[];
        imagesDisplay.value = imageResponse.value;
      });
    });
    onMounted(() => {
      // calculate scroll area
      const scrollArea = document.getElementById("scroll-area") as any;
      const bottom = document.getElementById("bottom-button") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
      // retrieve
      bridge.call("retrieveCargoImages", null, (data: any) => {
        imageResponse.value = JSON.parse(data) as ImageModel[];
        imagesDisplay.value = imageResponse.value;
      });
    });
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
    watch(search, () => {
      if (search.value) {
        const filteredResult = imageResponse.value.filter(
          (item) =>
            item.so.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
            item.po.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
            item.cid.toLowerCase().indexOf(search.value.toLowerCase()) > -1 ||
            item.clientCode.toLowerCase().indexOf(search.value.toLowerCase()) >
              -1
        );
        imagesDisplay.value = filteredResult;
      } else {
        imagesDisplay.value = imageResponse.value;
      }
    });
    return {
      back,
      onClick,
      imagesDisplay,
      onAdd,
      titleParam,
      search,
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
