import React from "react";
import * as AC from "@bacons/apple-colors";
import { SymbolView } from "expo-symbols";
import { Laminar } from "react-native-laminar";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { PressableScale } from "@/components/ui/utils/pressable-scale";
import * as Form from "@/components/ui/form";
import { metrics } from "./constants";

type EditorWord = "Craft" | "Creative";
type ConfirmationWord = "Continue" | "Confirm";
type RequestLabel = "Send Request" | "Sending Request" | "Request Sent!";
type SlotValue = "07:42" | "08:15" | "12:30";
type PriceValue = "$1,234.00" | "$12,345.50" | "$9,876.25";
type PercentValue = "+12.48%" | "-2.40%" | "+29.59%";

export function LaminarShowcase() {
  const [word, setWord] = React.useState<EditorWord>("Craft");
  const [confirmationWord, setConfirmationWord] =
    React.useState<ConfirmationWord>("Continue");
  const [requestLabel, setRequestLabel] =
    React.useState<RequestLabel>("Send Request");
  const [slotValue, setSlotValue] = React.useState<SlotValue>("07:42");
  const [priceValue, setPriceValue] = React.useState<PriceValue>("$1,234.00");
  const [percentValue, setPercentValue] =
    React.useState<PercentValue>("+12.48%");

  function sendRequest() {
    setRequestLabel((current) =>
      current === "Send Request"
        ? "Sending Request"
        : current === "Sending Request"
          ? "Request Sent!"
          : "Send Request",
    );
  }

  return (
    <>
      <Form.Section
        title="Text examples"
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.FormItem
          style={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 12,
          }}
        >
          <Laminar
            text={word}
            align="center"
            autoSize={false}
            fontSize={32}
            animationPreset="smooth"
            containerStyle={{
              width: "100%",
            }}
            style={{
              color: "#111111",
              fontFamily: "Sf-semibold",
            }}
          />
        </Form.FormItem>
        <Form.Text
          systemImage={{ name: "textformat", color: AC.systemBlue }}
          hint="Text"
          onPress={() =>
            setWord((current) => (current === "Craft" ? "Creative" : "Craft"))
          }
        >
          Morph word
        </Form.Text>

        <Form.FormItem
          style={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 12,
          }}
        >
          <Laminar
            text={confirmationWord}
            align="center"
            autoSize={false}
            fontSize={32}
            animationPreset="smooth"
            containerStyle={{
              width: "100%",
            }}
            style={{
              color: "#111111",
              fontFamily: "Sf-semibold",
            }}
          />
        </Form.FormItem>
        <Form.Text
          systemImage={{
            name: "checkmark.circle.fill",
            color: AC.systemIndigo,
          }}
          hint={confirmationWord}
          onPress={() =>
            setConfirmationWord((current) =>
              current === "Continue" ? "Confirm" : "Continue",
            )
          }
        >
          Change action
        </Form.Text>
      </Form.Section>

      <Form.Section
        title="Number lanes"
        footer="The number variant aligns digits by place value so changing magnitude does not shift stable lanes."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.FormItem
          style={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 12,
          }}
        >
          <Laminar
            text={priceValue}
            variant="number"
            autoSize={false}
            animationPreset="default"
            fontSize={32}
            containerStyle={{ width: "100%" }}
            style={{
              color: "#111111",
              fontFamily: "Sf-bold",
              fontVariant: ["tabular-nums"],
         
            }}
          />
        </Form.FormItem>
        <Form.Text
          systemImage={{
            name: "dollarsign.circle.fill",
            color: AC.systemGreen,
          }}
          hint={priceValue}
          onPress={() =>
            setPriceValue((current) =>
              current === "$1,234.00"
                ? "$12,345.50"
                : current === "$12,345.50"
                  ? "$9,876.25"
                  : "$1,234.00",
            )
          }
        >
          Change currency value
        </Form.Text>

        <Form.FormItem
          style={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 12,
          }}
        >
          <Laminar
            text={percentValue}
            variant="number"
            autoSize={false}
            animationPreset="default"
            fontSize={32}
            containerStyle={{ width: "100%" }}
            style={{
              color: percentValue.startsWith("-") ? "#ff3b30" : "#34c759",
              fontFamily: "Sf-bold",
              fontVariant: ["tabular-nums"],
             
            }}
          />
        </Form.FormItem>
        <Form.Text
          systemImage={{ name: "percent", color: AC.systemBlue }}
          hint={percentValue}
          onPress={() =>
            setPercentValue((current) =>
              current === "+12.48%"
                ? "-2.40%"
                : current === "-2.40%"
                  ? "+29.59%"
                  : "+12.48%",
            )
          }
        >
          Change percentage
        </Form.Text>
      </Form.Section>

      <Form.Section
        title="Slot reels"
        footer="The slots variant rolls each digit vertically while keeping punctuation in place."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#f8f8f8",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.FormItem
          style={{
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 12,
          }}
        >
          <Laminar
            text={slotValue}
            variant="slots"
            align="center"
            autoSize={false}
            clipToBounds
            animationPreset="snappy"
            fontSize={44}
            containerStyle={{ width: "100%" }}
            style={{
              color: "#111111",
              fontFamily: "Sf-semibold",
              fontVariant: ["tabular-nums"],
         
            }}
          />
        </Form.FormItem>
        <Form.Text
          systemImage={{ name: "timer", color: AC.systemOrange }}
          hint={slotValue}
          onPress={() =>
            setSlotValue((current) =>
              current === "07:42"
                ? "08:15"
                : current === "08:15"
                  ? "12:30"
                  : "07:42",
            )
          }
        >
          Roll the time
        </Form.Text>
      </Form.Section>

      <Form.Section
        title="Leading content"
        footer="Text-keyed leading content lets a spinner and confirmation mark transition with the label."
        outerStyle={{ paddingHorizontal: 0 }}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: metrics.panelRadius,
        }}
        separatorInset="content"
      >
        <Form.FormItem
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <PressableScale
            onPress={sendRequest}
            className="rounded-full"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 50,
              backgroundColor: "#111111",
              paddingHorizontal: 20,
            }}
          >
            <Laminar
              text={requestLabel}
              leading={{
                "Sending Request": <LoadingSpinner />,
                "Request Sent!": (
                  <SymbolView
                    name="checkmark.circle.fill"
                    size={20}
                    tintColor="#ffffff"
                  />
                ),
              }}
              leadingGap={4}
              align="center"
              autoSize={false}
              containerStyle={{ width: "100%" }}
              style={{
                color: "#ffffff",
                fontFamily: "Sf-bold",
                fontSize: 20,
              }}
            />
          </PressableScale>
        </Form.FormItem>
        <Form.Text
          systemImage={{ name: "paperplane.fill", color: AC.systemBlue }}
          hint={requestLabel}
        >
          Leading content text
        </Form.Text>
      </Form.Section>
    </>
  );
}

function LoadingSpinner() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 400,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width={20}
        height={20}
        viewBox="0 0 18 18"
        fill="none"
        accessibilityLabel="Loading Spinner"
      >
        <Circle
          cx="9"
          cy="9"
          r="7"
          stroke="#ffffff"
          strokeOpacity={0.2}
          strokeWidth="2.5"
        />
        <Path
          d="M16 9C16 5.13401 12.866 2 9 2"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}
