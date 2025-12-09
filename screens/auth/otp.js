import React, { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Otp({ route, navigation }) {
  const { mobile } = route.params ?? {};

  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);

  const generateOtp = async () => {
    const newOtp = (Math.floor(100000 + Math.random() * 900000)).toString();
    await AsyncStorage.setItem("userOtp", newOtp);
    console.log("📌 OTP:", newOtp);
  };

  useEffect(() => {
    generateOtp();
    startTimer();
  }, []);

  const startTimer = () => {
    setTimer(30);
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) clearInterval(countdown);
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (text, index) => {
    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const resendOtp = async () => {
    await generateOtp();
    startTimer();
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current.forEach(input => input?.clear());
  };

  const verifyOtp = async () => {
    const entered = otp.join("");
    const stored = await AsyncStorage.getItem("userOtp");

    if (entered !== stored) {
      Alert.alert("Incorrect OTP", "Try again.");
      return;
    }

    Alert.alert("Success", "OTP Verified!");

    // -----------------------------------------------------
    // CHECK USER & LOAN STATUS
    // -----------------------------------------------------
    const userData = await AsyncStorage.getItem("@BasicInfoData");
    const loanData = await AsyncStorage.getItem("loanDetails");

    if (userData) {
      const parsed = JSON.parse(userData);

      if (parsed.mobile === mobile) {

        // ⭐ Loan exists → go to dashboard
        if (loanData) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
          return;
        }

        // ⭐ Existing user but no loan → skip BasicInfo
        navigation.navigate("ProfessionalInfo");
        return;
      }
    }

    // ⭐ New user → start from BasicInfo
    navigation.navigate("BasicInfo", { mobile });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Sent to: +91 {mobile}</Text>

      <View style={styles.otpContainer}>
        {otp.map((_, index) => (
          <TextInput
            key={index}
            maxLength={1}
            keyboardType="number-pad"
            ref={(ref) => (inputRefs.current[index] = ref)}
            onChangeText={(text) => handleChange(text, index)}
            style={styles.otpInput}
            autoFocus={index === 0}
          />
        ))}
      </View>

      {timer > 0 ? (
        <Text style={styles.timer}>Resend OTP in {timer}s</Text>
      ) : (
        <TouchableOpacity onPress={resendOtp}>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={verifyOtp}>
        <Text style={styles.buttonText}>Verify & Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { marginTop: 10, color: "#777" },
  otpContainer: { flexDirection: "row", gap: 10, marginVertical: 20 },
  otpInput: {
    width: 45, height: 55, borderWidth: 1, borderColor: "#ccc",
    borderRadius: 10, textAlign: "center", fontSize: 20,
  },
  timer: { marginBottom: 10, color: "#555" },
  resend: { color: "#001F54", fontSize: 16 },
  button: {
    width: "80%", height: 50, backgroundColor: "#001F54",
    justifyContent: "center", alignItems: "center", borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
