export interface CapturedValue {
  attributeName: string;
  dataType: string;
  value: string;
  screenDepth: number;
}

export interface EngineRequset {
  screenDepth: number;
  sessionId: string;
  actionKey: string;
  countryAbbreviatedName: string;
  subScreenDto: SubScreenDto;
  capturedValues: CapturedValue[];
  userSettingDto: UserSettingDto;
}

export interface SubScreenDto {
  startWorkFlowId: string;
  startWorkNodeId: string;
}

export interface UserSettingDto {
  soundLevel: number;
  vibrationLevel: number;
}
