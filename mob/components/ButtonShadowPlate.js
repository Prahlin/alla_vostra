import { View } from "react-native";

import { tappableButtonShadowPlate } from "../styles/borderEffects";

export default function ButtonShadowPlate({ style }) {
  return (
    <View
      pointerEvents="none"
      style={[tappableButtonShadowPlate, style]}
    />
  );
}
