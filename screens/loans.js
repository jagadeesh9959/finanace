import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Loans({ navigation }) {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await AsyncStorage.getItem("@BasicInfoData");
        const loanData = await AsyncStorage.getItem("loanDetails");

        if (userData) setUser(JSON.parse(userData));

        if (loanData) {
          const parsedLoan = JSON.parse(loanData);

          setLoans([
            {
              id: 1,
              ...parsedLoan,
              status: "active",
              createdDate: "15 Nov 2025",
            },
            {
              id: 2,
              amount: 150000,
              emi: 4500,
              months: 36,
              status: "paid",
              createdDate: "10 May 2023",
              paidAmount: 150000,
            },
            {
              id: 3,
              amount: 75000,
              emi: 2500,
              months: 30,
              status: "active",
              createdDate: "01 Jun 2025",
            },
          ]);
        }
      } catch (error) {
        console.log("Error loading loans data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{ name: "login" }],
          }),
      },
    ]);
  };

  const filterLoans = () => {
    if (activeTab === "all") return loans;
    return loans.filter((loan) => loan.status === activeTab);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#28A745";
      case "paid":
        return "#007BFF";
      case "default":
        return "#DC3545";
      default:
        return "#6C757D";
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const LoanCard = ({ loan }) => {
    return (
      <View style={styles.loanCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.loanId}>Loan #{loan.id}</Text>
            <Text style={styles.createdDate}>{loan.createdDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) }]}>
            <Text style={styles.statusText}>{getStatusText(loan.status)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardContent}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Loan Amount</Text>
            <Text style={styles.amount}>₹{loan.amount?.toLocaleString()}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>EMI</Text>
              <Text style={styles.detailValue}>₹{loan.emi}</Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Tenure</Text>
              <Text style={styles.detailValue}>{loan.months} mo</Text>
            </View>

            {loan.status === "paid" && (
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Paid</Text>
                <Text style={styles.detailValue}>₹{loan.paidAmount?.toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* REMOVED Progress Section Completely */}

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => Alert.alert("Loan Details", `Loan #${loan.id}\nAmount: ₹${loan.amount}\nStatus: ${loan.status}`)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="arrow-forward" size={18} color="#001F3F" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Your Loans</Text>
          <Text style={styles.username}>
            {user?.fullName ? user.fullName.split(" ")[0] : "User"} 👋
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={30} color="#001F3F" />
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "paid" && styles.activeTab]}
          onPress={() => setActiveTab("paid")}
        >
          <Text style={[styles.tabText, activeTab === "paid" && styles.activeTabText]}>
            Paid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "default" && styles.activeTab]}
          onPress={() => setActiveTab("default")}
        >
          <Text style={[styles.tabText, activeTab === "default" && styles.activeTabText]}>
            Default
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOAN LIST */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.loansSection}>
          {filterLoans().length > 0 ? (
            filterLoans().map((loan) => <LoanCard key={loan.id} loan={loan} />)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#6C757D" />
              <Text style={styles.emptyText}>No {activeTab} loans found</Text>
            </View>
          )}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("offers")}
          >
            <Text style={styles.primaryButtonText}>Apply for New Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => Alert.alert("Download", "Statement downloaded successfully!")}
          >
            <Text style={styles.secondaryButtonText}>Download Statement</Text>
          </TouchableOpacity>
        </View>
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

  content: {
    flex: 1,
    paddingHorizontal: 10,
  },

  greeting: { fontSize: 14, color: "#6C757D" },
  username: { fontSize: 24, fontWeight: "700", color: "#001F3F" },

  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FFD700",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
  },
  activeTabText: {
    color: "#001F3F",
  },

  loansSection: {
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  loanCard: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loanId: { fontSize: 16, fontWeight: "700", color: "#001F3F" },
  createdDate: { fontSize: 12, color: "#6C757D", marginTop: 4 },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#e0e0e0", marginBottom: 12 },

  cardContent: { marginBottom: 12 },
  amountSection: { marginBottom: 12 },

  amountLabel: { fontSize: 12, color: "#6C757D", marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: "700", color: "#001F3F" },

  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailBox: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  detailLabel: { fontSize: 11, color: "#6C757D", marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#001F3F" },

  detailsButton: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsButtonText: { color: "#001F3F", fontWeight: "600", fontSize: 14 },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: "#6C757D", marginTop: 12 },

  actionSection: { marginBottom: 30, paddingHorizontal: 10 },
  primaryButton: {
    backgroundColor: "#001F3F",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#001F3F", fontWeight: "700", fontSize: 16 },
});
