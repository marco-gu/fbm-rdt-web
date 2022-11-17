<template>
  <div class="wrapper">
    <div class="header">
      <q-item clickable style="width: 100%">
        <q-item-section avatar @click="back()">
          <q-icon name="arrow_back" />
        </q-item-section>
        <q-item-section>
          <span style="font-size: 21px">Mix Carton</span>
        </q-item-section>
      </q-item>
    </div>
    <q-separator color="grey-5" />
    <div class="carton-info">
      <span>63786764788197289371987</span>
      <span>Item count:1</span>
    </div>
    <q-form @submit="onSubmit" style="background: #fff">
      <div v-for="(item, i) in pageViews" :key="i">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="padding-left: 1rem; color: black">
            {{ item.name }}
          </span>
          <q-input
            v-model="item.value"
            clearable
            input-class="text-right"
            lazy-rules
            :rules="[item.rule]"
            borderless
            style="padding: 0px 16px"
          >
            <template v-slot:append>
              <q-avatar v-if="item.canScan == 1" @click="scan(name)">
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
          </q-input>
        </div>
        <q-separator color="grey-5" />
      </div>
      <div class="bottom">
        <q-btn no-caps style="width: 48%" flat push @click="add">Add</q-btn>
        <q-separator vertical inset color="white" />
        <q-btn no-caps style="width: 52%" flat type="submit" push
          >Complete</q-btn
        >
      </div>
    </q-form>
  </div>
</template>
<script lang="ts">
import { Attribute } from "@/models/profile";
import bridge from "dsbridge";
import { defineComponent, onMounted, ref } from "vue";
interface PageView {
  name: string;
  value: unknown;
  mandatory: number;
  format: RegExp;
  rule: unknown;
  canScan: number;
}
const MixCartonView = defineComponent({
  setup() {
    const pageViews = ref([] as PageView[]);
    const addPageViews = ref([] as PageView[]);
    onMounted(() => {
      // call natvive get Mix carton Page Details
      // bridge.call("checkUserUid", null, (res: string) => {
      //   if (res) {
      //     // username.value = res.toUpperCase();
      //   }
      // });
      const pageView1 = {} as PageView;
      pageView1.name = "Style";
      pageViews.value.push(pageView1);
      const pageView2 = {} as PageView;
      pageView2.name = "Color";
      pageViews.value.push(pageView2);
      const pageView3 = {} as PageView;
      pageView3.name = "Size";
      pageViews.value.push(pageView3);
      const pageView4 = {} as PageView;
      pageView4.name = "QTY";
      pageViews.value.push(pageView4);
    });
    const composeViews = (attr: Attribute) => {
      const view = {} as PageView;
      view.name = attr.dataFieldName;
      view.mandatory = attr.mandatory;
      view.value = ref("");
      view.format = new RegExp(composeFormat(attr.format));
      view.canScan = attr.scan == "1" ? 1 : 0;
      view.rule = (val: string) => {
        return new Promise((resolve) => {
          if (view.mandatory == 1 && !val) {
            resolve(`Please input ${view.name}`);
          } else {
            if (attr.maxLength < 0 && val.length > Math.abs(attr.maxLength)) {
              resolve(
                `Please input not more than ${attr.maxLength} charactors`
              );
            } else if (attr.maxLength > 0 && val.length != attr.maxLength) {
              resolve(
                `Please input not more or less than ${attr.maxLength} charactors`
              );
            } else if (!view.format.test(val)) {
              resolve("Please input correct format");
            } else {
              resolve(true);
            }
          }
        });
      };
      return view;
    };
    const composeFormat = (format: string) => {
      let reg = "";
      for (let i = 0; i < format.length; i++) {
        switch (format[i]) {
          case "A":
            reg += "[a-zA-Z]";
            break;
          case "9":
            reg += "[0-9]";
            break;
          case "#":
            reg += "[0-9]|[\\s]";
            break;
          case "X":
            reg += "[.]";
            break;
        }
      }
      return reg;
    };
    const onSubmit = () => {
      // submit data to natvive
      addPageViews.value.forEach((addPageView) => {
        //
      });
    };
    const add = () => {
      // stay at current page and clear all inputs
      pageViews.value.forEach((pageView) => {
        addPageViews.value.push(pageView);
        pageView.value = "";
      });
    };
    const scan = () => {
      alert("scan");
      // call native
    };
    const back = () => {
      bridge.call("backToScan", null);
    };
    return {
      scan,
      add,
      onSubmit,
      pageViews,
      back,
    };
  },
});
export default MixCartonView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
  background: rgb(233, 229, 229);
}
.header {
  display: flex;
  background: #fff;
  justify-content: space-around;
  height: 60px;
  align-items: center;
}
.carton-info {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #00243d;
  color: #fff;
  flex-flow: column;
}

.bottom {
  position: fixed;
  bottom: 0px;
  display: flex;
  background: #42b0d5;
  color: white;
  width: 100%;
  height: 50px;
}
</style>
