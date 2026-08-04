import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import SwitchButton from "switch-button-react-native";

const YELLOW = "#FFFC00";

/**
 * Normal / Journal mode toggle, pinned near the top of the camera.
 *
 * onChange gets 1 for normal and 2 for journal, matching the library's
 * own numbering.
 */
export default function ToggleMode({ activeSwitch = 1, onChange, top = 110 }) {
  return (
    <View style={[styles.container, { top }]} pointerEvents="box-none">
      <SwitchButton
        onValueChange={onChange}
        text1="Normal"
        text2="Journal"
        switchWidth={200}
        switchHeight={40}
        switchdirection="ltr"
        switchBorderRadius={100}
        switchSpeedChange={250}
        switchBorderColor="transparent"
        switchBackgroundColor="rgba(0,0,0,0.35)"
        btnBorderColor="#FFFC00"
        btnBackgroundColor="#FFFC00"
        fontColor="#fff"
        activeFontColor="#111"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});