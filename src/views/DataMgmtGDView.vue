<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Data Management</span>
        </q-item-section>
        <q-item-section avatar @click="home">
          <q-icon name="home" />
        </q-item-section>
      </q-item>
      <q-separator color="grey-5" />
    </div>

    <q-separator color="grey-5" />

    <div>
      <q-item class="taskIdHeader">
        <q-item-section>
          {{ taskId }}
        </q-item-section>
      </q-item>
    </div>

    <div v-show="pageType == 'Group'">
      <div class="tab row items-center">
        <div class="col-4">SO</div>
        <div class="col-4">PO</div>
        <div class="col">Count</div>
        <div class="col"></div>
      </div>

      <q-list v-for="(item, index) in taskListDisplay" :key="index">
        <div class="groupList row items-center" @click="onClickLP(item)">
          <div class="col-4">{{ item.so }}</div>
          <div class="col-4">{{ item.po }}</div>
          <div class="col">{{ item.cartonSize }}</div>
          <div class="col">
            <q-icon size="md" name="chevron_right" color="black" />
          </div>
        </div>
      </q-list>
    </div>

    <div v-show="pageType == 'Detail'">
      <div class="tab row items-center">
        <div class="col-4">SO</div>
        <div class="col-4">PO</div>
        <div class="col-3">CID</div>
        <div></div>
      </div>

      <q-list v-for="(item, index) in cartonListDisplay" :key="index">
        <div class="detailList row items-center" @click="onClickCarton(item)">
          <div class="col-4">{{ item.so }}</div>
          <div class="col-4">{{ item.po }}</div>
          <div class="col-3 show">{{ item.cartonId }}</div>
          <div>
            <q-icon size="md" name="chevron_right" color="black" />
          </div>
        </div>
      </q-list>
    </div>

    <div class="bottom row">
      <q-btn
        class="col btnGeneral"
        no-caps
        :class="pageType == 'Group' ? 'btnSelected' : ''"
        flat
        push
        label="GroupView"
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
        label="DetailView"
        @click="changPageType('Detail')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP, Carton } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";

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

    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    const taskListDisplay: Ref<LP[]> = ref([]);
    const cartonListDisplay: Ref<Carton[]> = ref([]);

    const refresh = (done: any) => {
      getTaskList();
      done();
    };

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

    const getTaskList = () => {
      bridge.call("fetchTask", null, (res: string) => {
        taskListDisplay.value = JSON.parse(res) as LP[];
      });
    };
    const getLPDetailList = () => {
      bridge.call("fetchCartons", null, (res: string) => {
        cartonListDisplay.value = JSON.parse(res) as Carton[];
      });
    };

    onMounted(() => {
      getTaskList();
      getLPDetailList();
      if (typeof route.query.pageType === "string") {
        pageType.value = route.query.pageType;
      }
    });

    return {
      router,
      refresh,
      onClickLP,
      taskListDisplay,
      cartonListDisplay,
      back,
      taskId,
      pageType,
      changPageType,
      onClickCarton,
    };
  },
});
export default DataMgmtView;
</script>
<style lang="scss" scoped>
.wrapper {
  background-color: #e5e5e5;
  height: 100vh;
  .header {
    display: flex;
    background: #fff;
    justify-content: space-around;
    height: 60px;
    align-items: center;
  }
  .search {
    background: #fff;
    height: 60px;
    width: 100%;
  }
  .q-item {
    background-color: #fff;
    text-align: left;
    width: 100%;
  }
  .taskIdHeader {
    background: #040000;
    color: #ffffff;
    height: 47px;
    text-align: center;
    font-size: 13.3px;
  }
  .tab {
    background: #040000;
    color: #ffffff;
    height: 48.3px;
    text-align: center;
    font-size: 16px;
  }
  .groupList {
    background: rgba($color: #e9b2b7, $alpha: 0.2);
    color: gray;
    height: 50.6px;
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
}
.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  width: 100%;
  height: 50px;
}
</style>
