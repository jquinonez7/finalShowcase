import React, { useState, useEffect, useMemo } from "react";
import {
  Image,
  Text,
  View,
  Button,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // 1. Added LinearGradient import
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/hooks/supabase";
import { useAuthentication } from "../../utils/hooks/useAuthentication";
import DiaryHub from "../components/DiaryHub";

export default function ProfileScreen() {
  const [profileInfo, setProfileInfo] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();
  const { user } = useAuthentication();
  const [hubVisible, setHubVisible] = useState(false);

  //const fakeName = "Maya Torres";//need to replace specifically 
  const fakeUsername = "maya-torres";//need to replace specifically

  const postToItems = useMemo(
    () => [
      {
        id: "post-1",
        title: "Spotlight",
        description: "Reach millions of Snapchatters!",
        icon: "play-circle",
        iconColor: "#FF2A54",
        actionType: "Post",
      },
      {
        id: "post-2",
        title: "My Story · Friends Only",
        description: "",
        avatar: { uri: profileInfo.bitmojiUrl }
      },
      {
        id: "post-3",
        title: "My Story · Public",
        description: "Friends, Followers, and Everyone",
        avatar: { uri: profileInfo.bitmojiUrl }
      },
    ],
    [profileInfo]
  );

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Error signing out:", error.message);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

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

  const fetchBitmojis = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUserId)
      .single();

    if (error) {
      console.log("[hub] entries query failed:", error.message);
      return;
    }

    setProfileInfo(data ?? {});
  };

  useEffect(() => {
    if (currentUserId) {
      fetchBitmojis();
    }
  }, [currentUserId]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- HERO & USER PROFILE SECTION WITH BACKGROUND ASSET --- */}
        <ImageBackground
          source={require("../../assets/profile-hub/BGPROFILE.png")}
          style={styles.heroContainer}
          resizeMode="cover"
        >
          {/* Top Floating Control Buttons */}
          <Pressable
            style={styles.floatingBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </Pressable>

          <View style={styles.topRightControls}>
            <Pressable style={styles.floatingIconButton}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </Pressable>
            <Pressable style={styles.floatingIconButton}>
              <Ionicons name="settings-outline" size={22} color="#FFF" />
            </Pressable>
          </View>

          {/* Hero Bitmoji Image */}
          <Image
            source={
              {uri: profileInfo.bitmoji_profile}
            }
            style={styles.heroImage}
          />

          {/* Profile Header Content Over Background */}
          <View style={styles.heroProfileDetails}>
            {/* User Info Header */}
            <View style={styles.profileRow}>
              <Image
                source={
                  { uri: profileInfo.bitmojiUrl }
                }
                style={styles.snapcodeBox}
              />

              <View style={styles.profileText}>
                <Text style={styles.profileName}>{profileInfo.userName}</Text>
                <Text style={styles.profileUsername}>{profileInfo["profile-user-name"]}</Text>
              </View>
            </View>

            {/* Account Selector Pills */}
            <View style={styles.accountTypeRow}>
              <Pressable style={[styles.accountTab, styles.activeAccountTab]}>
                <Text style={styles.activeAccountTabText}>My Account</Text>
              </Pressable>
              <Pressable style={styles.accountTab}>
                <Text style={styles.accountTabText}>Public Profile</Text>
              </Pressable>
            </View>

            {/* Tags Row */}
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>🎂 Dec 28</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>👻 1,936</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>♓ Pisces ›</Text>
              </View>
            </View>
          </View>

          {/* 2. Seamless Bottom Fade Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "#F5F5F7"]}
            style={styles.bottomFadeOverlay}
            pointerEvents="none"
          />
        </ImageBackground>

        {/* --- MAIN CONTENT CARDS --- */}
        <View style={styles.contentContainer}>
          {/* Snapchat+ Feature Card */}
          <Pressable style={styles.snapchatPlusCard}>
           <View style={styles.plusIconBox}>
            <Image
              source={{
                uri: "https://link.snapchat.com/plus/plus.png",
              }}
              style={styles.plusIconImage} // 👈 Added style reference
              resizeMode="contain"
            />
          </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Snapchat+</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                Tiny Snaps, Custom Bitmoji Pets and more!
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>

          {/* HUB / Video Journal Card */}
          <Pressable style={styles.hubCard} onPress={() => setHubVisible(true)}>
            <View style={styles.hubIconBox}>
              <Ionicons name="book-outline" size={24} color="#000" />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>HUB</Text>
              <Text style={styles.cardSubtitle}>Video Journal</Text>
            </View>

            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>

          {/* Diary Hub Modal */}
          <DiaryHub
            visible={hubVisible}
            close={() => setHubVisible(false)}
            hubBitmoji={profileInfo?.bitmoji_hub}
          />

          {/* --- POST TO... SECTION --- */}
          <Text style={styles.sectionTitle}>Post to...</Text>

          <View style={styles.rowsContainer}>
            {postToItems.map((item) => (
              <View key={item.id} style={styles.compactRow}>
                {item.avatar ? (
                  <Image source={item.avatar} style={styles.rowAvatar} />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={26}
                    color={item.iconColor || "#000"}
                    style={styles.rowIcon}
                  />
                )}

                <View style={styles.cardTextContainer}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.rowSubtitle}>{item.description}</Text>
                  ) : null}
                </View>

                {/* Compact Action Button */}
                <Pressable style={styles.actionBtn}>
                  <Ionicons name="camera-outline" size={16} color="#000" />
                  <Text style={styles.actionBtnText}>{item.actionType}</Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* --- FRIENDS SECTION --- */}
          <Text style={styles.sectionTitle}>Friends</Text>

          <Pressable style={styles.compactRow}>
            <View style={styles.circleOutlineIcon}>
              <Ionicons name="ellipse-outline" size={26} color="#000" />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.rowTitle}>Add Friends</Text>
              <Text style={styles.rowSubtitle}>2 friend suggestions!</Text>
            </View>

            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button title="Log Out" color="#FF3B30" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* Hero Section */
  heroContainer: {
    width: "100%",
    position: "relative",
    paddingTop: 50,
  },
  heroImage: {
  position: "absolute", // 1. Removes it from the flex flow so it won't push items down
  top: 40,               // 2. Adjust vertical placement independently
  width: "100%",
  height: 450,           // 3. Make this as large as you want!
  resizeMode: "contain",
  alignSelf: "center",
  zIndex: 0,             // 4. Ensures it stays behind your text/buttons
},
  heroProfileDetails: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 200,
    zIndex: 2, // Keeps text/buttons interactive above the gradient fade
  },
  
  /* Bottom Fade Overlay Style */
  bottomFadeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100, // Adjust this to make the transition longer or shorter
    zIndex: 1,
  },

  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  topRightControls: {
    position: "absolute",
    top: 50,
    right: 16,
    flexDirection: "row",
    gap: 10,
    zIndex: 10,
  },
  floatingIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusIconImage: {
  width: 30,  // 👈 Decrease/increase to fit your target size
  height: 30, // 👈 Match width to maintain aspect ratio
},

  /* Main Content Sheet */
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#F5F5F7",
  },

  /* User Info */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  snapcodeBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFFC00",
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  profileUsername: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },

  /* Account Selector Pills */
  accountTypeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 22,
    padding: 3,
    marginBottom: 12,
  },
  accountTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 18,
  },
  activeAccountTab: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  accountTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeAccountTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },

  /* Tags */
  tagRow: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  /* Card Styles */
  snapchatPlusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  plusIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hubCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  hubIconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  /* Badge */
  newBadge: {
    backgroundColor: "#0099FF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  newBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },

  /* Section Styles */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
    marginTop: 6,
  },
  rowsContainer: {
    gap: 8,
    marginBottom: 16,
  },

  /* Compact Rows */
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  rowIcon: {
    marginRight: 12,
  },
  circleOutlineIcon: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 1,
  },

  /* Compact Action Pill Buttons */
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },

  logoutContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  snapchatPlusCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFF",
  borderRadius: 20,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 10,

  /* Gold Border */
  borderWidth: 1.5,
  borderColor: "#FFC700", // Warm Metallic Gold

  /* Soft Gold Glow Shadow */
  shadowColor: "#FFC700",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 4, // Android shadow
},
});