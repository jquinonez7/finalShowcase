import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

// hold past this and it records instead of taking a photo
export const HOLD_THRESHOLD_MS = 250;

const SCREEN_W = Dimensions.get("window").width;

// every mood gets a slot this wide, so scrolling one slot moves exactly
// one mood into the ring
const SLOT = 92;
// padding so the first and last mood can still reach the middle
const SIDE_PAD = SCREEN_W / 2 - SLOT / 2;

const RESTING_SIZE = 56;
// the centered one is bigger, since it doubles as the shutter
const ACTIVE_SIZE = 78;
const RING_STROKE = 5;

// how far left the finger has to travel before recording locks
const LOCK_DISTANCE = 90;

// the press area is only as wide as the circle, so sliding left would
// leave it and cancel the press before the lock ever triggers. this
// stretches the area out so the slide stays inside it
const SLIDE_SLOP = { left: 260, right: 260, top: 140, bottom: 140 };

const MOODS = [
  { key: "low", emoji: "😞", color: "#A8C8E8" },
  { key: "sad", emoji: "🙁", color: "#B8DDD4" },
  { key: "happy", emoji: "🙂", color: "#FFD84D" },
  { key: "great", emoji: "😄", color: "#CDB8FF" },
  { key: "meh", emoji: "😐", color: "#D6E04D" },
];

// starts on happy, so theres something to scroll to either side
const START_INDEX = 2;

/**
 * The mood picker and the shutter, merged. Whichever mood is centered
 * is the one selected, and tapping it captures.
 *
 * Tap the centered mood for a photo, hold for video, and slide left
 * while holding to lock the recording so you can let go.
 *
 * state: "idle" | "pressed" | "recording"
 */
export default function MoodShutter({
  state,
  accentColor = "#FFFC00",
  onMoodChange,
  onCapture,
  onRecordStart,
  onRecordStop,
}) {
  const [index, setIndex] = useState(START_INDEX);
  // true once the finger has slid far enough left to hold the recording
  const [locked, setLocked] = useState(false);

  const scrollRef = useRef(null);
  // mirrors index so the scroll handler can compare without the state
  // value being stale inside the callback
  const indexRef = useRef(START_INDEX);
  // where the finger went down, so the slide is measured relative to it
  const touchStartXRef = useRef(0);
  // read inside touch handlers, where state would be stale
  const lockedRef = useRef(false);

  const isRecording = state === "recording";

  // recording ended, so drop the lock ready for next time
  useEffect(() => {
    if (!isRecording && lockedRef.current) {
      lockedRef.current = false;
      setLocked(false);
    }
  }, [isRecording]);

  const select = (next) => {
    // only re-render when the centered mood actually changed, otherwise
    // this fires on every scroll frame
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onMoodChange?.(MOODS[next].key);
  };

  // runs while the finger is still moving, so the circle grows as the
  // mood reaches the middle rather than after the scroll settles
  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SLOT);
    select(Math.max(0, Math.min(MOODS.length - 1, next)));
  };

  // tapping an off-center mood brings it into the ring rather than
  // selecting it where it sits
  const scrollTo = (next) => {
    scrollRef.current?.scrollTo({ x: next * SLOT, animated: true });
    select(next);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.nativeEvent.pageX;
  };

  // watches the finger slide left far enough to lock
  const handleTouchMove = (e) => {
    if (!isRecording || lockedRef.current) return;

    const travelled = touchStartXRef.current - e.nativeEvent.pageX;
    if (travelled > LOCK_DISTANCE) {
      lockedRef.current = true;
      setLocked(true);
    }
  };

  // a locked recording ignores the release and waits for a tap instead
  const handlePressOut = () => {
    if (lockedRef.current) return;
    onRecordStop?.();
  };

  // once locked the centered circle becomes a stop button
  const handlePress = () => {
    if (locked) {
      onRecordStop?.();
      return;
    }
    onCapture?.();
  };

  return (
    <View style={styles.container}>
      {/* the hint slides in during recording and turns solid once locked */}
      {isRecording && (
        <View style={[styles.lockHint, locked && styles.lockHintActive]}>
          <Text style={styles.lockText}>{locked ? "🔒" : "◀ 🔓"}</Text>
        </View>
      )}

      {/* the ring never moves, the moods scroll underneath it */}
      <View
        style={[styles.ring, isRecording && { borderColor: accentColor }]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        // snapping to one slot is what lands a mood dead center
        snapToInterval={SLOT}
        decelerationRate="fast"
        contentOffset={{ x: START_INDEX * SLOT, y: 0 }}
        contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
        onScroll={handleScroll}
        // every frame, so the swap keeps up with the finger
        scrollEventThrottle={16}
        // recording locks the scroll so the mood cant change mid capture
        scrollEnabled={!isRecording}
      >
        {MOODS.map((mood, i) => {
          const active = i === index;
          const size = active ? ACTIVE_SIZE : RESTING_SIZE;

          return (
            <View key={mood.key} style={styles.slot}>
              <Pressable
                style={[
                  styles.mood,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: isRecording ? accentColor : mood.color,
                  },
                  // the others fade out while recording, but stay mounted
                  // so the scroll offset doesnt jump
                  isRecording && !active && styles.moodHidden,
                ]}
                // only the centered mood captures, the rest scroll in
                onPress={active ? handlePress : () => scrollTo(i)}
                onLongPress={active ? onRecordStart : undefined}
                onPressOut={active ? handlePressOut : undefined}
                onTouchStart={active ? handleTouchStart : undefined}
                onTouchMove={active ? handleTouchMove : undefined}
                // only while recording, so a normal tap keeps a normal
                // sized target
                hitSlop={active && isRecording ? SLIDE_SLOP : undefined}
                delayLongPress={HOLD_THRESHOLD_MS}
              >
                <Text style={active ? styles.emojiActive : styles.emoji}>
                  {mood.emoji}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: "center",
    marginBottom: 40,
  },

  // sits left of the ring, where the finger is sliding toward
  lockHint: {
    position: "absolute",
    left: SCREEN_W / 2 - LOCK_DISTANCE - 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 3,
  },

  lockHintActive: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },

  lockText: {
    fontSize: 16,
    color: "#fff",
  },

  // fixed in the middle, marks whichever mood is selected
  ring: {
    position: "absolute",
    alignSelf: "center",
    width: ACTIVE_SIZE + 18,
    height: ACTIVE_SIZE + 18,
    borderRadius: (ACTIVE_SIZE + 18) / 2,
    borderWidth: RING_STROKE,
    borderColor: "#fff",
    zIndex: 2,
  },

  // fixed width so the snap interval always moves exactly one mood
  slot: {
    width: SLOT,
    alignItems: "center",
    justifyContent: "center",
  },

  mood: {
    alignItems: "center",
    justifyContent: "center",
  },

  moodHidden: {
    opacity: 0,
  },

  emoji: {
    fontSize: 26,
  },

  emojiActive: {
    fontSize: 36,
  },
});