import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";

import { supabase } from "../../utils/hooks/supabase";
import ResourcesModal from "./ResourcesModal";

const { width } = Dimensions.get("window");

const GAP = 3;
const COLUMNS = 3;
const ITEM_SIZE = (width - GAP * (COLUMNS - 1)) / COLUMNS;
const THUMBNAIL_TIME_MS = 1000;

const MOOD_EMOJI = {
  low: "😞",
  sad: "🙁",
  happy: "🙂",
  great: "😄",
  meh: "😐",
};

function isVideo(url = "") {
  return url.endsWith(".mp4") || url.endsWith(".mov");
}

export default function DiaryHub({ visible, close, hubBitmoji }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [viewing, setViewing] = useState(null);
  const [resourcesVisible, setResourcesVisible] = useState(false);

  const navigation = useNavigation();

  const player = useVideoPlayer(
    viewing && isVideo(viewing.media_url) ? viewing.media_url : null,
    (p) => {
      p.loop = true;
    }
  );

  useEffect(() => {
    if (viewing && isVideo(viewing.media_url) && player) {
      player.play();
    }
  }, [viewing, player]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("[hub] user fetch failed:", error.message);
        return;
      }
      setCurrentUserId(data?.user?.id ?? null);
    };

    fetchUser();
  }, []);

  const fetchUserEntries = async () => {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", currentUserId);

    if (error) {
      console.log("[hub] entries query failed:", error.message);
      return;
    }

    setUserEntries(data ?? []);
  };

  useEffect(() => {
    if (currentUserId && visible) {
      fetchUserEntries();
    }
  }, [currentUserId, visible]);

  const entries = useMemo(
    () =>
      userEntries
        .filter((item) => item.privacy_status === "private")
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [userEntries]
  );

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      for (const entry of entries) {
        if (cancelled) return;
        if (!isVideo(entry.media_url) || thumbnails[entry.id]) continue;

        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            entry.media_url,
            { time: THUMBNAIL_TIME_MS }
          );

          if (cancelled) return;
          setThumbnails((current) => ({ ...current, [entry.id]: uri }));
        } catch (error) {
          console.log("[hub] thumbnail failed:", error.message);
        }
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const closeViewer = () => {
    player?.pause();
    setViewing(null);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={close}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* --- 1. HEADER CONTAINER --- */}
        <View style={styles.topHeader}>
          {/* BACKGROUND ASSET LAYER (Aligned strictly to the top edge) */}
          <Image
            source={require("../../assets/profile-hub/BGHUB.png")}
            style={styles.bgAssetImage}
            resizeMode="cover"
          />

          {/* BITMOJI OVERLAY LAYER */}
          {hubBitmoji ? (
            <Image
              source={{ uri: hubBitmoji }}
              style={styles.headerBitmoji}
              resizeMode="contain"
            />
          ) : null}

          {/* Controls */}
          <Pressable
            onPress={close}
            style={({ pressed }) => [
              styles.iconCircle,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>

          <View style={styles.topRightIcons}>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="settings-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.sheetContainer}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color="#000"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
                editable={false}
              />
            </View>
            <Pressable onPress={close} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
          <Pressable>
          <View style={styles.bubbleContainer}>
            <View style={styles.futureSelfBubble}>
              <Text style={styles.futureSelfText}>Dear Future Self</Text>
            </View>
          </View>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridScrollContainer}
          >
            <View style={styles.grid}>
              {entries.map((entry) => {
                const video = isVideo(entry.media_url);
                const preview = video
                  ? thumbnails[entry.id]
                  : entry.media_url;

                return (
                  <Pressable
                    key={entry.id}
                    style={styles.photoWrapper}
                    onPress={() => setViewing(entry)}
                  >
                    {preview ? (
                      <Image source={{ uri: preview }} style={styles.photo} />
                    ) : (
                      <View style={styles.videoTile} />
                    )}

                    {video ? (
                      <View style={styles.playBadge}>
                        <Ionicons name="play" size={14} color="#fff" />
                      </View>
                    ) : null}

                    {entry.prompt_text ? (
                      <View style={styles.tilePrompt}>
                        <Text style={styles.tilePromptText} numberOfLines={2}>
                          {entry.prompt_text}
                        </Text>
                      </View>
                    ) : null}

                    {entry.mood ? (
                      <Pressable 
                        onPress={() => {
                          // Check if the mood is 'sad' (or 'low')
                          if (entry.mood?.toLowerCase() === "sad") {
                            setResourcesVisible(true);
                          }
                        }}
                        style={styles.moodPressable}
                        hitSlop={8}
                      > 
                        <Text style={styles.tileMood}>
                          {MOOD_EMOJI[entry.mood?.toLowerCase()] ?? ""}
                        </Text>
                      </Pressable>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {entries.length === 0 ? (
              <Text style={styles.empty}>
                Nothing saved yet. Tap + to start.
              </Text>
            ) : null}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [
              styles.translucentPlusButton,
              { transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
            onPress={() => {
              close();
              navigation.navigate("UserTab", {
                screen: "Camera",
                params: { journalMode: true },
              });
            }}
          >
            <Ionicons name="add" size={48} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={Boolean(viewing)}
        animationType="fade"
        onRequestClose={closeViewer}
      >
        <Pressable style={styles.viewer} onPress={closeViewer}>
          {viewing && isVideo(viewing.media_url) ? (
            <VideoView
              player={player}
              style={styles.viewerMedia}
              contentFit="contain"
              nativeControls={false}
            />
          ) : viewing?.media_url ? (
            <Image
              source={{ uri: viewing.media_url }}
              style={styles.viewerMedia}
              resizeMode="contain"
            />
          ) : null}

          {viewing?.prompt_text ? (
            <View style={styles.viewerPrompt}>
              <Text style={styles.viewerPromptText}>{viewing.prompt_text}</Text>
            </View>
          ) : null}

          <View style={styles.viewerFooter}>
            {viewing?.mood ? (
              <Text style={styles.viewerMood}>
                {MOOD_EMOJI[viewing.mood] ?? ""}
              </Text>
            ) : null}

            {viewing?.created_at ? (
              <Text style={styles.viewerDate}>
                {new Date(viewing.created_at).toLocaleDateString([], {
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Modal>
      <ResourcesModal
        visible={resourcesVisible}
        close={() => setResourcesVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#efdae4",
  },

  topHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    height: 250,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },

  // Absolute positioning fixes the background asset to start strictly at top: 0
  bgAssetImage: {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "200%",
  transform: [{ scaleX: 1.25 }], // Stretches width by 25% horizontally
},

  headerBitmoji: {
    position: "absolute",
    top: 30,
    right:-10,
    width: "120%",
    height: "200%",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(35, 33, 33, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  topRightIcons: {
    position: "absolute",
    top: 50,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },

  sheetContainer: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 28,
    paddingTop: 16,
    overflow: "hidden",
  },

  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F4",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },

  searchIcon: {
    marginRight: 6,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },

  cancelButton: {
    paddingVertical: 4,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  bubbleContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  futureSelfBubble: {
    backgroundColor: "#0099FF",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  futureSelfText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  gridScrollContainer: {
    paddingBottom: 90,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },

  photoWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.35,
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  videoTile: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2C2C2E",
  },

  playBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  tilePrompt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 5,
  },

  tilePromptText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 13,
  },
  // Fix: The Pressable gets absolute positioning in the top right
  moodPressable: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10, // Keeps it on top of the image/video badge
  },

  // Fix: Text no longer needs absolute positioning inside the Pressable
  tileMood: {
    fontSize: 22,
  },

  empty: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 40,
  },

  translucentPlusButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(35, 33, 33, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  viewer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  viewerMedia: {
    width: "100%",
    height: "100%",
  },

  viewerPrompt: {
    position: "absolute",
    top: 70,
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

  viewerFooter: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  viewerMood: {
    fontSize: 26,
  },

  viewerDate: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});