<template>
  <div class="wrapper">
    <div class="header">
      <div style="width: 100%">
        <q-item clickable>
          <q-item-section avatar @click="back">
            <q-icon name="arrow_back" />
          </q-item-section>
          <q-item-section>
            <span style="font-size: 21px">LP Search</span></q-item-section
          >
          <q-item-section avatar @click="home">
            <q-icon name="home" />
          </q-item-section>
        </q-item>
      </div>
    </div>
    <Form :validation-schema="schema" @submit="onSubmit">
      <div style="width: 95%; padding-left: 10px; margin-top: 10px">
        <q-field label="Profile" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline">
              {{ profileName }}
            </div>
          </template>
        </q-field>
      </div>
      <div style="width: 95%; padding-left: 10px">
        <q-field stack-label>
          <template v-slot:control>
            <div>
              <span style="color: rgba(0, 0, 0, 0.6); font-size: 14px">
                Type</span
              >
            </div>
          </template>
          <div style="display: flex; color: black">
            <q-radio
              v-model="type"
              val="Receiving"
              label="Receiving"
              @click="changeType"
            />
            <q-radio
              v-model="type"
              val="Stuffing"
              label="Stuffing"
              @click="changeType"
            />
          </div>
        </q-field>
      </div>
      <div style="width: 95%; padding-left: 10px">
        <q-field stack-label>
          <template v-slot:control>
            <div>
              <span style="color: rgba(0, 0, 0, 0.6); font-size: 14px">
                LP Mode</span
              >
            </div>
          </template>
          <div style="display: flex; color: black">
            <q-radio v-model="mode" val="Detail" label="Detail" />
            <q-radio
              name="shape"
              v-model="mode"
              val="Quantity"
              label="Quantity"
            />
          </div>
        </q-field>
      </div>
      <div style="width: 95%; padding-left: 10px">
        <Field name="soNumber" v-slot="{ errorMessage, value, field }">
          <q-input
            :model-value="value"
            v-bind="field"
            :error-message="errorMessage"
            :error="!!errorMessage"
            label-slot
          >
            <template v-slot:append>
              <q-avatar>
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
            <template v-slot:label>
              <span style="font-size: 14px"> SO Number </span></template
            >
          </q-input>
        </Field>
      </div>
      <div style="width: 95%; padding-left: 10px; margin-top: -12px">
        <Field name="poNumber" v-slot="{ errorMessage, value, field }">
          <q-input
            :model-value="value"
            v-bind="field"
            :error-message="errorMessage"
            :error="!!errorMessage"
            label-slot
          >
            <template v-slot:append>
              <q-avatar>
                <q-icon name="qr_code_scanner" />
              </q-avatar>
            </template>
            <template v-slot:label>
              <span style="font-size: 14px"> PO Number </span></template
            >
          </q-input>
        </Field>
      </div>
      <div style="position: fixed; bottom: 0px; width: 100%">
        <q-btn
          type="submit"
          color="primary"
          class="full-width"
          label="Generate"
          icon="file_download"
        />
      </div>
    </Form>
  </div>
</template>
<script lang="ts">
import { Field, Form } from "vee-validate";
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import bridge from "dsbridge";
import { ProfileDeail } from "@/models/profile";
import * as yup from "yup";
const LpSearchView = defineComponent({
  components: {
    Field,
    Form,
  },
  methods: {
    back() {
      this.router.go(-1);
    },
    home() {
      this.router.push("/home");
    },
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const result: Ref<ProfileDeail[]> = ref([]);
    const profileName = ref("");
    const type = ref("Receiving");
    const mode = ref("Detail");
    const soNumber = ref("");
    const poNumber = ref("");
    const schema = ref();
    let soRules: any = null;
    let poRules: any = null;
    schema.value = yup.object({
      soNumber: yup.string().max(1).label("SO Number"),
      poNumber: yup.string().max(1).label("PO Number"),
    });
    onMounted(() => {
      profileName.value = route.params.client as string;
      const args = { profileName: profileName.value };
      bridge.call("fetchProfileDetail", args, (res: any) => {
        result.value = JSON.parse(res) as ProfileDeail[];
        result.value.forEach((t: ProfileDeail) => {
          if (t.type == type.value) {
            if (t.fieldName == "SO") {
              soRules = yup.string().max(t.maxLength).label("SO Number");
              schema.value = yup.object({
                soNumber: soRules,
                poNumber: poRules,
              });
              if (t.mandatory == 1) {
                soRules = yup
                  .string()
                  .max(t.maxLength)
                  .required()
                  .label("SO Number");
                schema.value = yup.object({
                  soNumber: soRules,
                  poNumber: poRules,
                });
              }
            } else if (t.fieldName == "PO") {
              poRules = yup.string().max(t.maxLength).label("PO Number");
              if (t.mandatory == 1) {
                poRules = yup
                  .string()
                  .max(t.maxLength)
                  .required()
                  .label("PO Number");
                schema.value = yup.object({
                  soNumber: soRules,
                  poNumber: poRules,
                });
              }
            }
          }
        });
      });
    });
    const onSubmit = (values: any, actions: any) => {
      const params = {
        profileName: profileName.value,
        type: type.value,
        so: values.soNumber,
        po: values.poNumber,
      };
      router.push({ name: "scan", params: params });
    };
    const changeType = () => {
      result.value.forEach((t: ProfileDeail) => {
        if (t.type == type.value) {
          if (t.fieldName == "SO") {
            soRules = yup.string().max(t.maxLength).label("SO Number");
            schema.value = yup.object({
              soNumber: soRules,
              poNumber: poRules,
            });
            if (t.mandatory == 1) {
              soRules = yup
                .string()
                .max(t.maxLength)
                .required()
                .label("SO Number");
              schema.value = yup.object({
                soNumber: soRules,
                poNumber: poRules,
              });
            }
          } else if (t.fieldName == "PO") {
            poRules = yup.string().max(t.maxLength).label("PO Number");
            if (t.mandatory == 1) {
              poRules = yup
                .string()
                .max(t.maxLength)
                .required()
                .label("PO Number");
              schema.value = yup.object({
                soNumber: soRules,
                poNumber: poRules,
              });
            }
          }
        }
      });
    };
    return {
      router,
      profileName,
      type,
      soNumber,
      poNumber,
      schema,
      mode,
      changeType,
      onSubmit,
    };
  },
});
export default LpSearchView;
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-flow: column;
}
.header {
  background: #027be3;
  padding-top: 1px;
  padding-bottom: 1px;
  display: flex;
  color: #fff;
  justify-content: space-around;
}
</style>
