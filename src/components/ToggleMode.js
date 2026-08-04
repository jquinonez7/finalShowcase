import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const OPTIONS = ["Normal", "Journal"];

/**
 * Normal / Journal pill, pinned near the top of the camera.
 *
 * Fully controlled: activeSwitch decides which side is lit, so the
 * parent can flip it from anywhere. 1 is Normal, 2 is Journal, matching
 * what the old library used.
 */
export default function ToggleMode({
  activeSwitch = 1,
  accentColor = "#FFFC00",
  onChange,
  top = 110,
}) {
  return (
    // box-none so the full width wrapper doesnt eat taps meant for the camera
    <View style={[styles.wrapper, { top }]} pointerEvents="box-none">
      <View style={styles.track}>
        {OPTIONS.map((label, i) => {
          // the library counted from 1, so index 0 is value 1
          const value = i + 1;
          const active = activeSwitch === value;

          return (
            <Pressable
              key={label}
              style={[
                styles.option,
                active && { backgroundColor: accentColor },
              ]}
              onPress={() => onChange?.(value)}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  // the dark pill the two options sit inside
  track: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 100,
    padding: 4,
  },

  option: {
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 100,
  },

  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // dark text since the accent colors are both light
  labelActive: {
    color: "#111",
  },
});