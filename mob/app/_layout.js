import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
  Animated,
  AppState,
  Platform,
  StatusBar,
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
import QuestionOverlay from "../components/QuestionOverlay";
import ScreenFade from "../components/ScreenFade";
import StickyCartButton from "../components/StickyCartButton";
import StickyQuestionButton from "../components/StickyQuestionButton";
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
  stripeUrlScheme,
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
const androidStatusBarDimmedColor = "#7c5d34";
const androidNavigationBarHairlineColor = "rgba(17, 17, 17, 0.28)";
const androidNavigationBarHairlineWidth = 0.375;
const androidNavigationBarButtonStyle = "light";
const androidStatusBarStyle = "light-content";

function disableAutomaticFontScaling(Component) {
  Component.defaultProps = Component.defaultProps || {};
  Component.defaultProps.allowFontScaling = false;
  Component.defaultProps.maxFontSizeMultiplier = 1;
}

disableAutomaticFontScaling(Text);
disableAutomaticFontScaling(TextInput);

async function applyAndroidNavigationBarTheme({ dimStatusBar = false } = {}) {
  if (Platform.OS !== "android") return;

  try {
    StatusBar.setHidden(false);
    StatusBar.setTranslucent(false);
    StatusBar.setBackgroundColor(
      dimStatusBar ? androidStatusBarDimmedColor : androidNavigationBarColor,
      true,
    );
    StatusBar.setBarStyle(androidStatusBarStyle, true);
  } catch {}

  try {
    await NavigationBar.setVisibilityAsync("visible");
  } catch {}

  try {
    await NavigationBar.setButtonStyleAsync(androidNavigationBarButtonStyle);
  } catch {}
}

function AndroidNavigationBarTint({ dimStatusBar = false, pathname }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    const applyTheme = () => applyAndroidNavigationBarTheme({ dimStatusBar });

    applyTheme();
    const restoreTimer = setTimeout(applyTheme, 250);
    const finalRestoreTimer = setTimeout(applyTheme, 1000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        applyTheme();
      }
    });
    let visibilitySubscription;

    try {
      visibilitySubscription = NavigationBar.addVisibilityListener(
        applyTheme,
      );
    } catch {}

    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(finalRestoreTimer);
      appStateSubscription.remove();
      visibilitySubscription?.remove();
    };
  }, [dimStatusBar, pathname]);

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

function AndroidStatusBarTint({ dimmed = false }) {
  const height =
    Platform.OS === "android" && Number.isFinite(StatusBar.currentHeight)
      ? Math.max(0, StatusBar.currentHeight)
      : 0;

  if (height <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height,
        backgroundColor: androidNavigationBarColor,
        zIndex: 1000002,
        elevation: 1000002,
      }}
    >
      {dimmed ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      ) : null}
    </View>
  );
}

function RootLayoutContent({ headerScrollY }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const backgroundHeroState = useBackgroundHeroState();
  const {
    cartOverlayActionRequest,
    isQuestionOverlayVisible,
    isShopOverlayVisible,
  } = useShopCart();
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
    !(pathname === "/shop" && isShopOverlayVisible) &&
    !isQuestionOverlayVisible;
  const shouldShowCartOpeningDim =
    cartOverlayActionRequest.pending && pathname !== "/shop";
  const shouldDimAndroidStatusBar =
    Platform.OS === "android" &&
    ((pathname === "/shop" && isShopOverlayVisible) ||
      isQuestionOverlayVisible);

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
          <AppHeader
            dimHeaderExceptShopButton={isQuestionOverlayVisible}
            scrollY={headerScrollY}
            showHero={false}
          />
        </View>
      ) : null}

      {showPersistentHeader && !useOverlayHeader ? (
        <AppHeader
          dimHeaderExceptShopButton={isQuestionOverlayVisible}
          scrollY={headerScrollY}
        />
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

      <QuestionOverlay headerScrollY={headerScrollY} />
      <StickyQuestionButton />
      <StickyCartButton />

      <AndroidStatusBarTint
        dimmed={shouldDimAndroidStatusBar}
      />
      <AndroidNavigationBarTint
        dimStatusBar={shouldDimAndroidStatusBar}
        pathname={pathname}
      />
    </View>
  );
}

export default function RootLayout() {
  const headerScrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    "Dream Avenue": require("../assets/fonts/dream_avenue/dream_avenue.ttf"),
    "Great Vibes": require("../assets/fonts/great_vibes/GreatVibes-Regular.ttf"),
    "TT Fors": require("../assets/fonts/tt_fors/tt_fors_trial_regular.ttf"),
    "TT Fors Demibold": require("../assets/fonts/tt_fors/tt_fors_trial_demibold.ttf"),
    "TT Fors Black": require("../assets/fonts/tt_fors/tt_fors_trial_black.ttf"),
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
        urlScheme={stripeUrlScheme}
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
