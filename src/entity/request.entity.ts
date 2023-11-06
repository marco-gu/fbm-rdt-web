export interface CapturedValue {
  attributeName: string;
  value: string;
}

export interface EngineRequset {
  sessionID: string;
  actionKey: string;
  countryAbbreviatedName: string;
  capturedValues: CapturedValue[];
}