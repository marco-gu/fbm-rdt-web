export interface DataMgmt {
  client: string;
  profileName: string;
  so: string;
  po: string;
  sku?: string;
  scanType: string;
  updateDatetime: string;
  scannedCartonNumber: number;
  allCartonNumber: number;
  uploadStatus: boolean;
  finishStatus: boolean;
  totalCBM: string;
  totalWeight: string;
  taskID: string;
  containerNumber: string;
  lpID: string;
}