import {
  EngineResponse,
  FieldDto,
  AttributeType,
  ListAttributeType,
} from "@/entity/response.entity";
import {
  ScreenModel,
  ScreenRowComponentEnum,
  ScreenRowModel,
} from "@/entity/screen.entity";
import _ from "lodash";
import { ref } from "vue";

/**
 * Deprecated, For XML reponse
 * @param xml
 * @returns
 */
export function parseXML(xml: any) {
  // const doc = new XmlDocument(xml);
  // const response = {} as EngineResponse;
  // const screenEntity: ScreenModel = {
  //   title: "",
  //   subTitle: "",
  //   focus: "",
  //   mainRows: new Map(),
  //   subFormRows: new Map(),
  //   screenLines: [],
  //   capturedValues: [],
  // };
  // screenEntity.capturedValues = [];
  // screenEntity.focus = doc.attr.focus;
  // // screenEntity.sessionID = doc.attr.number as unknown as number;
  // response.fields = [];
  // doc.children.forEach((t: any, index: number) => {
  //   switch (t.name) {
  //     case "field": {
  //       if (t.attr.typ != "funcKey") {
  //         const element = {} as FieldDto;
  //         element.color = t.attr.color;
  //         element.coordinateX = t.attr.x;
  //         element.coordinateY = t.attr.y;
  //         if (
  //           screenEntity.title.includes("Menu") &&
  //           index < doc.children.length - 1
  //         ) {
  //           element.attributeType = ScreenRowComponentEnum.MENU;
  //         } else {
  //           element.attributeType = t.attr.typ;
  //         }
  //         element.value = t.attr.value;
  //         element.attributeName = t.attr.id;
  //         element.defaultValue = t.attr.default;
  //         element.maxLength = t.attr.length;
  //         if (element.attributeType == AttributeType.INPUT) {
  //           const capturedValue = {} as CapturedValue;
  //           capturedValue.attributeName = element.attributeName;
  //           capturedValue.value = element.defaultValue
  //             ? element.defaultValue
  //             : "";
  //           screenEntity.capturedValues.push(capturedValue);
  //         }
  //         response.fields.push(element);
  //       } else {
  //         // todo sub process&&funtion key
  //       }
  //       break;
  //     }
  //     case "screen": {
  //       screenEntity.title = t.attr.title;
  //     }
  //   }
  // });
  // console.log(response);
  // const rows: any[][] = [[]];
  // let j = 0;
  // response.fields.forEach((t: FieldDto) => {
  //   if (t.coordinateX == 1) {
  //     if (rows[t.coordinateY]) {
  //       j = rows[t.coordinateY].length - 1;
  //       j++;
  //       rows[t.coordinateY][j] = t;
  //       sortArray(rows[t.coordinateY]);
  //     } else {
  //       j = 0;
  //       rows[t.coordinateY] = [];
  //       rows[t.coordinateY][j] = t;
  //     }
  //   } else {
  //     if (rows[t.coordinateY]) {
  //       j++;
  //       rows[t.coordinateY][j] = t;
  //     } else {
  //       j = 0;
  //       rows[t.coordinateY] = [];
  //       rows[t.coordinateY][j] = t;
  //     }
  //   }
  // });
  // console.log(rows);
  // screenEntity.screenLines = rows;
  // return screenEntity;
}

/**
 * Deprecated, For XML reponse
 * @param xml
 * @returns
 */
// export function composeRowData(
//   screenEntity: ScreenModel
// ): Map<number, ScreenLineEntity> {
//   const map: Map<number, any> = new Map();
//   screenEntity.screenLines.forEach((screenRow: any[]) => {
//     if (screenRow.length > 0) {
//       const line = {} as ScreenLineEntity;
//       line.details = [] as LineDetailEntity[];
//       screenRow.forEach((column: FieldDto) => {
//         const detail = {} as LineDetailEntity;
//         if (column) {
//           switch (column.attributeType) {
//             case AttributeType.OUTPUT:
//               if (
//                 !line.type ||
//                 (line.type && line.type == ScreenRowComponentEnum.LABEL)
//               ) {
//                 line.type = ScreenRowComponentEnum.LABEL;
//               }
//               detail.name = column.value;
//               detail.coordinateNameX = column.coordinateX;
//               line.color = column.color;
//               line.details.push(detail);
//               break;
//             case AttributeType.INPUT:
//               line.type = ScreenRowComponentEnum.INPUT;
//               detail.attributeName = column.attributeName;
//               detail.coordinateValueX = column.coordinateX;
//               detail.maxLength = column.maxLength;
//               detail.value =
//                 column.defaultValue == undefined ? "" : column.defaultValue;
//               if (screenEntity.focus == column.attributeName) {
//                 line.isFocus = true;
//               }
//               line.details.push(detail);
//               break;
//             case AttributeType.PASSWORD:
//               line.type = ScreenRowComponentEnum.PASSWORD;
//               detail.attributeName = column.attributeName;
//               detail.maxLength = column.maxLength;
//               detail.coordinateValueX = column.coordinateX;
//               line.details.push(detail);
//               break;
//             case AttributeType.MENU:
//               line.type = ScreenRowComponentEnum.MENU;
//               detail.name = column.value;
//               detail.coordinateNameX = column.coordinateX;
//               line.details.push(detail);
//               break;
//           }
//         }
//       });
//       map.set(screenRow[0].coordinateY, line);
//     }
//   });
//   console.log(map);
//   return map;
// }

/**
 * Deprecated, For XML reponse
 * @param xml
 * @returns
 */
// function sortArray(array: any) {
//   let temp = null;
//   for (let i = 0; i < array.length - 1; i++) {
//     for (let j = i + 1; j < array.length; j++) {
//       if (parseInt(array[i].coordinateX) > parseInt(array[j].coordinateX)) {
//         temp = array[i];
//         console.log(i, j);
//         array[i] = array[j];
//         array[j] = temp;
//       }
//     }
//   }
// }
