import React from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");
//Supabase stuff
import { useState, useEffect, useMemo} from "react";
import { supabase } from "../../utils/hooks/supabase";
//for the navigate to camera button
import { useNavigation } from "@react-navigation/native";
//for the video preview
import { useVideoPlayer, VideoView } from "expo-video";
//**** 
const STORAGE_BUCKET = "diary-media";
const DIARY_FOLDER = "diary-entries";


// Grid Math: 3 columns with a clean 3px gap
const GAP = 3;
const COLUMNS = 3;
const ITEM_SIZE = (width - GAP * (COLUMNS - 1)) / COLUMNS;

export default function DiaryHub({ visible, close, journalToggle}) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
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
            .eq("user_id", currentUserId)

        if (error) {
            console.error("Error fetching User Entry details:", error);
            return;
        }

        if (data) {
            setUserEntries(data);
        }
    };
    const SortUserEntries = useMemo(
        () =>
            userEntries
                .filter((item) => item.privacy_status === "private")
                .slice()
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        [userEntries]
    );
    
    // const miniPreview = useVideoPlayer(video.media_url, (miniPreview) => {
    //         miniPreview.loop = true;
    //     });
    
    // useEffect(() => {
    //          if (videoUri && miniPreview) miniPreview.play();
    //      }, [videoUri, miniPreview]);
    
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={close}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* --- Top Header with Background Asset --- */}
        <ImageBackground
          // 💡 Replace uri with require('../../assets/your-header-bg.png') for local images
          source={require("../../assets/profile-hub/hub-bitmoji.png")}
          style={styles.topHeader}
          resizeMode="cover"
        >
          {/* Back Button */}
          <Pressable
            onPress={close}
            style={({ pressed }) => [
              styles.iconCircle,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </Pressable>

          {/* Top Right Action Icons */}
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
          {/* Search Bar Section */}
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

          {/* "Future Self" Bubble / Tag */}
          <View style={styles.bubbleContainer}>
            <View style={styles.futureSelfBubble}>
              <Text style={styles.futureSelfText}>Future Self</Text>
            </View>
          </View>

          {/* Scrollable Photo Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridScrollContainer}
          >
            <View style={styles.grid}>
              {userEntries.map((photo) => (
                <Pressable
                  key={photo.id}
                  style={[
                    styles.photoWrapper
                  ]}
                >
                  <Image source={{ uri: photo.media_url }} style={styles.photo} />
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Translucent Floating Plus Button */}
          <Pressable
            style={({ pressed }) => [
              styles.translucentPlusButton,
              { transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
            onPress={() => {
              close();
              navigation.navigate("UserTab", { screen: "Camera"});
            }}
            
          >
            <Ionicons name="add" size={48} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: "#FFFC00", // Fallback color
  },
  topHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    height: 250, // Height of header section
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
  /* Sheet Container */
  sheetContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    overflow: "hidden",
  },
  /* Search Bar */
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
  /* "Future Self" Bubble */
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
  /* Photo Grid */
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
  },
  selectedPhotoWrapper: {
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  /* Translucent Plus Button */
  translucentPlusButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(35, 33, 33, 0.4)", // Semi-transparent overlay style
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
// photo.selected && styles.selectedPhotoWrapper,