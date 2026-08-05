import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { supabase } from "../../utils/hooks/supabase";
import { saveDiaryEntry, uploadMedia } from "../../utils/hooks/diary";
import { sendSnapToFriend } from "../../utils/hooks/chats";

import Icon from "../../assets/Icon.png";

const BLUE = "#4FA8FF";
const YELLOW = "#FFFC00";

// saves privately to the hub rather than sending to anyone
const DIARY_HUB = "diary-hub";

// rows take an emoji in `icon` or a bundled image in `image`, not both
const STORIES = [
  {
    id: "my-story-friends",
    title: "My Story - Friends Only",
    subtitle: "Just for Friends",
    icon: "👥",
  },
  {
    id: "my-story-public",
    title: "My Story - Public",
    subtitle: "Friends, Followers, and Everyone",
    icon: "🌎",
  },
  {
    id: "dogs-daily",
    title: "Dogs Daily",
    subtitle: "Public Story",
    icon: "🐕",
  },
  {
    id: "snap-map",
    title: "Snap Map",
    subtitle: "Add your Snap to the Map!",
    icon: "📍",
  },
  {
    id: DIARY_HUB,
    title: "Diary Hub",
    subtitle: "Save privately to your hub",
    image: Icon,
  },
];

// send sheet pushed from the preview
// route.params: { photoUri?, videoUri?, promptText?, mood? }
export default function SendToScreen({ route, navigation }) {
  const { photoUri, videoUri, promptText, mood } = route.params ?? {};

  const [userId, setUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  // a Set so stories and friends can be picked in any mix
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");

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
        console.log("[sendto] load failed:", error.message);
      } finally {
        setLoadingFriends(false);
      }
    };

    load();
  }, []);

  const toggle = (id) => {
    setSelected((current) => {
      // copy rather than mutate, react compares by reference
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  const handleSend = async () => {
    if (sending || selected.size === 0 || !userId) return;
    setSending(true);

    try {
      const uri = photoUri || videoUri;
      if (!uri) throw new Error("nothing to send");

      // uploaded once and reused, so sending to five friends doesnt
      // upload the same photo five times
      const mediaUrl = await uploadMedia(uri, userId);

      if (selected.has(DIARY_HUB)) {
        await saveDiaryEntry({
          mediaUrl,
          privacyStatus: "private",
          promptText,
          mood,
        });
      }

      // anything selected that isnt a story is a friend
      const storyIds = STORIES.map((s) => s.id);
      const friendIds = [...selected].filter((id) => !storyIds.includes(id));

      // each one lands in that friend's chat as an unopened snap
      for (const friendId of friendIds) {
        await sendSnapToFriend({ userId, friendId, mediaUrl, promptText });
      }

      // the story rows still have nowhere to go
      const stories = [...selected].filter(
        (id) => storyIds.includes(id) && id !== DIARY_HUB,
      );
      if (stories.length) console.log("[sendto] not wired up:", stories);

      // past the preview, back to the camera
      navigation.popToTop();
    } catch (error) {
      console.log("[sendto] send failed:", error.message);
      Alert.alert("Couldn't send", "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  // what the chips at the bottom say
  const labelFor = (id) => {
    const story = STORIES.find((s) => s.id === id);
    if (story) return story.title;
    const friend = friends.find((f) => f.id === id);
    return friend?.userName || friend?.email || "Unknown";
  };

  const visibleFriends = friends.filter((friend) => {
    if (!query) return true;
    const name = friend.userName || friend.email || "";
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.chevron}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.chevronText}>⌄</Text>
        </TouchableOpacity>

        <View style={styles.search}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Send To..."
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* the prompt stays visible right up to sending */}
      {promptText ? (
        <View style={styles.promptBanner}>
          <Text style={styles.promptText} numberOfLines={2}>
            {promptText}
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Stories</Text>

        <View style={styles.card}>
          {STORIES.map((story, index) => (
            <Row
              key={story.id}
              title={story.title}
              subtitle={story.subtitle}
              icon={story.icon}
              localAvatar={story.image}
              selected={selected.has(story.id)}
              onPress={() => toggle(story.id)}
              isLast={index === STORIES.length - 1}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent</Text>

        {loadingFriends ? (
          <ActivityIndicator style={styles.loader} color="#8E8E93" />
        ) : (
          <View style={styles.card}>
            {visibleFriends.map((friend, index) => (
              <Row
                key={friend.id}
                title={friend.userName || friend.email}
                avatarUrl={friend.bitmojiUrl}
                selected={selected.has(friend.id)}
                onPress={() => toggle(friend.id)}
                isLast={index === visibleFriends.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* only shows once something is picked */}
      {selected.size > 0 && (
        <View style={styles.sendBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...selected].map((id) => (
              <TouchableOpacity
                key={id}
                style={styles.chip}
                onPress={() => toggle(id)}
              >
                <Text style={styles.chipText} numberOfLines={1}>
                  {labelFor(id)}
                </Text>
                <Text style={styles.chipClose}>✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#111" />
            ) : (
              <Text style={styles.sendArrow}>▶</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// one selectable line, shared by stories and friends
function Row({
  title,
  subtitle,
  icon,
  localAvatar,
  avatarUrl,
  selected,
  onPress,
  isLast,
}) {
  // bundled images pass straight through, urls need the {uri} wrapper
  const source = localAvatar ?? (avatarUrl ? { uri: avatarUrl } : null);

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowDivider]}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        {source ? (
          <Image source={source} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <Text style={styles.avatarIcon}>{icon}</Text>
        )}
      </View>

      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, selected && styles.rowTitleSelected]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>

      {/* filled when picked, hollow when not */}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Text style={styles.radioCheck}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },

  chevron: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  chevronText: {
    fontSize: 22,
    color: "#111",
  },

  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E4E4E9",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },

  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },

  // the prompt carried over from the camera
  promptBanner: {
    marginHorizontal: 12,
    marginBottom: 4,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  promptText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  scroll: {
    flex: 1,
  },

  // room so the last row clears the send bar
  scrollContent: {
    paddingBottom: 120,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // hairline between rows, skipped on the last one
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D8D8DC",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E4E9",
    alignItems: "center",
    justifyContent: "center",
    // clips the avatar into the circle
    overflow: "hidden",
    marginRight: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarIcon: {
    fontSize: 18,
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  rowTitleSelected: {
    color: BLUE,
  },

  rowSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 1,
  },

  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  radioCheck: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  loader: {
    marginTop: 20,
  },

  sendBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },

  chipText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 6,
  },

  chipClose: {
    color: "#8E8E93",
    fontSize: 12,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },

  sendArrow: {
    fontSize: 18,
    color: "#111",
  },
});