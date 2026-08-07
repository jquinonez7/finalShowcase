import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ResourcesModal({ visible, close }) {
  return (
    <Modal
      animationType="slide"
      transparent={true} // Must be true so the screen behind shows through
      visible={visible}
      onRequestClose={close}
      statusBarTranslucent={true}
    >
      {/* Semi-transparent dark overlay to dim the screen behind */}
      <Pressable style={styles.overlay} onPress={close}>
        {/* Prevent taps inside the drawer from closing the modal */}
        <Pressable style={styles.drawerContainer} onPress={(e) => e.stopPropagation()}>
          
          {/* Top Grab Handle */}
          <View style={styles.handle} />

          {/* Text Section */}
          <View style={styles.textRow}>
            <Text style={styles.rememberText}>Remember </Text>
            <Ionicons name="call" size={16} color="#333" style={styles.phoneIcon} />
            <Text style={styles.rememberText}>9-8-8 is a friend</Text>
          </View>

          {/* Bottom Illustration / Icon */}
          <View>
            <Image
              source={require("../../assets/profile-hub/openHands.png")}
              style={styles.handsIcon}
            />
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: "rgba(0, 0, 0, 0.3)", // Dimmed screen background
    justifyContent: "flex-end",            // Anchors drawer to bottom
  },
  drawerContainer: {
    backgroundColor: "#EBEBEB",             // Light gray sheet background
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#555555",             // Rounded pill grab handle bar
    borderRadius: 3,
    marginBottom: 20,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4e4e4e",
  },
  phoneIcon: {
    marginHorizontal: 4,
    color: "#4e4e4e",
  },
  handsIcon: {
    marginTop: 8,
    marginBottom: -30,
  },
});