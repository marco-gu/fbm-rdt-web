import { CargoImageState } from "./module/cargoImage.module";
import { CommonState } from "./module/common.module";
import { DataMgmtState } from "./module/dataMgmt.module";
import { DeviceProfileState } from "./module/device.profile.module";
import { LanguageState } from "./module/language.module";
import { LpState } from "./module/lp.module";
import { ProfileState } from "./module/profile.module";
import { ScreenState } from "./module/screen.module";

export default interface RootState {
  // root state
}

export interface State extends RootState {
  profileModule: ProfileState;
  languageModule: LanguageState;
  screenModule: ScreenState;
  commonModule: CommonState;
  dataMgmtModule: DataMgmtState;
  cargoImageModule: CargoImageState;
  lpModule: LpState;
  deviceProfileModule: DeviceProfileState;
}
