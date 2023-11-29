import { XmlDocument } from "xmldoc";
import {
  EngineResponse,
  FieldDto,
  ResponseAttributeType,
} from "@/entity/response.entity";
import {
  LineDetailEntity,
  ScreenEntity,
  ScreenLineEntity,
  ScreenLineTypeEnum,
} from "@/entity/screen.entity";
import { CapturedValue } from "@/entity/request.entity";

export function parseXML(xml: any): ScreenEntity {
  const doc = new XmlDocument(xml);
  const response = {} as EngineResponse;
  const screenEntity = new ScreenEntity();
  screenEntity.capturedValues = [];
  screenEntity.screenFocusName = doc.attr.focus;
  screenEntity.sessionID = doc.attr.number as unknown as number;
  response.fields = [];
  doc.children.forEach((t: any, index: number) => {
    switch (t.name) {
      case "field": {
        if (t.attr.typ != "funcKey") {
          const element = {} as FieldDto;
          element.color = t.attr.color;
          element.coordinateX = t.attr.x;
          element.coordinateY = t.attr.y;
          if (
            screenEntity.screenTitle.includes("Menu") &&
            index < doc.children.length - 1
          ) {
            element.attributeType = ScreenLineTypeEnum.MENU;
          } else {
            element.attributeType = t.attr.typ;
          }
          element.value = t.attr.value;
          element.attributeName = t.attr.id;
          element.defaultValue = t.attr.default;
          element.maxLength = t.attr.length;
          if (element.attributeType == ResponseAttributeType.INPUT) {
            const capturedValue = {} as CapturedValue;
            capturedValue.attributeName = element.attributeName;
            capturedValue.value = element.defaultValue
              ? element.defaultValue
              : "";
            screenEntity.capturedValues.push(capturedValue);
          }
          response.fields.push(element);
        } else {
          // todo sub process&&funtion key
        }
        break;
      }
      case "screen": {
        screenEntity.screenTitle = t.attr.title;
      }
    }
  });
  console.log(response);
  const rows: any[][] = [[]];
  let j = 0;
  response.fields.forEach((t: FieldDto) => {
    if (t.coordinateX == 1) {
      if (rows[t.coordinateY]) {
        j = rows[t.coordinateY].length - 1;
        j++;
        rows[t.coordinateY][j] = t;
        sortArray(rows[t.coordinateY]);
        // const last = rows[t.coordinateY].length - 1;
        // if (rows[t.coordinateY][last].coordinateX > t.coordinateX) {
        //   const temp = rows[t.coordinateY][j];
        //   rows[t.coordinateY][j] = t;
        //   j++;
        //   rows[t.coordinateY][j] = temp;
        // } else {
        //   j++;
        //   rows[t.coordinateY][j] = t;
        // }
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
  console.log(rows);
  screenEntity.screenLines = rows;
  return screenEntity;
}

export function parseLineView(
  screenEntity: ScreenEntity
): Map<number, ScreenLineEntity> {
  const map: Map<number, any> = new Map();
  screenEntity.screenLines.forEach((screenRow: any[]) => {
    if (screenRow.length > 0) {
      const line = {} as ScreenLineEntity;
      line.details = [] as LineDetailEntity[];
      screenRow.forEach((column: FieldDto) => {
        const detail = {} as LineDetailEntity;
        if (column) {
          switch (column.attributeType) {
            case ResponseAttributeType.OUTPUT:
              if (
                !line.type ||
                (line.type && line.type == ScreenLineTypeEnum.LABEL)
              ) {
                line.type = ScreenLineTypeEnum.LABEL;
              }
              detail.name = column.value;
              detail.coordinateNameX = column.coordinateX;
              line.color = column.color;
              // if (line.detail && !line.detail.name) {
              //   line.detail.name = column.value;
              //   line.detail.coordinateNameX = column.coordinateX;
              // } else {
              //   line.detail.value = column.value;
              //   line.detail.coordinateValueX = column.coordinateX;
              // }
              // line.detail.color = column.color;
              line.details.push(detail);
              break;
            case ResponseAttributeType.INPUT:
              line.type = ScreenLineTypeEnum.INPUT;
              detail.attributeName = column.attributeName;
              detail.coordinateValueX = column.coordinateX;
              detail.maxLength = column.maxLength;
              detail.value =
                column.defaultValue == undefined ? "" : column.defaultValue;
              // line.detail.attributeName = column.attributeName;
              // line.detail.coordinateValueX = column.coordinateX;
              // line.detail.maxLength = column.maxLength;
              // line.detail.value =
              //   column.defaultValue == undefined ? "" : column.defaultValue;
              if (screenEntity.screenFocusName == column.attributeName) {
                line.isFocus = true;
              }
              line.details.push(detail);
              break;
            case ResponseAttributeType.PASSWORD:
              line.type = ScreenLineTypeEnum.PASSWORD;
              // line.detail.attributeName = column.attributeName;
              // line.detail.maxLength = column.maxLength;
              // line.detail.coordinateValueX = column.coordinateX;
              detail.attributeName = column.attributeName;
              detail.maxLength = column.maxLength;
              detail.coordinateValueX = column.coordinateX;
              line.details.push(detail);
              break;
            case ResponseAttributeType.MENU:
              line.type = ScreenLineTypeEnum.MENU;
              // line.detail.name = column.value;
              // line.detail.coordinateNameX = column.coordinateX;
              detail.name = column.value;
              detail.coordinateNameX = column.coordinateX;
              line.details.push(detail);
              break;
          }
        }
      });
      map.set(screenRow[0].coordinateY, line);
    }
  });
  console.log(map);
  return map;
}

function sortArray(array: any) {
  let temp = null;
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (parseInt(array[i].coordinateX) > parseInt(array[j].coordinateX)) {
        temp = array[i];
        console.log(i, j);
        array[i] = array[j];
        array[j] = temp;
      }
    }
  }
}
