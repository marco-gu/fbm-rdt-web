import { ViewDisplayAttribute } from "./profile.render";

export function resetForm(formData: ViewDisplayAttribute[], formName: any) {
  formData.forEach((t: any) => {
    t.model = "";
  });
  formName.resetValidation();
}
