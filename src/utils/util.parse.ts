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
  let j = 0;
  response.fields.forEach((t: FieldDto) => {
    console.log(t.coordinateY);
    if (t.coordinateX == 1) {
      if (rows[t.coordinateY]) {
        if (rows[t.coordinateY][j].coordinateX > t.coordinateX) {
          const temp = rows[t.coordinateY][j];
          rows[t.coordinateY][j] = t;
          j++;
          rows[t.coordinateY][j] = temp;
        } else {
          j++;
          rows[t.coordinateY][j] = t;
        }
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
  screenEntity.screenLines.forEach((screenRow: any[], index: number) => {
    if (screenRow.length > 0) {
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
      console.log(screenRow[0]);
      map.set(screenRow[0].coordinateY, line);
    }
  });
  console.log(map);
  return map;
}
