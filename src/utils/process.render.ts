export interface EngineResponseDto {
  sessionId: number;
  resultStatus: string;
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

export class GroupNode {
  type: string;
  detail: NodeDetail;
  constructor() {
    this.type = "";
    this.detail = new NodeDetail();
  }
}

export class NodeDetail {
  attributeName: string;
  label: string;
  value: string;
  constructor() {
    this.attributeName = "";
    this.label = "";
    this.value = "";
  }
}
