import { XmlDocument } from "xmldoc";
import {
  EngineResponse,
  FieldDto,
  AttributeType,
} from "@/entity/response.entity";
import {
  LineDetailEntity,
  ScreenModel,
  ScreenLineEntity,
  ScreenRowComponentEnum,
  ScreenRowModel,
  ListViewModel,
  ListMasterModel,
  LabelViewModel,
} from "@/entity/screen.entity";
import { CapturedValue } from "@/entity/request.entity";

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
export function composeRowData(
  screenEntity: ScreenModel
): Map<number, ScreenLineEntity> {
  const map: Map<number, any> = new Map();
  // screenEntity.screenLines.forEach((screenRow: any[]) => {
  //   if (screenRow.length > 0) {
  //     const line = {} as ScreenLineEntity;
  //     line.details = [] as LineDetailEntity[];
  //     screenRow.forEach((column: FieldDto) => {
  //       const detail = {} as LineDetailEntity;
  //       if (column) {
  //         switch (column.attributeType) {
  //           case AttributeType.OUTPUT:
  //             if (
  //               !line.type ||
  //               (line.type && line.type == ScreenRowComponentEnum.LABEL)
  //             ) {
  //               line.type = ScreenRowComponentEnum.LABEL;
  //             }
  //             detail.name = column.value;
  //             detail.coordinateNameX = column.coordinateX;
  //             line.color = column.color;
  //             line.details.push(detail);
  //             break;
  //           case AttributeType.INPUT:
  //             line.type = ScreenRowComponentEnum.INPUT;
  //             detail.attributeName = column.attributeName;
  //             detail.coordinateValueX = column.coordinateX;
  //             detail.maxLength = column.maxLength;
  //             detail.value =
  //               column.defaultValue == undefined ? "" : column.defaultValue;
  //             if (screenEntity.focus == column.attributeName) {
  //               line.isFocus = true;
  //             }
  //             line.details.push(detail);
  //             break;
  //           case AttributeType.PASSWORD:
  //             line.type = ScreenRowComponentEnum.PASSWORD;
  //             detail.attributeName = column.attributeName;
  //             detail.maxLength = column.maxLength;
  //             detail.coordinateValueX = column.coordinateX;
  //             line.details.push(detail);
  //             break;
  //           case AttributeType.MENU:
  //             line.type = ScreenRowComponentEnum.MENU;
  //             detail.name = column.value;
  //             detail.coordinateNameX = column.coordinateX;
  //             line.details.push(detail);
  //             break;
  //         }
  //       }
  //     });
  //     map.set(screenRow[0].coordinateY, line);
  //   }
  // });
  console.log(map);
  return map;
}

/**
 * Deprecated, For XML reponse
 * @param xml
 * @returns
 */
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

export function composeScreenData(param: EngineResponse) {
  const screenModel: ScreenModel = {
    title: "",
    focus: "",
    mainRows: new Map(),
    subFormRows: new Map(),
    screenLines: [],
    capturedValues: [],
    subTitle: "",
  };
  screenModel.title = param.title;
  // screenModel.subTitle = param.subTitle;
  screenModel.mainRows = composeRowsData(param.fields);
  console.log(screenModel.mainRows);
  // screenModel.subFormRows = composeRowsData(param.subFields);
  return screenModel;
}

export function composeRowsData(fields: FieldDto[]) {
  const rows = new Map<number, ScreenRowModel>();
  const listView = {} as ListViewModel;
  fields.forEach((field: FieldDto) => {
    let type = field.attributeType;
    if (field.attributeType.includes("list_single")) {
      type = "list_single";
    }
    switch (type) {
      case "label":
        composeLabelComponent(rows, field);
        break;
      case "list_single":
        parseListSingle(rows, listView, field);
        break;
    }
  });
  const array = Array.from(rows).sort((a: any, b: any) => {
    return a[0] - b[0];
  });
  const result = new Map<number, ScreenRowModel>();
  array.forEach((t) => {
    result.set(t[0], t[1]);
  });
  return result;
}

function parseListSingle(
  rows: Map<number, ScreenRowModel>,
  listView: ListViewModel,
  field: FieldDto
) {
  switch (field.attributeType) {
    case "list_single_title":
      composeLabelComponent(rows, field);
      break;
    case "list_single_item_first":
      listView.firstRow = field.coordinateY;
      break;
    case "list_single_item_last":
      listView.lastRow = field.coordinateY;
      break;
    case "list_single_value":
      composeLabelComponentForList(rows, listView, field);
      break;
    case "list_single_label":
      composeListInputComponet(rows, field);
      break;
    case "list_single_input":
      composeListInputComponet(rows, field);
      break;
    case "list_single_page":
      composeListInputComponet(rows, field);
      break;
  }
}

function composeLabelComponent(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) {
  const screenRow = {} as ScreenRowModel;
  screenRow.type = ScreenRowComponentEnum.LABEL;
  screenRow.coordinateY = field.coordinateY;
  screenRow.labelDetails = [];
  if (rows.size == 0) {
    screenRow.labelDetails.push(field);
    rows.set(field.coordinateY, screenRow);
  } else {
    let sameRow = false;
    rows.forEach((row) => {
      if (row.coordinateY == field.coordinateY) {
        row.labelDetails.push(field);
        sameRow = true;
      }
    });
    if (!sameRow) {
      screenRow.labelDetails.push(field);
      rows.set(field.coordinateY, screenRow);
    }
  }
}

function composeLabelComponentForList(
  rows: Map<number, ScreenRowModel>,
  listView: ListViewModel,
  field: FieldDto
) {
  const data = field.value as ListMasterModel;
  data.list.forEach((t) => {
    const screenRow = {} as ScreenRowModel;
    screenRow.type = ScreenRowComponentEnum.LABEL;
    screenRow.labelDetails = [];
    screenRow.coordinateY = listView.firstRow + t.sequence - 1;
    const tempField = {} as FieldDto;
    tempField.value = t.id + "." + t.name;
    screenRow.labelDetails.push(tempField);
    rows.set(screenRow.coordinateY, screenRow);
  });
}

function composeListInputComponet(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) {
  let existRow = false;
  rows.forEach((row) => {
    if (row.coordinateY == field.coordinateY) {
      row.singleListInputDetails.push(field);
      existRow = true;
    }
  });
  if (!existRow) {
    const screenRow = {} as ScreenRowModel;
    screenRow.type = ScreenRowComponentEnum.SINGLELISTINPUT;
    screenRow.coordinateY = field.coordinateY;
    screenRow.singleListInputDetails = [];
    screenRow.singleListInputDetails.push(field);
    rows.set(screenRow.coordinateY, screenRow);
  }
}
