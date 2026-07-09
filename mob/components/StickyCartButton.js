import { Keyboard, Platform, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import ButtonShadowPlate from "./ButtonShadowPlate";
import Pressable from "./HapticPressable";
import ShoppingCartIcon from "./ShoppingCartIcon";
import stickyCartStyles from "../styles/stickyCartStyles";
import { useShopCart } from "../utils/shopCartContext";
import { stickyButtonEdgeOffset } from "../utils/stickyButtonLayout";

function StickyCartButtonGradient({ confirmed }) {
  const colors = confirmed
    ? ["#2F9348", "#247C3A", "#1D6630"]
    : ["#FFC878", "#f7b967", "#D9953F"];

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.52, 1]}
      pointerEvents="none"
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={stickyCartStyles.buttonGradient}
    />
  );
}

export default function StickyCartButton() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isAndroidKeyboardVisible, setIsAndroidKeyboardVisible] =
    useState(false);
  const {
    isOrderConfirmationOverlayVisible,
    overlayConfirmedProductCount,
    requestCartOverlayOpen,
  } = useShopCart();
  const shouldHideForShopKeyboard =
    Platform.OS === "android" &&
    pathname === "/shop" &&
    isAndroidKeyboardVisible;

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    const keyboardShowSubscription = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsAndroidKeyboardVisible(true),
    );
    const keyboardHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsAndroidKeyboardVisible(false),
    );

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  const handlePress = () => {
    requestCartOverlayOpen();

    if (pathname !== "/shop") {
      router.push({
        pathname: "/shop",
        params: { openCart: String(Date.now()) },
      });
    }
  };

  if (shouldHideForShopKeyboard) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        stickyCartStyles.frame,
        {
          bottom: insets.bottom + stickyButtonEdgeOffset,
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
        <View pointerEvents="none" style={stickyCartStyles.buttonFillClip}>
          <StickyCartButtonGradient confirmed={isOrderConfirmationOverlayVisible} />
        </View>
        {isOrderConfirmationOverlayVisible ? (
          <View pointerEvents="none" style={stickyCartStyles.buttonForeground}>
            <Svg width={31.9} height={31.9} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12.6L10 17.4L19.3 6.8"
                stroke="#FFFFFF"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3.35}
              />
            </Svg>
          </View>
        ) : (
          <View pointerEvents="none" style={stickyCartStyles.buttonForeground}>
            <ShoppingCartIcon />
          </View>
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
