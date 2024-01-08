import { CapturedValue } from "./request.entity";
import { FieldDto } from "./response.entity";

export interface ScreenModel {
  title: string;
  header: boolean;
  headerField: FieldDto;
  footer: boolean;
  footerField: FieldDto;
  focus: string;
  screenRows: Map<number, ScreenRowModel>;
  capturedValues: CapturedValue[];
  focusCollection: Map<number, FocusItem>;
  sortFocus: [number, FocusItem][];
  currentPage: number;
  pageSize: number;
  totalPage: number;
  workFlowCollection: WorkFlowCollection;
  singleListCollection: Map<string, ListModel>;
  selectedItem: SelectedItem;
  showSubBtn: boolean;
  showMessage: boolean;
  msgField: FieldDto;
  additionalY: number;
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

export interface FocusItem {
  attributeName: string;
  sequence: number;
  pageNumer: number;
}

export interface MsgInfo {
  color: string;
  message: string;
  y?: number;
}
