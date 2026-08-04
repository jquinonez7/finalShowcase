import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, StyleSheet, View } from "react-native";

import { supabase } from "../../utils/hooks/supabase";

// pill button with the user's bitmoji on the left and a label next to it
export default function StoryButton({ photoUri, videoUri, onPress }) {
  const [bitmojiUrl, setBitmojiUrl] = useState(null);

  useEffect(() => {
    const loadBitmoji = async (session) => {
      if (!session?.user) {
        setBitmojiUrl(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("bitmoji:bitmojiUrl")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        setBitmojiUrl(data?.bitmoji || null);
      } catch (error) {
        console.log("[story] bitmoji query failed:", error.message);
        setBitmojiUrl(null);
      }
    };

    // fires right away with INITIAL_SESSION, so this is also the first load
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      loadBitmoji(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    console.log("[story] post tapped", { photoUri, videoUri });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Post to your story"
    >
      <View style={styles.avatar}>
        {bitmojiUrl ? (
          <Image
            source={{ uri: bitmojiUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>

      <Text style={styles.label}>Story</Text>
    </TouchableOpacity>
  );
}

const AVATAR_SIZE = 35;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(60,60,60,0.85)",
    paddingHorizontal: 30,
    paddingVertical: 4,
    borderRadius: 24,
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.35)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});