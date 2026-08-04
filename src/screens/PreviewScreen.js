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
import SendToScreen from "./SendToScreen";

import SaveSnap from "../components/SaveSnap";

import ThoughtsButton from "../components/ThoughtsButton";
import StoryButton from "../components/StoryButton";
import PreviewToolbar from "../../assets/PreviewToolbar.png";
import JournalButton from "../components/JournalButton";
import SendButton from "../components/SendButton";
import LetItGoButton from "../components/LetItGoButton";

/**
 * Stack screen, pushed over the tab navigator after a capture. Being on
 * the stack rather than inside the tabs is what hides the tab bar.
 *
 * route.params: { photoUri?, videoUri?, bitmojiUri? }
 */
export default function PreviewScreen({ route, navigation }) {
    const { photoUri, videoUri, bitmojiUri, mirrored, journalMode } = route.params ?? {};

    // camera player that plays vid uri
    const player = useVideoPlayer(videoUri, (videoPlayer) => {
        videoPlayer.loop = true;
    });

    useEffect(() => {
        if (videoUri && player) player.play();
    }, [videoUri, player]);

    const mediaStyle = [StyleSheet.absoluteFill, mirrored && styles.flipHorizontal];

    // pause before leaving or the player keeps looping audio in the
    // background after this screen pops
    const close = () => {
        player?.pause();
        navigation.goBack();
    };
    <SendButton
        onPress={() => navigation.navigate("SendTo", { photoUri, videoUri })}
    />
    return (
        <View style={styles.container}>
            {photoUri && (
                <Image
                    source={{ uri: photoUri }}
                    style={mediaStyle}
                    resizeMode="cover"
                />

            )}

            {videoUri && (
                <VideoView
                    player={player}
                    style={mediaStyle}
                    contentFit="cover"
                    nativeControls={false}
                />
            )}

            <SafeAreaView style={styles.topLeft}>
                <TouchableOpacity style={styles.iconButton} onPress={close}>
                    <Text style={styles.iconText}>X</Text>
                </TouchableOpacity>
            </SafeAreaView>
            <Image source={PreviewToolbar} style={styles.toolbar} resizeMode="contain" />
            <BottomBar>
                {journalMode ? (
                    <>
                        <SaveSnap />
                        <LetItGoButton onPress={close} />
                        <ThoughtsButton photoUri={photoUri} videoUri={videoUri} />
                    </>
                ) : (
                    <>
                        <SaveSnap />
                        <StoryButton />
                        <SendButton onPress={() => navigation.navigate("SendTo", { photoUri, videoUri })} />
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

    bitmojiOverlay: {
        position: "absolute",
        width: 180,
        height: 180,
        left: 24,
        bottom: 170,
    },
    toolbar: {
        position: "absolute",
        right: 12,
        top: 30,
        width: 40,
        height: 600,
    },

    // wrapper only exists to position SaveToHub, the button styles itself
    saveSlot: {
        position: "absolute",
        left: 16,
        bottom: 40,
    },

    sendButton: {
        alignItems: "center",
        backgroundColor: "#4FA8FF",
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 24,
    },

    sendButtonText: {
        fontWeight: "800",
        color: "#fff",
    },
    flipHorizontal: {
        transform: [{ scaleX: -1 }],
    }
});