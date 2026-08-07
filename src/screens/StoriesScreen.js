import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fontHeader } from "../../assets/themes/font";
import { colors } from "../../assets/themes/colors";
import StoriesBitmoji from "../components/StoriesBitmoji";
import DiscoverFeed from "../components/DiscoverFeed";
import BitmojiButton from "../components/bitmojiButton";

// ---- dummy data, swap uris for real assets/CDN links ----
const MY_AVATAR = "https://i.pravatar.cc/150?img=47";

const FRIENDS_DATA = [
  {
    id: "1",
    name: "Madeline Parr",
    uri: "https://picsum.photos/seed/madeline/200/200",
  },
  {
    id: "2",
    name: "DELAINEY",
    uri: "https://picsum.photos/seed/delainey/200/200",
  },
  {
    id: "3",
    name: "Kaitlyn",
    subtitle: "kaitlynmarie106",
    uri: "https://picsum.photos/seed/kaitlyn/200/200",
    hasBadge: true,
  },
  {
    id: "4",
    name: "Jolea Shave",
    subtitle: "joshave1",
    uri: "https://picsum.photos/seed/jolea/200/200",
    hasBadge: true,
  },
];

const DISCOVER_DATA = [
  {
    id: "1",
    title: "Hailey Fernandes",
    subtitle: "so much harder for me to lift later in the day",
    uri: "https://picsum.photos/seed/hailey/400/700",
  },
  {
    id: "2",
    title: "King Kylie",
    uri: "https://picsum.photos/seed/kylie/400/700",
  },
  {
    id: "3",
    title: "Austin McBroom",
    uri: "https://picsum.photos/seed/austin/400/700",
  },
  {
    id: "4",
    title: "Jeffree Star",
    uri: "https://picsum.photos/seed/jeffree/400/700",
  },
];

function IconButton({ children, badge, onPress }) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress}>
      <Text style={styles.iconGlyph}>{children}</Text>
      {badge != null && (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function StoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.topBar}>
        <View>
          <BitmojiButton onPress={() => navigation.navigate("Profile")} />
        </View>

        <IconButton>🔍</IconButton>

        <Text style={styles.topBarTitle}>Stories</Text>

        <IconButton>🔔</IconButton>
        <IconButton badge={4}>👤➕</IconButton>
        <IconButton>•••</IconButton>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={DISCOVER_DATA}
        numColumns={2}
        columnWrapperStyle={styles.discoverRow}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.storyBar}>
              <Pressable onPress={() => { }}>
                <Text style={styles.sectionHeader}>Friends  ›</Text>
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {FRIENDS_DATA.map((f) => (
                  <StoriesBitmoji
                    key={f.id}
                    name={f.name}
                    uri={f.uri}
                    hasBadge={f.hasBadge}
                    onPress={() => { }}
                  />
                ))}
              </ScrollView>
            </View>

            <Pressable onPress={() => { }}>
              <Text style={styles.sectionHeader}>Discover  ›</Text>
            </Pressable>
          </>
        }
        renderItem={({ item }) => (
          <DiscoverFeed
            title={item.title}
            subtitle={item.subtitle}
            uri={item.uri}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  myAvatarWrap: {
    width: 44,
    height: 44,
  },
  myAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eee",
  },
  redDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#fff",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontSize: 16,
  },
  iconBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  iconBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  storyBar: {
    marginTop: 4,
    marginBottom: 8,
  },
  discoverRow: {
    gap: 12,
  },
  sectionHeader: {
    textAlign: "left",
    paddingVertical: 4,
    color: colors.primary,
    fontSize: fontHeader.fontSize,
    fontFamily: fontHeader.fontFamily,
    fontWeight: fontHeader.fontWeight,
  },
});