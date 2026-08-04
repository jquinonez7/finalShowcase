import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Bottom row that holds whatever buttons get passed into it.
 *
 * Purely a container, no buttons of its own. Each child styles itself,
 * this only handles position and spacing.
 *
 * <BottomBar>
 *   <SaveToHub />
 *   <SendButton />
 * </BottomBar>
 */
export default function BottomBar({ children, style }) {
  return <View style={[styles.bar, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
   position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 20,
    backgroundColor: "rgba(47, 45, 45)",
  },
});