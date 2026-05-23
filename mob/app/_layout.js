import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const style = document.createElement("style");

    style.innerHTML = `
      @font-face {
        font-family: "Dream Avenue";
        src: url("https://db.onlinewebfonts.com/t/5da49843f66caf14799662bd12aa55a2.woff2") format("woff2");
      }

      @font-face {
        font-family: "TT Fors";
        src: url("https://db.onlinewebfonts.com/t/8f46a9d6da371e084db7165e3231be5c.woff2") format("woff2");
      }

      html,
      body,
      #root {
        margin: 0;
        min-height: 100%;
        background: #FFFCF2;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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