import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const GHOST_LOGO = require("../../assets/snapchat/ghostlogo.png");

/**
 * Normal / Journal switch, pinned to the left edge of the camera as two
 * stacked icon buttons — ghost for Normal, book for Journal — instead of
 * a text pill.
 */
export default function ToggleMode({
  activeSwitch = 1,
  accentColor = "#FFFC00",
  onChange,
  top = 110,
}) {
  return (
    // box-none so the wrapper doesnt eat taps meant for the camera
    <View style={[styles.wrapper, { top }]} pointerEvents="box-none">
      <Pressable
        style={[
          styles.option,
          activeSwitch === 1 && { backgroundColor: accentColor },
        ]}
        onPress={() => onChange?.(1)}
      >
        <Image source={GHOST_LOGO} style={styles.ghost} resizeMode="contain" />
      </Pressable>

      <Pressable
        style={[
          styles.option,
          styles.journalOption,
          activeSwitch === 2 && { backgroundColor: accentColor },
        ]}
        onPress={() => onChange?.(2)}
      >
        <Ionicons name="book-outline" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    gap: 10,
  },

  option: {
    width: 56,
    height: 70,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  journalOption: {
    height: 64,
  },

  ghost: {
    width: 28,
    height: 28,
  },
});