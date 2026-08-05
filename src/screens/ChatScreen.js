import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/hooks/supabase";
import BitmojiButton from "../components/bitmojiButton";

const YELLOW = "#FFFC00";
const BLUE = "#0EADFF";
const RED = "#F23B4F";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread", badge: 3 },
  { key: "groups", label: "Groups" },
  { key: "stories", label: "Stories", badge: 1 },
  { key: "new", label: "New" },
];

const MESSAGE_TABLE = "messages";

function formatRelativeTime(timestamp, now = Date.now()) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const difference = Math.max(0, now - date.getTime());

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getDaysQuiet(timestamp) {
  if (!timestamp) return null;

  return Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 86400000,
  );
}

function getMessageStatus(message, currentUserId) {
  if (!message) return null;

  const sentByMe = message.sender_id === currentUserId;
  const isSnap = Boolean(message.media_url);
  const isOpened = message.opened === true;
  const color = isSnap ? RED : BLUE;

  if (sentByMe) {
    return {
      text: isOpened ? "Opened" : "Delivered",
      color,
      hollow: isOpened,
    };
  }

  if (isOpened) {
    return {
      text: "Opened",
      color,
      hollow: true,
    };
  }

  return {
    text: isSnap ? "New Snap" : "New Chat",
    color,
    hollow: false,
  };
}

export default function ChatScreen() {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [opening, setOpening] = useState(null);
  const [now, setNow] = useState(Date.now());

  const loadChats = useCallback(async (id, showLoader = false) => {
    if (!id) return;

    if (showLoader) {
      setLoading(true);
    }

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, userName, bitmojiUrl")
        .neq("id", id)
        .limit(20);

      if (profilesError) throw profilesError;

      const { data: chats, error: chatsError } = await supabase
        .from("chats")
        .select("id, user_a, user_b")
        .or(`user_a.eq.${id},user_b.eq.${id}`);

      if (chatsError) throw chatsError;

      const chatIds = (chats ?? []).map((chat) => chat.id);

      let messages = [];

      if (chatIds.length > 0) {
        const { data, error: messagesError } = await supabase
          .from(MESSAGE_TABLE)
          .select(`
            id,
            chat_id,
            created_at,
            sender_id,
            media_url,
            opened
          `)
          .in("chat_id", chatIds)
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;

        messages = data ?? [];
      }

      const latestMessageByChat = new Map();

      messages.forEach((message) => {
        if (!latestMessageByChat.has(message.chat_id)) {
          latestMessageByChat.set(message.chat_id, message);
        }
      });

      const chatByFriend = new Map();

      (chats ?? []).forEach((chat) => {
        const friendId =
          chat.user_a === id ? chat.user_b : chat.user_a;

        const latestMessage =
          latestMessageByChat.get(chat.id) ?? null;

        chatByFriend.set(friendId, {
          chatId: chat.id,
          latestMessage,
          lastActivityAt: latestMessage?.created_at ?? null,
        });
      });

      const rows = (profiles ?? [])
        .map((profile) => {
          const chatInfo = chatByFriend.get(profile.id);

          return {
            ...profile,
            chatId: chatInfo?.chatId ?? null,
            latestMessage: chatInfo?.latestMessage ?? null,
            lastActivityAt: chatInfo?.lastActivityAt ?? null,
          };
        })
        .sort((a, b) => {
          if (!a.lastActivityAt && !b.lastActivityAt) {
            return (a.userName || a.email || "").localeCompare(
              b.userName || b.email || "",
            );
          }

          if (!a.lastActivityAt) return 1;
          if (!b.lastActivityAt) return -1;

          return (
            new Date(b.lastActivityAt).getTime() -
            new Date(a.lastActivityAt).getTime()
          );
        });

      setFriends(rows);
    } catch (error) {
      console.log("[chat] load failed:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const id = session?.user?.id ?? null;

        if (!active) return;

        setUserId(id);
        await loadChats(id, true);
      } catch (error) {
        console.log("[chat] session load failed:", error.message);
        setLoading(false);
      }
    };

    start();

    return () => {
      active = false;
    };
  }, [loadChats]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) return undefined;

    const channel = supabase
      .channel(`chat-list-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: MESSAGE_TABLE,
        },
        () => {
          setNow(Date.now());
          loadChats(userId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadChats, userId]);

  const getOrCreateChat = async (friendId) => {
    const { data: existing, error } = await supabase
      .from("chats")
      .select("id")
      .or(
        `and(user_a.eq.${userId},user_b.eq.${friendId}),` +
          `and(user_a.eq.${friendId},user_b.eq.${userId})`,
      )
      .maybeSingle();

    if (error) throw error;

    if (existing) {
      return existing.id;
    }

    const { data: created, error: createError } = await supabase
      .from("chats")
      .insert({
        user_a: userId,
        user_b: friendId,
      })
      .select("id")
      .single();

    if (createError) throw createError;

    return created.id;
  };

  const openChat = async (friend) => {
    if (opening || !userId) return;

    setOpening(friend.id);

    try {
      const chatId =
        friend.chatId ?? (await getOrCreateChat(friend.id));

      navigation.navigate("Conversation", {
        chatId,
        name: friend.userName || friend.email,
        avatarUrl: friend.bitmojiUrl,
      });
    } catch (error) {
      console.log("[chat] could not open chat:", error.message);
    } finally {
      setOpening(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BitmojiButton
          onPress={() => navigation.navigate("Profile")}
        />

        <TouchableOpacity style={styles.headerCircle}>
          <Ionicons name="search" size={20} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chat</Text>

        <TouchableOpacity style={styles.headerCircle}>
          <Ionicons name="person-add" size={18} color="#111" />

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>5</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerCircle}>
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((item) => {
          const active = filter === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filter,
                active && styles.filterActive,
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>

              {item.badge ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          color="#8E8E93"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {friends.map((friend) => {
            const daysQuiet = getDaysQuiet(
              friend.lastActivityAt,
            );

            const stale =
              daysQuiet !== null && daysQuiet >= 3;

            return (
              <ChatRow
                key={friend.id}
                name={friend.userName || friend.email}
                avatarUrl={friend.bitmojiUrl}
                stale={stale}
                daysQuiet={daysQuiet}
                latestMessage={friend.latestMessage}
                currentUserId={userId}
                relativeTime={formatRelativeTime(
                  friend.lastActivityAt,
                  now,
                )}
                hasConversation={Boolean(friend.chatId)}
                busy={opening === friend.id}
                onPress={() => openChat(friend)}
              />
            );
          })}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ChatRow({
  name,
  avatarUrl,
  stale,
  daysQuiet,
  latestMessage,
  currentUserId,
  relativeTime,
  hasConversation,
  busy,
  onPress,
}) {
  const status = getMessageStatus(
    latestMessage,
    currentUserId,
  );

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={busy}
    >
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>

      <View style={styles.rowText}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <View style={styles.statusLine}>
          {stale ? (
            <>
              <View style={styles.statusSquareHollow} />

              <Text style={styles.statusMuted}>
                You haven't chatted in {daysQuiet} days
              </Text>
            </>
          ) : hasConversation && status ? (
            <>
              <View
                style={
                  status.hollow
                    ? [
                        styles.dynamicStatusSquareHollow,
                        { borderColor: status.color },
                      ]
                    : [
                        styles.statusSquare,
                        { backgroundColor: status.color },
                      ]
                }
              />

              <Text
                style={[
                  styles.statusText,
                  { color: status.color },
                ]}
              >
                {status.text}
              </Text>

              {relativeTime ? (
                <Text style={styles.statusTime}>
                  {" "}
                  · {relativeTime}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.statusMuted}>
              Tap to start chatting
            </Text>
          )}
        </View>
      </View>

      {busy ? (
        <ActivityIndicator
          size="small"
          color="#8E8E93"
        />
      ) : stale ? (
        <TouchableOpacity
          style={styles.checkIn}
          onPress={onPress}
        >
          <Text style={styles.checkInText}>
            Check In? ▶
          </Text>
        </TouchableOpacity>
      ) : (
        <Ionicons
          name="camera-outline"
          size={24}
          color="#8E8E93"
        />
      )}
    </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  headerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  headerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  filters: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },

  filter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  filterActive: {
    backgroundColor: "#E5F4FF",
  },

  filterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A4A4F",
  },

  filterTextActive: {
    color: "#111",
  },

  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1B3A5C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  loader: {
    marginTop: 30,
  },

  list: {
    paddingBottom: 140,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E9",
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E4E4E9",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#C7C7CC",
  },

  rowText: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  statusSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },

  statusSquareHollow: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: RED,
    marginRight: 6,
  },

  dynamicStatusSquareHollow: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    marginRight: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },

  statusMuted: {
    fontSize: 14,
    color: "#8E8E93",
  },

  statusTime: {
    fontSize: 14,
    color: "#8E8E93",
  },

  checkIn: {
    backgroundColor: YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },

  checkInText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 110,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
});