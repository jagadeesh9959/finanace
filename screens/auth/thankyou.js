import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThankYou({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("bottomTabs");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text style={styles.bigCheck}>✓</Text>
          <Text style={styles.title}>Thank You</Text>
          <Text style={styles.sub}>Your Financial Partner</Text>

          <Text style={styles.small}>
            Experience the future of instant lending—simple, secure, and designed for you.
          </Text>
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
    padding: 25,
  },
  bigCheck: {
    fontSize: 70,
    color: "green",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  sub: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "500",
  },
  small: {
    textAlign: "center",
    marginTop: 15,
    color: "#777",
    fontSize: 14,
    lineHeight: 20,
  },
});
