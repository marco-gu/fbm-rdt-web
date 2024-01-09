import defaultScreen from "../assets/device/default.json";
export function setShellStyle(shell: any, device?: string) {
  shell.style.position = "relative";
  shell.style.margin = "auto";
  // shell.style.border = "#6E7C89 .5px solid";
  // shell.style.width = ck65.width;
  if (
    process.env.VUE_APP_IS_ANDROID_SIMULATOR === "true" ||
    process.env.VUE_APP_IS_SIMULATOR === "true"
  ) {
    shell.style.height = defaultScreen.height + 72 + "px";
  } else {
    shell.style.height = defaultScreen.height + "px";
  }
  // shell.style.height =
  //   process.env.VUE_APP_IS_ANDROID_SIMULATOR === "true"
  //     ? defaultScreen.height + 72 + "px"
  //     : defaultScreen.height + "px";
  shell.style.width = defaultScreen.width + "px";
  // shell.style.height = defaultScreen.height;
}
export function calculateWidthItems(details: any) {
  let lengthRemain = defaultScreen.columns + 1;
  const eachLength = defaultScreen.content_width / defaultScreen.columns;
  const reversedArr = [];
  if (details.value.length === 1) {
    reversedArr.push("100%");
  } else {
    for (let i = details.value.length - 1; i >= 0; i--) {
      const x = details.value[i].coordinateX;
      if (x) {
        const calcColumnNo = lengthRemain - Number(x);
        // old percentage calculation
        // const num =
        //   (calcColumnNo / defaultScreen.columns + Number.EPSILON) * 100 + "%";
        const num = calcColumnNo * eachLength + "px";
        reversedArr.push(num);
        lengthRemain = x;
      }
    }
  }
  return reversedArr.reverse();
}
export function inputLength(maxLength: number) {
  const screenWidth = defaultScreen.content_width;
  const eachLength = defaultScreen.content_width / defaultScreen.columns;
  const calcWidth =
    eachLength * maxLength >= screenWidth
      ? screenWidth
      : eachLength * maxLength;
  console.log(calcWidth);
  if (maxLength > 0) {
    if (maxLength > 1) {
      return calcWidth + "px";
    } else {
      return Math.ceil(eachLength) + 2 + "px";
    }
  } else {
    return "auto";
  }
}
