import { Platform, Pressable as NativePressable, Vibration } from "react-native";

import { isSmallAndroidViewport } from "../utils/responsiveLayout";

const smallAndroidHapticDuration = 22;

const getResolvedHapticDuration = (duration) =>
  isSmallAndroidViewport
    ? Math.max(duration, smallAndroidHapticDuration)
    : duration;

export const triggerHapticTick = (duration = 8, delay = 0) => {
  if (Platform.OS !== "android") {
    return;
  }

  const resolvedDuration = getResolvedHapticDuration(duration);

  if (delay > 0) {
    setTimeout(() => Vibration.vibrate(resolvedDuration), delay);
    return;
  }

  Vibration.vibrate(resolvedDuration);
};

export default function HapticPressable({
  disabled = false,
  haptic = true,
  hapticDelay = 0,
  hapticDuration = 8,
  onPressIn,
  ...props
}) {
  const handlePressIn = (event) => {
    if (haptic && !disabled) {
      triggerHapticTick(hapticDuration, hapticDelay);
    }

    onPressIn?.(event);
  };

  return (
    <NativePressable
      {...props}
      disabled={disabled}
      onPressIn={handlePressIn}
    />
  );
}
