import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
  Animated,
  AppState,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useEffect, useRef } from "react";

import AppHeader from "../components/AppHeader";
import MainScreenPushFrame from "../components/MainScreenPushFrame";
import ScreenFade from "../components/ScreenFade";
import StickyCartButton from "../components/StickyCartButton";
import {
  BackgroundHeroStateProvider,
  useBackgroundHeroState,
} from "../utils/backgroundHeroStateContext";
import { HeaderScrollProvider } from "../utils/headerScrollContext";
import {
  HeaderSwipeProvider,
  useHeaderSwipe,
} from "../utils/headerSwipeContext";
import { getTopSafeInset } from "../utils/platformLayout";
import { ShopCartProvider, useShopCart } from "../utils/shopCartContext";
import {
  stripeMerchantIdentifier,
  stripePublishableKey,
} from "../utils/stripePayments";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:
      Platform.OS === "web" ? "transparent" : DefaultTheme.colors.background,
    card: Platform.OS === "web" ? "transparent" : DefaultTheme.colors.card,
  },
};
const androidNavigationBarColor = "#f7b967";
const androidNavigationBarHairlineColor = "rgba(17, 17, 17, 0.28)";
const androidNavigationBarHairlineWidth = 0.375;
const androidNavigationBarButtonStyle = "light";

function disableAutomaticFontScaling(Component) {
  Component.defaultProps = Component.defaultProps || {};
  Component.defaultProps.allowFontScaling = false;
  Component.defaultProps.maxFontSizeMultiplier = 1;
}

disableAutomaticFontScaling(Text);
disableAutomaticFontScaling(TextInput);

async function applyAndroidNavigationBarTheme() {
  if (Platform.OS !== "android") return;

  try {
    await NavigationBar.setVisibilityAsync("visible");
  } catch {}

  try {
    await NavigationBar.setButtonStyleAsync(androidNavigationBarButtonStyle);
  } catch {}
}

function AndroidNavigationBarTint({ pathname }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    applyAndroidNavigationBarTheme();
    const restoreTimer = setTimeout(applyAndroidNavigationBarTheme, 250);
    const finalRestoreTimer = setTimeout(applyAndroidNavigationBarTheme, 1000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        applyAndroidNavigationBarTheme();
      }
    });
    let visibilitySubscription;

    try {
      visibilitySubscription = NavigationBar.addVisibilityListener(
        applyAndroidNavigationBarTheme
      );
    } catch {}

    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(finalRestoreTimer);
      appStateSubscription.remove();
      visibilitySubscription?.remove();
    };
  }, [pathname]);

  if (Platform.OS !== "android" || insets.bottom <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: insets.bottom,
        borderTopWidth: androidNavigationBarHairlineWidth,
        borderTopColor: androidNavigationBarHairlineColor,
        backgroundColor: androidNavigationBarColor,
        zIndex: 1000001,
        elevation: 1000001,
      }}
    />
  );
}

function RootLayoutContent({ headerScrollY }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const backgroundHeroState = useBackgroundHeroState();
  const { cartOverlayActionRequest, isShopOverlayVisible } = useShopCart();
  const screenSwipe = useHeaderSwipe();
  const topSafeInset = getTopSafeInset(insets);

  const showPersistentHeader = pathname !== "/shop";

  const useOverlayHeader =
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/aboutus" ||
    pathname === "/contact";

  const shouldProtectBackgroundHero =
    useOverlayHeader &&
    Boolean(screenSwipe?.isActive || backgroundHeroState?.isFrozen);
  const backgroundHeroLayerDepth = shouldProtectBackgroundHero ? 100 : 0;
  const screenFadeTopOffset = pathname === "/shop"
    ? 120 + topSafeInset
    : 84 + topSafeInset;
  const shouldShowScreenFade =
    !(pathname === "/shop" && isShopOverlayVisible);
  const shouldShowCartOpeningDim =
    cartOverlayActionRequest.pending && pathname !== "/shop";

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFCF2" }}>
      {showPersistentHeader && useOverlayHeader ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: backgroundHeroLayerDepth,
            elevation: backgroundHeroLayerDepth,
          }}
        >
          <AppHeader scrollY={headerScrollY} showOnlyHero />
        </View>
      ) : null}

      <MainScreenPushFrame>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: {
              backgroundColor: useOverlayHeader
                ? "transparent"
                : "#FFFCF2",
            },
          }}
        />
      </MainScreenPushFrame>

      {shouldShowScreenFade ? (
        <ScreenFade
          showTopFade={!useOverlayHeader}
          topOffset={screenFadeTopOffset}
        />
      ) : null}

      {showPersistentHeader && useOverlayHeader ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000000,
            elevation: 1000000,
          }}
        >
          <AppHeader scrollY={headerScrollY} showHero={false} />
        </View>
      ) : null}

      {showPersistentHeader && !useOverlayHeader ? (
        <AppHeader scrollY={headerScrollY} />
      ) : null}

      {shouldShowCartOpeningDim ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000001,
            elevation: 1000001,
          }}
        />
      ) : null}

      <StickyCartButton />

      <AndroidNavigationBarTint pathname={pathname} />
    </View>
  );
}

export default function RootLayout() {
  const headerScrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    "Dream Avenue": require("../assets/fonts/dream_avenue/dream_avenue.ttf"),
    "TT Fors": require("../assets/fonts/tt_fors/tt_fors_trial_regular.ttf"),
    "TT Fors Demibold": require("../assets/fonts/tt_fors/tt_fors_trial_demibold.ttf"),
    "TT Fors Light": require("../assets/fonts/tt_fors/tt_fors_trial_light.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StripeProvider
        merchantIdentifier={stripeMerchantIdentifier || undefined}
        publishableKey={stripePublishableKey}
        setReturnUrlSchemeOnAndroid
        urlScheme="allavostra"
      >
        <ThemeProvider value={navigationTheme}>
          <HeaderScrollProvider scrollY={headerScrollY}>
            <BackgroundHeroStateProvider sourceScrollY={headerScrollY}>
              <HeaderSwipeProvider>
                <ShopCartProvider>
                  <RootLayoutContent headerScrollY={headerScrollY} />
                </ShopCartProvider>
              </HeaderSwipeProvider>
            </BackgroundHeroStateProvider>
          </HeaderScrollProvider>
        </ThemeProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
