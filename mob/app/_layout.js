import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
  Animated,
  AppState,
  Easing,
  Image,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";

import AppHeader from "../components/AppHeader";
import MainScreenPushFrame from "../components/MainScreenPushFrame";
import QuestionOverlay from "../components/QuestionOverlay";
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
const androidNavigationBarHairlineColor = "rgba(17, 17, 17, 0.28)";
const androidNavigationBarHairlineWidth = 0.375;
const androidNavigationBarButtonStyle = "light";
const androidStatusBarStyle = "light-content";
const startupSplashBackgroundImage = require("../assets/store/playstore-orange-gradient.png");
const startupSplashIconImage = require("../assets/store/app-icon.png");
const startupSplashMinimumDuration = 3000;
const startupSplashFadeDuration = 520;
const startupSplashIconMinSize = 132;
const startupSplashIconMaxSize = 184;
const startupSplashIconInitialScale = 0.9;
const startupSplashIconPeakScale = 1.12;
const startupSplashIconEnlargeDuration = 240;
const startupSplashIconSpinDuration = 1813;
const startupSplashIconOuterRadiusRatio = 112 / 512;
const startupSplashIconInnerInsetRatio = 44 / 512;
const startupSplashIconInnerSizeRatio = 424 / 512;
const startupSplashIconInnerRadiusRatio = 92 / 424;
const startupSplashIconBorderMaskSizeRatio = 0.92;
const startupSplashIconBorderMaskColor = "#f7b967";
const startupSplashIconBorderMaskCreamColor = "#FFFCF2";
const startupSplashIconMaskMinScale = 0.9;
const startupSplashIconMaskMaxScale = 1.05;
const startupSplashIconMaskPulseDuration = 360;

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
    StatusBar.setHidden(false);
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

    const applyTheme = () => applyAndroidNavigationBarTheme();

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

function StartupOrangeBackground({ style = null }) {
  return (
    <Image
      resizeMode="cover"
      source={startupSplashBackgroundImage}
      style={[
        {
          flex: 1,
          transform: [{ scaleY: -1 }],
        },
        style,
      ]}
    />
  );
}

function StartupSplashArtwork({ style = null }) {
  const { width } = useWindowDimensions();
  const iconScale = useRef(
    new Animated.Value(startupSplashIconInitialScale),
  ).current;
  const iconSpin = useRef(new Animated.Value(0)).current;
  const iconMaskScale = useRef(
    new Animated.Value(startupSplashIconMaskMaxScale),
  ).current;
  const iconSize = Math.min(
    startupSplashIconMaxSize,
    Math.max(startupSplashIconMinSize, width * 0.38),
  );
  const iconOuterRadius = iconSize * startupSplashIconOuterRadiusRatio;
  const iconInnerInset = iconSize * startupSplashIconInnerInsetRatio;
  const iconInnerSize = iconSize * startupSplashIconInnerSizeRatio;
  const iconInnerRadius = iconInnerSize * startupSplashIconInnerRadiusRatio;
  const iconBorderMaskSize = iconSize * startupSplashIconBorderMaskSizeRatio;
  const iconBorderMaskOffset = (iconSize - iconBorderMaskSize) / 2;
  const iconBorderMaskRadius =
    iconBorderMaskSize * startupSplashIconOuterRadiusRatio;
  const iconBorderMaskRotation = iconSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    const scaleAnimation = Animated.sequence([
      Animated.timing(iconScale, {
        toValue: startupSplashIconPeakScale,
        duration: startupSplashIconEnlargeDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]);
    const spinAnimation = Animated.loop(
      Animated.timing(iconSpin, {
        toValue: 1,
        duration: startupSplashIconSpinDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const maskPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconMaskScale, {
          toValue: startupSplashIconMaskMinScale,
          duration: startupSplashIconMaskPulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconMaskScale, {
          toValue: startupSplashIconMaskMaxScale,
          duration: startupSplashIconMaskPulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    scaleAnimation.start();
    spinAnimation.start();
    maskPulseAnimation.start();

    return () => {
      scaleAnimation.stop();
      spinAnimation.stop();
      maskPulseAnimation.stop();
      iconScale.stopAnimation();
      iconSpin.stopAnimation();
      iconMaskScale.stopAnimation();
    };
  }, [iconMaskScale, iconScale, iconSpin]);

  return (
    <View
      pointerEvents="none"
      style={[
        {
          flex: 1,
        },
        style,
      ]}
    >
      <StartupOrangeBackground
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            height: iconSize,
            transform: [{ scale: iconScale }],
            width: iconSize,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: iconBorderMaskOffset,
              left: iconBorderMaskOffset,
              height: iconBorderMaskSize,
              width: iconBorderMaskSize,
              backgroundColor: startupSplashIconBorderMaskCreamColor,
              borderRadius: iconBorderMaskRadius,
              transform: [
                { rotate: iconBorderMaskRotation },
                { scale: iconMaskScale },
              ],
            }}
          />
          <Image
            resizeMode="stretch"
            source={startupSplashIconImage}
            style={{
              height: iconSize,
              width: iconSize,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: iconOuterRadius,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                top: iconBorderMaskOffset,
                left: iconBorderMaskOffset,
                height: iconBorderMaskSize,
                width: iconBorderMaskSize,
                backgroundColor: startupSplashIconBorderMaskColor,
                borderRadius: iconBorderMaskRadius,
                transform: [
                  { rotate: iconBorderMaskRotation },
                  { scale: iconMaskScale },
                ],
              }}
            />
          </View>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: iconInnerInset,
              left: iconInnerInset,
              height: iconInnerSize,
              width: iconInnerSize,
              borderRadius: iconInnerRadius,
              overflow: "hidden",
            }}
          >
            <Image
              resizeMode="stretch"
              source={startupSplashIconImage}
              style={{
                position: "absolute",
                top: -iconInnerInset,
                left: -iconInnerInset,
                height: iconSize,
                width: iconSize,
              }}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function StartupIconSplash({ opacity, visible }) {
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2000000,
        elevation: 2000000,
        opacity,
      }}
    >
      <StartupSplashArtwork
        style={{
          flex: 1,
        }}
      />
    </Animated.View>
  );
}

function StartupTutorialOverlay({
  contentOpacity = 1,
  headerScrollY,
  onClose,
  visible,
}) {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1999990,
        elevation: 1999990,
      }}
    >
      <StartupOrangeBackground
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: contentOpacity,
        }}
      >
        <QuestionOverlay
          headerScrollY={headerScrollY}
          onClose={onClose}
          presentation="splash"
          visible
        />
      </Animated.View>
    </View>
  );
}

function RootLayoutContent({ headerScrollY, isStartupSplashReady }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isStartupTutorialVisible, setIsStartupTutorialVisible] =
    useState(true);
  const [isStartupSplashDismissed, setIsStartupSplashDismissed] =
    useState(false);
  const startupTransitionProgress = useRef(new Animated.Value(0)).current;
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
  const isShopQuestionOverlayVisible =
    pathname === "/shop" && isQuestionOverlayVisible;
  const backgroundHeroLayerDepth = shouldProtectBackgroundHero ? 100 : 0;
  const screenFadeTopOffset = pathname === "/shop"
    ? 120 + topSafeInset
    : 84 + topSafeInset;
  const shouldShowScreenFade =
    !(pathname === "/shop" && isShopOverlayVisible) &&
    !isShopQuestionOverlayVisible;
  const shouldShowCartOpeningDim =
    cartOverlayActionRequest.pending && pathname !== "/shop";
  const shouldDimAndroidStatusBar =
    Platform.OS === "android" &&
    ((pathname === "/shop" && isShopOverlayVisible) ||
      isShopQuestionOverlayVisible);
  const shouldShowStartupTutorial =
    isStartupTutorialVisible && isStartupSplashReady;
  const startupSplashOpacity = startupTransitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const handleStartupTutorialClose = useCallback(() => {
    setIsStartupTutorialVisible(false);
  }, []);

  useEffect(() => {
    if (!isStartupSplashReady || isStartupSplashDismissed) return undefined;

    Animated.timing(startupTransitionProgress, {
      toValue: 1,
      duration: startupSplashFadeDuration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsStartupSplashDismissed(true);
      }
    });

    return () => {
      startupTransitionProgress.stopAnimation();
    };
  }, [
    isStartupSplashDismissed,
    isStartupSplashReady,
    startupTransitionProgress,
  ]);

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
            dimHeaderExceptShopButton={isShopQuestionOverlayVisible}
            scrollY={headerScrollY}
            showHero={false}
          />
        </View>
      ) : null}

      {showPersistentHeader && !useOverlayHeader ? (
        <AppHeader
          dimHeaderExceptShopButton={isShopQuestionOverlayVisible}
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

      <StickyCartButton />

      <AndroidStatusBarTint
        dimmed={shouldDimAndroidStatusBar}
      />
      <AndroidNavigationBarTint
        dimStatusBar={shouldDimAndroidStatusBar}
        pathname={pathname}
      />
      <StartupTutorialOverlay
        contentOpacity={startupTransitionProgress}
        headerScrollY={headerScrollY}
        onClose={handleStartupTutorialClose}
        visible={shouldShowStartupTutorial}
      />
      <StartupIconSplash
        opacity={startupSplashOpacity}
        visible={!isStartupSplashDismissed}
      />
    </View>
  );
}

export default function RootLayout() {
  const headerScrollY = useRef(new Animated.Value(0)).current;
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(false);

  const [fontsLoaded] = useFonts({
    "Dream Avenue": require("../assets/fonts/dream_avenue/dream_avenue.ttf"),
    "Great Vibes": require("../assets/fonts/great_vibes/GreatVibes-Regular.ttf"),
    "TT Fors": require("../assets/fonts/tt_fors/tt_fors_trial_regular.ttf"),
    "TT Fors Demibold": require("../assets/fonts/tt_fors/tt_fors_trial_demibold.ttf"),
    "TT Fors Black": require("../assets/fonts/tt_fors/tt_fors_trial_black.ttf"),
    "TT Fors Light": require("../assets/fonts/tt_fors/tt_fors_trial_light.ttf"),
  });

  useEffect(() => {
    const minimumSplashTimer = setTimeout(() => {
      setMinimumSplashElapsed(true);
    }, startupSplashMinimumDuration);

    return () => {
      clearTimeout(minimumSplashTimer);
    };
  }, []);

  const isStartupSplashReady = fontsLoaded && minimumSplashElapsed;

  if (!fontsLoaded) {
    return <StartupSplashArtwork />;
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
                  <RootLayoutContent
                    headerScrollY={headerScrollY}
                    isStartupSplashReady={isStartupSplashReady}
                  />
                </ShopCartProvider>
              </HeaderSwipeProvider>
            </BackgroundHeroStateProvider>
          </HeaderScrollProvider>
        </ThemeProvider>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
