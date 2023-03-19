<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backFunctionParam="back">
    </header-component>
    <div class="page-content">
      <div class="search" id="search">
        <q-input
          ref="input"
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
      <q-scroll-area
        ref="myScrollArea"
        id="scroll-area"
        :thumb-style="{ width: '0px' }"
      >
        <template v-if="noRecord">
          <div class="no-record">{{ $t("common.no_record") }}</div>
        </template>
        <template v-if="loading">
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
        <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
          <div v-for="(item, index) in defaultDisplay" :key="index">
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
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImageModel } from "../models/image";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";
import {
  calScrollAreaWithBottom,
  softKeyPopUpWithSearch,
} from "@/utils/screen.util";
const virtualPageLimit = 20;
const ImageAccessView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    // const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    // page default display
    const defaultDisplay = ref([] as ImageModel[]);
    const imagesDisplay = ref([] as ImageModel[]);
    const onSearchMode = ref(false);
    const apiIndex = ref(0);
    const searchIndex = ref(0);
    const searchResult = ref([] as ImageModel[]);
    const apiResult = ref([] as ImageModel[]);
    const i18n = useI18n();
    const titleParam = i18n.t("image.access_image_header");
    const search = ref();
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const noRecord = ref(false);
    const input = ref();
    onBeforeMount(() => {
      loading.value = true;
      bridge.call("retrieveCargoImages", {}, (data: any) => {
        loading.value = false;
        apiResult.value = JSON.parse(data) as ImageModel[];
        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length > 10) {
            defaultDisplay.value = apiResult.value.slice(0, 10);
            apiIndex.value++;
          } else {
            defaultDisplay.value = apiResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
    });
    const onLoad = (index: any, done: any) => {
      if (onSearchMode.value) {
        const start = searchIndex.value * 10;
        const end = (searchIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (searchResult.value[i]) {
              defaultDisplay.value.push(searchResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (searchIndex.value + 1) * 10) {
            searchIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      } else {
        const start = apiIndex.value * 10;
        const end = (apiIndex.value + 1) * 10;
        setTimeout(() => {
          for (let i = start; i < end; i++) {
            if (apiResult.value[i]) {
              defaultDisplay.value.push(apiResult.value[i]);
            }
          }
          if (defaultDisplay.value.length == (apiIndex.value + 1) * 10) {
            apiIndex.value++;
          } else {
            myInfiniteScroll.value.stop();
          }
          done();
        }, 200);
      }
    };
    onMounted(() => {
      // calculate scroll area
      calScrollAreaWithBottom("scroll-area", "bottom-button");
      // softkey popup
      softKeyPopUpWithSearch(
        window.innerHeight,
        "scroll-area",
        "bottom-button"
      );
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
    const onClear = () => {
      search.value = "";
      onSearchMode.value = false;
      if (apiResult.value.length > 0) {
        noRecord.value = false;
        if (apiResult.value.length > 10) {
          defaultDisplay.value = apiResult.value.slice(0, 10);
          apiIndex.value = 1;
          myInfiniteScroll.value.resume();
        } else {
          defaultDisplay.value = apiResult.value;
          myInfiniteScroll.value.stop();
        }
      } else {
        noRecord.value = true;
      }
      searchIndex.value = 0;
      myScrollArea.value.setScrollPosition("vertical", 0);
    };
    watch(search, () => {
      if (search.value) {
        if (search.value.length >= 5) {
          input.value.blur();
          onSearch();
        } else if (search.value.length == 0) {
          onClear();
        }
      }
    });
    const onSearch = () => {
      const args = {
        condition: search.value.toUpperCase(),
      };
      myScrollArea.value.setScrollPosition("vertical", 0);
      onSearchMode.value = true;
      defaultDisplay.value = [];
      searchResult.value = [];
      bridge.call("searchCargoImages", args, (data: any) => {
        searchResult.value = JSON.parse(data) as ImageModel[];
        if (searchResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (searchResult.value.length > 10) {
            defaultDisplay.value = searchResult.value.slice(0, 10);
            searchIndex.value++;
            myInfiniteScroll.value.resume();
          } else {
            defaultDisplay.value = searchResult.value;
            myInfiniteScroll.value.stop();
          }
        }
      });
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
      noRecord,
      input,
      myScrollArea,
      loading,
      defaultDisplay,
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
