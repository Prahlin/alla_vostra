import { Platform } from "react-native";

export const logoFont = "Dream Avenue";
export const bodyFont = "TT Fors";
export const bodyDemiBoldFont = "TT Fors Demibold";
export const bodyLightFont = "TT Fors Light";

export const tightText = Platform.OS === "web"
  ? {}
  : {
      includeFontPadding: false,
    };

export const centeredTightText = {
  ...tightText,
  textAlign: "center",
};
