import React, { useState, useEffect } from "react";
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
  ImageBackground,
  ActivityIndicator, // 👈 Added ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { supabase } from "../../utils/hooks/supabase";

const { width, height } = Dimensions.get("window");

const GAP = 3;
const COLUMNS = 3;
const ITEM_SIZE = (width - GAP * (COLUMNS - 1)) / COLUMNS;

// ⚡ In-memory cache to store generated thumbnails so they only render ONCE per session
const thumbnailCache = {};

// --- Full-Screen Snapchat-Style Video Modal ---
function VideoPreviewOverlay({ videoUrl, visible, onClose }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  if (!visible || !videoUrl) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.fullScreenContainer}>
        <StatusBar barStyle="light-content" />

        <VideoView
          player={player}
          style={styles.fullScreenVideo}
          contentFit="cover"
          nativeControls={false}
        />

        <Pressable
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

// --- Grid Item Component Handling Fast Video Thumbnails with Loading Buffer ---
function GridTile({ item, isVid, onLongPress }) {
  const cachedUri = thumbnailCache[item?.media_url] || null;
  const [thumbnailUri, setThumbnailUri] = useState(cachedUri);
  
  // ⚡ Track loading state: Start true if it's a video and not cached yet
  const [isLoading, setIsLoading] = useState(isVid && !cachedUri);

  useEffect(() => {
    let isMounted = true;

    const generateThumbnail = async () => {
      // If it's not a video or already cached, skip thumbnail generation
      if (!isVid || !item?.media_url || thumbnailCache[item.media_url]) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (isMounted) setIsLoading(true);

        const { uri } = await VideoThumbnails.getThumbnailAsync(
          item.media_url,
          {
            time: 100,
            quality: 0.3,
          }
        );

        thumbnailCache[item.media_url] = uri;

        if (isMounted) {
          setThumbnailUri(uri);
        }
      } catch (e) {
        console.warn("Could not generate video thumbnail:", e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      isMounted = false;
    };
  }, [item?.media_url, isVid]);

  const displayUri = isVid ? thumbnailUri : item?.media_url;

  return (
    <Pressable
      style={styles.photoWrapper}
      delayLongPress={200}
      onLongPress={onLongPress}
    >
      {/* ⚡ Render spinner placeholder while loading */}
      {isLoading ? (
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color="#8E8E93" />
        </View>
      ) : displayUri ? (
        <Image
          source={{ uri: displayUri }}
          style={styles.photo}
          onLoadStart={() => {
            // Optional: Buffer standard images during download
            if (!isVid) setIsLoading(true);
          }}
          onLoadEnd={() => setIsLoading(false)}
        />
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Play badge indicator on video items (only show when loading completes) */}
      {isVid && !isLoading && (
        <View style={styles.videoBadge}>
          <Ionicons name="play" size={12} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

export default function DiaryHub({ visible, close, journalToggle }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
        return;
      }
      setCurrentUserId(data?.user?.id ?? null);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUserEntries();
    }
  }, [currentUserId]);

  const fetchUserEntries = async () => {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Error fetching User Entry details:", error);
      return;
    }

    if (data) {
      setUserEntries(data);
    }
  };

  const isVideoItem = (item) => {
    if (!item?.media_url) return false;
    return (
      item.media_type === "video" ||
      item.media_url.endsWith(".mp4") ||
      item.media_url.endsWith(".mov")
    );
  };

  return (
    //changed so allows to slide out of modal
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* --- Top Header with Background Asset --- */}
        <ImageBackground
          source={require("../../assets/profile-hub/hub-bitmoji.png")}
          style={styles.topHeader}
          resizeMode="cover"
        >
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
        </ImageBackground>

        {/* --- White Bottom Sheet --- */}
        <View style={styles.sheetContainer}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
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

          <View style={styles.bubbleContainer}>
            <View style={styles.futureSelfBubble}>
              <Text style={styles.futureSelfText}>Dear Future Self</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridScrollContainer}
          >
            <View style={styles.grid}>
              {userEntries.map((item) => {
                const isVid = isVideoItem(item);

                return (
                  <GridTile
                    key={item.id}
                    item={item}
                    isVid={isVid}
                    onLongPress={() => {
                      if (isVid) {
                        setActiveVideoUrl(item.media_url);
                      }
                    }}
                  />
                );
              })}
            </View>
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

        <VideoPreviewOverlay
          videoUrl={activeVideoUrl}
          visible={!!activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFC00",
  },
  topHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    height: 250,
    justifyContent: "space-between",
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
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
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    borderRadius: 10,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});