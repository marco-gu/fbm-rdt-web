export function softKeyPopUp(
  deviceHeight: number,
  startEL: string,
  endEL: string
) {
  window.onresize = () => {
    const resizeHeight = window.innerHeight;
    const scrollArea = document.getElementById(startEL) as any;
    scrollArea.style.height = resizeHeight - scrollArea.offsetTop - 30 + "px";
    const bottom = document.getElementById(endEL) as any;
    if (deviceHeight > resizeHeight) {
      bottom.style.visibility = "hidden";
    } else {
      bottom.style.visibility = "visible";
    }
  };
}

export function softKeyPopUpWithSearch(
  deviceHeight: number,
  startEL: string,
  endEL: string
) {
  window.onresize = () => {
    const resizeHeight = window.innerHeight;
    const scrollArea = document.getElementById(startEL) as any;
    scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
    const bottom = document.getElementById(endEL) as any;
    if (deviceHeight - resizeHeight > 0) {
      bottom.style.visibility = "hidden";
    } else {
      scrollArea.style.height =
        bottom.offsetTop - scrollArea.offsetTop - 20 + "px";
      bottom.style.visibility = "visible";
    }
  };
}

export function calScrollAreaWithBottom(startEL: string, endEL: string) {
  const scrollArea = document.getElementById(startEL) as any;
  const bottom = document.getElementById(endEL) as any;
  scrollArea.style.height = bottom.offsetTop - scrollArea.offsetTop - 20 + "px";
}

/****************TODO Confirm 50/100/141 */
/**
 * Initial screen scroll area height in full screen mode
 * @param scrollAreaID
 */
export function setContentHeight(scrollAreaID: string, height?: number) {
  const deviceHeight = height ? height : window.innerHeight;
  const scrollArea = document.getElementById(scrollAreaID) as any;
  scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 1 + "px";
}

/**
 * Initial screen scroll area height in full screen mode
 * @param scrollAreaID
 */
export function setContentHeightWithBtn(scrollAreaID: string, height?: number) {
  const deviceHeight = height ? height : window.innerHeight;
  const scrollArea = document.getElementById(scrollAreaID) as any;
  scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 51 + "px";
}

/**
 * Initial screen scroll area height in full screen mode
 * @param scrollAreaID
 */
export function setContentHeightInSearch(scrollAreaID: string) {
  const deviceHeight = window.innerHeight;
  const scrollArea = document.getElementById(scrollAreaID) as any;
  scrollArea.style.height = deviceHeight - scrollArea.offsetTop - 56 + "px";
}

export function setContentHeightOutSearch(scrollAreaID: string) {
  const deviceHeight = window.innerHeight;
  const scrollArea = document.getElementById(scrollAreaID) as any;
  scrollArea.style.height = deviceHeight - scrollArea.offsetTop + 52 + "px";
}
