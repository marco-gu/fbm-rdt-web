import { XmlDocument } from "xmldoc";
import { EngineResponse, FieldDto } from "@/entity/response.entity";
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
  doc.children.forEach((t: any) => {
    switch (t.name) {
      case "field": {
        const element = {} as FieldDto;
        element.color = t.attr.color;
        element.coordinateX = t.attr.x;
        element.coordinateY = t.attr.y;
        if (screenEntity.screenTitle.includes("Menu")) {
          element.attributeType = "menu";
        } else {
          element.attributeType = t.attr.typ;
        }
        element.value = t.attr.value;
        element.attributeName = t.attr.id;
        element.defaultValue = t.attr.default;
        element.maxLength = t.attr.length;
        if (element.attributeType == "input") {
          const capturedValue = {} as CapturedValue;
          capturedValue.attributeName = element.attributeName;
          capturedValue.value = element.defaultValue
            ? element.defaultValue
            : "";
          screenEntity.capturedValues.push(capturedValue);
        }
        response.fields.push(element);
        break;
      }
      case "screen": {
        screenEntity.screenTitle = t.attr.title;
      }
    }
  });
  console.log(response);
  const rows: any[][] = [[]];
  let i = 0;
  let j = 0;
  response.fields.forEach((t: FieldDto) => {
    if (t.coordinateX == 1) {
      if (i > 0 && rows[i - 1] && rows[i - 1][0].coordinateY == t.coordinateY) {
        if (rows[i - 1][j].coordinateX > t.coordinateX) {
          const temp = rows[i - 1][j];
          rows[i - 1][j] = t;
          j++;
          rows[i - 1][j] = temp;
        } else {
          j++;
          rows[i - 1][j] = t;
        }
      } else {
        j = 0;
        rows[i] = [];
        rows[i][j] = t;
      }
    } else {
      if (rows[i - 1]) {
        rows[i - 1].forEach((row: any) => {
          if (row && row.coordinateY == t.coordinateY) {
            j++;
            rows[i - 1][j] = t;
          }
        });
      } else {
        j = 0;
        rows[i] = [];
        rows[i][j] = t;
      }
    }
    i++;
  });
  console.log(rows);
  screenEntity.screenLines = rows;
  return screenEntity;
}

export function parseLineView(
  screenEntity: ScreenEntity
): Map<number, ScreenLineEntity> {
  const map: Map<number, any> = new Map();
  screenEntity.screenLines.forEach((screenRow: any[], index: number) => {
    const line = {} as ScreenLineEntity;
    line.detail = {} as LineDetailEntity;
    screenRow.forEach((column: FieldDto) => {
      switch (column.attributeType) {
        case "output":
          line.type = ScreenLineTypeEnum.Label;
          if (line.detail && !line.detail.name) {
            line.detail.name = column.value;
            line.detail.coordinateNameX = column.coordinateX;
          } else {
            line.detail.value = column.value;
            line.detail.coordinateValueX = column.coordinateX;
          }
          break;
        case "input":
          line.type = ScreenLineTypeEnum.Input;
          line.detail.attributeName = column.attributeName;
          line.detail.coordinateValueX = column.coordinateX;
          line.detail.maxLength = column.maxLength;
          line.detail.value =
            column.defaultValue == undefined ? "" : column.defaultValue;
          if (screenEntity.screenFocusName == column.attributeName) {
            line.isFocus = true;
          }
          break;
        case "password":
          line.type = ScreenLineTypeEnum.Password;
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          line.detail.attributeName = column.attributeName;
          line.detail.maxLength = column.maxLength;
          line.detail.coordinateValueX = column.coordinateX;
          break;
        case "menu":
          line.type = ScreenLineTypeEnum.Menu;
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          line.detail.name = column.value;
          line.detail.coordinateNameX = column.coordinateX;
          break;
      }
    });
    map.set(screenRow[0].coordinateY, line);
  });
  console.log(map);
  return map;
}
