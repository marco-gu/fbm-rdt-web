import { CapturedValue } from "@/entity/request.entity";
import {
  AttributeType,
  EngineResponse,
  FieldDto,
} from "@/entity/response.entity";
import {
  FocusItem,
  ListModel,
  ScreenModel,
  ScreenRowComponentEnum,
  ScreenRowModel,
} from "@/entity/screen.entity";
import _ from "lodash";
export function composeScreen(param: EngineResponse, screenModel: ScreenModel) {
  screenModel.screenRows = new Map<number, ScreenRowModel>();
  screenModel.focusCollection = new Map<number, FocusItem>();
  screenModel.currentPage = 1;
  screenModel.totalPage = 1;
  screenModel.additionalY = 0;
  const screen = JSON.parse(localStorage.getItem("screen") as any);
  screenModel.pageSize = param.screenDepth == 0 ? screen.rows : screen.subRows;
  screenModel.screenRows = composeRowsData(param, screenModel);
  console.log(screenModel.screenRows);
  screenModel.title = param.screenDto.title;
  screenModel.workFlowCollection.workFlowId = param.workFlowId;
  screenModel.workFlowCollection.workNodeId = param.workNodeId;
  return screenModel;
}

const composeRowsData = (param: EngineResponse, screenModel: ScreenModel) => {
  const fields = param.screenDto.fields;
  fields.forEach((field: FieldDto) => {
    if (field.attributeType == AttributeType.MESSAGE) {
      screenModel.showMessage = param.resultStatus == "error" ? true : false;
      screenModel.msgField = field;
    } else {
      if (_.isNull(param.legacyOutPutXML)) {
        if (!_.isNull(field.coordinateY)) {
          // calculate total page
          screenModel.totalPage =
            Math.floor(field.coordinateY / screenModel.pageSize) + 1;
          // calculate next coordinateY
          if (screenModel.header) {
            field.coordinateY += screenModel.totalPage;
          }
          field.coordinateY += screenModel.additionalY;
          if (field.coordinateY % screenModel.pageSize == 0) {
            screenModel.additionalY++;
            field.coordinateY++;
          }
          // TODO span row logic
          if (screenModel.screenRows.size > 0) {
            const preRow = screenModel.screenRows.get(
              screenModel.screenRows.size - 1
            );
            if (!_.isUndefined(preRow)) {
              field.coordinateY += preRow.rowspan - 1;
            }
          }
        }
      } else {
        screenModel.focus = param.screenDto.focus;
      }
      switch (field.attributeType) {
        case AttributeType.HEADER:
          screenModel.header = true;
          screenModel.headerField = field;
          break;
        case AttributeType.LABEL:
          composeLabelRow(screenModel, field);
          break;
        case AttributeType.INPUT:
        case AttributeType.PASSWORD:
          composeInputRow(screenModel, field);
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
          screenModel.footer = true;
          screenModel.footerField = field;
          break;
      }
    }
  });
  setScreenFocus(param, screenModel);
  adjustRows(screenModel);
  return sortRows(screenModel);
};

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
    if (_.isNull(field.showLines) || _.isUndefined(field.showLines)) {
      screenRow.rowspan = 1;
    } else {
      screenRow.rowspan = field.showLines;
    }
    screenModel.screenRows.set(field.coordinateY, screenRow);
  }
};

const composeInputRow = (screenModel: ScreenModel, field: FieldDto) => {
  collectInputAttribute(screenModel, field);
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
    if (_.isNull(field.showLines) || _.isUndefined(field.showLines)) {
      row.rowspan = 1;
    } else {
      row.rowspan = field.showLines;
    }
    row.rowDetails.push(field);
  } else {
    const screenRow = {} as ScreenRowModel;
    screenRow.rowType = ScreenRowComponentEnum.INPUT;
    screenRow.coordinateY = field.coordinateY;
    screenRow.rowDetails = [];
    if (_.isNull(field.showLines) || _.isUndefined(field.showLines)) {
      screenRow.rowspan = 1;
    } else {
      screenRow.rowspan = field.showLines;
    }
    screenRow.rowDetails.push(field);
    screenModel.screenRows.set(field.coordinateY, screenRow);
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
  field.style = _.isNull(field.style) ? "1" : field.style;
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
  inputLabel.value = "CHOICE:";
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
  collectInputAttribute(screenModel, inputValue);
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
    screenRow.rowspan = field.showLines;
    screenModel.screenRows.set(field.coordinateY, screenRow);
  }
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

const adjustRows = (screenModel: ScreenModel) => {
  const end = screenModel.totalPage * screenModel.pageSize;
  for (let i = 1; i <= end; i++) {
    if (screenModel.header) {
      if (i == 1 || (i - 1) % screenModel.pageSize == 0) {
        screenModel.headerField.coordinateY = i;
        composeLabelRow(screenModel, screenModel.headerField);
      }
    }
    if (screenModel.footer && i % screenModel.pageSize == 0) {
      screenModel.footerField.coordinateY = i;
      composeLabelRow(screenModel, screenModel.footerField);
    }
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
};

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

const collectInputAttribute = (screenModel: ScreenModel, field: FieldDto) => {
  const focusItem = {} as FocusItem;
  focusItem.pageNumer = screenModel.totalPage;
  focusItem.sequence = field.sequence;
  focusItem.attributeName = field.attributeName;
  screenModel.focusCollection.set(focusItem.sequence, focusItem);
  const capturedValue = {
    attributeName: field.attributeName,
    value: field.value,
  } as CapturedValue;
  screenModel.capturedValues.push(capturedValue);
};

const setScreenFocus = (param: EngineResponse, screenModel: ScreenModel) => {
  if (screenModel.focusCollection.size > 0) {
    const array = Array.from(screenModel.focusCollection).sort(
      (a: any, b: any) => {
        return a[0] - b[0];
      }
    );
    screenModel.sortFocus = array;
  }
  if (_.isNull(param.screenDto.focus)) {
    screenModel.focus = screenModel.sortFocus[0][1].attributeName;
  }
};
