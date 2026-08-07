import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../utils/hooks/supabase";
import { markSnapOpened, markMessagesOpened } from "../../utils/hooks/chats";

const SELF_ACCENT = "#FF2D55"; // red, "ME"
const OTHER_ACCENT = "#00B7FF"; // blue, everyone else
const SNAP_COLOR = "#FF2D55"; // real Snapchat colors snaps by content type, not sender

// groups messages under a day label instead of stamping every message
function dayLabel(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, now)) return "TODAY";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(date, yesterday)) return "YESTERDAY";

  return date.toLocaleDateString([], { weekday: "long" }).toUpperCase();
}

/**
 * Which status icon a snap gets.
 *
 * Arrows are things you sent, squares are things you received. Filled
 * means unopened, hollow means its been seen.
 */
function statusIcon(isSelf, opened) {
  if (isSelf) return opened ? "send-outline" : "send";
  return opened ? "square-outline" : "square";
}

// your own say Delivered, since theres nothing for you to open
function snapLabel(isSelf, opened) {
  if (opened) return "Opened";
  return isSelf ? "Delivered" : "Tap to view";
}

// one to one chat. route.params: { chatId, name?, avatarUrl?, showCheckInPrompt? }
export default function ConversationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { chatId, name, avatarUrl, showCheckInPrompt } = route.params ?? {};

  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  // the snap currently open full screen, null when nothing is
  const [viewing, setViewing] = useState(null);

  const listRef = useRef(null);

  // who is sending, so messages can be split into mine and theirs
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("[chat] user fetch failed:", error.message);
        return;
      }
      setCurrentUserId(data?.user?.id ?? null);
    };

    fetchUser();
  }, []);

  // the join pulls each sender's name alongside the message
  const fetchMessages = async () => {
    if (!chatId) return;

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, content, media_url, prompt_text, opened, sender_id, created_at, " +
          "profiles:sender_id(userName, email, bitmojiUrl)",
      )
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("[chat] messages query failed:", error.message);
      setMessages([]);
    } else {
      setMessages(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // live updates, so a message from the other device shows up without
  // pulling to refresh
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        // refetching is simpler than patching the profile join in by hand
        () => fetchMessages(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !currentUserId || !chatId || sending) return;

    setSending(true);
    // clear right away so it feels responsive
    setDraft("");

    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: currentUserId,
      content,
    });

    if (error) {
      console.log("[chat] send failed:", error.message);
      // put it back so nothing typed gets lost
      setDraft(content);
    } else {
      // dont wait on realtime to show your own message
      fetchMessages();
    }

    setSending(false);
  };

  // only ever called for someone else's snap, so this always marks read
  const openSnap = (message) => {
    setViewing(message);

    if (!message.opened) {
      markSnapOpened(message.id).then(fetchMessages);
    }
  };

  // text chats have no tap-to-reveal step, so just being in this thread
  // counts as opening them — snaps stay untouched, those need the tap above
  useEffect(() => {
    const unreadTextIds = messages
      .filter(
        (m) => m.sender_id !== currentUserId && !m.media_url && !m.opened,
      )
      .map((m) => m.id);

    if (unreadTextIds.length) {
      markMessagesOpened(unreadTextIds).then(fetchMessages);
    }
  }, [messages, currentUserId]);

  // day dividers interleaved with the messages, so the list can render
  // both from one array
  const rows = messages.reduce((acc, message, i) => {
    const label = dayLabel(message.created_at);
    const previous = i > 0 ? dayLabel(messages[i - 1].created_at) : null;

    if (label !== previous) {
      acc.push({ type: "divider", id: `divider-${message.id}`, label });
    }

    acc.push({ type: "message", ...message });
    return acc;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.headerAvatarImage}
            />
          ) : (
            <Text style={styles.headerInitial}>
              {(name || "?")[0].toUpperCase()}
            </Text>
          )}
        </View>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {name || "Chat"}
        </Text>

        <TouchableOpacity style={styles.headerAction} hitSlop={6}>
          <Ionicons name="call-outline" size={20} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction} hitSlop={6}>
          <Ionicons name="videocam-outline" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      {/* only shows up when you arrived here via the "Check In?" button,
          not just because check-in mode happens to be on for this friend */}
      {showCheckInPrompt && (
        <View style={styles.checkInBanner}>
          <Text style={styles.checkInBannerText}>
            Haven't checked in with {name} recently? Send them a quick “How's
            your week treating you?”
          </Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        // keeps the newest message in view as they arrive
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => {
          if (item.type === "divider") {
            return <Text style={styles.dividerText}>{item.label}</Text>;
          }

          const isSelf = item.sender_id === currentUserId;
          const isSnap = Boolean(item.media_url);
          const accent = isSelf ? SELF_ACCENT : OTHER_ACCENT;
          const sender = isSelf
            ? "Me"
            : item.profiles?.userName || item.profiles?.email || "Someone";

          return (
            <View style={styles.messageBlock}>
              {/* uppercase, in the sender's own color */}
              <Text style={[styles.senderName, { color: accent }]}>
                {sender.toUpperCase()}
              </Text>

              <View style={styles.messageRow}>
                {/* the colored bar is what tells the two sides apart */}
                <View style={[styles.accentBar, { backgroundColor: accent }]} />

                {isSnap ? (
                  // a snap. shows as a card rather than the photo itself,
                  // so it has to be opened. your own are inert, theres
                  // nothing left to reveal
                  <Pressable
                    style={styles.snapCard}
                    onPress={isSelf ? undefined : () => openSnap(item)}
                    disabled={isSelf}
                  >
                    <Ionicons
                      name={statusIcon(isSelf, item.opened)}
                      size={20}
                      color={SNAP_COLOR}
                      style={styles.snapIcon}
                    />

                    <View style={styles.snapText}>
                      <Text style={styles.snapLabel}>
                        {snapLabel(isSelf, item.opened)}
                      </Text>
                      {item.prompt_text ? (
                        <Text style={styles.snapPrompt} numberOfLines={2}>
                          {item.prompt_text}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                ) : (
                  <Text style={styles.messageText}>{item.content}</Text>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? "Loading messages..." : "No messages yet — say hi 👋"}
          </Text>
        }
      />

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <View style={styles.inputPill}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Send a chat"
            placeholderTextColor="#8E8E93"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            // keeps the keyboard up between messages
            blurOnSubmit={false}
          />
          <TouchableOpacity hitSlop={6}>
            <Ionicons name="mic-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconButton} hitSlop={6}>
          <Ionicons name="happy-outline" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} hitSlop={6}>
          <Ionicons name="albums-outline" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* full screen snap, tap anywhere to close */}
      <Modal
        visible={Boolean(viewing)}
        animationType="fade"
        onRequestClose={() => setViewing(null)}
      >
        <Pressable style={styles.viewer} onPress={() => setViewing(null)}>
          {viewing?.media_url ? (
            <Image
              source={{ uri: viewing.media_url }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          ) : null}

          {/* the prompt it was answering, so the snap has context */}
          {viewing?.prompt_text ? (
            <View style={[styles.viewerPrompt, { top: insets.top + 20 }]}>
              <Text style={styles.viewerPromptText}>{viewing.prompt_text}</Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },

  back: {
    padding: 2,
    marginRight: 6,
  },

  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerAvatarImage: {
    width: "100%",
    height: "100%",
  },

  // stands in when theres no bitmoji
  headerInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8E8E93",
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },

  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  checkInBanner: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },

  checkInBannerText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    fontStyle: "italic",
  },

  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },

  empty: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 40,
  },

  // just centered text, no rules either side
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B0B0B5",
    letterSpacing: 0.8,
    textAlign: "center",
    marginVertical: 14,
  },

  messageBlock: {
    marginBottom: 14,
  },

  senderName: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 3,
    marginLeft: 14,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingRight: 14,
  },

  // runs the full height of whatever sits beside it
  accentBar: {
    width: 3,
    marginRight: 10,
    marginLeft: 11,
  },

  messageText: {
    fontSize: 16,
    color: "#000",
    flexShrink: 1,
    paddingTop: 1,
  },

  // wide, faint bordered card, the way snapchat draws an unopened snap
  snapCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  snapIcon: {
    marginRight: 12,
  },

  snapText: {
    flex: 1,
  },

  snapLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },

  snapPrompt: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 3,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#fff",
  },

  // grey circle rather than black, matching the newer snapchat bar
  cameraButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F4",
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 12,
    height: 38,
    marginRight: 6,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },

  iconButton: {
    paddingHorizontal: 5,
  },

  viewer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  viewerImage: {
    width: "100%",
    height: "100%",
  },

  viewerPrompt: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  viewerPromptText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});