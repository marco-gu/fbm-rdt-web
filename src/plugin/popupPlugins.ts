import { QVueGlobals } from "quasar/dist/types/globals";
export function popupErrorMsg($q: QVueGlobals, message: string) {
  $q.notify({
    position: "center",
    color: "red-5",
    textColor: "white",
    icon: "error",
    timeout: 2000,
    message: message,
  });
}
export function popupSuccessMsg($q: QVueGlobals, message: string) {
  $q.notify({
    position: "center",
    type: "positive",
    timeout: 1000,
    message: message,
  });
}

export function popupInfoMsg($q: QVueGlobals, message: string) {
  $q.notify({
    position: "center",
    color: "blue-5",
    textColor: "white",
    icon: "info",
    timeout: 2000,
    message: message,
  });
}
