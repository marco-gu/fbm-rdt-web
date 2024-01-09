import { UserSettingDto } from "./request.entity";

export interface EngineResponse {
  sessionId: string;
  resultStatus: string;
  screenDepth: number;
  workFlowId: string;
  workNodeId: string;
  screenDto: ScreenDto;
  userSettingDto: UserSettingDto;
  legacyOutPutXML: string;
}

export interface ScreenDto {
  title: string;
  screenDepth: number;
  functionKey: string;
  functionKeyNameList: string[];
  rowSize: number;
  columnSize: number;
  style: string;
  colorSchema: string;
  fields: FieldDto[];
  focus: string;
}

export interface FieldDto {
  attributeId: string;
  sequence: number;
  attributeName: string;
  attributeType: string;
  dataType: string;
  style: string;
  value: string;
  coordinateX: number;
  coordinateY: number;
  color: string;
  regexPattern: string;
  isHidden: boolean;
  isOverwritten: boolean;
  isHighlighed: boolean;
  isRequired: boolean;
  maxLength: number;
  minLength: number;
  defaultValue: string;
  fontSize: number;
  events: ScreenFieldEventDto[];
  showLines: number;
  showLinesMax: number;
}

export interface ScreenFieldEventDto {
  screenFieldId: number;
  eventType: string;
  eventValue: string;
  triggeredBy: string;
}

export enum AttributeType {
  LIST_SINGLE = "listSingle",
  LABEL = "label",
  INPUT = "inputBox",
  PASSWORD = "password",
  MESSAGE = "message",
  INPUT_MULTI = "inputBoxMultiLine",
  SUB_BUTTON = "subButton",
  HEADER = "header",
  FOOTER = "footer",
}

export enum EventType {
  TAB = "tab",
  SUBMIT = "submit",
  SUBFORM = "subform",
  SUBMIT_OR_TAB_NONE_BLANK = "submitOrTabNoneBlank",
  SUBFORM_OR_TAB_NONE_BLANK = "subFormOrTabNoneBlank",
}
