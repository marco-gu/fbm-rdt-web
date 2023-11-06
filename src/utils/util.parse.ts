import { XmlDocument } from "xmldoc";
import { EngineResponse, FieldDto } from "@/entity/response.entity";
import { ScreenEntity, ScreenRowEntity } from "@/entity/screen.entity";
import { CapturedValue } from "@/entity/request.entity";

export function parseXML(xml: any): ScreenEntity {
  const doc = new XmlDocument(xml);
  const response = {} as EngineResponse;
  const screenEntity = {} as ScreenEntity;
  screenEntity.capturedValues = [];
  response.sessionID = doc.attr.number as unknown as number;
  response.fields = [];
  doc.children.forEach((t: any) => {
    switch (t.name) {
      case "field": {
        const element = {} as FieldDto;
        element.color = t.attr.color;
        element.coordinateX = t.attr.x;
        element.coordinateY = t.attr.y;
        element.attributeType = t.attr.typ;
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
        response.screenTitle = t.attr.title;
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
  screenEntity.screenRows = rows;
  screenEntity.screenTitle = response.screenTitle;
  screenEntity.sessionID = response.sessionID;
  return screenEntity;
}

export function parseLineView(
  screenEntity: ScreenEntity
): Map<number, ScreenRowEntity> {
  const map: Map<number, any> = new Map();
  screenEntity.screenRows.forEach((screenRow: any[]) => {
    const line = new ScreenRowEntity();
    screenRow.forEach((column: FieldDto) => {
      switch (column.attributeType) {
        case "output":
          line.type = "output";
          line.detail.value = line.detail.label ? column.value : "";
          line.detail.label = column.value;
          break;
        case "input":
          line.type = "input";
          line.detail.attributeName = column.attributeName;
          line.detail.maxLength = column.maxLength;
          line.detail.value = column.defaultValue;
          break;
        case "password":
          line.type = "password";
          line.detail.attributeName = column.attributeName;
          line.detail.maxLength = column.maxLength;
          break;
      }
    });
    map.set(screenRow[0].coordinateY, line);
  });
  console.log(map);
  return map;
}
