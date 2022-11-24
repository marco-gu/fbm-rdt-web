
export interface ProfileMaster {
  profileCode: string;
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
  profileCode: string;
  attributes: Attribute[];
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

export interface MixCartonProfile {
  cartonID: string;
  uniqueId: string;
  masterUniqueId: string;
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
}

export interface MixCartonRendering {
  cartonID: string;
  mixCartonProfile: MixCartonProfile[];
}


// Define Type for Profile
export type LpSearchCondition = {
  SO: string;
  PO: string;
  ContainerNumber: string;
  SKU: string;
}

export type ProfileSoLevel = {
  TotalCBM: string;
  TotalWeight: string;
}

export type ProfileCartonLevel = {
  Style: string;
  HUB: string;
  Quantity: string;
}

export type ProfileMixCartonLevel = {
  UPC: string;
  Style: string;
  SKU: string;
  Color: string;
  Size: string;
  Quantity: string
}