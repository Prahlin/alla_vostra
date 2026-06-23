import { Platform, StyleSheet } from "react-native";

import { bodyFont, tightText } from "./typography";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "web" ? 534 : 354,
    paddingBottom: 82,
  },

  main: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  pageTitle: {
    ...tightText,
    height: 46,
    fontFamily: bodyFont,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "400",
    color: "#333333",
    textAlign: "center",
    marginBottom: 168,
  },

  aboutLayout: {
    width: "100%",
    alignItems: "center",
  },

  imageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },

  aboutImage: {
    width: "100%",
    height: 286,
    borderRadius: 0,
  },

  copy: {
    width: "100%",
  },

  paragraph: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 46.5,
    color: "#111111",
    textAlign: "justify",
    marginBottom: 28,
  },

  signature: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: 21,
    lineHeight: 31,
    color: "#111111",
    textAlign: "left",
    marginTop: 2,
  },
});
