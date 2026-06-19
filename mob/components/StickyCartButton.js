import { Pressable, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ButtonShadowPlate from "./ButtonShadowPlate";
import ShoppingCartIcon from "./ShoppingCartIcon";
import stickyCartStyles from "../styles/stickyCartStyles";
import { useShopCart } from "../utils/shopCartContext";

export default function StickyCartButton() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const {
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
        style={stickyCartStyles.button}
      >
        <ShoppingCartIcon />
        {overlayConfirmedProductCount > 0 ? (
          <View pointerEvents="none" style={stickyCartStyles.badge}>
            <Text style={stickyCartStyles.badgeText}>
              {overlayConfirmedProductCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
