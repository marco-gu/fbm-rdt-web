import { CapturedValue } from "./request.entity";

export class ScreenEntity {
  screenTitle: string;
  sessionID: number;
  screenLines: any[][];
  capturedValues: CapturedValue[];
  constructor() {
    this.screenTitle = "";
    this.sessionID = -1;
    this.screenLines = [[]];
    this.capturedValues = [];
  }
}
export class ScreenLineEntity {
  type: string;
  isLastLine: boolean;
  detail: ScreenLineDetailEntity;
  constructor() {
    this.type = "";
    this.isLastLine = false;
    this.detail = new ScreenLineDetailEntity();
  }
}

export class ScreenLineDetailEntity {
  attributeName: string;
  label: string;
  labelX: number;
  value: string;
  valueX: number;
  color: string;
  maxLength: string | number;
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
