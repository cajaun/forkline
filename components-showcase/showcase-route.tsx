import React from "react";
import * as Form from "@/components/ui/form";

type ShowcaseRouteProps = {
  children: React.ReactNode;
  title: string;
};

export function ShowcaseRoute({ children, title }: ShowcaseRouteProps) {
  return (
    <Form.List
      navigationTitle={title}
      listStyle="grouped"
      contentContainerStyle={{
        gap: 18,
        paddingHorizontal: 16,
      }}
    >
      {children}
    </Form.List>
  );
}
