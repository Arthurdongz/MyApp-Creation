// The JSX rendered inside the Android home-screen widget. Deliberately
// simple (FlexWidget/TextWidget only, no images) since this is a small,
// glanceable surface, not a mini version of the app. Uses fixed brand
// colors rather than following in-app light/dark mode — home-screen
// widgets are commonly styled to match the app's brand rather than the
// system theme, and it keeps this first version simpler.

import * as React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

const COLORS = {
  bg: "#eef4ea",
  border: "#d8e4d0",
  sageDark: "#56705f",
  text: "#3a3a34",
  textSoft: "#6b6a63",
};

export function TodayVerseWidget({ verseText, verseRef }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Today's verse: ${verseText} — ${verseRef}. Tap to open Barnabas Journal.`}
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
        text="TODAY'S VERSE"
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: COLORS.sageDark,
          letterSpacing: 1,
        }}
      />
      <TextWidget
        text={verseText}
        maxLines={4}
        truncate="END"
        style={{
          fontSize: 14,
          color: COLORS.text,
          marginTop: 6,
          lineHeight: 19,
        }}
      />
      <TextWidget
        text={verseRef}
        style={{
          fontSize: 11,
          color: COLORS.textSoft,
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}
