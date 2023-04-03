import { CommonState } from "./module/common.module";
import { LanguageState } from "./module/language.module";
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
}
