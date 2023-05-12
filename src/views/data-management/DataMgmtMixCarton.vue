<template>
  <div class="wrapper">
    <common-header-component
      :titles="[`${cartonID}: ${$t('carton.item')}${itemCount}`]"
      :icons="['back', 'home', 'empty']"
      @onHome="home"
      @onBack="() => router.push('/dataMgmtCartonMixed')"
    />
    <div class="page-content">
      <q-scroll-area id="scroll-area" :thumb-style="{ width: '0px' }">
        <q-form ref="myForm">
          <div v-for="(item, i) in pageViews" :key="i" class="container">
            <div v-if="item.display == 1">
              <div class="field">
                <div class="input-title">
                  <span class="text">{{ item.displayFieldName }}</span>
                </div>
                <q-input
                  class="input-field"
                  input-class="text-left"
                  ref="inputRef"
                  v-model="item.model"
                  @paste="validPaste($event, i)"
                  :maxlength="item.length"
                  lazy-rules
                  :rules="[item.valid]"
                  borderless
                >
                  <template v-if="item.scan == 1" v-slot:append>
                    <q-avatar
                      class="btn-img"
                      @click="scan(item.fieldName, $event)"
                    >
                      <q-img
                        no-transition
                        no-spinner
                        :src="inputScanIcon"
                        width="12px"
                      />
                    </q-avatar>
                  </template>
                </q-input>
              </div>
            </div>
          </div>
        </q-form>
      </q-scroll-area>
    </div>
    <div class="bottom-coherent-button" id="bottom-button">
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.mix_carton_add')"
        @click="add"
      />
      <q-separator vertical inset color="white" />
      <q-btn
        no-caps
        class="full-width"
        flat
        push
        :label="$t('carton.mix_carton_complete')"
        @click="complete"
      />
    </div>
  </div>
  <PopupComponent
    :visible="dialogVisible"
    :message="msg"
    :type="type"
    @close="onConfirmDialog"
    @cancel="dialogVisible = false"
  ></PopupComponent>
</template>
<script lang="ts">
import CommonHeaderComponent from "@/components/CommonHeaderComponent.vue";
import PopupComponent from "@/components/PopupComponent.vue";
import {
  AndroidResponse,
  AndroidResponseStatus,
} from "@/models/android.response";
import {
  ProfileDisplayAttribute,
  ProfileMixCartonLevel,
} from "@/models/profile";
import {
  composeViewElement,
  ViewDisplayAttribute,
} from "@/utils/profile.render";
import bridge from "dsbridge";
import { defineComponent, onBeforeMount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import inputScan from "../../assets/icon/compress-solid.svg";
import { resetForm } from "../../utils/form.util";
import { setContentHeightWithBtn } from "../../utils/screen.util";
const DataMgmtMixCarton = defineComponent({
  components: {
    CommonHeaderComponent,
    PopupComponent,
  },
  setup() {
    const i18n = useI18n();
    const route = useRoute();
    const router = useRouter();
    const dialogVisible = ref(false);
    const type = ref("");
    const msg = ref("");
    const cartonID = route.params.cartonID;
    const taskID = route.params.taskID;
    const scanType = route.params.scanType;
    const itemCount = ref(route.params.itemCount as any);
    const profileName = route.params.profileName;
    const pageViews = ref([] as ViewDisplayAttribute[]);
    const myForm = ref();
    const inputScanIcon = inputScan;
    const pressComplete = ref(false);
    const pressHome = ref(false);
    const addDialogSuccess = ref(false);
    const completeDialogSuccess = ref(false);
    onBeforeMount(() => {
      composeView();
    });
    onMounted(() => {
      setContentHeightWithBtn("scroll-area");
    });
    const composeView = () => {
      const param = {
        profileName: profileName,
        scanType: scanType,
      };
      bridge.call("getMixCartonProfile", param, (res: any) => {
        const mixProfiles = JSON.parse(res) as ProfileDisplayAttribute[];
        mixProfiles.forEach((item) => {
          const element = composeViewElement(item);
          pageViews.value.push(element);
        });
      });
    };
    const onSubmit = () => {
      const apiParams = {
        cartonID: cartonID,
        scanType: scanType,
        taskID: taskID,
      };
      composeApiParam(apiParams, pageViews.value);
      bridge.call("addMixCarton", apiParams, (res: string) => {
        const androidResponse = JSON.parse(res) as AndroidResponse<any>;
        if (androidResponse.status == AndroidResponseStatus.SUCCESS) {
          if (pressComplete.value) {
            showCompleteSuccessDialog();
          } else {
            showAddSuccessDialog();
          }
        }
      });
    };
    const showAddSuccessDialog = () => {
      addDialogSuccess.value = true;
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.add_success");
    };
    const showCompleteSuccessDialog = () => {
      completeDialogSuccess.value = true;
      dialogVisible.value = true;
      type.value = "success";
      msg.value = i18n.t("common.add_success");
    };
    const composeApiParam = (apiParams: any, source: any[]) => {
      const profileMixCartonLevel = new ProfileMixCartonLevel();
      let j: keyof ProfileMixCartonLevel;
      for (j in profileMixCartonLevel) {
        apiParams[j] = "";
      }
      source.forEach((view: ViewDisplayAttribute) => {
        for (j in profileMixCartonLevel) {
          if (j == view.fieldName) {
            apiParams[j] = view.model;
          }
        }
      });
    };
    const complete = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          pressComplete.value = true;
          dialogVisible.value = true;
          type.value = "action";
          msg.value = i18n.t("carton.complete_mix_carton");
        }
      });
    };
    const add = () => {
      myForm.value.validate().then((success: any) => {
        if (success) {
          dialogVisible.value = true;
          type.value = "action";
          msg.value = i18n.t("carton.add_mix_carton");
        }
      });
    };
    const onConfirmDialog = () => {
      dialogVisible.value = false;
      if (completeDialogSuccess.value) {
        router.push("/dataMgmtMixCartonList");
      } else if (addDialogSuccess.value) {
        addDialogSuccess.value = false;
        itemCount.value++;
        resetForm(pageViews.value, myForm.value);
      } else if (pressHome.value) {
        router.push("/home");
      } else {
        onSubmit();
      }
    };
    const home = () => {
      pressHome.value = true;
      dialogVisible.value = true;
      type.value = "action";
      msg.value = i18n.t("common.return_home");
    };
    return {
      msg,
      type,
      cartonID,
      itemCount,
      dialogVisible,
      home,
      router,
      pageViews,
      onSubmit,
      myForm,
      inputScanIcon,
      complete,
      add,
      onConfirmDialog,
    };
  },
});
export default DataMgmtMixCarton;
</script>
