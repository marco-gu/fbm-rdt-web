import { LanguageState } from "./module/language.module";
import { ProfileState } from "./module/profile.module";

export default interface RootState {
  // root state
}

export interface State extends RootState {
  profileModule: ProfileState;
  languageModule: LanguageState;
}
