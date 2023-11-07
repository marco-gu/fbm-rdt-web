import { CapturedValue } from "./request.entity";

export class ScreenEntity {
  screenTitle: string;
  sessionID: number;
  screenRows: any[][];
  capturedValues: CapturedValue[];
  constructor() {
    this.screenTitle = "";
    this.sessionID = -1;
    this.screenRows = [[]];
    this.capturedValues = [];
  }
}
export class ScreenRowEntity {
  type: string;
  detail: ScreenRowDetailEntity;
  constructor() {
    this.type = "";
    this.detail = new ScreenRowDetailEntity();
  }
}

export class ScreenRowDetailEntity {
  attributeName: string;
  label: string;
  labelX: number;
  value: string;
  valueX: number;
  color: string;
  maxLength: number;
  constructor() {
    this.attributeName = "";
    this.label = "";
    this.labelX = 0;
    this.value = "";
    this.valueX = 0;
    this.color = "";
    this.maxLength = 0;
  }
}
