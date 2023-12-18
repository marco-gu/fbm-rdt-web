import { UserSettingDto } from "./response.entity";

export interface CapturedValue {
  attributeName: string;
  dataType: string;
  value: string;
}

export interface EngineRequset {
  sessionId: string;
  actionKey: string;
  countryAbbreviatedName: string;
  capturedValues: CapturedValue[];
  userSettingDto: UserSettingDto;
}
