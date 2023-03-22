import { QVueGlobals } from "quasar/dist/types/globals";
export function showLoading($q: QVueGlobals) {
  $q.loading.show({
    html: true,
  });
}
export function closeLoading($q: QVueGlobals) {
  $q.loading.hide();
}
