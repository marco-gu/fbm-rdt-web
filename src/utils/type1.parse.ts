import { XmlDocument } from "xmldoc";
import {
  AttributeType,
  EngineResponse,
  FieldDto,
} from "@/entity/response.entity";
import { ScreenRowComponentEnum, ScreenRowModel } from "@/entity/screen.entity";

export function parseLegacyXML(engineResponse: EngineResponse) {
  const doc = new XmlDocument(engineResponse.legacyOutPutXML);
  const fields = [] as FieldDto[];
  engineResponse.screenDto.fields = [];
  doc.children.forEach((t: any) => {
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
          fields.push(element);
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
  rows.forEach((row) => {
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
