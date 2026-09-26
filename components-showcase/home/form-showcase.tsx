import React from "react";
import { Button, Platform, Pressable } from "react-native";
import { Image } from "expo-image";
import * as AC from "@bacons/apple-colors";
import * as Form from "@/components/ui/form";
import { metrics, updateApps } from "./constants";

type AccountType = "Personal" | "Business" | "Creator";
type Visibility = "Private" | "Friends" | "Public";

export function FormShowcase() {
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [name, setName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("Campbell");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reminderDate, setReminderDate] = React.useState(
    new Date(2026, 8, 15),
  );
  const [summaryEnabled, setSummaryEnabled] = React.useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = React.useState(true);
  const [accountType, setAccountType] =
    React.useState<AccountType>("Personal");
  const [visibility, setVisibility] =
    React.useState<Visibility>("Friends");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  function cycleAccountType() {
    setAccountType((current) =>
      current === "Personal"
        ? "Business"
        : current === "Business"
          ? "Creator"
          : "Personal",
    );
  }

  function cycleVisibility() {
    setVisibility((current) =>
      current === "Private"
        ? "Friends"
        : current === "Friends"
          ? "Public"
          : "Private",
    );
  }

  return (
    <>
      <Form.Section
        title="Form controls"
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.TextField
          value={name}
          onChangeText={setName}
          placeholder="Display name"
          returnKeyType="done"
        />
        <Form.Toggle
          value={pushEnabled}
          onValueChange={setPushEnabled}
          hint={pushEnabled ? "On" : "Off"}
        >
          Push Notifications
        </Form.Toggle>
        <Form.Text hintBoolean={pushEnabled}>Notification status</Form.Text>
        <Form.Link
          href="/account"
          hint={name || "Not set"}
          systemImage={{ name: "person.crop.circle.fill", color: AC.systemIndigo }}
        >
          Account details
        </Form.Link>
      </Form.Section>

      <Form.Section
        title="Account setup"
        footer="Text fields can use native keyboard types, secure entry, and platform-native date controls."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          inputStyle={{ textAlign: "left" }}
        />
        <Form.TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          returnKeyType="done"
          inputStyle={{ textAlign: "left" }}
        />
        {Platform.OS === "web" ? (
          <Form.Text
            systemImage={{ name: "calendar", color: AC.systemBlue }}
            hint={formatDate(reminderDate)}
          >
            Reminder date
          </Form.Text>
        ) : (
          <Form.DatePicker
            value={reminderDate}
            mode="date"
            display="compact"
            onChange={(_, selectedDate) => {
              if (selectedDate) setReminderDate(selectedDate);
            }}
          >
            Reminder date
          </Form.DatePicker>
        )}
      </Form.Section>

      <Form.Section
        title="Preferences"
        footer="Toggle rows keep the control in the trailing hint position while preserving the same row API."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.Toggle
          value={pushEnabled}
          onValueChange={setPushEnabled}
          systemImage={{ name: "bell.fill", color: AC.systemOrange }}
        >
          Push Notifications
        </Form.Toggle>
        <Form.Toggle
          value={summaryEnabled}
          onValueChange={setSummaryEnabled}
          systemImage={{ name: "calendar.badge.clock", color: AC.systemBlue }}
        >
          Weekly Summary
        </Form.Toggle>
        <Form.Toggle
          value={faceIdEnabled}
          onValueChange={setFaceIdEnabled}
          systemImage={{ name: "faceid", color: AC.systemGreen }}
        >
          Use Face ID
        </Form.Toggle>
        <Form.Text hintBoolean={pushEnabled}>Notification status</Form.Text>
      </Form.Section>

      <Form.Section
        title="Labeled inputs"
        footer="Use labeled inputs when a row needs a fixed label and editable value."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.TextField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Required"
          returnKeyType="next"
          inputStyle={{
            textAlign: "left",
          }}
        />
        <Form.TextField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Required"
          returnKeyType="done"
          inputStyle={{
            textAlign: "left",
          }}
        />
      </Form.Section>

      <Form.Section
        title="Choice rows"
        footer="Rows can represent selections, boolean confirmation, or navigation without introducing a new component type."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.Text
          systemImage={{ name: "person.2.fill", color: AC.systemIndigo }}
          hint={accountType}
          onPress={cycleAccountType}
        >
          Account type
        </Form.Text>
        <Form.Text
          systemImage={{ name: "lock.fill", color: AC.systemOrange }}
          hint={visibility}
          onPress={cycleVisibility}
        >
          Profile visibility
        </Form.Text>
        <Form.Text
          systemImage={{ name: "checkmark.seal.fill", color: AC.systemGreen }}
          hintBoolean={termsAccepted}
          onPress={() => setTermsAccepted((current) => !current)}
        >
          Accept terms and conditions
        </Form.Text>
        <Form.Link
          href="/account"
          hint="Manage"
          systemImage={{ name: "gearshape.fill", color: AC.systemGray }}
        >
          Account settings
        </Form.Link>
      </Form.Section>

      <Form.Section
        title="Message form"
        footer="Multiline fields and a submit action can live alongside the same grouped form primitives."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.TextField
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
          returnKeyType="next"
        />
        <Form.TextField
          value={message}
          onChangeText={setMessage}
          placeholder="Write a message"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          inputStyle={{
            minHeight: 96,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        />
        <Button
          title={message.trim() ? "Send feedback" : "Add a message first"}
          color="#007aff"
          disabled={!message.trim()}
          onPress={() => {
            setSubject("");
            setMessage("");
          }}
        />
      </Form.Section>

      <Form.Section
        title="Section styling"
        titleHint="custom surface"
        footer="Sections accept outerStyle, style, item padding, row height, and separator inset controls."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#f8f8f8",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.Text
          systemImage={{ name: "rectangle.inset.filled", color: AC.systemOrange }}
          hint="outerStyle"
        >
          Flush outer padding
        </Form.Text>
        <Form.Text
          systemImage={{ name: "rectangle.roundedtop.fill", color: AC.systemPink }}
          hint="style"
        >
          Custom panel color and radius
        </Form.Text>
        <Form.Text
          systemImage={{ name: "list.bullet.indent", color: AC.systemGray }}
          hint="content"
        >
          Content separator inset
        </Form.Text>
      </Form.Section>

      <SeparatorInsetShowcase pushEnabled={pushEnabled} />
      <AccountFormShowcase />
    </>
  );
}

function SeparatorInsetShowcase({
  pushEnabled,
}: {
  readonly pushEnabled: boolean;
}) {
  return (
    <>
      <Form.Section
        title="Inset automatic"
        outerStyle={{ paddingHorizontal: 0 }}
        style={{ borderRadius: metrics.panelRadius }}
        separatorInset="automatic"
      >
        <Form.Text
          systemImage={{
            name: "text.alignleft",
            color: AC.systemIndigo,
          }}
          hint="Icon row"
        >
          Accounts for symbols
        </Form.Text>
        <Form.Text hint="Automatic">Uses the row shape</Form.Text>
        <Form.Link href="/" hint="Chevron">
          Link row
        </Form.Link>
      </Form.Section>

      <Form.Section
        title="Inset content"
        outerStyle={{ paddingHorizontal: 0 }}
        style={{ borderRadius: metrics.panelRadius }}
        separatorInset="content"
      >
        <Form.Text
          systemImage={{ name: "increase.indent", color: AC.systemBlue }}
          hint="Aligned"
        >
          Starts after content inset
        </Form.Text>
        <Form.Text hint="Clean edge">Good default for icon rows</Form.Text>
        <Form.Text hintBoolean={pushEnabled}>Boolean hint row</Form.Text>
      </Form.Section>

      <Form.Section
        title="Inset full"
          // className = "rounded-full"
        footer="Full separators work best when every row should read as one dense list."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{ borderRadius: metrics.panelRadius}}
        separatorInset="full"
      >
        <Form.Text
          systemImage={{
            name: "rectangle.split.1x2.fill",
            color: AC.systemTeal,
          }}
          hint="Full width"
        >
          Separator spans the panel
        </Form.Text>
        <Form.Text hint="Dense">Useful for dense lists</Form.Text>
        <Form.Link href="/" hint="Full">
          Link row
        </Form.Link>
      </Form.Section>
    </>
  );
}

function AccountFormShowcase() {
  return (
    <Form.Section
      title="Upcoming automatic updates"
      outerStyle={{ paddingHorizontal: 0 }}
      style={{ borderRadius: metrics.panelRadius }}
      separatorInset="content"
    >
      <Form.Text hint="3 pending">Update All</Form.Text>
      {updateApps.map((app) => (
        <AppUpdate key={app.name} icon={app.icon} name={app.name} />
      ))}
    </Form.Section>
  );
}

function AppUpdate({
  icon,
  name,
}: {
  readonly icon: string;
  readonly name: string;
}) {
  return (
    <Form.HStack style={{ flex: 1, gap: 12 }}>
      <Image
        source={{ uri: icon }}
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
        }}
      />
      <Form.VStack>
        <Form.Text bold>{name}</Form.Text>
        <Form.Text
          style={{
            color: "#6e6e73",
            fontSize: 13,
          }}
        >
          Ready to install
        </Form.Text>
      </Form.VStack>
      <Form.Spacer />
      <Pressable
        accessibilityRole="button"
        style={{
          borderRadius: 999,
          backgroundColor: "rgba(0, 122, 255, 0.12)",
          paddingHorizontal: 14,
          paddingVertical: 7,
        }}
      >
        <Form.Text
          style={{
            color: "#007aff",
            fontFamily: "Sf-semibold",
            fontSize: 14,
          }}
        >
          Update
        </Form.Text>
      </Pressable>
    </Form.HStack>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
