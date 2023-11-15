export interface EngineResponse {
  sessionID: number;
  resultStatus: string;
  screenTitle: string;
  fields: FieldDto[];
  legacyOutPutXML: string;
}

export interface FieldDto {
  sequence: number;
  attributeId: string;
  attributeName: string;
  attributeType: string;
  dataType: string;
  defaultValue: string;
  value: string;
  isRequired: boolean;
  maxLength: number;
  minLength: number;
  regexPattern: string;
  groupName: string;
  match: string;
  coordinateX: number;
  coordinateY: number;
  color: string;
}

export enum ResponseAttributeType {
  INPUT = "input",
  OUTPUT = "output",
  PASSWORD = "password",
  MENU = "menu",
}
