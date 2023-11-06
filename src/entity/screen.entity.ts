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
  value: string;
  color: string;
  maxLength: number;
  constructor() {
    this.attributeName = "";
    this.label = "";
    this.value = "";
    this.color = "";
    this.maxLength = 0;
  }
}
