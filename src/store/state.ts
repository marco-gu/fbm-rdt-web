import { ProfileState } from "./module/profile.module";

export default interface RootState {
  // root state
}

export interface State extends RootState {
  profileModule: ProfileState;
}
