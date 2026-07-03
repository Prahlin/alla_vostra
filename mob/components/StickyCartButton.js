import { Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
import ShoppingCartIcon from "./ShoppingCartIcon";
import stickyCartStyles from "../styles/stickyCartStyles";
import { useShopCart } from "../utils/shopCartContext";

export default function StickyCartButton() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const {
    isOrderConfirmationOverlayVisible,
    overlayConfirmedProductCount,
    requestCartOverlayOpen,
  } = useShopCart();

  const handlePress = () => {
    requestCartOverlayOpen();

    if (pathname !== "/shop") {
      router.push({
        pathname: "/shop",
        params: { openCart: String(Date.now()) },
      });
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        stickyCartStyles.frame,
        {
          bottom: insets.bottom + 18,
        },
      ]}
    >
      <ButtonShadowPlate style={stickyCartStyles.shadowPlate} />
      <Pressable
        accessibilityLabel="Shopping cart"
        accessibilityRole="button"
        hitSlop={8}
        onPress={handlePress}
        style={[
          stickyCartStyles.button,
          isOrderConfirmationOverlayVisible && stickyCartStyles.buttonConfirmed,
        ]}
      >
        {isOrderConfirmationOverlayVisible ? (
          <Svg width={31.9} height={31.9} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12.6L10 17.4L19.3 6.8"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3.35}
            />
          </Svg>
        ) : (
          <ShoppingCartIcon />
        )}
        {!isOrderConfirmationOverlayVisible && overlayConfirmedProductCount > 0 ? (
          <View pointerEvents="none" style={stickyCartStyles.badge}>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={stickyCartStyles.badgeText}
            >
              {overlayConfirmedProductCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
