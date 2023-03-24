<template>
  <div class="wrapper">
    <header-component :titleParam="titleParam" :backUrlParam="backUrlParam">
    </header-component>
    <div class="page-content">
      <div class="sub-title-card">
        <div v-if="taskDisplay.isMix == 1">{{ taskId }}+Mix</div>
        <div v-else>{{ taskId }}</div>
      </div>
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <template v-if="pageType == 'Group'">
          <div
            v-show="taskDisplay.scannedCartonNumber > 0"
            @click="onClickLP(taskDisplay)"
          >
            <q-item class="card-item">
              <div class="card-item-content">
                <div class="card-item-left">
                  <q-item-section>
                    <div
                      v-show="
                        taskDisplay.containerNumber != '' &&
                        taskDisplay.containerNumber != null
                      "
                    >
                      <q-item-label
                        >Container:
                        {{ taskDisplay.containerNumber }}</q-item-label
                      >
                    </div>
                    <div
                      v-show="taskDisplay.po != '' && taskDisplay.po != null"
                    >
                      <q-item-label>PO: {{ taskDisplay.po }}</q-item-label>
                    </div>
                    <div
                      v-show="taskDisplay.sku != '' && taskDisplay.sku != null"
                    >
                      <q-item-label>SKU: {{ taskDisplay.sku }}</q-item-label>
                    </div>
                  </q-item-section>
                </div>
                <div class="card-item-right">
                  <q-item-section>
                    <q-item-label>
                      {{ $t("dataManagement.count") }}:
                      {{ taskDisplay.scannedCartonNumber }}</q-item-label
                    >
                  </q-item-section>
                </div>
              </div>
              <q-item-section side>
                <q-icon name="chevron_right" color="black" />
              </q-item-section>
            </q-item>
          </div>
        </template>
        <template v-else>
          <template v-if="noRecord">
            <div class="no-record">{{ $t("common.no_record") }}</div>
          </template>
          <template v-if="refreshloading">
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
          <q-infinite-scroll @load="onLoad" :offset="20" ref="myInfiniteScroll">
            <div
              v-for="(item, index) in defaultDisplay"
              :key="index"
              @click="onClickCarton(item)"
            >
              <q-item class="card-item">
                <div class="card-detail-left">
                  <q-item-section>
                    <div
                      v-show="
                        item.containerNumber != '' &&
                        item.containerNumber != null
                      "
                    >
                      <q-item-label
                        >Container: {{ item.containerNumber }}</q-item-label
                      >
                    </div>
                    <div v-show="item.po != '' && item.po != null">
                      <q-item-label>PO: {{ item.po }}</q-item-label>
                    </div>
                    <div v-show="item.sku != '' && item.sku != null">
                      <q-item-label>SKU: {{ item.sku }}</q-item-label>
                    </div>
                    <div v-show="item.cartonId != '' && item.cartonId != null">
                      <q-item-label>CID: {{ item.cartonId }}</q-item-label>
                    </div>
                  </q-item-section>
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
        </template>
      </q-scroll-area>
    </div>
    <div class="bottom row" id="bottom-button">
      <q-btn
        class="col btnGeneral"
        no-caps
        :class="pageType == 'Group' ? 'btnSelected' : ''"
        flat
        push
        :label="$t('dataManagement.group_view')"
        @click="changPageType('Group')"
      />

      <q-btn
        class="col btnGeneral"
        no-caps
        :class="pageType == 'Detail' ? 'btnSelected' : ''"
        flat
        type="submit"
        push
        :label="$t('dataManagement.detail_view')"
        @click="changPageType('Detail')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted } from "@vue/runtime-core";
import { Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP, Carton } from "../models/profile";
import { useI18n } from "vue-i18n";
import HeaderComponent from "@/components/HeaderComponent.vue";

const DataMgmtView = defineComponent({
  components: {
    HeaderComponent,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const taskId = ref(route.query.taskId);
    const pageType = ref("Group");
    const i18n = useI18n();
    const titleParam =
      pageType.value == "Group"
        ? i18n.t("dataManagement.group_title")
        : i18n.t("dataManagement.detail_title");
    const backUrlParam = "/dataManagement";
    const taskDisplay: Ref<LP> = ref({} as LP);

    const apiIndex = ref(0);
    const defaultDisplay = ref([] as Carton[]);
    const apiResult = ref([] as Carton[]);
    const refreshloading = ref(false);
    const myInfiniteScroll = ref();
    const myScrollArea = ref();
    const noRecord = ref(false);
    const input = ref();

    var retrieved = false; //这个界面的 onLoad 方法加载页面就会调用，写一个变量控制onLoad不执行

    onBeforeMount(() => {
      refreshloading.value = true;

      if (typeof taskId.value === "string") {
        fetchTaskByTaskId(taskId.value);
        getLPDetailList(taskId.value);
      }
      if (typeof route.query.pageType === "string") {
        pageType.value = route.query.pageType;
      }
    });
    const onLoad = (index: any, done: any) => {
      if (!retrieved) {
        done();
        return;
      }
      //console.log("onLoad");
      const start = apiIndex.value * 10;
      const end = (apiIndex.value + 1) * 10;
      // console.log(
      //   "apiIndex:" + apiIndex.value + " start:" + start + " end:" + end
      // );
      setTimeout(() => {
        // console.log(
        //   "onLoad start apiResult:" +
        //     apiResult.value.length +
        //     " defaultDisplay:" +
        //     defaultDisplay.value.length
        // );
        for (let i = start; i < end; i++) {
          if (
            apiResult.value[i] &&
            defaultDisplay.value.length < apiResult.value.length
          ) {
            defaultDisplay.value.push(apiResult.value[i]);
          }
        }
        if (defaultDisplay.value.length == (apiIndex.value + 1) * 10) {
          apiIndex.value++;
        } else {
          myInfiniteScroll.value.stop();
        }
        // console.log(
        //   "onLoad end apiResult:" +
        //     apiResult.value.length +
        //     " defaultDisplay:" +
        //     defaultDisplay.value.length
        // );
        done();
      }, 200);
    };

    onMounted(() => {
      // calculate scroll area
      const scrollArea = document.getElementById("scroll-area") as any;
      const bottom = document.getElementById("bottom-button") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
    });

    const onClickLP = (item: any) => {
      router.push({
        path: "/dataMgmtGDEdit",
        query: {
          taskId: item.taskId,
          pageType: pageType.value,
        },
      });
    };

    const onClickCarton = (item: any) => {
      localStorage.setItem("dataMgmtCarton", JSON.stringify(item));
      router.push({
        path: "/dataMgmtGDEdit",
        query: {
          taskId: item.taskId,
          pageType: pageType.value,
        },
      });
    };

    const changPageType = (type: string) => {
      pageType.value = type;
    };

    const fetchTaskByTaskId = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      bridge.call("fetchTaskByTaskId", args, (res: string) => {
        taskDisplay.value = JSON.parse(res) as LP;
      });
    };

    const getLPDetailList = (taskId: string) => {
      const args = {
        taskId: taskId,
      };
      //console.log("fetchLPByTaskIdForDataManagement");
      bridge.call("fetchLPByTaskIdForDataManagement", args, (res: string) => {
        refreshloading.value = false;
        apiResult.value = JSON.parse(res) as Carton[];

        const deepCopyRef = ref(apiResult.value.map((item) => item));

        if (apiResult.value.length == 0) {
          noRecord.value = true;
        } else {
          if (apiResult.value.length > 10) {
            defaultDisplay.value = deepCopyRef.value.slice(0, 10);
            apiIndex.value++;
          } else {
            defaultDisplay.value = deepCopyRef.value;
            myInfiniteScroll.value.stop();
          }
        }
        retrieved = true;
        // console.log("fetchLPByTaskIdForDataManagement end");
        // console.log("defaultDisplay length", defaultDisplay.value.length);
      });
    };

    return {
      onClickLP,
      taskDisplay,
      taskId,
      pageType,
      changPageType,
      onClickCarton,
      titleParam,
      backUrlParam,
      onLoad,
      myInfiniteScroll,
      noRecord,
      input,
      myScrollArea,
      refreshloading,
      defaultDisplay,
    };
  },
});
export default DataMgmtView;
</script>
<style lang="scss" scoped>
.card-item {
  padding: 10px 0 10px 15px;
  .card-item-content {
    width: 100%;
    display: flex;
    text-align: left;
    word-break: break-all;
    justify-content: space-between;
    .card-item-left {
      flex: 3;
      align-self: center;
    }
    .card-item-right {
      flex: 1;
      align-self: center;
    }
  }
  .card-detail-left {
    width: 100%;
    align-self: center;
    text-align: left;
  }
}
.tab {
  background: #040000;
  color: #ffffff;
  text-align: center;
  font-size: 16px;
}
.btnGeneral {
  background: #42b0d5;
  color: #ffffff;
}
.btnSelected {
  background: #fff;
  color: #42b0d5;
}
.show {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.bottom {
  padding: 0px 20px;
  position: fixed;
  bottom: 20px;
  display: flex;
  width: 100%;
  border-radius: 5px;
}
</style>
