import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

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
      setTimer((prev) => {
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
    inputRefs.current.forEach((input) => input?.clear());
  };

  const verifyOtp = async () => {
    const entered = otp.join("");
    const stored = await AsyncStorage.getItem("userOtp");

    if (entered !== stored) {
      Alert.alert("Incorrect OTP", "Try again.");
      return;
    }

    Alert.alert("Success", "OTP Verified!");

    const userData = await AsyncStorage.getItem("@BasicInfoData");
    const loanData = await AsyncStorage.getItem("loanDetails");

    if (userData) {
      const parsed = JSON.parse(userData);

      if (parsed.mobile === mobile) {
        if (loanData) {
          navigation.reset({
            index: 0,
            routes: [{ name: "bottomTabs" }],
          });
          return;
        }

        navigation.navigate("ProfessionalInfo");
        return;
      }
    }

    navigation.navigate("BasicInfo", { mobile });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { marginTop: 10, color: "#777" },
  otpContainer: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  timer: { marginBottom: 10, color: "#555" },
  resend: { color: "#001F54", fontSize: 16, fontWeight: "600" },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#001F54",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
