import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const YELLOW = "#FFFC00";

const PROMPTS = [
  "What made you smile today, even for a second?",
  "What's a truth you've been avoiding lately?",
  "What's on your mind right now?",
];

// prompt picker shown over the camera in journal mode. mood lives on
// the shutter now, so this only handles the question
export default function Prompts({ onStart }) {
  const [selected, setSelected] = useState(null);

  return (
    // box-none so taps on empty space still reach the camera behind
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.prompts}>
        {PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={[styles.prompt, selected === prompt && styles.promptSelected]}
            onPress={() => setSelected(prompt)}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* greyed out until a prompt is picked */}
      <TouchableOpacity
        style={[styles.start, !selected && styles.startDisabled]}
        disabled={!selected}
        onPress={() => onStart?.(selected)}
      >
        <Text style={styles.startText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },

  prompts: {
    paddingHorizontal: 16,
     marginTop: 100, 
  },

  // translucent so the camera reads through the card
  prompt: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: "center",
  },

  promptSelected: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 2,
    borderColor: YELLOW,
  },

  promptText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  start: {
    alignSelf: "center",
    backgroundColor: YELLOW,
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 26,
    marginTop: 12,
  },

  startDisabled: {
    opacity: 0.4,
  },

  startText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "800",
  },
});