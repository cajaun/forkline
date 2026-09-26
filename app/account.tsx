import React from "react";
import * as Form from "@/components/ui/form";

export default function AccountScreen() {
  return (
    <Form.List navigationTitle="Account" listStyle="grouped">
      <Form.Section>
        <Form.Text hint="Baconator">Game Center</Form.Text>
        <Form.Text hint="Active">Profile</Form.Text>
      </Form.Section>
    </Form.List>
  );
}
