import { CapturedValue } from "./request.entity";
import { FieldDto } from "./response.entity";

export interface ScreenModel {
  title: string;
  header: boolean;
  footer: boolean;
  footerDto: FieldDto;
  focus: string;
  screenRows: Map<number, ScreenRowModel>;
  capturedValues: CapturedValue[];
  currentPage: number;
  pageSize: number;
  totalPage: number;
  workFlowCollection: WorkFlowCollection;
  singleListCollection: Map<string, ListModel>;
  selectedItem: SelectedItem;
  showSubBtn: boolean;
  showMessage: boolean;
  msgField: FieldDto;
}

export interface WorkFlowCollection {
  preWorkFlowId: string;
  preWorkNodeId: string;
  workFlowId: string;
  workNodeId: string;
  subWorkFlowId: string;
  subWorkNodeId: string;
  subFormAction: string;
  triggerByWorkFlowId: string;
  triggerByWorkNodeId: string;
}

export interface ScreenRowModel {
  coordinateY: number;
  rowspan: number;
  rowHeight: string;
  rowType: ScreenRowComponentEnum;
  rowDetails: FieldDto[];
}

export interface LabelViewModel {
  attributeName?: string;
  coordinateY: number;
  coordinateX: number;
  value: string;
}

// export class LineDetail {
//   attributeName: string;
//   attributeType: string;
//   name?: string;
//   value?: string;
//   coordinateX: number | undefined | null;
//   coordinateY: number | undefined | null;
//   maxLength: number;
//   minLength: number;
//   attributeId;
//   color: string;
//   dataType: string;
//   regexPattern: string;
//   defaultValue: string;
//   groupName: string;
//   highlighted?: boolean;
//   isHidden?: boolean;
//   overwritten?: boolean;
//   required?: boolean;
//   sequence: number;

//   constructor() {
//     this.attributeName = "";
//     this.name = "";
//     this.value = "";
//     this.attributeType = "";
//     this.maxLength = 0;
//     this.minLength = 0;
//     this.attributeId = "";
//     this.color = "";
//     this.dataType = "";
//     this.regexPattern = "";
//     this.defaultValue = "";
//     this.groupName = "";
//     this.sequence = 0;
//   }
// }
export enum ScreenRowComponentEnum {
  INPUT = "input",
  PASSWORD = "password",
  LABEL = "label",
  LIST_TITLE_LABEL = "list_title_label",
  LIST_ITEM_LABEL = "list_item_label",
  LIST_PAGE_LABEL = "list_page_label",
  LIST_INPUT = "list_input",
  MENU = "menu",
  MESSAGEBOX = "messageBox",
  SUB_BUTTON = "subButton",
  MULTI_INPUT = "multi_input",
}
export interface ListModel {
  title: string;
  total: number;
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

export interface SelectedItem {
  attributeId: string;
  sequence: number;
}
