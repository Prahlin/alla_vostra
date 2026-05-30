import { Platform, StyleSheet } from "react-native";

const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});

const webMinHeight = Platform.OS === "web" ? "100vh" : undefined;

export default StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: webMinHeight,
    backgroundColor: "transparent",
  },

  scroll: {
    flex: 1,
    minHeight: webMinHeight,
    backgroundColor: "transparent",
  },

  scrollContent: {
    minHeight: webMinHeight,
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "web" ? 534 : 354,
    paddingBottom: 56,
  },

  main: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  pageTitle: {
    fontFamily: bodyFont,
    fontSize: 36,
    lineHeight: 43,
    color: "#111111",
    textAlign: "center",
    marginBottom: 34,
  },

  featureBlock: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },

  featureImage: {
    width: "100%",
    height: 285,
    borderRadius: 28,
    backgroundColor: "#f7b967",
  },

  featureTitle: {
    fontFamily: bodyFont,
    fontSize: 31,
    lineHeight: 38,
    color: "#111111",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 12,
  },

  featureText: {
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 29,
    color: "#111111",
    textAlign: "justify",
  },

  pageDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(17, 17, 17, 0.13)",
    marginTop: 22,
    marginBottom: 42,
  },
});
