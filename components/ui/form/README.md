# Form

The form package provides iOS-style grouped list primitives for settings, account screens, and compact control panels.

## Import

```tsx
import * as Form from "@/components/ui/form";
```

## Basic List

```tsx
<Form.List navigationTitle="Settings" listStyle="grouped">
  <Form.Section title="Account">
    <Form.Text hint="Baconator">Game Center</Form.Text>
    <Form.Link href="/account">Account details</Form.Link>
  </Form.Section>
</Form.List>
```

## App Fonts

Forms use SF fonts by default, but you can provide app-wide form fonts with `Form.Provider`.

```tsx
<Form.Provider
  fonts={{
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semibold: "Inter-SemiBold",
    bold: "Inter-Bold",
  }}
>
  <Form.List navigationTitle="Settings">
    <Form.Section>
      <Form.Text>Uses Inter now</Form.Text>
    </Form.Section>
  </Form.List>
</Form.Provider>
```

## Section Styling

```tsx
<Form.Section
  outerStyle={{ paddingHorizontal: 0 }}
  style={{
    backgroundColor: "#f8f8f8",
    borderRadius: 24,
  }}
  separatorInset="content"
>
  <Form.Text>Styled row</Form.Text>
</Form.Section>
```

## Separator Insets

`separatorInset` supports:

- `automatic`: chooses an inset based on row content.
- `content`: aligns separators to the content inset.
- `full`: spans the whole section.

## Rows

```tsx
<Form.Text hint="On">Label</Form.Text>
<Form.Text hintBoolean={true}>Boolean state</Form.Text>
<Form.TextField placeholder="Display name" />
<Form.TextField
  label="First Name"
  placeholder="Required"
  value={firstName}
  onChangeText={setFirstName}
/>
<Form.Toggle value={enabled} onValueChange={setEnabled}>
  Push Notifications
</Form.Toggle>
<Form.Link
  href="/account"
  hint="Baconator"
  systemImage={{ name: "person.crop.circle.fill", color: "#5856d6" }}
>
  Account
</Form.Link>
```

## Layout Helpers

Use layout helpers for custom rows inside sections.

```tsx
<Form.FormItem>
  <Form.HStack style={{ gap: 12 }}>
    <Form.Text>Custom row</Form.Text>
    <Form.Spacer />
    <Form.Text hint="Value" />
  </Form.HStack>
</Form.FormItem>
```

## Package Layout

```txt
components/ui/form/
  index.ts
  README.md
  components/
  context/
  styles/
  types/
  utils/
```
