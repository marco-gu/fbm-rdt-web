import { CapturedValue } from "./request.entity";
import { FieldDto } from "./response.entity";

export interface ScreenModel {
  title: string;
  subTitle: string;
  focus: string;
  mainRows: Map<number, ScreenRowModel>;
  subFormRows: Map<number, ScreenRowModel>;
  screenLines: any[][];
  capturedValues: CapturedValue[];
  // constructor() {
  //   this.title = "";
  //   this.focus = "";
  //   this.mainRows = new Map();
  //   this.subFormRows = new Map();
  //   // this.sessionID = -1;
  //   this.screenLines = [[]];
  //   this.capturedValues = [];
  // }
}

export interface ScreenRowModel {
  type: ScreenRowComponentEnum;
  coordinateY: number;
  labelDetails: FieldDto[];
  inputDetails: FieldDto[];
  messageDetail: FieldDto;
  singleListInputDetails: FieldDto[];
}

export interface LabelViewModel {
  attributeName?: string;
  coordinateY: number;
  coordinateX: number;
  value: string;
}

// export interface ScreenRowDetailModel {
//   attributeId: string;
//   sequence: number;
//   attributeName: string;
//   attributeType: string;
//   dataType: string;
//   value: string | ListSingle;
//   coordinateX: number;
//   coordinateY: number;
//   color: string;
//   regexPattern: string;
//   isHidden: boolean;
//   isOverwritten: boolean;
//   isHighlighed: boolean;
//   isRequired: boolean;
// }
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
  name?: string;
  value?: string;
  coordinateNameX: number | undefined | null;
  coordinateValueX: number | undefined | null;
  maxLength: string | number;
  constructor() {
    this.attributeName = "";
    this.name = "";
    this.value = "";
    this.coordinateNameX = null;
    this.coordinateValueX = null;
    this.maxLength = "";
  }
}
export enum ScreenRowComponentEnum {
  INPUT = "input",
  SINGLELISTINPUT = "singlelistinput",
  PASSWORD = "password",
  LABEL = "label",
  MENU = "menu",
  MESSAGEBOX = "messageBox",
}

export interface ListViewModel {
  // title: string;
  // titleX: number;
  // titleY: number;
  firstRow: number;
  lastRow: number;
  // label: string;
  // labelX: number;
  // labelY: number;
  // inputX: number;
  // inputY: number;
  // page: string;
  // pageX: number;
  // pageY: number;
  // list: ListMasterModel;
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
