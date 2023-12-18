export interface EngineResponse {
  sessionId: string;
  resultStatus: string;
  screenDto: ScreenDto;
  userSettingDto: UserSettingDto;
  legacyOutPutXML: string;
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

export interface UserSettingDto {
  soundLevel: number;
  vibrationLevel: number;
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
  LIST_SINGLE = "listSingle",
  LABEL = "label",
  INPUT = "inputBox",
  PASSWORD = "password",
  MESSAGE = "message",
  INPUT_MULTI = "inputBoxMultiLine",
}

export enum ListAttributeType {
  LIST_SINGLE_TITLE = "listSingleTitle",
  LIST_SINGLE_ITEM_FIRST = "listSingleItemFirst",
  LIST_SINGLE_ITEM_LAST = "listSingleItemLast",
  LIST_SINGLE_LIST = "listSingleList",
  LIST_SINGLE_LABEL = "listSingleLabel",
  LIST_SINGLE_INPUT = "listSingleInput",
  LIST_SINGLE_PAGE = "listSinglePage",
}
