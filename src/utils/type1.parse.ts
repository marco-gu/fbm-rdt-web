import { XmlDocument } from "xmldoc";
import {
  AttributeType,
  EngineResponse,
  FieldDto,
  LegacyAttributeType,
} from "@/entity/response.entity";
import { ScreenRowComponentEnum, ScreenRowModel } from "@/entity/screen.entity";
import { CapturedValue } from "@/entity/request.entity";

export function parseLegacyXML(engineResponse: EngineResponse) {
  const doc = new XmlDocument(engineResponse.legacyOutPutXML);
  // const screenModel = {} as ScreenModel;
  // screenModel.capturedValues = [];
  // screenModel.focus = doc.attr.focus;
  const fields = [] as FieldDto[];
  engineResponse.screenDto.fields = [];

  doc.children.forEach((t: any, index: number) => {
    switch (t.name) {
      case "field": {
        if (t.attr.typ != "funcKey") {
          const element = {} as FieldDto;
          element.color = t.attr.color;
          element.coordinateX = parseInt(t.attr.x);
          element.coordinateY = parseInt(t.attr.y);
          // if (
          //   screenModel.title.includes("Menu") &&
          //   index < doc.children.length - 1
          // ) {
          //   element.attributeType = ScreenLineTypeEnum.MENU;
          // } else {
          //   element.attributeType = t.attr.typ;
          // }
          switch (t.attr.typ) {
            case "output":
              element.attributeType = AttributeType.LABEL;
              break;
            case "input":
              element.attributeType = AttributeType.INPUT;
              break;
          }
          element.value = t.attr.value;
          element.attributeName = t.attr.id;
          element.defaultValue = t.attr.default;
          element.maxLength = t.attr.length;
          // if (element.attributeType == LegacyAttributeType.INPUT) {
          //   const capturedValue = {} as CapturedValue;
          //   capturedValue.attributeName = element.attributeName;
          //   capturedValue.value = element.defaultValue
          //     ? element.defaultValue
          //     : "";
          //   screenModel.capturedValues.push(capturedValue);
          // }
          fields.push(element);
          // response.fields.push(element);
        } else {
          // todo sub process&&funtion key
        }
        break;
      }
      case "screen": {
        engineResponse.screenDto.title = t.attr.title;
      }
    }
  });
  const rows: any[][] = [[]];
  let j = 0;
  console.log(fields);
  fields.forEach((t: FieldDto) => {
    if (t.coordinateX == 1) {
      if (rows[t.coordinateY]) {
        j = rows[t.coordinateY].length - 1;
        j++;
        rows[t.coordinateY][j] = t;
        sortArray(rows[t.coordinateY]);
      } else {
        j = 0;
        rows[t.coordinateY] = [];
        rows[t.coordinateY][j] = t;
      }
    } else {
      if (rows[t.coordinateY]) {
        j++;
        rows[t.coordinateY][j] = t;
      } else {
        j = 0;
        rows[t.coordinateY] = [];
        rows[t.coordinateY][j] = t;
      }
    }
  });
  rows.forEach((row, index) => {
    if (row && row.length > 0) {
      row.forEach((t) => {
        engineResponse.screenDto.fields.push(t);
      });
    }
  });
  console.log(engineResponse);
  return engineResponse;
  // screenEntity.screenLines = rows;
}

export function composeEmptyRowsForLegacy(rows: Map<number, ScreenRowModel>) {
  const perPageMaxLine = 15;
  console.log("236");
  console.log(rows);
  for (let i = 1; i <= perPageMaxLine; i++) {
    console.log(rows.has(i));
    if (!rows.has(i)) {
      const screenRow = {} as ScreenRowModel;
      screenRow.rowType = ScreenRowComponentEnum.LABEL;
      screenRow.coordinateY = i;
      screenRow.rowDetails = [];
      rows.set(i, screenRow);
    }
  }
}

// export function composeRowData(
//   screenEntity: ScreenEntity
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
//             case ResponseAttributeType.OUTPUT:
//               if (
//                 !line.type ||
//                 (line.type && line.type == ScreenLineTypeEnum.LABEL)
//               ) {
//                 line.type = ScreenLineTypeEnum.LABEL;
//               }
//               detail.name = column.value;
//               detail.coordinateNameX = column.coordinateX;
//               line.color = column.color;
//               // if (line.detail && !line.detail.name) {
//               //   line.detail.name = column.value;
//               //   line.detail.coordinateNameX = column.coordinateX;
//               // } else {
//               //   line.detail.value = column.value;
//               //   line.detail.coordinateValueX = column.coordinateX;
//               // }
//               // line.detail.color = column.color;
//               line.details.push(detail);
//               break;
//             case ResponseAttributeType.INPUT:
//               line.type = ScreenLineTypeEnum.INPUT;
//               detail.attributeName = column.attributeName;
//               detail.coordinateValueX = column.coordinateX;
//               detail.maxLength = column.maxLength;
//               detail.value =
//                 column.defaultValue == undefined ? "" : column.defaultValue;
//               // line.detail.attributeName = column.attributeName;
//               // line.detail.coordinateValueX = column.coordinateX;
//               // line.detail.maxLength = column.maxLength;
//               // line.detail.value =
//               //   column.defaultValue == undefined ? "" : column.defaultValue;
//               if (screenEntity.screenFocusName == column.attributeName) {
//                 line.isFocus = true;
//               }
//               line.details.push(detail);
//               break;
//             case ResponseAttributeType.PASSWORD:
//               line.type = ScreenLineTypeEnum.PASSWORD;
//               // line.detail.attributeName = column.attributeName;
//               // line.detail.maxLength = column.maxLength;
//               // line.detail.coordinateValueX = column.coordinateX;
//               detail.attributeName = column.attributeName;
//               detail.maxLength = column.maxLength;
//               detail.coordinateValueX = column.coordinateX;
//               line.details.push(detail);
//               break;
//             case ResponseAttributeType.MENU:
//               line.type = ScreenLineTypeEnum.MENU;
//               // line.detail.name = column.value;
//               // line.detail.coordinateNameX = column.coordinateX;
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

function sortArray(array: any) {
  let temp = null;
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (parseInt(array[i].coordinateX) > parseInt(array[j].coordinateX)) {
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
  }
}
