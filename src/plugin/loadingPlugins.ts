import { QVueGlobals } from "quasar/dist/types/globals";
export function showLoading($q: QVueGlobals) {
  $q.loading.show({
    message: '<span class="text-italic">Please wait...</span>',
    html: true,
  });
}
export function closeLoading($q: QVueGlobals) {
  $q.loading.hide();
}
