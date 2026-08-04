import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  Button,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../utils/hooks/supabase";
import { useAuthentication } from "../../utils/hooks/useAuthentication";
import DiaryHub from "../components/DiaryHub";

// Cleaned up data matching the new Snapchat mockup UI
const postToItems = [
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
    avatar: require("../../assets/snapchat/defaultprofile.png"),
    actionType: "Add",
  },
  {
    id: "post-3",
    title: "My Story · Public",
    description: "Friends, Followers, and Everyone",
    avatar: require("../../assets/snapchat/defaultprofile.png"),
    actionType: "Add",
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuthentication();
  const [hubVisible, setHubVisible] = useState(false);

  const fakeName = "Maya Torres";
  const fakeUsername = "maya-torres";

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Error signing out:", error.message);
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- HERO BITMOJI SECTION --- */}
        <View style={styles.heroContainer}>
          <Image
            source={require("../../assets/profile-hub/profile-bitmoji.png")}
            style={styles.heroImage}
          />

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
        </View>

        {/* --- MAIN CONTENT (Soft transition over hero image) --- */}
        <View style={styles.contentContainer}>
          {/* User Info Header */}
          <View style={styles.profileRow}>
            <Image
              source={require("../../assets/snapchat/defaultprofile.png")}
              style={styles.snapcodeBox}
            />

            <View style={styles.profileText}>
              <Text style={styles.profileName}>{fakeName}</Text>
              <Text style={styles.profileUsername}>{fakeUsername}</Text>
            </View>
          </View>

          {/* Pill Tabs (My Account / Public Profile) */}
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

          {/* Snapchat+ Feature Card */}
          <Pressable style={styles.snapchatPlusCard}>
            <View style={styles.plusIconBox}>
              <Ionicons name="logo-snapchat" size={26} color="#FFFC00" />
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
          <DiaryHub visible={hubVisible} close={() => setHubVisible(false)} />

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
                    size={28}
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
                  <Ionicons name="camera-outline" size={18} color="#000" />
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
    height: 380,
    backgroundColor: "#4B52FF", // Snapchat purple/blue hero background
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  topRightControls: {
    position: "absolute",
    top: 50,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },
  floatingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Main Body Section */
  contentContainer: {
    marginTop: -40, // Blends smooth curved top over the hero background
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#F5F5F7",
  },

  /* User Info */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  snapcodeBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFFC00",
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  profileUsername: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  /* Account Selector Pills */
  accountTypeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 20,
    padding: 3,
    marginBottom: 12,
  },
  accountTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 18,
  },
  activeAccountTab: {
    backgroundColor: "#22252A",
  },
  accountTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
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
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },

  /* Card Styles */
  snapchatPlusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10, // Shortened height
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  plusIconBox: {
    width: 40,
    height: 40,
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10, // Shortened height
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  hubIconBox: {
    width: 40,
    height: 40,
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
    marginBottom: 8,
    marginTop: 6,
  },
  rowsContainer: {
    gap: 8,
    marginBottom: 16,
  },

  /* Compact Rows (Shorter height) */
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10, // Reduced from 16 for cleaner look
    borderWidth: 1,
    borderColor: "#EAEAEA",
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
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
});