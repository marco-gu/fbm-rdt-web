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

    <div>
      <div class="list row items-center">
        <div class="col">UPC code</div>
        <div class="col">781637678</div>
      </div>

      <div class="list row items-center">
        <div class="col">Color</div>
        <div class="col">RED</div>
      </div>

      <div class="list row items-center">
        <div class="col">Size</div>
        <div class="col">BIG</div>
      </div>

      <div class="list row items-center">
        <div class="col">QTY</div>
        <div class="col">11</div>
      </div>
    </div>

    <div class="bottom row">
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        push
        label="Save"
        @click="deleteProfile"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        type="submit"
        push
        label="Delete"
        @click="cancelEditMode"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        class="col"
        no-caps
        style="background: #42b0d5; color: white"
        flat
        push
        label="Cancel"
        @click="back"
      />
    </div>
  </div>
</template>
<script lang="ts">
import bridge from "dsbridge";
import { defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LP } from "../models/profile";
import { useI18n } from "@/plugin/i18nPlugins";

const DataManagementMixView = defineComponent({
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
    var pageType = ref(route.query.pageType);

    taskId.value = "Adidas_BKK786137_86878009_Receiving";
    bridge.call("getSettingLanguage", null, (res: string) => {
      i18n.locale.value = res;
    });

    let result: LP[] = [];
    const taskListDisplay: Ref<LP[]> = ref([]);
    const search = ref("");
    const refresh = (done: any) => {
      getTaskList();
      done();
    };

    const back = () => {
      router.push({
        path: "/dataMgmtGDEdit",
        query: {
          taskId: taskId.value,
          pageType: "Detail",
        },
      });
    };

    const getTaskList = () => {
      bridge.call("fetchTask", null, (res: string) => {
        result = JSON.parse(res) as LP[];
        taskListDisplay.value = JSON.parse(res) as LP[];
      });
    };

    onMounted(() => {
      getTaskList();
      pageType = ref(route.query.pageType);
    });

    watch(search, () => {
      if (search.value) {
        const filteredResult = result.filter(
          (item) =>
            item.taskId.toLowerCase().indexOf(search.value.toLowerCase()) > -1
        );
        taskListDisplay.value = filteredResult;
      } else {
        taskListDisplay.value = result;
      }
    });

    return {
      router,
      refresh,
      taskListDisplay,
      search,
      back,
      taskId,
      pageType,
    };
  },
});
export default DataManagementMixView;
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
  .list {
    background: #ffffff;
    color: gray;
    height: 50.6px;
    text-align: center;
    font-size: 16px;
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
