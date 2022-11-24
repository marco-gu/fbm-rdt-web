export function composeReg(format: string) {
  let reg = "";
  for (let i = 0; i < format.length; i++) {
    switch (format[i]) {
      case "A":
        reg += "[a-zA-Z]";
        break;
      case "9":
        reg += "[0-9]";
        break;
      case "#":
        reg += "[0-9]|[\\s]";
        break;
      case "X":
        reg += "[.]";
        break;
    }
  }
  return reg;
}
