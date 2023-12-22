import { CapturedValue } from "@/entity/request.entity";
import {
  AttributeType,
  EngineResponse,
  FieldDto,
  ListAttributeType,
} from "@/entity/response.entity";
import {
  ScreenModel,
  ScreenRowComponentEnum,
  ScreenRowModel,
} from "@/entity/screen.entity";
import _ from "lodash";

let screenModel = {} as ScreenModel;
screenModel.capturedValues = [];
export function composeScreenData(param: EngineResponse, data: ScreenModel) {
  screenModel = data;
  screenModel.capturedValues = [];
  screenModel.screenRows = composeRowsData(param.screenDto.fields);
  screenModel.title = param.screenDto.title;
  screenModel.workFlowId = param.workFlowId;
  screenModel.workNodeId = param.workNodeId;
  return screenModel;
}

function composeRowsData(fields: FieldDto[]) {
  const rows = new Map<number, ScreenRowModel>();
  const singleListInfo = {
    firstRow: 0,
  };
  fields.forEach((field: FieldDto) => {
    if (field.attributeType.includes(AttributeType.LIST_SINGLE)) {
      parseListSingle(singleListInfo, rows, field);
    } else {
      switch (field.attributeType) {
        case AttributeType.LABEL:
          composeLabelRow(rows, field);
          break;
        case AttributeType.INPUT:
          composeInputRow(rows, field);
          break;
        case AttributeType.PASSWORD:
          composeInputRow(rows, field);
          break;
        case AttributeType.MESSAGE:
          composeMessageRows(rows, field);
          break;
        case AttributeType.INPUT_MULTI:
          // parseInputBoxMultiLine(rows, field);
          break;
        case AttributeType.SUB_BUTTON:
          composeSubButton(rows, field);
          break;
      }
    }
  });
  composeEmptyRows(rows);
  return sortRows(rows);
}

function parseListSingle(
  singleListInfo: any,
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) {
  switch (field.attributeType) {
    case ListAttributeType.LIST_SINGLE_TITLE:
      composeLabelRow(rows, field, ScreenRowComponentEnum.LIST_TITLE_LABEL);
      break;
    case ListAttributeType.LIST_SINGLE_ITEM_FIRST:
      singleListInfo.firstRow = field.coordinateY;
      break;
    case ListAttributeType.LIST_SINGLE_LABEL:
      composeInputRowForList(rows, field, ScreenRowComponentEnum.LIST_INPUT);
      break;
    case ListAttributeType.LIST_SINGLE_INPUT:
      composeInputRowForList(rows, field, ScreenRowComponentEnum.LIST_INPUT);
      break;
    // case ListAttributeType.LIST_SINGLE_PAGE:
    //   composeInputRowForList(rows, field, ScreenRowComponentEnum.LABEL);
    //   break;
    case ListAttributeType.LIST_SINGLE_LIST:
      composeLabelRowsForList(
        rows,
        field,
        singleListInfo.firstRow,
        ScreenRowComponentEnum.LIST_ITEM_LABEL
      );
      break;
  }
}

function composeLabelRow(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenRowComponent?: ScreenRowComponentEnum
) {
  if (rows.has(field.coordinateY)) {
    rows.get(field.coordinateY)?.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    if (screenRowComponent) {
      screenRow.rowType = screenRowComponent;
    } else {
      screenRow.rowType = ScreenRowComponentEnum.LABEL;
    }
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    rows.set(field.coordinateY, screenRow);
  }
}

function composeLabelRowsForList(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  firstRow: number,
  screenRowComponent: ScreenRowComponentEnum
) {
  const values = JSON.parse(field.value);
  screenModel.list = values;
  values.list.forEach((t: any) => {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = screenRowComponent;
    screenRow.coordinateY = firstRow + t.sequence - 1;
    screenRow.rowDetails = [];
    const cloneField = _.cloneDeep(field);
    cloneField.value = t.sequence + "." + t.name;
    screenRow.rowDetails.push(cloneField);
    rows.set(screenRow.coordinateY, screenRow);
  });
}

function composeInputRow(rows: Map<number, ScreenRowModel>, field: FieldDto) {
  if (_.isEmpty(screenModel.focus)) {
    screenModel.focus = field.attributeName;
  }
  if (rows.has(field.coordinateY)) {
    const row = rows.get(field.coordinateY) as ScreenRowModel;
    switch (field.attributeType) {
      case AttributeType.INPUT:
        row.rowType = ScreenRowComponentEnum.INPUT;
        break;
      case AttributeType.PASSWORD:
        row.rowType = ScreenRowComponentEnum.PASSWORD;
        break;
    }
    row.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.INPUT;
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    rows.set(field.coordinateY, screenRow);
  }
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
}

function composeInputRowForList(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenRowComponent: ScreenRowComponentEnum
) {
  if (rows.has(field.coordinateY)) {
    rows.get(field.coordinateY)?.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = screenRowComponent;
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    rows.set(field.coordinateY, screenRow);
  }
  if (field.attributeType == ListAttributeType.LIST_SINGLE_INPUT) {
    const capturedValue = {
      attributeName: field.attributeName,
      value: field.value,
    } as CapturedValue;
    screenModel.capturedValues.push(capturedValue);
  }
}

function composeMessageRows(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) {
  if (!_.isEmpty(field.value)) {
    const values = JSON.parse(field.value);
    values.msgItems.forEach((t: any, index: number) => {
      const screenRow = {} as ScreenRowModel;
      screenRow.rowType = ScreenRowComponentEnum.MESSAGEBOX;
      screenRow.coordinateY = field.coordinateY + index;
      screenRow.rowDetails = [];
      const rowData = _.cloneDeep(field);
      rowData.value = t;
      screenRow.rowDetails.push(rowData);
      rows.set(field.coordinateY + index, screenRow);
    });
  }
}

function composeEmptyRows(rows: Map<number, ScreenRowModel>) {
  const perPageMaxLine = 15;
  for (let i = 1; i <= perPageMaxLine; i++) {
    if (!rows.has(i)) {
      const screenRow = {} as ScreenRowModel;
      screenRow.rowType = ScreenRowComponentEnum.LABEL;
      screenRow.coordinateY = i;
      screenRow.rowDetails = [];
      rows.set(i, screenRow);
    }
  }
}

function sortRows(rows: Map<number, ScreenRowModel>) {
  const array = Array.from(rows).sort((a: any, b: any) => {
    return a[0] - b[0];
  });
  const result = new Map<number, ScreenRowModel>();
  array.forEach((t) => {
    result.set(t[0], t[1]);
  });
  return result;
}

function composeSubButton(rows: Map<number, ScreenRowModel>, field: FieldDto) {
  const screenRow = {} as ScreenRowModel;
  screenRow.coordinateY = field.coordinateY;
  screenRow.rowType = ScreenRowComponentEnum.SUB_BUTTON;
  screenRow.rowDetails = [];
  const values = field.value.split(",");
  screenModel.subFormAction = values[0];
  screenModel.subWorkFlowId = values[1];
  screenModel.subWorkNodeId = values[2];
  // rows.set(field.coordinateY, screenRow);
  rows.set(15, screenRow);
}

function parseInputBoxMultiLine(
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) {
  const row = rows.get(field.coordinateY) as ScreenRowModel;
  field.attributeType = "inputBox";
  row.rowDetails.push(field);
  row.rowType = ScreenRowComponentEnum.MULTI_INPUT;
  rows.set(field.coordinateY, row);
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
  // hard code for 3 lines
  for (let i = 1; i < 4; i++) {
    const newLabelField = _.clone(row.rowDetails[0]);
    newLabelField.value = "      ";
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.MULTI_INPUT;
    screenRow.coordinateY = field.coordinateY + i;
    screenRow.rowDetails = [];
    const newField = _.clone(field);
    newField.attributeType = "inputBox";
    newField.attributeId = field.attributeType + i;
    newField.attributeName = field.attributeName + "_" + "multi_line_" + i;
    screenRow.rowDetails.push(newLabelField);
    screenRow.rowDetails.push(newField);
    const capturedValue = {
      attributeName: newField.attributeName,
      value: field.value,
    } as CapturedValue;
    screenModel.capturedValues.push(capturedValue);
    rows.set(screenRow.coordinateY, screenRow);
  }
}
