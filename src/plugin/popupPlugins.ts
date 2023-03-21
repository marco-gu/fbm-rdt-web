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
  // $q.notify({
  //   position: "center",
  //   type: "positive",
  //   timeout: 500,
  //   message: message,
  // });
  autoClose($q, message);
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

/* eslint-disable */
function autoClose($q: any, msg: any) {
  let seconds = 1;
  const dialog = $q.dialog({
    // title: "Success<em>!</em>",
    title: "Success",
    message: msg,
    // '<em>I can</em> <span class="text-red">use</span> <strong>HTML</strong>',
    html: true,
    ok: false
  }).onOk(() => {
    console.log('OK');
  }).onCancel(() => {
    console.log('Cancel');
  }).onDismiss(() => {
    clearTimeout(timer)
    console.log('I am triggered on both OK and Cancel');
  })
  const timer = setInterval(() => {
    seconds--;
    // if (seconds > 0) {
    //   dialog.update({
    //     message: `Autoclosing in ${seconds} second${seconds > 1 ? 's' : ''}.`
    //   });
    // } else {
    //   clearInterval(timer);
    //   dialog.hide();
    // }
    if (seconds == 0) {
      clearInterval(timer);
      dialog.hide();
    }
  }, 1500);
}
