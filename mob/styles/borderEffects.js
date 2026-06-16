import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const thickBlackBorder = {
  borderWidth: 2,
  borderColor: "#111111",
};

export const heavyBlackBorder = {
  borderWidth: 3,
  borderColor: "#111111",
};

export const thickBlackBorderShadow = {
  boxShadow: isWeb ? "1px 3px 5px rgba(17, 17, 17, 0.18)" : undefined,
  shadowColor: "#111111",
  shadowOpacity: isWeb ? 0 : 0.18,
  shadowRadius: isWeb ? 0 : 3,
  shadowOffset: { width: isWeb ? 0 : 1, height: isWeb ? 0 : 2 },
  elevation: Platform.OS === "android" ? 3 : 0,
};

export const thickBlackBorderWithShadow = {
  ...thickBlackBorder,
  ...thickBlackBorderShadow,
};

export const heavyBlackBorderWithShadow = {
  ...heavyBlackBorder,
  ...thickBlackBorderShadow,
};

export const tappableButtonShadowPlate = {
  position: "absolute",
  backgroundColor: "rgba(17, 17, 17, 0.09)",
  transform: [{ translateX: 2 }, { translateY: 3 }],
};
