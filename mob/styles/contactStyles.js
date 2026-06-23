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

  introText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: 21,
    lineHeight: 48,
    color: "#111111",
    textAlign: "center",
    marginBottom: 18,
  },

  formCard: {
    width: "100%",
    marginTop: 22,
    alignItems: "center",
  },

  label: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 26,
    color: "#111111",
    textAlign: "center",
    marginBottom: 8,
  },

  input: {
    ...tightText,
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(17, 17, 17, 0.24)",
    borderRadius: 8,
    backgroundColor: "#FFFCF2",
    fontFamily: bodyFont,
    fontSize: 17,
    lineHeight: 23,
    color: "#111111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 22,
  },

  messageInput: {
    minHeight: 180,
    paddingTop: 14,
  },

  button: {
    width: 170,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  buttonWrap: {
    alignItems: "center",
  },

  buttonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
