import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

// Dispatches to whichever @expo/vector-icons set a given icon spec names.
// Ionicons covers almost everything; a couple of symbols central to the
// app's identity (the handshake, the dove) only exist as a good literal
// match in FontAwesome5, and the "steady companion" candle only in
// MaterialCommunityIcons — this lets data (e.g. storage.js's BADGE_DEFS)
// name an icon without every call site needing to know which set it's in.
const ICON_SETS = {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
};

export default function AppIcon({ set = "Ionicons", name, size = 20, color, style, solid }) {
  const IconComponent = ICON_SETS[set] || Ionicons;
  // Only FontAwesome5 has a "solid" prop — passing it to the others would
  // just forward as an unrecognized prop onto their underlying <Text>.
  const extraProps = set === "FontAwesome5" ? { solid } : {};
  return <IconComponent name={name} size={size} color={color} style={style} {...extraProps} />;
}
