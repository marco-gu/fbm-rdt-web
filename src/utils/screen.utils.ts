import defaultScreen from "../assets/device/default.json";
export function setShellStyle(shell: any, device?: string) {
  shell.style.position = "relative";
  shell.style.margin = "auto";
  shell.style.border = "#6E7C89 .5px solid";
  shell.style.width = defaultScreen.width;
  shell.style.height = defaultScreen.height;
}
