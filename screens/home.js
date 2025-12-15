import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const calculateLoanStats = () => {
    if (!loan) return { paid: 0, remaining: 0, paidEMIs: 0 };

    const paidEMIs = Number(loan.paidEMIs) || 0;
    const amount = Number(loan.amount) || 0;
    const emi = Number(loan.emi) || 0;

    const paidAmount = emi * paidEMIs;
    const remainingAmount = amount - paidAmount;

    return {
      paid: paidAmount,
      remaining: remainingAmount > 0 ? remainingAmount : 0,
      paidEMIs: paidEMIs,
      totalEMIs: Number(loan.months),
      progressPercent: ((paidEMIs / Number(loan.months)) * 100).toFixed(1),
    };
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "login" }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>
            {user?.fullName ? user.fullName.split(" ")[0] : "User"} 👋
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} color="#001F3F" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ACTIVE LOAN */}
        {loan ? (
          <View style={styles.loanCard}>
            <Text style={styles.cardTitle}>Active Loan</Text>

            <Text style={styles.loanAmount}>
              ₹{Number(loan.amount).toLocaleString()}
            </Text>

            <View style={styles.row}>
              <Text style={styles.smallLabel}>Tenure: {loan.months} months</Text>
              <Text style={styles.smallLabel}>EMI:</Text>
              <Text style={styles.highlight}>₹{Number(loan.emi)}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => Alert.alert("Payment", "EMI Payment processed successfully!")}
              >
                <Text style={styles.primaryButtonText}>Pay EMI</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20, color: "#6C757D" }}>
            No active loan found.
          </Text>
        )}

        {/* LOAN STATISTICS */}
        {loan && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Loan Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Paid</Text>
                <Text style={styles.statAmount}>
                  ₹{calculateLoanStats().paid.toLocaleString()}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statAmount}>
                  ₹{calculateLoanStats().remaining.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Repayment Progress</Text>
                <Text style={styles.progressPercent}>
                  {calculateLoanStats().progressPercent}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calculateLoanStats().progressPercent}%` },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {calculateLoanStats().paidEMIs} of {calculateLoanStats().totalEMIs} EMIs paid
              </Text>
            </View>
          </View>
        )}

        {/* UPCOMING EMI */}
        {loan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming EMI</Text>
            <Text style={styles.sectionText}>Due on: 12 Dec 2025</Text>
            <Text style={styles.sectionAmount}>₹{Number(loan.emi)}</Text>

            <TouchableOpacity onPress={() => navigation.navigate("Loans")}>
              <Text style={styles.link}>View repayment schedule →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LOAN DETAILS */}
        {loan && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Loan Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loan Amount</Text>
              <Text style={styles.detailValue}>₹{Number(loan.amount).toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tenure</Text>
              <Text style={styles.detailValue}>{loan.months} Months</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly EMI</Text>
              <Text style={styles.detailValue}>₹{Number(loan.emi).toLocaleString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>
                {loan.rate ? `${loan.rate}%` : "12%"} p.a.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loan Approval Date</Text>
              <Text style={styles.detailValue}>{loan.approvalDate || "15 Nov 2025"}</Text>
            </View>
          </View>
        )}

        {/* OFFERS */}
        <View style={styles.offersBox}>
          <Text style={styles.offersTitle}>Exclusive Offers For You</Text>
          <Text style={styles.offersDesc}>Increase your limit up to ₹80,000 instantly</Text>

          {/* 👉 Navigate to Offers Screen */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("offers")}
          >
            <Text style={styles.primaryButtonText}>Check Eligibility</Text>
          </TouchableOpacity>
        </View>

        {/* APPLY FOR NEW LOAN */}
        <TouchableOpacity 
          style={styles.secondaryOfferBox}
          onPress={() => navigation.navigate("offers")}
        >
          <View style={styles.offerIconBox}>
            <Ionicons name="add-circle-outline" size={28} color="#FFD700" />
          </View>

          <View style={styles.offerTextBox}>
            <Text style={styles.offerNewTitle}>Apply for Additional Loan</Text>
            <Text style={styles.offerNewDesc}>Quick approval in 24 hours</Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#FFD700" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  content: { flex: 1, paddingHorizontal: 10 },
  greeting: { fontSize: 14, color: "#6C757D" },
  username: { fontSize: 24, fontWeight: "700", color: "#001F3F" },

  loanCard: {
    backgroundColor: "#001F3F",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 10,
    marginTop: 10,
  },
  cardTitle: { color: "#fff", fontSize: 16, marginBottom: 8 },
  loanAmount: { color: "#FFD700", fontSize: 30, fontWeight: "700" },

  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  smallLabel: { color: "#fff" },
  highlight: { color: "#FFD700", fontWeight: "700" },

  primaryButton: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  primaryButtonText: {
    color: "#001F3F",
    fontWeight: "700",
    textAlign: "center",
  },

  section: { marginBottom: 25, paddingHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  sectionText: { color: "#6C757D" },
  sectionAmount: { fontSize: 22, fontWeight: "700", marginVertical: 8 },
  link: { color: "#001F3F", fontWeight: "700" },

  offersBox: {
    backgroundColor: "#001F3F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
  },
  offersTitle: { fontSize: 20, fontWeight: "700", color: "#FFD700" },
  offersDesc: { color: "#fff", marginVertical: 10 },

  buttonRow: {
    flexDirection: "row",
  },

  statsContainer: { marginBottom: 25, paddingHorizontal: 10 },

  statsGrid: {
    flexDirection: "row",
  },

  statBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
    marginRight: 4,
  },

  statLabel: { fontSize: 12, color: "#6C757D", marginBottom: 10},
  statAmount: { fontSize: 18, fontWeight: "700", color: "#001F3F" },

  progressSection: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginTop:10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: "600", color: "#001F3F" },
  progressPercent: { fontSize: 16, fontWeight: "700", color: "#FFD700" },

  progressBar: {
    height: 10,
    backgroundColor: "#E9ECEF",
    borderRadius: 5,
    marginBottom: 2,
   
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: "#6C757D", textAlign: "center" },

  detailsSection: {
    marginBottom: 25,
    paddingHorizontal: 10,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailLabel: { fontSize: 14, color: "#6C757D" },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#001F3F" },
  divider: { height: 1, backgroundColor: "#E9ECEF" },

  secondaryOfferBox: {
    backgroundColor: "#001F3F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  offerIconBox: { marginRight: 12 },
  offerTextBox: { flex: 1 },
  offerNewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 4,
  },
  offerNewDesc: { fontSize: 12, color: "#fff" },
});
