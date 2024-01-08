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
  screenModel.currentPage = 1;
  screenModel.totalPage = 1;
  if (param.screenDepth == 0) {
    screenModel.pageSize = JSON.parse(
      localStorage.getItem("screen") as any
    ).rows;
  } else {
    screenModel.pageSize = JSON.parse(
      localStorage.getItem("screen") as any
    ).subRows;
  }
  screenModel.screenRows = new Map<number, ScreenRowModel>();
  screenModel.screenRows = composeRowsData(param, screenModel);
  screenModel.title = param.screenDto.title;
  screenModel.workFlowCollection.workFlowId = param.workFlowId;
  screenModel.workFlowCollection.workNodeId = param.workNodeId;
  return screenModel;
}

function composeRowsData(param: EngineResponse, screenModel: ScreenModel) {
  const fields = param.screenDto.fields;
  fields.forEach((field: FieldDto) => {
    if (
      field.attributeType != AttributeType.MESSAGE ||
      (field.attributeType == AttributeType.MESSAGE &&
        param.resultStatus == "error")
    ) {
      if (screenModel.header) {
        field.coordinateY += 1;
      }
      // check previous row span
      if (screenModel.screenRows.size > 0) {
        const preRow = screenModel.screenRows.get(
          screenModel.screenRows.size - 1
        );
        if (!_.isUndefined(preRow)) {
          field.coordinateY += preRow.rowspan - 1;
        }
      }
      // Calculate total page
      if (!_.isNull(field.coordinateY)) {
        screenModel.totalPage =
          Math.floor(field.coordinateY / screenModel.pageSize) + 1;
      }
      switch (field.attributeType) {
        case AttributeType.HEADER:
          field.coordinateY = 1;
          screenModel.header = true;
          composeLabelRow(screenModel, field);
          break;
        case AttributeType.LABEL:
          composeLabelRow(screenModel, field);
          break;
        case AttributeType.INPUT:
        case AttributeType.PASSWORD:
          composeInputRow(screenModel, field);
          break;
        case AttributeType.MESSAGE:
          composeMessageRows(screenModel, field);
          break;
        case AttributeType.INPUT_MULTI:
          composeMultiInputRow(screenModel, field);
          break;
        case AttributeType.SUB_BUTTON: {
          screenModel.showSubBtn = true;
          const values = field.value.split(",");
          screenModel.workFlowCollection.subFormAction = values[0];
          screenModel.workFlowCollection.subWorkFlowId = values[1];
          screenModel.workFlowCollection.subWorkNodeId = values[2];
          break;
        }
        case AttributeType.LIST_SINGLE:
          composeListComponents(screenModel, field);
          break;
        case AttributeType.FOOTER:
          screenModel.footerDto = field;
          break;
      }
    }
  });
  if (!_.isUndefined(screenModel.footerDto)) {
    screenModel.footerDto.coordinateY =
      screenModel.totalPage * screenModel.pageSize;
    composeLabelRow(screenModel, screenModel.footerDto);
  }
  composeAdjustRows(screenModel);
  return sortRows(screenModel);
}

const composeLabelRow = (
  screenModel: ScreenModel,
  field: FieldDto,
  screenRowComponent?: ScreenRowComponentEnum
) => {
  if (screenModel.screenRows.has(field.coordinateY)) {
    screenModel.screenRows.get(field.coordinateY)?.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    if (screenRowComponent) {
      screenRow.rowType = screenRowComponent;
    } else {
      screenRow.rowType = ScreenRowComponentEnum.LABEL;
    }
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    screenRow.rowspan = 1;
    screenModel.screenRows.set(field.coordinateY, screenRow);
  }
};

const composeInputRow = (screenModel: ScreenModel, field: FieldDto) => {
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
  if (_.isEmpty(screenModel.focus)) {
    screenModel.focus = field.attributeName;
  }
  if (screenModel.screenRows.has(field.coordinateY)) {
    const row = screenModel.screenRows.get(field.coordinateY) as ScreenRowModel;
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
    screenRow.rowspan = 1;
    screenRow.rowDetails.push(field);
    screenModel.screenRows.set(field.coordinateY, screenRow);
  }
};

const composeMessageRows = (screenModel: ScreenModel, field: FieldDto) => {
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
      screenRow.rowspan = 1;
      screenModel.screenRows.set(field.coordinateY + index, screenRow);
    });
  }
};

const composeListComponents = (screenModel: ScreenModel, field: FieldDto) => {
  const values = JSON.parse(field.value) as ListModel;
  let calculateY = field.coordinateY;
  // Compose title
  const title = {} as FieldDto;
  title.value = values.title;
  title.coordinateY = field.coordinateY;
  composeLabelRow(screenModel, title, ScreenRowComponentEnum.LIST_TITLE_LABEL);
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
    screenRow.rowspan = 1;
    screenModel.screenRows.set(screenRow.coordinateY, screenRow);
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
    screenRow.rowspan = 1;
    screenModel.screenRows.set(screenRow.coordinateY, screenRow);
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
  screenRow.rowspan = 1;
  screenRow.rowDetails.push(inputValue);
  screenModel.screenRows.set(screenRow.coordinateY, screenRow);
  if (_.isUndefined(screenModel.focus)) {
    screenModel.focus = inputValue.attributeName;
  }
  const capturedValue = {
    attributeName: inputValue.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

const composeMultiInputRow = (screenModel: ScreenModel, field: FieldDto) => {
  if (screenModel.screenRows.has(field.coordinateY)) {
    const row = screenModel.screenRows.get(field.coordinateY) as ScreenRowModel;
    row.rowType = ScreenRowComponentEnum.MULTI_INPUT;
    row.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.MULTI_INPUT;
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    screenRow.rowDetails.push(field);
    screenRow.rowspan = 2;
    screenModel.screenRows.set(field.coordinateY, screenRow);
  }
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

function composeAdjustRows(screenModel: ScreenModel) {
  for (let i = 1; i <= screenModel.totalPage * screenModel.pageSize; i++) {
    if (!screenModel.screenRows.has(i)) {
      for (let j = i - 1; j >= 0; j--) {
        const rowDetails = screenModel.screenRows.get(j)?.rowDetails;
        if (rowDetails && rowDetails?.length > 0) {
          const rowspan = _.isUndefined(screenModel.screenRows.get(j)?.rowspan)
            ? 0
            : (screenModel.screenRows.get(j)?.rowspan as number);
          if (j + rowspan <= i) {
            const screenRow = {} as ScreenRowModel;
            screenRow.rowType = ScreenRowComponentEnum.LABEL;
            screenRow.coordinateY = i;
            screenRow.rowDetails = [];
            screenRow.rowspan = 1;
            screenModel.screenRows.set(i, screenRow);
          }
          break;
        }
      }
    }
  }
}

function sortRows(screenModel: ScreenModel) {
  const array = Array.from(screenModel.screenRows).sort((a: any, b: any) => {
    return a[0] - b[0];
  });
  const result = new Map<number, ScreenRowModel>();
  array.forEach((t) => {
    result.set(t[0], t[1]);
  });
  return result;
}
