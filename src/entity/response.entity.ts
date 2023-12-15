import { ListMasterModel } from "./screen.entity";

export interface EngineResponse {
  sessionId: string;
  resultStatus: string;
  screenDto: ScreenDto;
}

export interface ScreenDto {
  title: string;
  functionKey: string;
  functionKeyNameList: string[];
  rowSize: number;
  columnSize: number;
  style: string;
  colorSchema: string;
  fields: FieldDto[];
}

export interface FieldDto {
  attributeId: string;
  sequence: number;
  attributeName: string;
  attributeType: string;
  dataType: string;
  value: string;
  coordinateX: number;
  coordinateY: number;
  color: string;
  regexPattern: string;
  isHidden: boolean;
  isOverwritten: boolean;
  isHighlighed: boolean;
  isRequired: boolean;
}

export enum AttributeType {
  OUTPUT = "output",
  INPUT = "input",
  PASSWORD = "password",
  DATE_TIME = "data_time",
  LIST_SINGLE = "list_single",
  LIST_MULTI = "list_muilt",
  SUB_BTN = "sub_btn",
  BUTTON = "button",
  MENU = "menu",
}
