import React from "react";
import * as Form from "@/components/ui/form";

export function ComponentCatalog() {
  return (
    <Form.List
      navigationTitle="Components"
      listStyle="grouped"
      contentContainerStyle={{
        gap: 18,
        paddingHorizontal: 16,
      }}
    >
      <Form.Section
        title="Components"
        footer="Choose a component to view its interactive examples."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
        }}
        separatorInset="content"
      >
        <Form.Link href="/toast" hint="Feedback and notifications">
          Toast
        </Form.Link>
        <Form.Link href="/laminar" hint="Animated text and numbers">
          Laminar
        </Form.Link>
        <Form.Link href="/forms" hint="Native grouped controls">
          Forms
        </Form.Link>
      </Form.Section>
    </Form.List>
  );
}
