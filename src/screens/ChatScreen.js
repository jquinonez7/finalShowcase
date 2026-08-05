import React, { useEffect, useState } from "react";
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

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread", badge: 3 },
  { key: "groups", label: "Groups" },
  { key: "stories", label: "Stories", badge: 1 },
  { key: "new", label: "New" },
];

// stand in status lines until unread counts are real
const STATUSES = [
  { text: "New Snap", color: "#F23B4F" },
  { text: "Received", color: "#F23B4F" },
  { text: "New Chat", color: BLUE },
  { text: "Opened", color: BLUE },
];

// how many rows get the check in nudge
const STALE_COUNT = 2;

export default function ChatScreen() {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  // which row is being opened, so it can show a spinner
  const [opening, setOpening] = useState(null);

  // fetches your user id and every other profile in the database
  // puts those in the list as your "friends
  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const id = session?.user?.id ?? null;
        setUserId(id);

        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, userName, bitmojiUrl")
          .neq("id", id ?? "")
          .limit(20);

        if (error) throw error;
        setFriends(data ?? []);
      } catch (error) {
        console.log("[chat] load failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /**
   * Finds the chat between you and this friend, creating one if you
   * have never spoken. 
   */
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
    if (existing) return existing.id;

    // first time these two have opened a chat
    const { data: created, error: createError } = await supabase
      .from("chats")
      .insert({ user_a: userId, user_b: friendId })
      .select("id")
      .single();

    if (createError) throw createError;
    return created.id;
  };

  const openChat = async (friend) => {
    if (opening || !userId) return;
    setOpening(friend.id);

    try {
      const chatId = await getOrCreateChat(friend.id);

      navigation.navigate("Conversation", {
        chatId,
        // passed through so the header can render before the messages
        // query has come back
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
        <BitmojiButton onPress={() => navigation.navigate("Profile")} />

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
          <Ionicons name="ellipsis-horizontal" size={18} color="#111" />
        </TouchableOpacity>
      </View>

      {/* filter row, visual only for now */}
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
              style={[styles.filter, active && styles.filterActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {item.label}
              </Text>

              {item.badge ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{item.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#8E8E93" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {friends.map((friend, i) => (
            <ChatRow
              key={friend.id}
              name={friend.userName || friend.email}
              avatarUrl={friend.bitmojiUrl}
              // the first couple get the nudge, the rest get a status
              stale={i < STALE_COUNT}
              daysQuiet={i + 3}
              status={STATUSES[i % STATUSES.length]}
              busy={opening === friend.id}
              onPress={() => openChat(friend)}
            />
          ))}
        </ScrollView>
      )}

      {/* floating new chat button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// one row: avatar, name, status line, and either a nudge or a camera
function ChatRow({ name, avatarUrl, stale, daysQuiet, status, busy, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={busy}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
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
              {/* hollow square, the "waiting on you" marker */}
              <View style={styles.statusSquareHollow} />
              <Text style={styles.statusMuted}>
                You haven't chatted in {daysQuiet} days
              </Text>
            </>
          ) : (
            <>
              <View
                style={[styles.statusSquare, { backgroundColor: status.color }]}
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
              <Text style={styles.statusTime}> · 2h</Text>
            </>
          )}
        </View>
      </View>

      {busy ? (
        <ActivityIndicator size="small" color="#8E8E93" />
      ) : stale ? (
        <TouchableOpacity style={styles.checkIn} onPress={onPress}>
          <Text style={styles.checkInText}>Check In? ▶</Text>
        </TouchableOpacity>
      ) : (
        <Ionicons name="camera-outline" size={24} color="#8E8E93" />
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

  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E4E4E9",
  },

  headerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F1F4",
    alignItems: "center",
    justifyContent: "center",
  },

  // flex 1 so the title takes the middle and the icons sit either side
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
    backgroundColor: "#F23B4F",
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

  // room at the bottom so the last row clears the tab bar
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
    // clips the bitmoji into the circle
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

  // filled square, the unread marker
  statusSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },

  // hollow version, for a chat waiting on you
  statusSquareHollow: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#F23B4F",
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

  // the nudge on chats that have gone quiet
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

  // sits above the tab bar
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