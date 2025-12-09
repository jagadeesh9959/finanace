import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinalSteps({ navigation }) {
  const [loanData, setLoanData] = useState(null);

  const [accountNo, setAccountNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");

  const [agreementSigned, setAgreementSigned] = useState(false);
  const [disbursalConfirmed, setDisbursalConfirmed] = useState(false);
  const [loadingBasicInfo, setLoadingBasicInfo] = useState(true);

  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        const loanJson = await AsyncStorage.getItem("loanDetails");
        if (loanJson) setLoanData(JSON.parse(loanJson));

        const basicJson = await AsyncStorage.getItem("@BasicInfoData");
        if (basicJson) {
          const basic = JSON.parse(basicJson);

          if (basic.accountNumber) setAccountNo(String(basic.accountNumber));
          if (basic.bankName) setBankName(basic.bankName);
          if (basic.ifsc) setIfsc(String(basic.ifsc).toUpperCase());
        }
      } catch (err) {
        console.error("Error loading saved data:", err);
      } finally {
        setLoadingBasicInfo(false);
      }
    };

    fetchSavedData();
  }, []);

  if (!loanData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.loading}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canProceed =
    accountNo.length > 0 &&
    bankName.length > 0 &&
    ifsc.length > 0 &&
    agreementSigned &&
    disbursalConfirmed;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Final Steps to Funding</Text>

        {/* STEP 1 - Loan Summary */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>1. Loan Summary</Text>
          <Text style={styles.text}>Amount: ₹{loanData.amount}</Text>
          <Text style={styles.text}>Tenure: {loanData.months} months</Text>
          <Text style={styles.text}>Interest: {loanData.interestRate}%</Text>
          <Text style={styles.text}>EMI: ₹{loanData.emi}</Text>
        </View>

        {/* STEP 2 - e-Mandate */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>2. Setup e-Mandate (Auto Pay)</Text>

          {loadingBasicInfo ? (
            <Text style={styles.text}>Loading account details...</Text>
          ) : accountNo && bankName && ifsc ? (
            <>
              <Text style={styles.text}>Account No: {accountNo}</Text>
              <Text style={styles.text}>Bank Name: {bankName}</Text>
              <Text style={styles.text}>IFSC: {ifsc}</Text>
            </>
          ) : (
            <>
              <Text style={styles.text}>No account details found.</Text>
              <Text style={styles.text}>
                Please return to the Basic Info screen and save your bank
                details.
              </Text>
            </>
          )}
        </View>

        {/* STEP 3 - Agreement */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>3. Sign Digital Agreement</Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreementSigned(!agreementSigned)}
          >
            <View style={styles.checkbox}>
              {agreementSigned && <Text style={styles.tick}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I agree to the loan terms & policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* STEP 4 - Confirm Disbursal */}
        <View style={styles.card}>
          <Text style={styles.stepTitle}>4. Confirm Disbursal</Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setDisbursalConfirmed(!disbursalConfirmed)}
          >
            <View style={styles.checkbox}>
              {disbursalConfirmed && <Text style={styles.tick}>✓</Text>}
            </View>
            <Text style={styles.checkText}>Confirm loan disbursal</Text>
          </TouchableOpacity>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          disabled={!canProceed}
          style={[
            styles.button,
            { backgroundColor: canProceed ? "#001F54" : "#aaa" },
          ]}
          onPress={() => navigation.navigate("SuccessScreen")}
        >
          <Text style={styles.buttonText}>Complete Process</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 25,
    paddingBottom: 40, // enough space at bottom, but not too much
  },
  loading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f4f4f4",
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 3,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#001F54",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  tick: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001F54",
  },
  checkText: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
