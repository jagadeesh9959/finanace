import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SuccessScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("ThankYou");
    }, 5000); // 5000ms = 5 seconds

    // Clear timer if component unmounts
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.bigCheck}>✓</Text>
      <Text style={styles.title}>Money is on its way!</Text>
      <Text style={styles.sub}>
        Your loan has been disbursed. Funds will reach your account shortly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  bigCheck: { fontSize: 70, color: "green", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  sub: { textAlign: "center", color: "#777", marginVertical: 20 },
});
