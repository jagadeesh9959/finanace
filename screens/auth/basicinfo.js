import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// ----------------------------------------------------------
//  1. PAN Component
// ----------------------------------------------------------

const PanInputComponent = ({ pan, onPanChange, panVerified }) => {
  return (
    <View style={styles.panContainer}>
      <Text style={styles.panLabel}>PAN Number</Text>

      <TextInput
        style={styles.panInputField}
        value={pan}
        maxLength={10}
        onChangeText={onPanChange}
        autoCapitalize="characters"
        placeholder="ABCDE1234F"
        editable={!panVerified}
      />

      {panVerified && (
        <Text style={styles.verificationStatus}>✓ PAN Verified</Text>
      )}
    </View>
  );
};

// ----------------------------------------------------------
//  2. Aadhaar Component (Option A)
// ----------------------------------------------------------

const AadharInputComponent = ({
  aadhar,
  onAadharChange,
  onSendOtp,
  aadharVerified,
}) => {
  return (
    <View style={styles.aadharContainer}>
      <Text style={styles.aadharLabel}>Aadhaar Number</Text>

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
          <Text style={styles.sendOtpButtonText}>VERIFY</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.verificationStatus}>✓ Aadhaar Verified</Text>
      )}
    </View>
  );
};

// ----------------------------------------------------------
//  OTP Component
// ----------------------------------------------------------

const OtpVerificationModal = ({ visible, generatedOtp, onVerify, onClose }) => {
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
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <Text style={styles.modalSubtitle}>Enter 6-digit OTP</Text>

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
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ----------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------

export default function BasicInfo({ navigation, route }) {
  const mobile = route?.params?.mobile ?? null;

  // States
  const [fullName, setFullName] = useState("");
  const [pan, setPan] = useState("");
  const [aadhar, setAadhar] = useState("");
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

  const [accountNumberError, setAccountNumberError] = useState("");
  const [ifscError, setIfscError] = useState("");

  // ----------------------------------------------------------
  // PAN Verify Logic
  // ----------------------------------------------------------

  const validatePan = (text) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const formatted = text.toUpperCase();
    setPan(formatted);

    if (regex.test(formatted)) {
      setPanVerified(true);
      Alert.alert("Success", "PAN Verified Successfully!");
    } else {
      setPanVerified(false);
    }
  };

  // ----------------------------------------------------------
  // Aadhaar Logic (Option A)
  // ----------------------------------------------------------

  const validateAadhar = (text) => {
    setAadhar(text);
    return /^[0-9]{12}$/.test(text);
  };

  const handleSendOtp = async () => {
    if (!validateAadhar(aadhar)) {
      Alert.alert("Invalid Aadhaar", "Enter 12-digit Aadhaar.");
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedAadharOtp(otp);

    console.log("Aadhaar OTP:", otp);

    setShowOtpModal(true);
  };

  const handleOtpVerification = (verified) => {
    if (verified) {
      setAadharVerified(true);
      setShowOtpModal(false);
    }
  };

  // ----------------------------------------------------------
  // Bank Inputs Validation
  // ----------------------------------------------------------

  const validateAccountNumber = (text) => {
    const regex = /^[0-9]*$/;
    setAccountNumber(text);

    if (!regex.test(text)) {
      setAccountNumberError("Digits only");
    } else if (text.length < 11) {
      setAccountNumberError("Minimum 11 digits");
    } else {
      setAccountNumberError("");
    }
  };

  const validateIfsc = (text) => {
    const formatted = text.toUpperCase();
    setIfsc(formatted);

    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!regex.test(formatted)) setIfscError("Invalid IFSC (SBIN0000001)");
    else setIfscError("");
  };

  // ----------------------------------------------------------
  // Proceed
  // ----------------------------------------------------------

  const proceed = async () => {
    if (!fullName || !dob || !email) {
      Alert.alert("Missing Details", "Fill required fields.");
      return;
    }

    if (!panVerified || !aadharVerified) {
      Alert.alert("Verification Required", "Verify PAN & Aadhaar.");
      return;
    }

    if (!accountNumber || !bankName || !ifsc || !branch) {
      Alert.alert("Missing Bank Details", "Fill bank details.");
      return;
    }

    const data = {
      fullName,
      mobile,
      pan,
      aadhar,
      dob: dob.toISOString(),
      email,
      accountNumber,
      bankName,
      ifsc,
      branch,
    };

    await AsyncStorage.setItem("@BasicInfoData", JSON.stringify(data));

    navigation.navigate("ProfessionalInfo");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <Text style={styles.step}>Step 1 of 4</Text>
            <Text style={styles.title}>Basic Information</Text>

            {/* Full Name */}
            <Text style={styles.panLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
            />

            {/* PAN */}
            <PanInputComponent
              pan={pan}
              onPanChange={validatePan}
              panVerified={panVerified}
            />

            {/* Aadhaar */}
            <AadharInputComponent
              aadhar={aadhar}
              onAadharChange={validateAadhar}
              onSendOtp={handleSendOtp}
              aadharVerified={aadharVerified}
            />

            {/* DOB */}
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={styles.panLabel}>Date of Birth</Text>
              <View style={styles.dobInput}>
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
                onChange={(e, selected) => {
                  setShowPicker(false);
                  if (selected) setDob(selected);
                }}
              />
            )}

            {/* Email */}
            <Text style={styles.panLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
            />

            {/* BANK DETAILS */}
            <Text style={styles.bankDetailsTitle}>Bank Details</Text>

            <Text style={styles.panLabel}>Account Number</Text>
            <TextInput
              style={[styles.input, accountNumberError && styles.inputError]}
              placeholder="Account Number"
              value={accountNumber}
              keyboardType="numeric"
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
              onChangeText={validateIfsc}
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

            {/* Continue */}
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

            {/* OTP Modal */}
            <OtpVerificationModal
              visible={showOtpModal}
              generatedOtp={generatedAadharOtp}
              onVerify={handleOtpVerification}
              onClose={() => setShowOtpModal(false)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------
// Styles
// ----------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollContentContainer: {
    padding: 25,
    paddingBottom: 80,
  },

  step: {
    fontSize: 14,
    marginBottom: 5,
    color: "#777",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },

  dobInput: {
  height: 50,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  paddingHorizontal: 15,
  justifyContent: "center",   // 🔥 centers the DOB text vertically
  marginBottom: 12,
},


  inputError: {
    borderColor: "#ff4444",
  },

  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
  },

  // PAN
  panContainer: {
    marginBottom: 15,
  },

  panLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 5,
  },

  panInputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,

  },

  // Aadhaar
  aadharContainer: {
    marginBottom: 15,
  },

  aadharLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 5,
  },

  aadharInputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },

  sendOtpButton: {
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

  verificationStatus: {
    color: "#4CAF50",
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 10,
  },

  // Bank Section
  bankDetailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001F54",
    marginTop: 20,
    marginBottom: 10,
  },

  // Modal
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
    minHeight: 300,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  modalSubtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 15,
  },

  otpModalInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 22,
    marginBottom: 20,
    letterSpacing: 6,
  },

  verifyButton: {
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
    textAlign: "center",
    color: "#001F54",
    fontSize: 16,
    fontWeight: "600",
  },

  button: {
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
