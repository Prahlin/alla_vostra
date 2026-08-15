import { View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
import stickyQuestionStyles from "../styles/stickyQuestionStyles";
import { useShopCart } from "../utils/shopCartContext";
import { stickyButtonEdgeOffset } from "../utils/stickyButtonLayout";

function QuestionMarkIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Defs>
        <SvgLinearGradient
          id="stickyQuestionMarkGradient"
          x1="20"
          y1="4"
          x2="20"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FFC878" />
          <Stop offset="0.52" stopColor="#f7b967" />
          <Stop offset="1" stopColor="#D9953F" />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        fill="url(#stickyQuestionMarkGradient)"
        fontFamily="TT Fors Black"
        fontSize={38}
        fontWeight="900"
        stroke="#111111"
        strokeWidth={0.38}
        textAnchor="middle"
        x={20}
        y={34}
      >
        {"?"}
      </SvgText>
    </Svg>
  );
}

export default function StickyQuestionButton() {
  const insets = useSafeAreaInsets();
  const {
    cartOverlayActionRequest,
    closeQuestionOverlay,
    isQuestionOverlayVisible,
    isShopOverlayVisible,
    openQuestionOverlay,
  } = useShopCart();
  const shouldHide =
    isShopOverlayVisible ||
    cartOverlayActionRequest.pending;

  if (shouldHide) {
    return null;
  }

  const handlePress = isQuestionOverlayVisible
    ? closeQuestionOverlay
    : openQuestionOverlay;

  return (
    <View
      pointerEvents="box-none"
      style={[
        stickyQuestionStyles.frame,
        {
          bottom: insets.bottom + stickyButtonEdgeOffset,
        },
      ]}
    >
      <ButtonShadowPlate style={stickyQuestionStyles.shadowPlate} />
      <Pressable
        accessibilityLabel="Questions"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handlePress}
        style={stickyQuestionStyles.button}
      >
        <View pointerEvents="none" style={stickyQuestionStyles.buttonFillClip}>
          <View style={stickyQuestionStyles.buttonFill} />
        </View>
        <View pointerEvents="none" style={stickyQuestionStyles.buttonForeground}>
          <QuestionMarkIcon />
        </View>
      </Pressable>
    </View>
  );
}
