<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{
            pageType == "Group"
              ? $t("dataManagement.group_title")
              : $t("dataManagement.detail_title")
          }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
      <div class="card-sub-title">
        <div v-if="taskDisplay.isMix == 1">{{ taskId }}+Mix</div>
        <div v-else>{{ taskId }}</div>
      </div>
    </div>
    <div class="content">
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
                    <div v-show="taskDisplay.containerNumber != ''">
                      <q-item-label
                        >Container:
                        {{ taskDisplay.containerNumber }}</q-item-label
                      >
                    </div>
                    <div v-show="taskDisplay.po != ''">
                      <q-item-label>PO: {{ taskDisplay.po }}</q-item-label>
                    </div>
                    <div v-show="taskDisplay.sku != ''">
                      <q-item-label>SKU: {{ taskDisplay.sku }}</q-item-label>
                    </div>
                  </q-item-section>
                </div>
                <div class="card-item-right">
                  <q-item-section>
                    <q-item-label>
                      Count: {{ taskDisplay.scannedCartonNumber }}</q-item-label
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
          <div
            v-for="(item, index) in cartonfilterList"
            :key="index"
            @click="onClickCarton(item)"
          >
            <q-item class="card-item">
              <div class="card-detail-left">
                <q-item-section>
                  <div v-show="item.containerNumber != ''">
                    <q-item-label
                      >Container: {{ item.containerNumber }}</q-item-label
                    >
                  </div>
                  <div v-show="item.po != ''">
                    <q-item-label>PO: {{ item.po }}</q-item-label>
                  </div>
                  <div v-show="item.sku != ''">
                    <q-item-label>SKU: {{ item.sku }}</q-item-label>
                  </div>
                  <div v-show="item.cartonId != ''">
                    <q-item-label>CID: {{ item.cartonId }}</q-item-label>
                  </div>
                </q-item-section>
              </div>
              <q-item-section side>
                <q-icon name="chevron_right" color="black" />
              </q-item-section>
            </q-item>
          </div>
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
import { computed, defineComponent, onMounted, Ref, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP, Carton } from "../models/profile";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const DataMgmtView = defineComponent({
  methods: {
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const taskId = ref(route.query.taskId);
    const pageType = ref("Group");
    const pageTitle = ref("");
    const detailViewLabel = ref("");
    const groupViewLabel = ref("");

    const homeIcon = homeImg;
    const arrowIcon = arrowImg;

    const taskDisplay: Ref<LP> = ref({} as LP);
    const cartonListDisplay: Ref<Carton[]> = ref([]);

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

    const back = () => {
      router.push({
        path: "/dataManagement",
      });
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
      bridge.call("fetchLPByTaskId", args, (res: string) => {
        cartonListDisplay.value = JSON.parse(res) as Carton[];
      });
    };

    const cartonfilterList = computed(() =>
      cartonListDisplay.value.filter((item) => item.scanStatus == 1)
    );

    onMounted(() => {
      // calculate scroll area
      const scrollArea = document.getElementById("scroll-area") as any;
      const bottom = document.getElementById("bottom-button") as any;
      scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop + "px";
      if (typeof taskId.value === "string") {
        fetchTaskByTaskId(taskId.value);
        getLPDetailList(taskId.value);
      }
      if (typeof route.query.pageType === "string") {
        pageType.value = route.query.pageType;
      }
    });

    return {
      router,
      onClickLP,
      taskDisplay,
      cartonListDisplay,
      back,
      taskId,
      pageType,
      changPageType,
      onClickCarton,
      pageTitle,
      detailViewLabel,
      groupViewLabel,
      cartonfilterList,
      homeIcon,
      arrowIcon,
    };
  },
});
export default DataMgmtView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-with-subtitle;
}
.card-item {
  background-color: #ffffff;
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
