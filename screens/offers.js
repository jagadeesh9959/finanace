import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function Offers() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Offers</Text>

      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>⭐ Increase Limit Offer</Text>
        <Text style={styles.offerDesc}>
          Increase your loan limit instantly up to ₹80,000.
        </Text>

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>🎁 Cashback EMI Offer</Text>
        <Text style={styles.offerDesc}>
          Get 5% cashback on every EMI paid on time.
        </Text>

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Activate Offer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>💳 Additional Loan Offer</Text>
        <Text style={styles.offerDesc}>
          Get a pre-approved additional loan with fast disbursal.
        </Text>

        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Check Eligibility</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#001F3F",
  },

  offerCard: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#FFD700",
  },

  offerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001F3F",
  },

  offerDesc: {
    marginVertical: 10,
    color: "#6C757D",
  },

  applyBtn: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
  },

  applyText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#001F3F",
  },
});
