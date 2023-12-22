import { CapturedValue } from "./request.entity";
import { FieldDto } from "./response.entity";

export interface ScreenModel {
  title: string;
  focus: string;
  screenDepth: number;
  screenRows: Map<number, ScreenRowModel>;
  capturedValues: CapturedValue[];
  workFlowId: string;
  workNodeId: string;
  subWorkFlowId: string;
  subWorkNodeId: string;
  subFormAction: string;
  list: ListMasterModel;
}

export interface ScreenRowModel {
  coordinateY: number;
  rowType: ScreenRowComponentEnum;
  rowDetails: FieldDto[];
}

export interface LabelViewModel {
  attributeName?: string;
  coordinateY: number;
  coordinateX: number;
  value: string;
}
export interface ScreenLineEntity {
  type: ScreenRowComponentEnum;
  // isLastLine: boolean;
  coordinateY: number;
  isFocus: boolean;
  color: string;
  details: LineDetailEntity[];
}

export interface LineDetailEntity {
  attributeName: string;
  name?: string;
  value: string;
  coordinateNameX: number;
  coordinateValueX: number;
  maxLength: string | number;
}
export class LineDetail {
  attributeName: string;
  attributeType: string;
  name?: string;
  value?: string;
  coordinateX: number | undefined | null;
  coordinateY: number | undefined | null;
  maxLength: number;
  minLength: number;
  attributeId;
  color: string;
  dataType: string;
  regexPattern: string;
  defaultValue: string;
  groupName: string;
  highlighted?: boolean;
  isHidden?: boolean;
  overwritten?: boolean;
  required?: boolean;
  sequence: number;

  constructor() {
    this.attributeName = "";
    this.name = "";
    this.value = "";
    this.attributeType = "";
    this.maxLength = 0;
    this.minLength = 0;
    this.attributeId = "";
    this.color = "";
    this.dataType = "";
    this.regexPattern = "";
    this.defaultValue = "";
    this.groupName = "";
    this.sequence = 0;
  }
}
export enum ScreenRowComponentEnum {
  INPUT = "input",
  PASSWORD = "password",
  LABEL = "label",
  LIST_TITLE_LABEL = "list_title_label",
  LIST_ITEM_LABEL = "list_item_label",
  LIST_INPUT = "list_input",
  MENU = "menu",
  MESSAGEBOX = "messageBox",
  SUB_BUTTON = "subButton",
  MULTI_INPUT = "multi_input",
}
export interface ListMasterModel {
  total: string;
  pageSize: number;
  currentPage: number;
  list: ListDetailModel[];
}

export interface ListDetailModel {
  id: string;
  name: string;
  sequence: number;
}

export enum ActionKeyEnum {
  SUBMIT = "Submit",
  CANCEL = "Cancel",
}
