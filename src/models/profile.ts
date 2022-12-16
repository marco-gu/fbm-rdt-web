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
  attributes: DisplayAttribute[];
}

export interface DisplayAttribute {
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
  level: string;
}

export interface LpSearch {
  profileName: string;
  type: string;
  mode: string;
  so: string;
  po: string;
}

export interface ProfileDetail {
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

export interface CartonRendering {
  cartonID: string;
  profileDetailList: ProfileDetail[];
}

export class ProfileOrderLevel {
  TotalCBM: string;
  TotalWeight: string;
  constructor() {
    this.TotalCBM = "";
    this.TotalWeight = "";
  }
}

export class ProfileCartonCommonLevel {
  SO: string;
  PO: string;
  SKU: string;
  ContainerNumber: string;
  constructor() {
    this.SO = "";
    this.PO = "";
    this.SKU = "";
    this.ContainerNumber = "";
  }
}

export class ProfileCartonIndividualLevel {
  Style: string;
  HUB: string;
  Quantity: string;
  constructor() {
    this.Style = "";
    this.HUB = "";
    this.Quantity = "";
  }
}

export class ProfileMixCartonLevel {
  UPC: string;
  Style: string;
  SKU: string;
  Color: string;
  Size: string;
  Quantity: string;

  constructor() {
    this.UPC = "";
    this.Style = "";
    this.SKU = "";
    this.Color = "";
    this.Size = "";
    this.Quantity = "";
  }
}

export type LP = {
  taskId: string;
  profileName: string;
  so: string;
  po: string;
  scanType: number;
  validationType: number;
  uploadStatus: number;
  createUser: string;
  createDatetime: string;
  updateUser: string;
  updateDatetime: string;
  totalCBM: string;
  totalWeight: string;
};

export type Carton = {
  id: number;
  taskId: string;
  so: string;
  po: string;
  sku: string;
  containerNumber: string;
  style: string;
  quantity: string;
  hub: string;
  lpId: string;
  cartonId: string;
  scanStatus: string;
  createUser: string;
  createDatetime: string;
  updateUser: string;
  updateDatetime: string;
};

export interface ScanDataManagement {
  taskId: string;
  status: string;
  updateDatetime: string;
  scannedCartonNumber: number;
  allCartonNumber: number;
}

export interface MixCartonProduct {
  lpId: string;
  upc: string;
  color: string;
  size: string;
  quantity: string;
}
