import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// ----------------------------------------------------------
//  1. Custom Components
// ----------------------------------------------------------

const PanInputComponent = ({
  pan,
  onPanChange,
  onFetchDetails,
  onUploadImage,
  panImage,
  panVerificationMethod,
  onSetVerificationMethod,
  panVerified,
  style,
}) => {
  return (
    <View style={[styles.panContainer, style]}>
      <Text style={styles.panLabel}>PAN Number</Text>
      <TextInput
        style={styles.panInputField}
        value={pan}
        maxLength={10}
        onChangeText={onPanChange}
        autoCapitalize="characters"
        placeholder="ABCDE1234F"
      />

      {!panVerified && (
        <View>
          <Text style={styles.methodLabel}>Choose Verification Method:</Text>

          <View style={styles.methodButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                panVerificationMethod === "fetch" && styles.methodButtonActive,
              ]}
              onPress={() => onSetVerificationMethod("fetch")}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  panVerificationMethod === "fetch" &&
                    styles.methodButtonTextActive,
                ]}
              >
                Fetch Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                panVerificationMethod === "upload" &&
                  styles.methodButtonActive,
              ]}
              onPress={() => onSetVerificationMethod("upload")}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  panVerificationMethod === "upload" &&
                    styles.methodButtonTextActive,
                ]}
              >
                Upload Card
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {panVerificationMethod === "fetch" && !panVerified && (
        <TouchableOpacity style={styles.fetchButton} onPress={onFetchDetails}>
          <Text style={styles.buttonText}>Fetch Details</Text>
        </TouchableOpacity>
      )}

      {panVerificationMethod === "upload" && !panVerified && (
        <TouchableOpacity style={styles.uploadArea} onPress={onUploadImage}>
          {panImage ? (
            <View style={styles.uploadedImageContainer}>
              <Image source={{ uri: panImage }} style={styles.uploadedImage} />
              <Text style={styles.uploadedText}>✓ PAN Card Uploaded</Text>
            </View>
          ) : (
            <>
              <Text style={styles.uploadIcon}>⬆️</Text>
              <Text style={styles.uploadText}>Upload PAN Card Image</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const AadharInputComponent = ({
  aadhar,
  onAadharChange,
  onSendOtp,
  aadharVerified,
  style,
}) => {
  return (
    <View style={[styles.aadharContainer, style]}>
      <Text style={styles.aadharLabel}>Aadhar Number</Text>
      <TextInput
        style={styles.aadharInputField}
        value={aadhar}
        maxLength={12}
        keyboardType="numeric"
        onChangeText={onAadharChange}
        placeholder="1234 5678 9012"
        editable={!aadharVerified}
      />

      {!aadharVerified ? (
        <TouchableOpacity style={styles.sendOtpButton} onPress={onSendOtp}>
          <Text style={styles.sendOtpButtonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.verifiedButton}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      )}
    </View>
  );
};

const OtpVerificationModal = ({
  visible,
  generatedOtp,
  onVerify,
  onClose,
}) => {
  const [otpInput, setOtpInput] = useState("");

  const handleVerify = () => {
    if (otpInput === generatedOtp) {
      setOtpInput("");
      onVerify(true);
    } else {
      Alert.alert("Invalid OTP", "Incorrect OTP, try again.");
      setOtpInput("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter OTP</Text>
          <Text style={styles.modalSubtitle}>Enter 6-digit OTP sent to your mobile</Text>

          <TextInput
            style={styles.otpModalInput}
            maxLength={6}
            keyboardType="number-pad"
            value={otpInput}
            onChangeText={setOtpInput}
          />

          <TouchableOpacity
            style={[
              styles.verifyButton,
              otpInput.length !== 6 && styles.verifyButtonDisabled,
            ]}
            disabled={otpInput.length !== 6}
            onPress={handleVerify}
          >
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeModalText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ----------------------------------------------------------
//  2. BASICINFO MAIN COMPONENT (UPDATED)
// ----------------------------------------------------------

export default function BasicInfo({ navigation, route }) {

  // ⭐ Mobile safely received from OTP (no crash)
  const mobile = route?.params?.mobile ?? null;

  if (!mobile) {
    console.warn("⚠️ No mobile received in BasicInfo");
  }

  // ---- State declarations ----
  const [fullName, setFullName] = useState("");
  const [pan, setPan] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [panImage, setPanImage] = useState("");
  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [email, setEmail] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedAadharOtp, setGeneratedAadharOtp] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branch, setBranch] = useState("");
  const [panVerificationMethod, setPanVerificationMethod] = useState(null);
  const [accountNumberError, setAccountNumberError] = useState("");
  const [ifscError, setIfscError] = useState("");

  // ----------------------------------------------------------
  // VALIDATIONS
  // ----------------------------------------------------------

  const validatePan = (text) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const formatted = text.toUpperCase();
    setPan(formatted);
    return panRegex.test(formatted);
  };

  const validateAadhar = (text) => {
    const regex = /^[0-9]{12}$/;
    setAadhar(text);
    return regex.test(text);
  };

  const validateAccountNumber = (text) => {
    const regex = /^[0-9]*$/;
    setAccountNumber(text);

    if (!regex.test(text)) {
      setAccountNumberError("Account number must contain only digits");
    } else if (text.length < 11) {
      setAccountNumberError(`Minimum 11 digits (${text.length}/11)`);
    } else if (text.length > 18) {
      setAccountNumberError("Max 18 digits allowed");
    } else {
      setAccountNumberError("");
    }
  };

  const validateIfscCode = (text) => {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const formatted = text.toUpperCase();
    setIfsc(formatted);

    if (formatted && !regex.test(formatted)) {
      setIfscError("Invalid IFSC (SBIN0000001 format)");
    } else {
      setIfscError("");
    }
  };

  // ----------------------------------------------------------
  //  IMAGE UPLOAD + PAN & AADHAR LOGIC
  // ----------------------------------------------------------

  const handleUploadPanImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      if (!validatePan(pan)) {
        Alert.alert("Invalid PAN", "Enter valid PAN before uploading.");
        return;
      }

      setPanImage(result.assets[0].uri);
      setPanVerified(true);
      Alert.alert("Success", "PAN verified via image!");
    }
  };

  const handleFetchDetails = () => {
    if (validatePan(pan)) {
      setPanVerified(true);
      Alert.alert("Success", "PAN details verified!");
    } else {
      Alert.alert("Invalid PAN", "Enter a valid PAN.");
    }
  };

  const handleSendOtp = async () => {
    if (!validateAadhar(aadhar)) {
      Alert.alert("Invalid Aadhar", "Enter 12-digit Aadhar.");
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedAadharOtp(otp);
    await AsyncStorage.setItem("aadharOtp", otp);

    console.log("📌 Aadhar OTP:", otp);
    setShowOtpModal(true);
  };

  const handleOtpVerification = (verified) => {
    if (verified) {
      setAadharVerified(true);
      setShowOtpModal(false);
    }
  };

  // ----------------------------------------------------------
  // 🟦 SAVE & CONTINUE
  // ----------------------------------------------------------

  const storeBasicInfo = async (data) => {
    try {
      await AsyncStorage.setItem("@BasicInfoData", JSON.stringify(data));
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to save data.");
      return false;
    }
  };

  const proceed = async () => {
    if (!fullName || !dob || !email) {
      Alert.alert("Missing Details", "Fill all required fields.");
      return;
    }

    if (!accountNumber || !bankName || !ifsc || !branch) {
      Alert.alert("Missing Bank Details", "Fill all bank details.");
      return;
    }

    if (!panVerified) {
      Alert.alert("PAN Not Verified");
      return;
    }

    if (!aadharVerified) {
      Alert.alert("Aadhar Not Verified");
      return;
    }

    const basicInfoData = {
      fullName,
      mobile,     // ⭐ NOW INCLUDED SAFELY
      pan,
      panImage,
      aadhar,
      dob: dob.toISOString(),
      email,
      accountNumber,
      bankName,
      ifsc,
      branch,
    };

    const saved = await storeBasicInfo(basicInfoData);
    if (saved) navigation.navigate("ProfessionalInfo");
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>Basic Information</Text>

        {/* FULL NAME */}
        <Text style={styles.panLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* PAN */}
        <PanInputComponent
          pan={pan}
          onPanChange={validatePan}
          onFetchDetails={handleFetchDetails}
          onUploadImage={handleUploadPanImage}
          panImage={panImage}
          panVerificationMethod={panVerificationMethod}
          onSetVerificationMethod={setPanVerificationMethod}
          panVerified={panVerified}
        />

        {panVerified && <Text style={styles.verificationStatus}>✓ PAN Verified</Text>}

        {/* AADHAR */}
        <AadharInputComponent
          aadhar={aadhar}
          onAadharChange={validateAadhar}
          onSendOtp={handleSendOtp}
          aadharVerified={aadharVerified}
        />

        {/* DOB */}
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Text style={styles.panLabel}>Date of Birth</Text>
          <View style={styles.input}>
            <Text style={{ color: dob ? "#000" : "#777" }}>
              {dob ? dob.toDateString() : "Select DOB"}
            </Text>
          </View>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDob(selectedDate);
            }}
          />
        )}

        {/* EMAIL */}
        <Text style={styles.panLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* BANK DETAILS */}
        <Text style={styles.bankDetailsTitle}>Bank Details</Text>

        <Text style={styles.panLabel}>Account Number</Text>
        <TextInput
          style={[styles.input, accountNumberError && styles.inputError]}
          placeholder="Account Number"
          keyboardType="numeric"
          value={accountNumber}
          onChangeText={validateAccountNumber}
        />
        {accountNumberError ? (
          <Text style={styles.errorText}>{accountNumberError}</Text>
        ) : null}

        <Text style={styles.panLabel}>Bank Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Bank Name"
          value={bankName}
          onChangeText={setBankName}
        />

        <Text style={styles.panLabel}>IFSC Code</Text>
        <TextInput
          style={[styles.input, ifscError && styles.inputError]}
          placeholder="SBIN0000001"
          value={ifsc}
          onChangeText={validateIfscCode}
          autoCapitalize="characters"
        />
        {ifscError ? (
          <Text style={styles.errorText}>{ifscError}</Text>
        ) : null}

        <Text style={styles.panLabel}>Branch</Text>
        <TextInput
          style={styles.input}
          placeholder="Branch Name"
          value={branch}
          onChangeText={setBranch}
        />

        {/* CONTINUE */}
        <TouchableOpacity
          style={[
            styles.button,
            (!panVerified || !aadharVerified) && styles.buttonDisabled,
          ]}
          disabled={!panVerified || !aadharVerified}
          onPress={proceed}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* OTP MODAL */}
        <OtpVerificationModal
          visible={showOtpModal}
          generatedOtp={generatedAadharOtp}
          onVerify={handleOtpVerification}
          onClose={() => setShowOtpModal(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- 3. Updated Stylesheet ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 25,
    paddingBottom: 50,
  },
  step: {
    color: "#777",
    marginBottom: 5,
    marginTop: 20,
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    fontSize: 16,
    marginBottom: 5,
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 15,
    fontWeight: "600",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 12,
    marginBottom: 15,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // --- PAN Component Styles ---
  panContainer: {
    marginBottom: 15,
  },
  panLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontWeight: "bold",
  },
  panInputField: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  fetchButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadIcon: {
    fontSize: 30,
    color: "#777",
    marginBottom: 5,
  },
  uploadText: {
    fontSize: 16,
    color: "#777",
  },
  uploadedImageContainer: {
    alignItems: "center",
  },
  uploadedImage: {
    width: 100,
    height: 60,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadedText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },

  // --- Aadhar Component Styles ---
  aadharContainer: {
    marginBottom: 15,
  },
  aadharLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontWeight: "bold",
  },
  aadharInputField: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  sendOtpButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendOtpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  verifiedButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  verificationStatus: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 10,
  },

  // --- Bank Section ---
  bankDetailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001F54",
    marginTop: 20,
    marginBottom: 15,
  },

  // --- OTP Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 350,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  otpModalInput: {
    width: "100%",
    height: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 5,
  },
  verifyButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeModalText: {
    color: "#001F54",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },

  // --- Verification Method Buttons ---
  methodLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    fontWeight: "600",
  },
  methodButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  methodButton: {
    flex: 1,
    height: 45,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  methodButtonActive: {
    borderColor: "#001F54",
    backgroundColor: "#e3f2fd",
  },
  methodButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  methodButtonTextActive: {
    color: "#001F54",
  },
});
