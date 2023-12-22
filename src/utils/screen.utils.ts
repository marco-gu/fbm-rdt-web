import defaultScreen from "../assets/device/default.json";
import ck65 from "../assets/device/ck65.json";
export function setShellStyle(shell: any, device?: string) {
  shell.style.position = "relative";
  shell.style.margin = "auto";
  // shell.style.border = "#6E7C89 .5px solid";
  shell.style.width = ck65.width;
  shell.style.height = ck65.height;
  // shell.style.width = defaultScreen.width;
  // shell.style.height = defaultScreen.height;
}
