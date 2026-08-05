import React, { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

import BottomBar from "../components/Bottombar";
import SaveSnap from "../components/SaveSnap";
import ThoughtsButton from "../components/ThoughtsButton";
import StoryButton from "../components/StoryButton";
import SendButton from "../components/SendButton";
import LetItGoButton from "../components/LetItGoButton";
import PromptPill from "../components/PromptPill";
import PreviewToolbar from "../../assets/PreviewToolbar.png";

// pushed over the tab navigator after a capture
// route.params: { photoUri?, videoUri?, mirrored?, journalMode?, promptText?, mood? }
export default function PreviewScreen({ route, navigation }) {
    const { photoUri, videoUri, mirrored, journalMode, promptText, mood } =
        route.params ?? {};

    // plays the video uri, ignored for photos
    const player = useVideoPlayer(videoUri, (videoPlayer) => {
        videoPlayer.loop = true;
    });

    useEffect(() => {
        if (videoUri && player) player.play();
    }, [videoUri, player]);

    // front camera captures come out un-mirrored, flip those back
    const mediaStyle = [
        StyleSheet.absoluteFill,
        mirrored && styles.flipHorizontal,
    ];

    // pause first or the player keeps looping audio after this pops
    const close = () => {
        console.log("[preview] close called");
        player?.pause();
        navigation.goBack();
    };

    // the prompt and mood ride along so the send sheet can save them
const openSendTo = () => {
  console.log("[preview] navigating with:", { photoUri, videoUri });
  navigation.navigate("SendTo", { photoUri, videoUri, promptText, mood });
};

    return (
        <View style={styles.container}>
            {photoUri && (
                <Image source={{ uri: photoUri }} style={mediaStyle} resizeMode="cover" />
            )}

            {videoUri && (
                <VideoView
                    player={player}
                    style={mediaStyle}
                    contentFit="cover"
                    nativeControls={false}
                />
            )}

            {/* the prompt stays visible over the capture */}
            {promptText ? <PromptPill prompt={promptText} top={150} /> : null}

            <SafeAreaView style={styles.topLeft}>
                <TouchableOpacity style={styles.iconButton} onPress={close}>
                    <Text style={styles.iconText}>✕</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <Image
                source={PreviewToolbar}
                style={styles.toolbar}
                resizeMode="contain"
            />

            <BottomBar>
                {journalMode ? (
                    <>
                        <SaveSnap onPress={close} />
                        <LetItGoButton onPress={close} />
                        <ThoughtsButton
                            photoUri={photoUri}
                            videoUri={videoUri}
                            promptText={promptText}
                            mood={mood}
                        />
                    </>
                ) : (
                    <>
                        <SaveSnap onPress={close} />
                        <StoryButton photoUri={photoUri} videoUri={videoUri} />
                        <SendButton onPress={openSendTo} />
                    </>
                )}
            </BottomBar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    topLeft: {
        position: "absolute",
        top: 0,
        left: 16,
    },

    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },

    iconText: {
        color: "#fff",
        fontSize: 20,
    },

    toolbar: {
        position: "absolute",
        right: 12,
        top: 30,
        width: 40,
        height: 600,
    },

    // display only, the file on disk is still un-mirrored
    flipHorizontal: {
        transform: [{ scaleX: -1 }],
    },
});