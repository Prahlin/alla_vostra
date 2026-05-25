import { Platform, StyleSheet } from "react-native";

const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCF2",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#FFFCF2",
  },

  scrollContent: {
    backgroundColor: "#FFFCF2",
    paddingBottom: 82,
  },

  main: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  pageTitle: {
    fontFamily: bodyFont,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "400",
    color: "#333333",
    textAlign: "center",
    marginBottom: 32,
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
    borderRadius: 18,
  },

  copy: {
    width: "100%",
  },

  paragraph: {
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 31,
    color: "#111111",
    textAlign: "justify",
    marginBottom: 28,
  },

  signature: {
    fontFamily: bodyFont,
    fontSize: 21,
    lineHeight: 31,
    color: "#111111",
    textAlign: "left",
    marginTop: 2,
  },
});