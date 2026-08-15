const numericKeyboardTypes = new Set(["decimal-pad", "number-pad", "numeric"]);

export function getTextInputKeyboardProps({
  autoComplete,
  fieldKey,
  inputMode,
  keyboardType,
  textContentType,
} = {}) {
  const resolvedKeyboardType = keyboardType || "default";
  const isPhoneInput =
    fieldKey === "phone" || resolvedKeyboardType === "phone-pad";
  const isPostalInput =
    fieldKey === "zip" ||
    fieldKey === "postalCode" ||
    fieldKey === "postal-code";
  const isNumericInput = numericKeyboardTypes.has(resolvedKeyboardType);
  const resolvedAutoComplete =
    autoComplete ||
    (isPhoneInput ? "tel" : isPostalInput ? "postal-code" : "off");
  const resolvedInputMode =
    inputMode ||
    (isPhoneInput ? "tel" : isNumericInput ? "numeric" : undefined);
  const resolvedTextContentType =
    textContentType ||
    (isPhoneInput
      ? "telephoneNumber"
      : isPostalInput
        ? "postalCode"
        : undefined);
  const props = {
    autoComplete: resolvedAutoComplete,
    keyboardType: resolvedKeyboardType,
  };

  if (resolvedInputMode) {
    props.inputMode = resolvedInputMode;
  }

  if (resolvedTextContentType) {
    props.textContentType = resolvedTextContentType;
  }

  return props;
}
