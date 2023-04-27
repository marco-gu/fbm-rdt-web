export function softKeyPopUp(
  deviceHeight: number,
  startEL: string,
  endEL: string
) {
  window.onresize = () => {
    alert("onresize");
    const resizeHeight = window.innerHeight;
    const scrollArea = document.getElementById(startEL) as any;
    scrollArea.style.height = resizeHeight - scrollArea.offsetTop + "px";
    const bottom = document.getElementById(endEL) as any;
    if (deviceHeight - resizeHeight > 0) {
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
