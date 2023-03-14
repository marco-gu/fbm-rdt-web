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
        >
          <template v-slot:prepend>
            <q-icon name="search" @click="onSearch" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="onClear" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-infinite-scroll @load="onLoad" :offset="50" ref="myInfiniteScroll">
          <div v-for="(item, index) in imagesDisplay" :key="index">
            <q-item class="card-item">
              <div class="card-item-labels" @click="onClick(item)">
                <div style="display: flex; flex: 1; flex-direction: column">
                  <div>
                    <q-item-label
                      >{{ $t("image.add_image_reason") }}:
                      {{ item.reason }}</q-item-label
                    >
                  </div>
                  <div>
                    <q-item-label>SO: {{ item.so }}</q-item-label>
                  </div>
                  <div>
                    <q-item-label>PO: {{ item.po }}</q-item-label>
                  </div>
                </div>
                <div style="display: flex; flex: 1; flex-direction: column">
                  <div>
                    <q-item-label>CID: {{ item.cid }}</q-item-label>
                  </div>
                  <div>
                    <q-item-label
                      >ClientCode: {{ item.clientCode }}</q-item-label
                    >
                  </div>
                </div>
              </div>
              <q-item-section side>
                <q-icon name="chevron_right" color="black" />
              </q-item-section>
            </q-item>
          </div>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>
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
import { defineComponent, onBeforeMount, onMounted } from "@vue/runtime-core";
import bridge from "dsbridge";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImageModel } from "../models/image";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
import { calScrollAreaWithBottom, softKeyPopUp } from "@/utils/screen.util";
const ImageAccessView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const imagesDisplay = ref([] as ImageModel[]);
    const i18n = useI18n();
    const titleParam = i18n.t("image.access_image_header");
    const search = ref();
    const param = route.query.data as any;
    const imagesSearchResult = ref([] as ImageModel[]);
    const imagesInitResult = ref([] as ImageModel[]);
    const myInfiniteScroll = ref();
    if (param) {
      imagesDisplay.value = JSON.parse(param) as ImageModel[];
    }
    onBeforeMount(() => {
      const args = {
        pageLimit: "20",
        pageOffset: 1,
      };
      bridge.call("retrieveCargoImages", args, (data: any) => {
        imagesInitResult.value = JSON.parse(data) as ImageModel[];
        imagesDisplay.value = imagesInitResult.value;
      });
    });
    onMounted(() => {
      // calculate scroll area
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      // softkey popup
      softKeyPopUp(window.innerHeight, "scroll-area", "bottom-button");
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
      router.push("/nativeBridge");
    };
    const onAdd = () => {
      router.push("/cargoImage");
    };
    const onLoad = (index: any, done: any) => {
      const args = {
        pageLimit: "20",
        pageOffset: index + 1,
      };
      bridge.call("retrieveCargoImages", args, (data: any) => {
        const result = JSON.parse(data) as ImageModel[];
        result.forEach((t) => {
          imagesInitResult.value.push(t);
        });
        imagesDisplay.value = imagesInitResult.value;
        done();
      });
    };
    const onSearch = () => {
      const args = {
        condition: search.value,
      };
      bridge.call("searchCargoImages", args, (data) => {
        imagesSearchResult.value = JSON.parse(data) as ImageModel[];
        imagesDisplay.value = imagesSearchResult.value;
        myInfiniteScroll.value.stop();
      });
    };
    const onClear = () => {
      search.value = "";
      imagesDisplay.value = imagesInitResult.value;
    };
    return {
      onClear,
      back,
      onClick,
      imagesDisplay,
      onAdd,
      search,
      titleParam,
      onSearch,
      onLoad,
      myInfiniteScroll,
    };
  },
});
export default ImageAccessView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
  .card-item-labels {
    display: flex;
    width: 100%;
    text-align: left;
  }
}
.show {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
