import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../utils/hooks/supabase";

/**
 * Round avatar button used in headers to jump to the Profile screen.
 * Shows the signed-in user's bitmoji when they have one, a placeholder
 * dot otherwise — but always fires onPress either way.
 */
export default function BitmojiButton({ onPress, selected = false }) {
  const [bitmojiUrl, setBitmojiUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBitmoji = async (session) => {
      if (!session?.user) {
        setBitmojiUrl(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("bitmoji:bitmojiUrl")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        setBitmojiUrl(data?.bitmoji || null);
      } catch (error) {
        console.log("[bitmoji] query failed:", error.message);
        setBitmojiUrl(null);
      } finally {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => loadBitmoji(session));

    return () => subscription.unsubscribe();
  }, []);

  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected]}
      onPress={() => onPress?.(bitmojiUrl)}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : bitmojiUrl ? (
        <Image
          source={{ uri: bitmojiUrl }}
          style={styles.bitmoji}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholder} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },

  buttonSelected: { borderColor: "#FFFC00" },
  bitmoji: { width: 42, height: 42 },

  placeholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});