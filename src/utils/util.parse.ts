import { XmlDocument } from "xmldoc";
import { EngineResponse, FieldDto } from "@/entity/response.entity";
import { ScreenEntity, ScreenLineEntity } from "@/entity/screen.entity";
import { CapturedValue } from "@/entity/request.entity";

export function parseXML(xml: any): ScreenEntity {
  const doc = new XmlDocument(xml);
  const response = {} as EngineResponse;
  const screenEntity = {} as ScreenEntity;
  screenEntity.capturedValues = [];
  screenEntity.screenFocusName = doc.attr.focus;
  // screenEntity.screenTitle = response.screenTitle;
  screenEntity.sessionID = doc.attr.number as unknown as number;
  // response.sessionID = doc.attr.number as unknown as number;
  response.fields = [];
  doc.children.forEach((t: any) => {
    switch (t.name) {
      case "field": {
        const element = {} as FieldDto;
        element.color = t.attr.color;
        element.coordinateX = t.attr.x;
        element.coordinateY = t.attr.y;
        // response.screenTitle.includes("Menu");
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
          capturedValue.value = element.defaultValue;
          screenEntity.capturedValues.push(capturedValue);
        }
        response.fields.push(element);
        break;
      }
      case "screen": {
        // response.screenTitle = t.attr.title;
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
      if (rows[i][0] && t.coordinateY == rows[i][0].coordinateY) {
        if (rows[i][j].coordinateX > t.coordinateX) {
          const temp = rows[i][j];
          rows[i][j] = t;
          j++;
          rows[i][j] = temp;
        } else {
          j++;
          rows[i][j] = t;
        }
      } else {
        if (t.attributeType == "input") {
          j++;
          rows[i][j] = t;
        } else {
          i++;
          j = 0;
          rows[i] = [];
          rows[i][j] = t;
        }
      }
    } else {
      let isSame = false;
      rows.forEach((row: any, index: number) => {
        if (row[0] && row[0].coordinateY == t.coordinateY) {
          j++;
          rows[index][j] = t;
          isSame = true;
        }
      });
      if (!isSame) {
        i++;
        j = 0;
        rows[i] = [];
        rows[i][j] = t;
      }
    }
  });
  rows.shift();
  console.log(rows);
  screenEntity.screenLines = rows;
  // screenEntity.screenTitle = response.screenTitle;
  // screenEntity.sessionID = response.sessionID;
  return screenEntity;
}

export function parseLineView(
  screenEntity: ScreenEntity
): Map<number, ScreenLineEntity> {
  const map: Map<number, any> = new Map();
  screenEntity.screenLines.forEach((screenRow: any[], index: number) => {
    const line = new ScreenLineEntity();
    screenRow.forEach((column: FieldDto) => {
      switch (column.attributeType) {
        case "output":
          line.type = "output";
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          if (line.detail.label == "") {
            line.detail.label = column.value;
            line.detail.labelX = column.coordinateX;
          } else {
            line.detail.value = column.value;
            line.detail.valueX = column.coordinateX;
          }
          break;
        case "input":
          line.type = "input";
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          line.detail.attributeName = column.attributeName;
          line.detail.maxLength = column.maxLength;
          line.detail.value = column.defaultValue;
          line.detail.valueX = column.coordinateX;
          if (screenEntity.screenFocusName == column.attributeName) {
            line.isFocus = true;
          }
          break;
        case "password":
          line.type = "password";
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          line.detail.attributeName = column.attributeName;
          line.detail.maxLength = column.maxLength;
          line.detail.valueX = column.coordinateX;
          break;
        case "menu":
          line.type = "menu";
          line.isLastLine = index == screenEntity.screenLines.length - 1;
          line.detail.label = column.value;
          line.detail.labelX = column.coordinateX;
          break;
      }
    });
    map.set(screenRow[0].coordinateY, line);
  });
  console.log(map);
  return map;
}
