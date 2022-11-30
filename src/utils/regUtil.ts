export function composeReg(format: string) {
  let reg = "";
  for (let i = 0; i < format.length; i++) {
    switch (format[i]) {
      case "A":
        reg += "[a-zA-Z0-9]";
        break;
      case "9":
        reg += "[\\d]";
        break;
      case "#":
        reg += "[0-9]|[\\s]";
        break;
      case "X":
        reg += "[a-zA-Z]";
        break;
      default:
        reg += format[i];
    }
  }
  return reg;
}
