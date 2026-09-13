import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function KeyboardToolbar({
  hideNavigation = false,
  onDone,
  onNext,
  onPrevious,
}) {
  const renderNavigationButton = (label, onPress) => (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        !onPress && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.navigationButtonText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.toolbar}>
      {!hideNavigation ? (
        <View style={styles.navigationGroup}>
          {renderNavigationButton("Previous", onPrevious)}
          {renderNavigationButton("Next", onNext)}
        </View>
      ) : null}
      <Pressable
        accessibilityLabel="Done"
        accessibilityRole="button"
        onPress={onDone || Keyboard.dismiss}
        style={({ pressed }) => [
          styles.doneButton,
          pressed && styles.doneButtonPressed,
        ]}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

export default function IOSKeyboardAccessory({
  hideNavigation = false,
  onDone,
  onNext,
  onPrevious,
  visible,
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return undefined;
    }

    const showKeyboard = (event) => {
      setKeyboardHeight(Math.max(0, event.endCoordinates?.height || 0));
    };
    const hideKeyboard = () => setKeyboardHeight(0);
    const willShowSubscription = Keyboard.addListener(
      "keyboardWillShow",
      showKeyboard,
    );
    const didShowSubscription = Keyboard.addListener(
      "keyboardDidShow",
      showKeyboard,
    );
    const willHideSubscription = Keyboard.addListener(
      "keyboardWillHide",
      hideKeyboard,
    );
    const didHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      hideKeyboard,
    );

    return () => {
      willShowSubscription.remove();
      didShowSubscription.remove();
      willHideSubscription.remove();
      didHideSubscription.remove();
    };
  }, []);

  if (Platform.OS !== "ios" || !visible || keyboardHeight <= 0) {
    return null;
  }

  return (
    <View style={[styles.overlayFrame, { bottom: keyboardHeight }]}>
      <KeyboardToolbar
        hideNavigation={hideNavigation}
        onDone={onDone}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    alignItems: "center",
    backgroundColor: "#FFFCF2",
    borderColor: "#C8C7CC",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 48,
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  navigationGroup: {
    alignItems: "center",
    flexDirection: "row",
  },
  navigationButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    minWidth: 78,
    paddingHorizontal: 8,
  },
  navigationButtonText: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "500",
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 6,
    height: 36,
    justifyContent: "center",
    marginLeft: "auto",
    minWidth: 72,
    paddingHorizontal: 14,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.34,
  },
  buttonPressed: {
    opacity: 0.52,
  },
  doneButtonPressed: {
    opacity: 0.72,
  },
  overlayFrame: {
    elevation: 2000001,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 2000001,
  },
});
