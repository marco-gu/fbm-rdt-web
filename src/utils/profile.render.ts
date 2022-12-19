import { ProfileDisplayAttribute } from "@/models/profile";
import { ref, Ref, watch } from "vue";

export type ViewDisplayAttribute = {
  displayFieldName: string;
  fieldName: string;
  level: string;
  mandatory: number;
  model: Ref<unknown>;
  reg: RegExp;
  display: number;
  scan: number;
  length: number;
  valid: (val: string) => Promise<unknown>;
};

export enum ProfileElementLevel {
  ORDER = "order",
  CARTON_COMMON = "cartoncommon",
  CARTON_UPC = "cartonupc",
  CARTON_INDIVIDUAL = "cartonindividual",
}

const scanOrTypeInList = ["PO", "SO", "SKU", "Container", "UPC"];

export function composeViewElement(attr: ProfileDisplayAttribute) {
  const element = {} as ViewDisplayAttribute;
  element.displayFieldName = attr.displayDataFieldName;
  element.fieldName = attr.dataFieldName;
  element.level = attr.level;
  element.mandatory = attr.mandatory;
  element.model = ref("");
  element.reg = new RegExp(composeReg(attr.format));
  element.display = attr.combo;
  element.scan = attr.scan == "1" ? 1 : 0;
  scanOrTypeInList.forEach((t: string) => {
    if (t == element.fieldName) {
      element.scan = 1;
    }
  });
  element.length = Math.abs(attr.maxLength);
  element.valid = (val: string) => {
    return new Promise((resolve) => {
      if (element.mandatory == 1 && !val) {
        resolve(`Please input ${element.fieldName}`);
      } else {
        if (attr.maxLength < 0) {
          // Only check format
          const inputs = val.split("");
          const inputLength = inputs.length;
          const newAttrFormat = attr.format.substring(0, inputLength);
          element.reg = new RegExp(composeReg(newAttrFormat));
          if (!element.reg.test(val)) {
            resolve("Please input correct format");
          } else {
            resolve(true);
          }
        } else {
          // Check length && format
          if (val.length != attr.maxLength) {
            resolve(
              `Please input not more or less than ${attr.maxLength} charactors`
            );
          } else if (!element.reg.test(val)) {
            resolve("Please input correct format");
          } else {
            resolve(true);
          }
        }
      }
    });
  };
  return element;
}

export function toUpperCaseElementInput(multiWatchSources: any[]) {
  watch(
    multiWatchSources,
    () => {
      multiWatchSources.forEach((source: ViewDisplayAttribute[]) => {
        source.forEach((t: any) => {
          if (t.model != null) {
            t.model = t.model.toUpperCase();
          }
        });
      });
    },
    { immediate: false }
  );
}

export function validPasteInput(inputRef: any, event: any, index: number) {
  if (event.clipboardData && event.clipboardData.getData("Text")) {
    const text = event.clipboardData.getData("Text");
    const param = inputRef.value as any;
    param.forEach((t: any, i: number) => {
      if (index == i) {
        t.validate(text);
      }
    });
  }
}

export function composeReg(format: string) {
  let reg = "";
  for (let i = 0; i < format.length; i++) {
    switch (format[i]) {
      case "A":
        reg += "[\\s\\S]";
        break;
      case "9":
        reg += "[0-9]";
        break;
      case "#":
        reg += "[0-9\\s]";
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
