
export interface ProfileMaster {
  client: string;
  effectiveDate: string;
}

export interface ProfileDeail {
  id: number;
  profileName: string;
  fileName: string;
  systemFlag: number;
  createUser: string;
  createDatetime: string;
  updateUser: string;
  updateDatetime: string;
  profileContent: string;
  code: number;
  version: any;
  client: string;
  effectiveDate: string;
  translationType: string;
  receivingScanFlag: number;
  putawayScanFlag: number;
  cycleCountFlag: number;
  pickingScanFlag: number;
  stuffingScanFlag: number;
  scanPackFlag: number;
  attributes: Attribute[]
}

export interface Attribute {
  type: string;
  typeDescription: string;
  dataFieldName: string;
  displayDataFieldName: string;
  format: string;
  maxLength: number;
  mandatory: number;
  duplicate: number;
  isKey: number;
  verification: number;
  combo: number;
  scan: string;
  irecType: string;
  uniqueId: string;
}

export interface LpSearch {
  profileName: string;
  type: string;
  mode: string;
  so: string;
  po: string
}