<template>
  <div class="wrapper">
    <div class="header">
      <div class="common-toolbar">
        <div class="common-toolbar-left">
          <img :src="arrowIcon" @click="back" />
        </div>
        <div class="common-toolbar-middle">
          {{ $t("image.add_image") }}
        </div>
        <div class="common-toolbar-right">
          <img :src="homeIcon" @click="home" />
        </div>
      </div>
    </div>
    <div class="content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <div class="card-item-select">
          {{ $t("image.add_image_reason") }}
          <q-select
            hide-bottom-space
            borderless
            v-model="reason"
            :options="options"
            behavior="menu"
          />
        </div>
        <div v-for="(item, i) in pageViews" :key="i">
          <div class="card-item-input">
            <div>
              {{ item.displayFieldName }}
            </div>
            <q-input
              class="card-item-input-field no-shadow"
              :input-style="{ fontSize: '15px' }"
              input-class="text-right"
              v-model="item.value"
              clearable
              borderless
              dense
            >
              <template v-slot:append>
                <q-avatar @click="scan(item.displayFieldName)">
                  <q-icon name="qr_code_scanner" size="16px" />
                </q-avatar>
              </template>
            </q-input>
          </div>
        </div>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('image.add_image_cancel')"
        @click="back"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('image.add_image_save')"
        @click="save"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import { popupErrorMsg } from "@/plugin/popupPlugins";
import bridge from "dsbridge";
import { useQuasar } from "quasar";
import { defineComponent, onMounted, ref, watch } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const cargoImageView = defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const reason = ref("Damage");
    const $q = useQuasar();
    const pageViews = ref([] as any);
    const options = ["Damage", "Other"];
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    const scanType = ref("CargoImage");
    onMounted(() => {
      // calculate scroll area height
      const deviceHeight = window.innerHeight;
      const scrollArea = document.getElementById("scroll-area") as any;
      scrollArea.style.height = deviceHeight - scrollArea.offsetTop + "px";
      // hide bottom button if soft key up
      window.onresize = () => {
        // get resize height and recalculate scroll area
        const resizeHeight = window.innerHeight;
        const scrollArea = document.getElementById("scroll-area") as any;
        scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
        const bottom = document.getElementById("bottom-button") as any;
        if (deviceHeight - resizeHeight > 0) {
          bottom.style.visibility = "hidden";
        } else {
          bottom.style.visibility = "visible";
        }
      };
      pageViews.value = [
        {
          displayFieldName: "SO",
          value: ref(""),
        },
        {
          displayFieldName: "PO",
          value: ref(""),
        },
        {
          displayFieldName: "CID",
          value: ref(""),
        },
      ];
    });
    watch(
      pageViews,
      () => {
        pageViews.value.forEach((t: any) => {
          if (t.value != null && t.value != "") {
            t.value = t.value.toUpperCase();
          }
        });
      },
      { immediate: true, deep: true }
    );
    const back = () => {
      router.push("/imageAccess");
    };
    const home = () => {
      router.push("/home");
    };
    const save = () => {
      let cartonID = "";
      const param = {
        so: "",
        po: "",
      };
      pageViews.value.forEach((t: any) => {
        switch (t.displayFieldName) {
          case "PO":
            param.po = t.value;
            break;
          case "SO":
            param.so = t.value;
            break;
          case "CID":
            cartonID = t.value;
            break;
        }
      });
      bridge.call("checkSoAndPoExist", param, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.ERROR) {
          popupErrorMsg($q, "PO or SO not exist");
        } else {
          const param2 = {
            cartonID: cartonID,
            taskID: androidResponse.data.taskId,
          };
          bridge.call("createCargoImageTask", param2);
          setTimeout(() => {
            router.push("/imageAccess");
          }, 500);
        }
      });
    };
    const scan = (fieldName: string, event: Event) => {
      const isCamera = store.state.commonModule.scanDevice === "camera";
      if (isCamera) {
        const reqParams = {
          scanType: scanType.value,
          fieldName: fieldName,
        };
        bridge.call("scanForInput", reqParams);
      } else {
        event.stopPropagation();
      }
    };
    bridge.register("getScanResult", (res: string) => {
      pageViews.value.forEach((view: any) => {
        const key = scanType.value + "_" + view.displayFieldName;
        if (key == res.substring(0, res.lastIndexOf("_"))) {
          view.value = res.substring(res.lastIndexOf("_") + 1);
        }
      });
    });
    return {
      back,
      home,
      pageViews,
      reason,
      save,
      scan,
      options,
      homeIcon,
      arrowIcon,
    };
  },
});
export default cargoImageView;
</script>
<style lang="scss" scoped>
.content {
  margin-top: $--page-content-margin-top-no-search;
}
</style>
