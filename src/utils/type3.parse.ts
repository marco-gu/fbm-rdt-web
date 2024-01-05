import { CapturedValue } from "@/entity/request.entity";
import {
  AttributeType,
  EngineResponse,
  FieldDto,
} from "@/entity/response.entity";
import {
  ListModel,
  ScreenModel,
  ScreenRowComponentEnum,
  ScreenRowModel,
} from "@/entity/screen.entity";
import _ from "lodash";
export function composeScreen(param: EngineResponse, screenModel: ScreenModel) {
  const screenStyle = localStorage.getItem("screenStyle") as string;
  const row = JSON.parse(screenStyle).rows;
  screenModel.currentPage = 1;
  screenModel.pageSize = row;
  screenModel.totalPage = Math.ceil(
    param.screenDto.fields[param.screenDto.fields.length - 1].coordinateY / row
  );
  screenModel.screenRows = composeRowsData(param.screenDto.fields, screenModel);
  screenModel.title = param.screenDto.title;
  screenModel.workFlowCollection.workFlowId = param.workFlowId;
  screenModel.workFlowCollection.workNodeId = param.workNodeId;
  return screenModel;
}

function composeRowsData(fields: FieldDto[], screenModel: ScreenModel) {
  const rows = new Map<number, ScreenRowModel>();
  fields.filter((value) => {
    if (value.attributeType == AttributeType.HEADER) {
      screenModel.header = true;
    } else if (value.attributeType == AttributeType.FOOTER) {
      screenModel.footer = true;
    }
  });
  fields.forEach((field: FieldDto) => {
    if (screenModel.header) {
      field.coordinateY += 1;
    }
    switch (field.attributeType) {
      case AttributeType.HEADER:
        field.coordinateY = 1;
        composeLabelRow(rows, field);
        break;
      case AttributeType.LABEL:
        composeLabelRow(rows, field);
        break;
      case AttributeType.INPUT:
      case AttributeType.PASSWORD:
        composeInputRow(rows, field, screenModel);
        break;
      case AttributeType.MESSAGE:
        composeMessageRows(rows, field);
        break;
      case AttributeType.INPUT_MULTI:
        composeMultiInputRow(rows, field, screenModel);
        break;
      case AttributeType.SUB_BUTTON:
        composeSubButton(rows, field, screenModel);
        break;
      case AttributeType.LIST_SINGLE:
        composeListComponents(rows, field, screenModel);
        break;
      case AttributeType.FOOTER:
        // TODO page > 1
        field.coordinateY = screenModel.pageSize;
        composeLabelRow(rows, field);
        break;
    }
  });
  composeEmptyRows(rows);
  return sortRows(rows);
}

const composeLabelRow = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenRowComponent?: ScreenRowComponentEnum
) => {
  if (rows.has(field.coordinateY)) {
    rows.get(field.coordinateY)?.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    if (screenRowComponent) {
      screenRow.rowType = screenRowComponent;
    } else {
      screenRow.rowType = ScreenRowComponentEnum.LABEL;
    }
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    rows.set(field.coordinateY, screenRow);
  }
};

const composeInputRow = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenModel: ScreenModel
) => {
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
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
};

const composeMessageRows = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto
) => {
  // TODO design message
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
};

const composeSubButton = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenModel: ScreenModel
) => {
  const screenRow = {} as ScreenRowModel;
  screenRow.coordinateY = field.coordinateY;
  screenRow.rowType = ScreenRowComponentEnum.SUB_BUTTON;
  screenRow.rowDetails = [];
  const values = field.value.split(",");
  screenModel.workFlowCollection.subFormAction = values[0];
  screenModel.workFlowCollection.subWorkFlowId = values[1];
  screenModel.workFlowCollection.subWorkNodeId = values[2];
  rows.set(screenModel.pageSize, screenRow);
};

const composeListComponents = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenModel: ScreenModel
) => {
  const values = JSON.parse(field.value) as ListModel;
  let calculateY = field.coordinateY;
  // Compose title
  const title = {} as FieldDto;
  title.value = values.title;
  title.coordinateY = field.coordinateY;
  composeLabelRow(rows, title, ScreenRowComponentEnum.LIST_TITLE_LABEL);
  calculateY = _.isUndefined(title.value) ? calculateY : calculateY + 1;
  // Compose items
  screenModel.singleListCollection.set(field.attributeId, values);
  values.list.forEach((t: any, index: number) => {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.LIST_ITEM_LABEL;
    calculateY = index == 0 ? calculateY : calculateY + 1;
    screenRow.coordinateY = calculateY;
    screenRow.rowDetails = [];
    const item = {} as FieldDto;
    item.value = t.sequence + "." + t.name;
    item.sequence = t.sequence;
    screenRow.rowDetails.push(item);
    rows.set(screenRow.coordinateY, screenRow);
  });
  if (_.isUndefined(field.style)) {
    field.style = "1";
  }
  // Compose page description
  if (field.style != "3") {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.LIST_PAGE_LABEL;
    calculateY = calculateY + 1;
    screenRow.coordinateY = calculateY;
    screenRow.rowDetails = [];
    const page = {} as FieldDto;
    page.attributeId = field.attributeId;
    page.style = field.style;
    screenRow.rowDetails.push(page);
    rows.set(screenRow.coordinateY, screenRow);
  }
  // Compose input
  const screenRow = {} as ScreenRowModel;
  screenRow.rowType = ScreenRowComponentEnum.LIST_INPUT;
  screenRow.coordinateY = calculateY + 1;
  screenRow.rowDetails = [];
  const inputLabel = {} as FieldDto;
  inputLabel.attributeType = AttributeType.LABEL;
  inputLabel.value = "OPTION:";
  inputLabel.coordinateX = 1;
  screenRow.rowDetails.push(inputLabel);
  const inputValue = {} as FieldDto;
  inputValue.attributeType = AttributeType.INPUT;
  inputValue.attributeName = field.attributeName;
  inputValue.maxLength = 3;
  inputValue.coordinateX = 9;
  screenRow.rowDetails.push(inputValue);
  rows.set(screenRow.coordinateY, screenRow);
  if (_.isUndefined(screenModel.focus)) {
    screenModel.focus = inputValue.attributeName;
  }
  const capturedValue = {
    attributeName: inputValue.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

const composeMultiInputRow = (
  rows: Map<number, ScreenRowModel>,
  field: FieldDto,
  screenModel: ScreenModel
) => {
  if (rows.has(field.coordinateY)) {
    const row = rows.get(field.coordinateY) as ScreenRowModel;
    row.rowType = ScreenRowComponentEnum.MULTI_INPUT;
    row.rowDetails.push(field);
    row.rowspan = 2;
  } else {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.MULTI_INPUT;
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    screenRow.rowspan = 2;
    rows.set(field.coordinateY, screenRow);
  }
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

function composeEmptyRows(rows: Map<number, ScreenRowModel>) {
  const perPageMaxLine = 15;
  for (let i = 1; i <= perPageMaxLine; i++) {
    if (!rows.has(i)) {
      for (let j = i - 1; j >= 0; j--) {
        const rowDetails = rows.get(j)?.rowDetails;
        if (rowDetails && rowDetails?.length > 0) {
          const rowspan = _.isUndefined(rows.get(j)?.rowspan)
            ? 0
            : (rows.get(j)?.rowspan as number);
          if (j + rowspan <= i) {
            const screenRow = {} as ScreenRowModel;
            screenRow.rowType = ScreenRowComponentEnum.LABEL;
            screenRow.coordinateY = i;
            screenRow.rowDetails = [];
            rows.set(i, screenRow);
          }
          break;
        }
      }
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
