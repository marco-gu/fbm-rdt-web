export function softKeyPopUp(
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
      bottom.style.visibility = "visible";
    }
  };
}
