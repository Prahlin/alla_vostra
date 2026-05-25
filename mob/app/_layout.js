import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { Animated, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
import { HeaderScrollProvider } from "../utils/headerScrollContext";

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

  return (
    <HeaderScrollProvider scrollY={headerScrollY}>
      <View style={{ flex: 1, backgroundColor: "#FFFCF2" }}>
        {showPersistentHeader ? <AppHeader scrollY={headerScrollY} /> : null}

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#FFFCF2",
            },
          }}
        />
      </View>
    </HeaderScrollProvider>
  );
}