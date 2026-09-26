import React from "react";
import {
  Button,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link as RouterLink } from "expo-router";
import { Switch } from "./switch";
import { formColors } from "../styles";
import {
  defaultItemPadding,
  defaultMinRowHeight,
  CardStyleContext,
  ListStyleContext,
  SectionStyleContext,
  useFormFonts,
} from "../context";
import { DatePicker, Toggle } from "./controls";
import { FormItem } from "./item";
import { HStack, Separator, Spacer } from "./layout";
import { Link } from "./link";
import { SystemImage, LinkChevronIcon } from "./symbol";
import { Text, TextField } from "./text";
import type { FormTextProps, SeparatorInset, SystemImageProps } from "../types";
import { getFlatChildren, isStringishNode } from "../utils";
import type { FormFonts } from "../context";

type SectionProps = ViewProps & {
  readonly title?: string | React.ReactNode;
  readonly titleHint?: string | React.ReactNode;
  readonly footer?: string | React.ReactNode;
  readonly titleStyle?: StyleProp<TextStyle>;
  readonly titleHintStyle?: StyleProp<TextStyle>;
  readonly footerStyle?: StyleProp<TextStyle>;
  readonly outerStyle?: StyleProp<ViewStyle>;
  readonly itemPadding?: {
    readonly paddingVertical: number;
    readonly paddingHorizontal: number;
  };
  readonly minRowHeight?: number;
  readonly separatorInset?: SeparatorInset;
};

export function Section({
  children,
  title,
  titleHint,
  footer,
  titleStyle,
  titleHintStyle,
  footerStyle,
  style,
  outerStyle,
  itemPadding = defaultItemPadding,
  minRowHeight = defaultMinRowHeight,
  separatorInset = "automatic",
  ...props
}: SectionProps) {
  const listStyle = React.useContext(ListStyleContext) ?? "auto";
  const { sheet } = React.useContext(CardStyleContext);
  const fonts = useFormFonts();
  const allChildren = getFlatChildren(children);
  const isGrouped = listStyle === "grouped";

  const childrenWithSeparator = allChildren.map((child, index) => (
    <React.Fragment key={index}>
      {renderSectionChild(child, fonts)}
      {index < allChildren.length - 1 ? (
        <Separator
          style={separatorStyleForChild({
            child,
            separatorInset,
            horizontalInset: itemPadding.paddingHorizontal,
          })}
        />
      ) : null}
    </React.Fragment>
  ));

  const contents = (
    <SectionStyleContext.Provider value={{ itemPadding, minRowHeight }}>
      <View
        {...props}
        collapsable={false}
        style={[
          styles.contents,
          {
            backgroundColor: sheet
              ? formColors.sheetCard
              : formColors.groupedCard,
          },
          isGrouped ? styles.groupedContents : styles.cardContents,
          style,
        ]}
      >
        {childrenWithSeparator}
      </View>
    </SectionStyleContext.Provider>
  );

  if (!title && !footer) {
    return (
      <View
        style={[isGrouped ? styles.groupedOuter : styles.cardOuter, outerStyle]}
      >
        {contents}
      </View>
    );
  }

  return (
    <View
      style={[isGrouped ? styles.groupedOuter : styles.cardOuter, outerStyle]}
    >
      {title || titleHint ? (
        <View style={styles.titleRow}>
          {title ? (
            <SectionLabel fonts={fonts} style={titleStyle}>
              {title}
            </SectionLabel>
          ) : null}
          {titleHint ? (
            <SectionHint fonts={fonts} style={titleHintStyle}>
              {titleHint}
            </SectionHint>
          ) : null}
        </View>
      ) : null}

      {contents}

      {footer ? (
        <SectionFooter fonts={fonts} style={footerStyle}>
          {footer}
        </SectionFooter>
      ) : null}
    </View>
  );
}

if (__DEV__) Section.displayName = "FormSection";

function renderSectionChild(
  node: React.ReactNode,
  fonts: Required<FormFonts>
): React.ReactNode {
  if (!React.isValidElement(node)) {
    return (
      <FormItem>
        <Text>{node}</Text>
      </FormItem>
    );
  }

  let child = node as React.ReactElement<any>;
  const resolvedProps = { ...child.props };
  const originalOnPress = resolvedProps.onPress;
  const originalOnLongPress = resolvedProps.onLongPress;
  let wrapsFormItem = false;

  const isToggle = isElementType(child, Toggle, "FormToggle");
  const isDatePicker = isElementType(child, DatePicker, "FormDatePicker");

  if (isToggle) {
    resolvedProps.hint = (
      <Switch
        thumbColor={resolvedProps.thumbColor}
        trackColor={resolvedProps.trackColor}
        ios_backgroundColor={resolvedProps.ios_backgroundColor}
        onChange={resolvedProps.onChange}
        disabled={resolvedProps.disabled}
        value={resolvedProps.value}
        onValueChange={resolvedProps.onValueChange}
      />
    );
  }

  if (isDatePicker && resolvedProps.value) {
    resolvedProps.hint = React.createElement(
      DateTimePicker as React.ComponentType<any>,
      {
        ...nativeDatePickerProps(resolvedProps),
        accentColor: resolvedProps.accentColor ?? formColors.link,
      }
    );
  }

  if (resolvedProps.hintBoolean != null) {
    resolvedProps.hint = resolvedProps.hintBoolean ? (
      <SystemImage
        systemImage={{
          name: "checkmark.circle.fill",
          color: formColors.green,
          size: 20,
        }}
      />
    ) : (
      <SystemImage
        systemImage={{
          name: "slash.circle",
          color: formColors.gray,
          size: 20,
        }}
      />
    );
  }

  if (child.type === Button) {
    child = (
      <RNText
        style={[
          styles.text,
          styles.linkText,
          { color: resolvedProps.color ?? formColors.link },
          { fontFamily: fonts.regular },
          resolvedProps.style,
        ]}
      >
        {resolvedProps.title}
      </RNText>
    );
  } else if (isTextElement(child) || isToggle || isDatePicker) {
    child = renderTextElement(child, resolvedProps, fonts);
  } else if (
    child.type === RouterLink ||
    isElementType(child, Link, "FormLink")
  ) {
    wrapsFormItem = true;
    child = renderLinkElement(child, resolvedProps, fonts);
  } else if (
    child.type === TextInput ||
    isElementType(child, TextField, "FormTextField")
  ) {
    wrapsFormItem = true;
    child = renderTextFieldElement(
      child,
      resolvedProps,
      {
        onPress: originalOnPress,
        onLongPress: originalOnLongPress,
      },
      fonts
    );
  }

  if (!wrapsFormItem && child.type !== FormItem && !resolvedProps.custom) {
    child = (
      <FormItem
        onPress={originalOnPress}
        onLongPress={originalOnLongPress}
        style={isToggle || isDatePicker ? styles.compactItem : undefined}
      >
        {child}
      </FormItem>
    );
  }

  return child;
}

function renderTextFieldElement(
  child: React.ReactElement<any>,
  resolvedProps: Record<string, any>,
  handlers: {
    readonly onPress?: unknown;
    readonly onLongPress?: unknown;
  },
  fonts: Required<FormFonts>
) {
  const nativeProps = nativeTextFieldProps(resolvedProps);
  const input = React.cloneElement(child, {
    placeholderTextColor: formColors.placeholder,
    ...nativeProps,
    onPress: undefined,
    onLongPress: undefined,
    style: [
      styles.textField,
      { fontFamily: fonts.regular },
      resolvedProps.inputStyle,
      resolvedProps.style,
    ],
  });

  if (!resolvedProps.label) {
    return (
      <FormItem
        onPress={handlers.onPress as never}
        onLongPress={handlers.onLongPress as never}
      >
        {input}
      </FormItem>
    );
  }

  return (
    <FormItem
      onPress={handlers.onPress as never}
      onLongPress={handlers.onLongPress as never}
    >
      <HStack>
        <RNText
          style={[
            styles.textFieldLabel,
            { fontFamily: fonts.semibold },
            resolvedProps.labelStyle,
          ]}
        >
          {resolvedProps.label}
        </RNText>
        <Spacer />
        {input}
      </HStack>
    </FormItem>
  );
}

function renderTextElement(
  child: React.ReactElement<any>,
  resolvedProps: FormTextProps,
  fonts: Required<FormFonts>
) {
  const hintView = renderHint(resolvedProps.hint, fonts);
  const textProps = nativeTextProps(resolvedProps);
  const mainText = React.cloneElement(child, {
    dynamicTypeRamp: "body",
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    ...textProps,
    onPress: undefined,
    onLongPress: undefined,
    hint: undefined,
    hintBoolean: undefined,
    systemImage: undefined,
    imageClassName: undefined,
    bold: undefined,
    custom: undefined,
    style: [
      styles.text,
      { fontFamily: resolvedProps.bold ? fonts.semibold : fonts.regular },
      resolvedProps.style,
    ],
  });

  if (!hintView && !resolvedProps.systemImage) {
    return mainText;
  }

  return (
    <HStack>
      <SystemImage systemImage={resolvedProps.systemImage} />
      {mainText}
      {hintView ? <Spacer /> : null}
      {hintView}
    </HStack>
  );
}

function renderLinkElement(
  child: React.ReactElement<any>,
  resolvedProps: FormTextProps & {
    readonly href?: unknown;
    readonly children?: React.ReactNode;
    readonly hintImage?: React.ReactNode;
  },
  fonts: Required<FormFonts>
) {
  const wrappedTextChildren = React.Children.map(
    resolvedProps.children,
    (linkChild) => {
      if (!linkChild) {
        return null;
      }

      if (typeof linkChild === "string") {
        return (
          <RNText style={[styles.text, { fontFamily: fonts.regular }]}>
            {linkChild}
          </RNText>
        );
      }

      return linkChild;
    }
  );
  const hintView = renderHint(resolvedProps.hint, fonts);

  return React.cloneElement(child, {
    dynamicTypeRamp: "body",
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    hint: undefined,
    systemImage: undefined,
    imageClassName: undefined,
    hintImage: undefined,
    asChild: process.env.EXPO_OS !== "web",
    children: (
      <FormItem>
        <HStack>
          <SystemImage systemImage={resolvedProps.systemImage} />
          {wrappedTextChildren}
          <Spacer />
          {hintView}
          <View>
            <LinkChevronIcon
              href={resolvedProps.href}
              systemImage={resolvedProps.hintImage}
            />
          </View>
        </HStack>
      </FormItem>
    ),
  });
}

function renderHint(hint: React.ReactNode, fonts: Required<FormFonts>) {
  if (!hint) {
    return null;
  }

  return React.Children.map(hint, (child) => {
    if (!child) {
      return null;
    }

    if (typeof child === "string") {
      return (
        <RNText
          selectable
          style={[
            styles.text,
            styles.hintText,
            { fontFamily: fonts.regular },
          ]}
        >
          {child}
        </RNText>
      );
    }

    return child;
  });
}

function SectionLabel({
  children,
  fonts,
  style,
}: {
  readonly children: React.ReactNode;
  readonly fonts: Required<FormFonts>;
  readonly style?: StyleProp<TextStyle>;
}) {
  if (!isStringishNode(children)) {
    return children;
  }

  return (
    <RNText style={[styles.sectionLabel, { fontFamily: fonts.regular }, style]}>
      {children}
    </RNText>
  );
}

function SectionHint({
  children,
  fonts,
  style,
}: {
  readonly children: React.ReactNode;
  readonly fonts: Required<FormFonts>;
  readonly style?: StyleProp<TextStyle>;
}) {
  if (!isStringishNode(children)) {
    return children;
  }

  return (
    <RNText style={[styles.sectionHint, { fontFamily: fonts.regular }, style]}>
      {children}
    </RNText>
  );
}

function SectionFooter({
  children,
  fonts,
  style,
}: {
  readonly children: React.ReactNode;
  readonly fonts: Required<FormFonts>;
  readonly style?: StyleProp<TextStyle>;
}) {
  if (!isStringishNode(children)) {
    return children;
  }

  return (
    <RNText style={[styles.sectionFooter, { fontFamily: fonts.regular }, style]}>
      {children}
    </RNText>
  );
}

function isTextElement(child: React.ReactElement<any>) {
  return (
    child.type === RNText || isElementType(child, Text, "FormText")
  );
}

function isElementType(
  child: React.ReactElement<any>,
  component: React.ComponentType<any>,
  displayName: string
) {
  if (child.type === component) {
    return true;
  }

  return (
    typeof child.type === "function" &&
    "displayName" in child.type &&
    child.type.displayName === displayName
  );
}

function nativeDatePickerProps(props: Record<string, any>) {
  const {
    children: _children,
    hint: _hint,
    hintBoolean: _hintBoolean,
    systemImage: _systemImage,
    imageClassName: _imageClassName,
    bold: _bold,
    onPress: _onPress,
    onLongPress: _onLongPress,
    custom: _custom,
    ...nativeProps
  } = props;

  return nativeProps;
}

function nativeTextProps(props: Record<string, any>) {
  const {
    hint: _hint,
    hintBoolean: _hintBoolean,
    systemImage: _systemImage,
    imageClassName: _imageClassName,
    bold: _bold,
    custom: _custom,
    ...textProps
  } = props;

  return textProps;
}

function nativeTextFieldProps(props: Record<string, any>) {
  const {
    label: _label,
    labelStyle: _labelStyle,
    inputStyle: _inputStyle,
    onPress: _onPress,
    onLongPress: _onLongPress,
    ...textFieldProps
  } = props;

  return textFieldProps;
}

function separatorStyleForChild({
  child,
  separatorInset,
  horizontalInset,
}: {
  readonly child: React.ReactNode;
  readonly separatorInset: SeparatorInset;
  readonly horizontalInset: number;
}) {
  if (separatorInset === "full") {
    return undefined;
  }

  const leadingInset =
    horizontalInset + leadingSystemImageWidth(getSystemImageFromChild(child));

  if (separatorInset === "content") {
    return {
      marginStart: leadingInset,
      marginEnd: horizontalInset,
    };
  }

  return {
    marginStart: leadingInset,
    marginEnd: 0,
  };
}

function getSystemImageFromChild(child: React.ReactNode) {
  if (!React.isValidElement(child)) {
    return undefined;
  }

  return (child.props as { systemImage?: SystemImageProps }).systemImage;
}

function leadingSystemImageWidth(systemImage?: SystemImageProps) {
  if (!systemImage) {
    return 0;
  }

  if (
    typeof systemImage === "object" &&
    systemImage !== null &&
    "name" in systemImage
  ) {
    return (systemImage.size ?? 20) + 8;
  }

  return 28;
}

const styles = StyleSheet.create({
  groupedOuter: {
    paddingHorizontal: 0,
  },
  cardOuter: {
    paddingHorizontal: 16,
  },
  contents: {
    overflow: "hidden",
  },
  groupedContents: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: formColors.separator,
  },
  cardContents: {
    borderRadius: 28,
  },
  titleRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  sectionLabel: {
    paddingVertical: 8,
    color: formColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textTransform: "uppercase",
  },
  sectionHint: {
    paddingVertical: 8,
    color: formColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionFooter: {
    paddingTop: 8,
    paddingHorizontal: 20,
    color: formColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  text: {
    color: formColors.text,
    fontSize: 17,
    lineHeight: 22,
  },
  linkText: {},
  hintText: {
    flexShrink: 1,
    color: formColors.textSecondary,
    textAlign: "right",
  },
  textField: {
    minWidth: 120,
    flex: 1,
    padding: 0,
    color: formColors.text,
    fontSize: 17,
    minHeight: 22,
    textAlignVertical: "center",
  } satisfies TextStyle,
  textFieldLabel: {
    color: formColors.text,
    fontSize: 17,
    lineHeight: 22,
  },
  compactItem: {
    paddingVertical: 8,
  },
});
