import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await AsyncStorage.getItem("@BasicInfoData");
        const loanData = await AsyncStorage.getItem("loanDetails");

        if (userData) setUser(JSON.parse(userData));
        if (loanData) {
          const parsedLoan = JSON.parse(loanData);
          setLoan(parsedLoan);
        }
      } catch (error) {
        console.log("Error loading dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "login" }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER WITH LOGOUT */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>
            {user?.fullName ? user.fullName.split(" ")[0] : "User"} 👋
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} color="#001F3F" />
        </TouchableOpacity>
      </View>

      {/* Active Loan Card */}
      {loan ? (
        <View style={styles.loanCard}>
          <Text style={styles.cardTitle}>Active Loan</Text>

          <Text style={styles.loanAmount}>₹{loan.amount?.toLocaleString()}</Text>

          <View style={styles.row}>
            <Text style={styles.smallLabel}>Tenure: {loan.months} months</Text>
            <Text style={styles.smallLabel}>EMI:</Text>
            <Text style={styles.highlight}>₹{loan.emi}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Pay EMI</Text>
            </TouchableOpacity>

            
          </View>
        </View>
      ) : (
        <Text style={{ textAlign: "center", marginVertical: 20, color: "#6C757D" }}>
          No active loan found.
        </Text>
      )}

      {/* Upcoming EMI */}
      {loan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming EMI</Text>
          <Text style={styles.sectionText}>Due on: 12 Dec 2025</Text>
          <Text style={styles.sectionAmount}>₹{loan.emi}</Text>

          <TouchableOpacity>
            <Text style={styles.link}>View repayment schedule →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Offers */}
      <View style={styles.offersBox}>
        <Text style={styles.offersTitle}>Exclusive Offers For You</Text>
        <Text style={styles.offersDesc}>Increase your limit up to ₹80,000 instantly</Text>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Check Eligibility</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 16 
  },

  headerRow: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { 
    fontSize: 14, 
    color: "#6C757D" 
  },
  username: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#001F3F" 
  },

  loanCard: {
    backgroundColor: "#001F3F",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardTitle: { 
    color: "#fff", 
    fontSize: 16, 
    marginBottom: 8 
  },
  loanAmount: { 
    color: "#FFD700", 
    fontSize: 30, 
    fontWeight: "700" 
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10 
  },
  smallLabel: { 
    color: "#fff" 
  },
  highlight: { 
    color: "#FFD700", 
    fontWeight: "700" 
  },
  primaryButton: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  primaryButtonText: { 
    color: "#001F3F", 
    fontWeight: "700", 
    textAlign: "center" 
  },

  section: { 
    marginBottom: 25 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 5 
  },
  sectionText: { 
    color: "#6C757D" 
  },
  sectionAmount: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginVertical: 8 
  },
  link: { 
    color: "#001F3F", 
    fontWeight: "700" 
  },

  offersBox: {
    backgroundColor: "#001F3F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
  },
  offersTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#FFD700" 
  },
  offersDesc: { 
    color: "#fff", 
    marginVertical: 10 
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  secondaryButtonSmall: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  secondaryButtonTextSmall: {
    color: "#001F3F",
    fontWeight: "700",
    textAlign: "center",
  },
});
