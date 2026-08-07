import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Image,
    SafeAreaView,
    Keyboard,
    Platform,
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

// the toolbar png is one flat image, so tap targets get layered on top of it.
// 12 icons stacked in a 600pt column -> 50pt per slot, T is slot 0.
const TOOLBAR_HEIGHT = 600;
const TOOL_SLOT = TOOLBAR_HEIGHT / 12;

// pushed over the tab navigator after a capture
// route.params: { photoUri?, videoUri?, mirrored?, journalMode?, promptText?, mood? }
export default function PreviewScreen({ route, navigation }) {
    const { photoUri, videoUri, mirrored, journalMode, promptText, mood } =
        route.params ?? {};

    // captions the user has stamped onto the capture
    const [textItems, setTextItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState("");
    const [kbHeight, setKbHeight] = useState(0);

    // plays the video uri, ignored for photos
    const player = useVideoPlayer(videoUri, (videoPlayer) => {
        videoPlayer.loop = true;
    });

    useEffect(() => {
        if (videoUri && player) player.play();
    }, [videoUri, player]);

    // keeps the caption bar sitting right on top of the keyboard
    useEffect(() => {
        // will* fires in step with the ios animation, android only has did*
        const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvt, (e) =>
            setKbHeight(e.endCoordinates.height)
        );
        const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

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

    const addText = () => {
        const id = String(Date.now());
        setTextItems((prev) => [...prev, { id, value: "" }]);
        setDraft("");
        setEditingId(id);
    };

    const editText = (item) => {
        setDraft(item.value);
        setEditingId(item.id);
    };

    // empty drafts get dropped instead of leaving an invisible tap target behind
    const commitText = () => {
        const trimmed = draft.trim();
        setTextItems((prev) =>
            trimmed
                ? prev.map((t) => (t.id === editingId ? { ...t, value: trimmed } : t))
                : prev.filter((t) => t.id !== editingId)
        );
        setEditingId(null);
        setDraft("");
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

            {/* committed captions, tap one to edit it again */}
            {textItems.map((item, i) =>
                item.id === editingId || !item.value ? null : (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        style={[styles.captionBar, { top: 300 + i * 56 }]}
                        onPress={() => editText(item)}
                    >
                        <Text style={styles.captionText}>{item.value}</Text>
                    </TouchableOpacity>
                )
            )}

            <SafeAreaView style={styles.topLeft}>
                <TouchableOpacity style={styles.iconButton} onPress={close}>
                    <Text style={styles.iconText}>✕</Text>
                </TouchableOpacity>
            </SafeAreaView>

            {/* box-none so only the hotspot takes taps, not the whole column */}
            <View style={styles.toolbar} pointerEvents="box-none">
                <Image
                    source={PreviewToolbar}
                    style={styles.toolbarImage}
                    resizeMode="contain"
                />
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Add text"
                    style={styles.textToolHotspot}
                    onPress={addText}
                />
            </View>

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

            {/* last in the tree so it sits above the toolbar and bottom bar */}
            {editingId && (
                <>
                    {/* transparent, just catches the dismiss tap — no dimming */}
                    <Pressable style={StyleSheet.absoluteFill} onPress={commitText} />

                    <View style={[styles.captionBar, { bottom: kbHeight }]}>
                        <TextInput
                            style={styles.captionText}
                            value={draft}
                            onChangeText={setDraft}
                            autoFocus
                            multiline
                            placeholder="Add a caption"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                        />
                    </View>
                </>
            )}
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
        height: TOOLBAR_HEIGHT,
    },

    toolbarImage: {
        width: "100%",
        height: "100%",
    },

    textToolHotspot: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 40,
        height: TOOL_SLOT,
    },

    // one style for both the editor and the committed caption, so what you
    // type is exactly what lands on the photo
    captionBar: {
        position: "absolute",
        left: 0,
        right: 0,
        minHeight: 52,
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
    },

    captionText: {
        color: "#fff",
        fontSize: 20,
        textAlign: "center",
    },

    // display only, the file on disk is still un-mirrored
    flipHorizontal: {
        transform: [{ scaleX: -1 }],
    },
});