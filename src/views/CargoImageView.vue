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
      <div class="item-container mb-15">
        {{ $t("image.add_image_reason") }}
        <q-select
          borderless
          v-model="reason"
          :options="options"
          behavior="menu"
        />
      </div>
      <div v-for="(item, i) in pageViews" :key="i">
        <div class="item-container mb-15">
          <div>
            {{ item.displayFieldName }}
          </div>
          <q-input
            v-model="item.value"
            clearable
            input-class="text-right"
            borderless
            dense
            class="common-input no-shadow"
          >
            <template v-slot:append>
              <q-avatar @click="scan(item.displayFieldName)">
                <q-icon name="qr_code_scanner" size="18px" />
              </q-avatar>
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <div class="button-bottom">
      <q-btn
        no-caps
        unelevated
        @click="save"
        class="full-width"
        color="secondary"
        :label="$t('image.add_image_save')"
      />
      <div style="margin-top: 23px">
        <q-btn
          no-caps
          unelevated
          @click="back"
          class="full-width"
          text-color="#757575"
          color="white"
          outline
          :label="$t('image.add_image_cancel')"
        />
      </div>
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
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import homeImg from "../assets/images/home.svg";
import arrowImg from "../assets/images/arrow.svg";
const cartonImageView = defineComponent({
  setup() {
    const router = useRouter();
    const reason = ref("Damage");
    const $q = useQuasar();
    const pageViews = ref([] as any);
    const options = ["Damage", "Other"];
    const homeIcon = homeImg;
    const arrowIcon = arrowImg;
    onMounted(() => {
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
    return {
      back,
      home,
      pageViews,
      reason,
      save,
      options,
      homeIcon,
      arrowIcon,
    };
  },
});
export default cartonImageView;
</script>
<style lang="scss" scoped>
.content {
  padding: 0 20px;
  margin-top: 26px;
  min-height: 600px;
}
.common-input {
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  font-size: 18px;
  height: 50px;
  padding-top: 5px;
  padding-left: 15px;
  padding-right: 15px;
  &.no-shadow {
    box-shadow: none;
  }
}
.mb-15 {
  margin-bottom: 20px;
}
.item-container {
  text-align: left;
  height: 50px;
  box-shadow: 0px 4px 12px 2px rgba(11, 69, 95, 0.08);
  border-radius: 5px;
  padding: 0 5px 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
}
.button-bottom {
  position: fixed;
  margin: 0 20px;
  bottom: 20px;
  width: calc(100% - 40px);
}
</style>
