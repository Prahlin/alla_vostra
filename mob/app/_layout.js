import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Dream Avenue": require("../assets/fonts/dream_avenue/dream_avenue.ttf"),
    "TT Fors": require("../assets/fonts/tt_fors/tt_fors_trial_regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#FFFCF2",
        },
      }}
    />
  );
}