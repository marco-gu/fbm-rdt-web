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
  detail: InputLineEntity | LabelLineEntity | MenuLineEntity;
}

export interface InputLineEntity {
  attributeName: string;
  name?: string;
  value: string;
  coordinateNameX: number;
  coordinateValueX: number;
  nameColor: string;
  valueColor?: string;
  maxLength: string | number;
}

export interface LabelLineEntity {
  name: string | [];
  coordinateNameX: number | [number];
  nameColor: string | [string];
}

export interface MenuLineEntity {
  name: string;
  coordinateNameX: number;
  nameColor: string;
}

export enum ScreenLineTypeEnum {
  Input,
  Label,
  Menu,
}
