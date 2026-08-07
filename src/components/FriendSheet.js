import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const PURPLE = "#B69CFF";
const BLUE = "#4FA8FF";

// friend management sheet opened by long-pressing a row in the chat list.
// only Check-in mode actually does anything — every other row here is
// visual only, matching the real Snapchat sheet without being wired up
export default function FriendSheet({
  visible,
  friend,
  checkInEnabled,
  onToggleCheckIn,
  onClose,
}) {
  if (!friend) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <SafeAreaView edges={["bottom"]}>
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.avatar}>
                  {friend.avatarUrl ? (
                    <Image
                      source={{ uri: friend.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {(friend.name || "?")[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.name}>{friend.name}</Text>
                  <Text style={styles.viewFriendship}>View Friendship</Text>
                </View>

                <Text style={styles.ghost}>👻</Text>
                <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionPill}>
                  <Ionicons name="camera" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPill}>
                  <Ionicons name="chatbubble" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPill}>
                  <Ionicons name="call" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPill}>
                  <Ionicons name="videocam" size={20} color="#111" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.card, styles.settingsCard]}>
              {/* the only row that's actually wired up — switch pinned to
                  the far right edge via the row's space-between layout */}
              <Row
                label="Check-in mode"
                right={
                  <Switch
                    value={checkInEnabled}
                    onValueChange={onToggleCheckIn}
                    trackColor={{ false: "#E4E4E9", true: PURPLE }}
                  />
                }
              />
              <Row
                label="Pin as your #1 BFF"
                right={<View style={styles.emptyCircle} />}
              />
              <Row label="Manage Friendship" right={<Chevron />} />
              <Row label="Chat Settings" right={<Chevron />} />
              <Row label="Story Settings" right={<Chevron />} />
              <Row label="Location Settings" right={<Chevron />} />
              <Row
                label="Privacy Settings"
                subtitle="My Story"
                right={<Chevron />}
              />
              <Row
                label="Send Profile To..."
                right={
                  <View style={styles.sendButton}>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </View>
                }
                isLast
              />
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Chevron() {
  return <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />;
}

// every settings row shares this shape: label (+ optional subtitle) on
// the left, whatever control on the right, pinned to the far edge
function Row({ label, subtitle, right, isLast }) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.rowLabelBlock}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  sheet: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E4E4E9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 10,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8E8E93",
  },

  headerText: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  viewFriendship: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },

  ghost: {
    fontSize: 20,
    marginRight: 4,
  },

  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 10,
  },

  actionPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  settingsCard: {
    paddingVertical: 2,
  },

  // label on the left, control pinned to the far right edge — this is
  // what keeps the Check-in mode switch "to the side"
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E9",
  },

  rowLabelBlock: {
    flex: 1,
    marginRight: 12,
  },

  rowLabel: {
    fontSize: 17,
    color: "#111",
  },

  rowSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },

  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
  },

  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  doneButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  doneText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
});