import React from "react";
import { StyleSheet, Text as RNText, TextInput } from "react-native";
import type { StyleProp, TextInputProps, TextStyle } from "react-native";
import { useFormFonts } from "../context";
import { formColors } from "../styles";
import type { FormTextProps } from "../types";

export type FormTextFieldProps = TextInputProps & {
  readonly label?: React.ReactNode;
  readonly labelStyle?: StyleProp<TextStyle>;
  readonly inputStyle?: StyleProp<TextStyle>;
};

export function Text({
  bold,
  style,
  hint: _hint,
  hintBoolean: _hintBoolean,
  systemImage: _systemImage,
  imageClassName: _imageClassName,
  ...props
}: FormTextProps) {
  const fonts = useFormFonts();

  return (
    <RNText
      dynamicTypeRamp="body"
      {...props}
      style={[
        styles.text,
        { fontFamily: bold ? fonts.semibold : fonts.regular },
        style,
      ]}
    />
  );
}

if (__DEV__) Text.displayName = "FormText";

export function TextField({
  label: _label,
  labelStyle: _labelStyle,
  inputStyle,
  style,
  ...props
}: FormTextFieldProps) {
  const fonts = useFormFonts();

  return (
    <TextInput
      placeholderTextColor={formColors.placeholder}
      {...props}
      style={[
        styles.textField,
        { fontFamily: fonts.regular },
        inputStyle,
        style,
      ]}
    />
  );
}

if (__DEV__) TextField.displayName = "FormTextField";

const styles = StyleSheet.create({
  text: {
    flexShrink: 0,
    color: formColors.text,
    fontSize: 17,
    lineHeight: 22,
  },
  textField: {
    color: formColors.text,
    fontSize: 17,
    minHeight: 22,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
});
