import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { CameraView, useCameraPermissions } from "expo-camera";

// SCREEN DIMENSIONS
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function KycUpload({ navigation }) {
  const [selfie, setSelfie] = useState(null);

  // Only ONE document per section
  const [panDoc, setPanDoc] = useState(null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef(null);

  // Which section we are adding file to: "pan" | "aadhaarFront" | "aadhaarBack"
  const [pickerTarget, setPickerTarget] = useState(null);
  const [optionModalVisible, setOptionModalVisible] = useState(false);

  // ---------------- OPEN CAMERA (NO FACE DETECTION) ----------------
  const openCameraForSelfie = async () => {
    try {
      if (!permission?.granted) {
        const perm = await requestPermission();
        if (!perm.granted) {
          Alert.alert("Permission required", "Camera permission is needed to capture selfie.");
          return;
        }
      }
      setCameraVisible(true);
    } catch (err) {
      console.log("Camera open error:", err);
      Alert.alert("Error", "Unable to open camera.");
    }
  };

  // ---------------- CAPTURE SELFIE ----------------
  const captureSelfie = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert("Camera not ready", "Please wait for the camera to initialize.");
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setSelfie(photo.uri);
      setCameraVisible(false);
    } catch (error) {
      console.log("capture error", error);
      Alert.alert("Error capturing selfie", "Please try again.");
    }
  };

  // ---------------- PICK IMAGE FROM GALLERY ----------------
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (res.canceled) return;

      const asset = res.assets[0];

      const doc = {
        uri: asset.uri,
        name: asset.fileName || "image.jpg",
        type: asset.type || "image/jpeg",
      };

      assignDocument(doc);
    } catch (err) {
      console.log("Image picker error:", err);
      Alert.alert("Error", "Failed to select image.");
    }
  };

  // ---------------- PICK DOCUMENT (PDF / IMAGE) ----------------
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      // Handle both old & new shapes of DocumentPicker responses
      if (result.canceled || result.type === "cancel") return;

      const asset = result.assets?.[0] || result;

      const doc = {
        uri: asset.uri,
        name: asset.name || "document",
        type: asset.mimeType || asset.type || "application/octet-stream",
      };

      assignDocument(doc);
    } catch (err) {
      console.log("Document picker error:", err);
      Alert.alert("Error", "Failed to select document.");
    }
  };

  // ---------------- ASSIGN A SINGLE DOCUMENT TO TARGET ----------------
  const assignDocument = (doc) => {
    if (pickerTarget === "pan") {
      setPanDoc(doc);
    } else if (pickerTarget === "aadhaarFront") {
      setAadhaarFront(doc);
    } else if (pickerTarget === "aadhaarBack") {
      setAadhaarBack(doc);
    }
  };

  const chooseOption = (type) => {
    setPickerTarget(type);
    setOptionModalVisible(true);
  };

  const handleSubmit = () => {
    if (!selfie || !panDoc || !aadhaarFront || !aadhaarBack) {
      Alert.alert("Incomplete KYC", "Please upload all required documents and selfie.");
      return;
    }

    navigation.navigate("ProfileAnalysis");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={styles.title}>Upload Your KYC Documents</Text>

        {/* ---------------- SELFIE SECTION ---------------- */}
        <View style={styles.section}>
          <Text style={styles.label}>📸 Capture Selfie</Text>
          <Text style={styles.hint}>
            Align your face inside the circle and tap Capture.
          </Text>

          <TouchableOpacity style={styles.documentButton} onPress={openCameraForSelfie}>
            <Text style={styles.documentButtonText}>
              {selfie ? "Retake Selfie" : "Capture Selfie"}
            </Text>
          </TouchableOpacity>

          {selfie && (
            <View style={styles.previewBox}>
              <Image source={{ uri: selfie }} style={styles.preview} />
            </View>
          )}
        </View>

        {/* ---------------- PAN CARD SECTION ---------------- */}
        <UploadSection
          label="🪪 PAN Card"
          doc={panDoc}
          onAdd={() => chooseOption("pan")}
          onRemove={() => setPanDoc(null)}
        />

        {/* ---------------- AADHAAR FRONT SECTION ---------------- */}
        <UploadSection
          label="🆔 Aadhaar Front"
          doc={aadhaarFront}
          onAdd={() => chooseOption("aadhaarFront")}
          onRemove={() => setAadhaarFront(null)}
        />

        {/* ---------------- AADHAAR BACK SECTION ---------------- */}
        <UploadSection
          label="🆔 Aadhaar Back"
          doc={aadhaarBack}
          onAdd={() => chooseOption("aadhaarBack")}
          onRemove={() => setAadhaarBack(null)}
        />

        {/* ---------------- SUBMIT ---------------- */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit KYC</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= CAMERA MODAL (NO CHILDREN INSIDE CameraView) ================= */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {/* Camera fills the screen */}
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="front"
            ref={cameraRef}
          />

          {/* Overlay is OUTSIDE CameraView (no children) */}
          <View style={styles.cameraOverlay}>
            {/* Static circle guide */}
            <View style={styles.circleOverlay} />

            {/* Capture button */}
            <TouchableOpacity style={styles.captureButton} onPress={captureSelfie}>
              <Text style={styles.captureText}>Capture</Text>
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= OPTION MODAL (GALLERY / DOCUMENT) ================= */}
      <Modal visible={optionModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Option</Text>

            <ModalBtn
              label="🖼 Choose from Gallery"
              onPress={() => {
                pickImage();
                setOptionModalVisible(false);
              }}
            />

            <ModalBtn
              label="📄 Upload Document (PDF/Image)"
              onPress={() => {
                pickDocument();
                setOptionModalVisible(false);
              }}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setOptionModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- REUSABLE SECTION COMPONENT ---------------- */

function UploadSection({ label, doc, onAdd, onRemove }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>

      {/* Show "+ Add Document" only if NOT uploaded */}
      {!doc && (
        <TouchableOpacity style={styles.documentButton} onPress={onAdd}>
          <Text style={styles.documentButtonText}>+ Add Document</Text>
        </TouchableOpacity>
      )}

      {/* Show selected doc if present */}
      {doc && (
        <View style={styles.docItem}>
          <Text style={styles.docName} numberOfLines={1}>
            {doc.name}
          </Text>
          <TouchableOpacity onPress={onRemove}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ModalBtn({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.modalOption} onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

/* ====================== STYLES ====================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },

  documentButton: {
    height: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    borderColor: "#001F54",
    justifyContent: "center",
    alignItems: "center",
  },

  documentButtonText: {
    color: "#001F54",
    fontSize: 16,
    fontWeight: "700",
  },

  previewBox: {
    marginTop: 10,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    alignItems: "flex-start",
  },

  preview: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  docItem: {
    marginTop: 10,
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  docName: {
    color: "#333",
    flex: 1,
    marginRight: 10,
  },

  removeText: {
    color: "#E44040",
    fontWeight: "700",
  },

  submitButton: {
    backgroundColor: "#001F54",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },

  /* ---- CAMERA OVERLAY ---- */
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  circleOverlay: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: "#ffffff",
    marginBottom: 80,
  },

  captureButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },

  captureText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
  },

  closeText: {
    color: "#fff",
    fontSize: 16,
  },

  /* ---- MODAL ---- */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalBox: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  cancelBtn: {
    marginTop: 15,
    backgroundColor: "#001F54",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontSize: 16,
  },
});
