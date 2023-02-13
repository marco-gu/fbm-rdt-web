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
    </div>

    <div class="taskIdHeader">
      {{ taskId }}
    </div>

    <div v-show="pageType == 'Group'">
      <div
        v-show="taskDisplay.scannedCartonNumber > 0"
        class="data-list-container row items-center body"
        @click="onClickLP(taskDisplay)"
      >
        <div class="column" style="width: 65%">
          <div v-show="taskDisplay.containerNumber != ''">
            <div>Container: {{ taskDisplay.containerNumber }}</div>
            <div style="height: 8px"></div>
          </div>
          <div>PO: {{ taskDisplay.po }}</div>
          <div v-show="taskDisplay.sku != ''">
            <div style="height: 8px"></div>
            <div>SKU: {{ taskDisplay.sku }}</div>
          </div>
        </div>
        <div style="width: 25%">
          Count: {{ taskDisplay.scannedCartonNumber }}
        </div>
        <div style="width: 10%">
          <q-icon size="md" name="chevron_right" color="black" />
        </div>
      </div>
    </div>

    <div v-show="pageType == 'Detail'">
      <div
        class="data-list-container row items-center body"
        v-for="(item, index) in cartonfilterList"
        :key="index"
        @click="onClickCarton(item)"
      >
        <div class="column" style="width: 90%">
          <div v-show="item.containerNumber != ''">
            <div>Container: {{ item.containerNumber }}</div>
            <div style="height: 8px"></div>
          </div>
          <div>PO: {{ item.po }}</div>
          <div v-show="item.sku != ''">
            <div style="height: 8px"></div>
            <div>SKU: {{ item.sku }}</div>
          </div>
          <div v-show="item.cartonId != ''">
            <div style="height: 8px"></div>
            <div>CID: {{ item.cartonId }}</div>
          </div>
        </div>
        <div style="width: 10%">
          <q-icon size="md" name="chevron_right" color="grey" />
        </div>
      </div>
    </div>

    <div class="bottom row">
      <q-btn
        class="col btnGeneral"
        no-caps
        :class="pageType == 'Group' ? 'btnSelected' : ''"
        flat
        push
        :label="$t('dataManagement.group_view')"
        @click="changPageType('Group')"
      />
      <q-separator vertical inset color="white" />
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
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP, Carton } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";
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
    const i18n = useI18n();
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
.data-list-container {
  margin-top: 20px;
  margin-left: 23px;
  margin-right: 23px;
  margin-bottom: 20px;
  padding-left: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  text-align: left;
  min-height: 64px;
}

.taskIdHeader {
  margin-top: 28px;
  margin-left: 23px;
  margin-right: 23px;
  margin-bottom: 23px;
  background-color: #00243d;
  padding: 6px 15px;
  font-size: 18px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #ffffff;
  line-height: 22px;
  border-radius: 5px 5px 5px 5px;
  word-break: break-all;
}

.body {
  font-size: 15px;
  font-family: Maersk Text-Regular, Maersk Text;
  font-weight: 400;
  color: #000000;
  line-height: 18px;
}

.tab {
  background: #040000;
  color: #ffffff;
  height: 48.3px;
  text-align: center;
  font-size: 16px;
}

.detailList {
  background: #ffffff;
  color: gray;
  height: 50.6px;
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
  position: fixed;
  bottom: 0px;
  display: flex;
  width: 100%;
  height: 50px;
}
</style>
