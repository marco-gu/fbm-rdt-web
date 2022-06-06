import { string } from "yup";

export interface ProfileMaster {
  client: string;
  updateDate: string;
}

export interface ProfileDeail {
  profileName: string;
  code: string;
  type: string;
  description: string;
  fieldName: string;
  fieldDisplayName: string;
  format: string;
  maxLength: any;
  mandatory: any;
  duplicate: any
  key: any;
  verification: any;
  combo: any
}

export interface LpSearch {
  profileName: string;
  type: string;
  mode: string;
  so: string;
  po: string
}