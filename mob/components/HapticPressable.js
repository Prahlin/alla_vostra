import { Platform, Pressable as NativePressable, Vibration } from "react-native";

export const triggerHapticTick = (duration = 8, delay = 0) => {
  if (Platform.OS !== "android") {
    return;
  }

  if (delay > 0) {
    setTimeout(() => Vibration.vibrate(duration), delay);
    return;
  }

  Vibration.vibrate(duration);
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
