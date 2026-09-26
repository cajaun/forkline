import React from "react";
import type { ListStyle } from "../types";

export const defaultItemPadding = {
  paddingVertical: 11,
  paddingHorizontal: 20,
} as const;

export const defaultMinRowHeight = 44;

export const ListStyleContext = React.createContext<ListStyle>("auto");

export const SectionStyleContext = React.createContext<{
  readonly itemPadding: {
    readonly paddingVertical: number;
    readonly paddingHorizontal: number;
  };
  readonly minRowHeight: number;
}>({
  itemPadding: defaultItemPadding,
  minRowHeight: defaultMinRowHeight,
});

export const CardStyleContext = React.createContext<{
  readonly sheet?: boolean;
}>({
  sheet: false,
});

export type FormFonts = {
  readonly regular?: string;
  readonly medium?: string;
  readonly semibold?: string;
  readonly bold?: string;
};

export const defaultFormFonts: Required<FormFonts> = {
  regular: "Sf-regular",
  medium: "Sf-medium",
  semibold: "Sf-semibold",
  bold: "Sf-bold",
};

export const FormFontsContext =
  React.createContext<Required<FormFonts>>(defaultFormFonts);

export function useFormFonts() {
  return React.useContext(FormFontsContext);
}

export function FormProvider({
  children,
  fonts,
}: {
  readonly children: React.ReactNode;
  readonly fonts?: FormFonts;
}) {
  const value = React.useMemo(
    () => ({
      ...defaultFormFonts,
      ...fonts,
    }),
    [fonts]
  );

  return (
    <FormFontsContext.Provider value={value}>
      {children}
    </FormFontsContext.Provider>
  );
}
