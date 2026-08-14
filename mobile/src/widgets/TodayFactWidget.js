// The JSX rendered inside the "Fact of the Day" Android home-screen widget.
// Mirrors TodayVerseWidget's layout/colors exactly (see that file for why
// it's deliberately simple and brand-colored rather than theme-aware) — the
// two widgets should read as a matched pair, just with a different label
// and content source.

import * as React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

const COLORS = {
  bg: "#f9f0d8",
  border: "#e9dbb0",
  sageDark: "#56705f",
  text: "#3a3a34",
  textSoft: "#6b6a63",
};

export function TodayFactWidget({ factText }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Today's fact: ${factText}. Tap to open Barnabas Journal.`}
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: COLORS.bg,
        borderRadius: 20,
        padding: 16,
      }}
    >
      <TextWidget
        text="DID YOU KNOW?"
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: COLORS.sageDark,
          letterSpacing: 1,
        }}
      />
      <TextWidget
        text={factText}
        maxLines={5}
        truncate="END"
        style={{
          fontSize: 14,
          color: COLORS.text,
          marginTop: 6,
          lineHeight: 19,
        }}
      />
    </FlexWidget>
  );
}
