import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { Animated, Platform, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
import MainScreenPushFrame from "../components/MainScreenPushFrame";
import ScreenFade from "../components/ScreenFade";
import { BackgroundHeroStateProvider } from "../utils/backgroundHeroStateContext";
import { HeaderScrollProvider } from "../utils/headerScrollContext";
import { HeaderSwipeProvider } from "../utils/headerSwipeContext";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background:
      Platform.OS === "web" ? "transparent" : DefaultTheme.colors.background,
    card: Platform.OS === "web" ? "transparent" : DefaultTheme.colors.card,
  },
};

export default function RootLayout() {
  const pathname = usePathname();
  const headerScrollY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    "Dream Avenue": require("../assets/fonts/dream_avenue/dream_avenue.ttf"),
    "TT Fors": require("../assets/fonts/tt_fors/tt_fors_trial_regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const showPersistentHeader = pathname !== "/shop";

  const useOverlayHeader =
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/aboutus" ||
    pathname === "/contact";

  return (
    <ThemeProvider value={navigationTheme}>
      <HeaderScrollProvider scrollY={headerScrollY}>
        <BackgroundHeroStateProvider sourceScrollY={headerScrollY}>
          <HeaderSwipeProvider>
            <View style={{ flex: 1, backgroundColor: "#FFFCF2" }}>
              {showPersistentHeader && useOverlayHeader ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 0,
                    elevation: 0,
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

              <ScreenFade />

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
            </View>
          </HeaderSwipeProvider>
        </BackgroundHeroStateProvider>
      </HeaderScrollProvider>
    </ThemeProvider>
  );
}
