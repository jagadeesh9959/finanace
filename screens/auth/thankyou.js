import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ThankYou({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("Dashboard");  // Navigate after 5 seconds
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.bigCheck}>✓</Text>
      <Text style={styles.title}>Thank You</Text>
      <Text style={styles.sub}>Your Financial Partner</Text>
      <Text style={styles.small}>
        Experience the future of instant lending—simple, secure, and designed for you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 25, 
    backgroundColor: "#fff" 
  },
  bigCheck: { 
    fontSize: 70, 
    color: "green", 
    marginBottom: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "700" 
  },
  sub: { 
    fontSize: 18, 
    marginTop: 10, 
    fontWeight: "500" 
  },
  small: { 
    textAlign: "center", 
    marginTop: 15, 
    color: "#777" 
  },
});
