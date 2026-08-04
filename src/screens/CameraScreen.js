import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

import ToggleMode from "../components/ToggleMode";
import BitmojiButton from "../components/bitmojiButton";
import CameraTools from "../components/CameraTools";
import CaptureButton from "../components/CaptureButton";

const YELLOW = "#FFFC00";
const PURPLE = "#B69CFF";

// how close two taps have to be to count as a double tap
const DOUBLE_TAP_DELAY_MS = 300;

export default function CameraScreen() {
  const navigation = useNavigation();
  const [bitmojiUrl, setBitmojiUrl] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [torchOn, setTorchOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [captureState, setCaptureState] = useState("idle");
  const [journalMode, setJournalMode] = useState(false);
  const accentColor = journalMode ? PURPLE : YELLOW;
  const cameraRef = useRef(null);
  const lastTapRef = useRef(0);
  const isRecordingRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const longPressFiredRef = useRef(false);

  if (!permission) {
    // still checking, stay black 
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Snap needs camera access to take Snaps.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // flips the camera only if two taps land close enough together
  const handleDoubleTap = () => {
    const now = Date.now();

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY_MS) {
      toggleCamera();
      // reset so a third tap starts a new pair
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
  };

  // preview is on the outer stack, so pushing it hides the tab bar
  const openPreview = (params) => {
    navigation.navigate("Preview", {
      ...params,
      // mirror pic
      mirrored: facing === "front",
      journalMode,
    });
  };

  // quick tap of the capture button
  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) {
      // no camera on web or the simulator, go to the preview empty so
      // the screen can still be worked on. remove before shipping
      openPreview({});
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) openPreview({ photoUri: photo.uri });
    } catch (error) {
      console.log("[camera] failed to take picture:", error);
      openPreview({});
    }
  };

  // hold past the threshold on the capture button
  const startRecording = async () => {
    if (!cameraRef.current || isRecordingRef.current) return;

    longPressFiredRef.current = true;
    stopRequestedRef.current = false;
    setCaptureState("recording");

    // the camera is sometimes not ready the instant the hold fires
    const maxAttempts = 3;
    const retryDelayMs = 100;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      // released while waiting, dont start a recording nobody is holding
      if (stopRequestedRef.current) break;

      try {
        isRecordingRef.current = true;

        // this waits here for the whole length of the video
        const video = await cameraRef.current.recordAsync();
        if (video?.uri) openPreview({ videoUri: video.uri });

        break;
      } catch (error) {
        isRecordingRef.current = false;
        console.log(`[camera] record attempt ${attempt} failed:`, error);

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    // reached whether it recorded or every attempt failed
    isRecordingRef.current = false;
    stopRequestedRef.current = false;
    setCaptureState("idle");
  };

  // every release of the capture button, tap or hold
  const stopRecording = () => {
    if (isRecordingRef.current) {
      // normal case, ends the recordAsync above
      try {
        cameraRef.current?.stopRecording();
      } catch (error) {
        console.log("[camera] stopRecording threw:", error);
      }
    } else if (longPressFiredRef.current) {
      // the hold fired but recording hadnt opened yet, so flag it
      stopRequestedRef.current = true;
    }

    longPressFiredRef.current = false;
    setCaptureState("idle");
  };


  return (
    <View style={styles.container}>
      {/* the camera has no press handler, so a Pressable wraps it */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torchOn}
          // locked to video so recording works without reinitializing
          mode="video"
          onCameraReady={() => setIsCameraReady(true)}
        />
      </Pressable>

      {/* purple wash so journal mode is obvious at a glance */}
      {journalMode && (
        <View
          style={[StyleSheet.absoluteFill, styles.modeTint]}
          pointerEvents="none"
        />
      )}

      {/* box-none lets taps through to the camera but keeps the
          buttons inside tappable */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <BitmojiButton
          />
        </View>

        <CameraTools
          torchOn={torchOn}
          onFlip={toggleCamera}
          onToggleTorch={() => setTorchOn((t) => !t)}
        />

        <CaptureButton
          state={captureState}
          accentColor={accentColor}
          onPressIn={() => setCaptureState("pressed")}
          onPress={takePicture}
          onLongPress={startRecording}
          onPressOut={stopRecording}
        />
      </SafeAreaView>

      <ToggleMode
        top={70}
        accentColor={accentColor}
        activeSwitch={journalMode ? 2 : 1}
        onChange={(val) => setJournalMode(val === 2)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  modeTint: {
    backgroundColor: "rgba(120,80,220,0.18)",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  permissionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: YELLOW,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },

  permissionButtonText: {
    fontWeight: "800",
    color: "#111",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },

  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});