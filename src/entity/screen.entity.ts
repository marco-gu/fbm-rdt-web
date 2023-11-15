import { CapturedValue } from "./request.entity";

export class ScreenEntity {
  screenTitle: string;
  sessionID: number;
  screenLines: any[][];
  capturedValues: CapturedValue[];
  screenFocusName: string;
  constructor() {
    this.screenTitle = "";
    this.sessionID = -1;
    this.screenLines = [[]];
    this.capturedValues = [];
    this.screenFocusName = "";
  }
}

export interface ScreenLineEntity {
  type: ScreenLineTypeEnum;
  isLastLine: boolean;
  coordinateY: number;
  isFocus: boolean;
  detail: LineDetailEntity;
}

export interface LineDetailEntity {
  attributeName: string;
  name?: string;
  value: string;
  coordinateNameX: number;
  coordinateValueX: number;
  nameColor: string;
  valueColor?: string;
  maxLength: string | number;
}

export enum ScreenLineTypeEnum {
  Input = "input",
  Password = "password",
  Label = "label",
  Menu = "menu",
}
