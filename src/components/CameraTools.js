import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

import FlipCameraIcon from "../../assets/flip_camera_icon_transparent.png";
import flashIcon from "../../assets/flash.png";
import AddIcon from "../../assets/add.png";
import AiIcon from "../../assets/ai.png";
import MusicIcon from "../../assets/music.png";
import videoIcon from "../../assets/video.png";

/**
 * Flip and torch buttons down the right edge of the live camera.
 */
export default function CameraTools({ torchOn, onFlip, onToggleTorch }) {
    return (
        <View style={styles.column}>
            <TouchableOpacity style={styles.button} onPress={onFlip}>
                <Image source={FlipCameraIcon} style={styles.iconImage} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onToggleTorch}>
                <Image source={flashIcon} style={styles.iconImage} />
            </TouchableOpacity>
            <Image source={videoIcon} style={styles.iconImage} />
            <Image source={MusicIcon} style={styles.iconImage} />
            <Image source={AiIcon} style={styles.iconImage} />
            <Image source={AddIcon} style={styles.iconImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    column: {
        position: "absolute",
        right: 12,
        top: 80,
        alignItems: "center",
        gap: 22,
        backgroundColor: "rgba(0,0,0,0.35)",
        paddingVertical: 5,
        paddingHorizontal: 1,
        borderRadius: 24,
    },

    // bigger than the icons inside so theres a real tap target
    button: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: -2,
    },

    icon: {
        color: "#fff",
        fontSize: 20,
    },

    iconImage: {
        width: 40,
        height: 46,
        resizeMode: "contain",
        marginVertical: -8,
    },
});