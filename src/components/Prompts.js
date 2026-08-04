import React, { useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";

const PROMPTS = [
    "What made you smile today, even for a second?",
    "What's a truth you've been avoiding lately?",
    "What's on your mind right now?",
];
const MOODS = [
    { key: "sad", emoji: "🙁", color: "#B8DDD4" },
    { key: "happy", emoji: "🙂", color: "#FFD84D" },
    { key: "great", emoji: "😄", color: "#CDB8FF" },
    { key: "meh", emoji: "😐", color: "#D6E04D" },
    { key: "low", emoji: "😞", color: "#A8C8E8" },
];

export default function Prompts() {
    return (
        <View style={styles.container}>
      {MOODS.map((mood) => (
        <TouchableOpacity
          key={mood.key}
          style={[
            styles.button,
            { backgroundColor: mood.color },
            selectedMood === mood.key && styles.selected,
          ]}
          onPress={() => setSelectedMood(mood.key)}
        >
          <Text style={styles.emoji}>{mood.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#fbff0b",
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 24,
    },

    text: {
        color: "#090909",
        fontWeight: "800",
    },
});