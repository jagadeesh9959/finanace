import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    pan: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const basicInfo = await AsyncStorage.getItem("@BasicInfoData");
      const loan = await AsyncStorage.getItem("loanDetails");

      if (basicInfo) {
        const parsed = JSON.parse(basicInfo);
        setUserData(parsed);
        setEditForm({
          fullName: parsed.fullName || "",
          email: parsed.email || "",
          mobile: parsed.mobile || "",
          pan: parsed.pan || "",
          dob: parsed.dob || "",
          address: parsed.address || "",
          city: parsed.city || "",
          state: parsed.state || "",
          pincode: parsed.pincode || "",
        });
      }
      if (loan) {
        setLoanData(JSON.parse(loan));
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const handleEditSave = async () => {
    if (!editForm.fullName || !editForm.email || !editForm.mobile) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const updatedData = { ...userData, ...editForm };
      await AsyncStorage.setItem("@BasicInfoData", JSON.stringify(updatedData));
      setUserData(updatedData);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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

  const handleDownloadStatement = () => {
    Alert.alert("Download", "Loan statement will be sent to your email");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* NEW HOME-STYLE HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>My Profile</Text>
            <Text style={styles.username}>
              {userData?.fullName?.split(" ")[0] || "User"} 👋
            </Text>
          </View>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#001F3F" />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.fullName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userData?.fullName || "User"}</Text>
              <Text style={styles.profileEmail}>{userData?.email}</Text>
              <Text style={styles.profileMobile}>{userData?.mobile}</Text>
            </View>
          </View>

          {!editMode && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(true)}
            >
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
              Personal Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "kyc" && styles.activeTab]}
            onPress={() => setActiveTab("kyc")}
          >
            <Text style={[styles.tabText, activeTab === "kyc" && styles.activeTabText]}>
              KYC Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "settings" && styles.activeTab]}
            onPress={() => setActiveTab("settings")}
          >
            <Text
              style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* PERSONAL INFO TAB */}
          {activeTab === "info" && (
            <View style={styles.infoContainer}>
              {editMode ? (
                <>
                  <Text style={styles.sectionTitle}>Edit Personal Information</Text>

                  {[
                    { key: "fullName", label: "Full Name *" },
                    { key: "email", label: "Email *", keyboard: "email-address" },
                    { key: "mobile", label: "Mobile *", keyboard: "phone-pad", max: 10 },
                    { key: "dob", label: "Date of Birth", placeholder: "DD/MM/YYYY" },
                    { key: "address", label: "Street Address" },
                    { key: "city", label: "City" },
                    { key: "state", label: "State" },
                    { key: "pincode", label: "Pincode", keyboard: "numeric", max: 6 },
                  ].map((field) => (
                    <View key={field.key} style={styles.formGroup}>
                      <Text style={styles.label}>{field.label}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={field.placeholder || field.label}
                        value={editForm[field.key]}
                        keyboardType={field.keyboard}
                        maxLength={field.max}
                        onChangeText={(t) =>
                          setEditForm({ ...editForm, [field.key]: t })
                        }
                      />
                    </View>
                  ))}

                  {/* PAN - Non editable */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>PAN Number</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: "#eee" }]}
                      editable={false}
                      value={editForm.pan}
                    />
                    <Text style={styles.helperText}>PAN cannot be changed</Text>
                  </View>

                  {/* Save + Cancel */}
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleEditSave}
                    >
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Personal Information</Text>

                  {[
                    { label: "Full Name", icon: "person", value: userData?.fullName },
                    { label: "Email", icon: "email", value: userData?.email },
                    { label: "Mobile", icon: "phone", value: userData?.mobile },
                    { label: "PAN", icon: "credit-card", value: userData?.pan },
                    { label: "DOB", icon: "calendar-today", value: userData?.dob },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                          <MaterialIcons
                            name={item.icon}
                            size={24}
                            color="#D4AF37"
                          />
                          <Text style={styles.infoLabel}>{item.label}</Text>
                        </View>
                        <Text style={styles.infoValue}>{item.value || "N/A"}</Text>
                      </View>
                    </View>
                  ))}

                  {/* Address */}
                  <Text style={styles.sectionTitle}>Address Details</Text>

                  {[
                    { label: "Street Address", icon: "home", value: userData?.address },
                    { label: "City", icon: "location-city", value: userData?.city },
                    { label: "State", icon: "map", value: userData?.state },
                    { label: "Pincode", icon: "local-post-office", value: userData?.pincode },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                          <MaterialIcons name={item.icon} size={24} color="#D4AF37" />
                          <Text style={styles.infoLabel}>{item.label}</Text>
                        </View>
                        <Text style={styles.infoValue}>{item.value || "N/A"}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {/* KYC STATUS TAB */}
          {activeTab === "kyc" && (
            <View style={styles.kycContainer}>
              <Text style={styles.sectionTitle}>KYC Verification Status</Text>

              {[
                {
                  label: "PAN Verification",
                  icon: "assignment-ind",
                  value: userData?.pan,
                  verified: userData?.panVerified,
                },
                {
                  label: "Aadhaar Verification",
                  icon: "perm-identity",
                  value: "Biometric verification",
                  verified: userData?.aadharVerified,
                },
                {
                  label: "Bank Verification",
                  icon: "account-balance",
                  value: "Account linked & verified",
                  verified: userData?.bankVerified,
                },
              ].map((item, idx) => (
                <View key={idx} style={styles.kycCard}>
                  <View style={styles.kycRow}>
                    <View style={styles.kycLeft}>
                      <MaterialIcons
                        name={item.icon}
                        size={28}
                        color={item.verified ? "#28A745" : "#FFC107"}
                      />
                      <View style={styles.kycInfo}>
                        <Text style={styles.kycName}>{item.label}</Text>
                        <Text style={styles.kycDoc}>{item.value}</Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.kycStatus,
                        {
                          backgroundColor: item.verified
                            ? "#D4EDDA"
                            : "#FFF3CD",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.kycStatusText,
                          {
                            color: item.verified ? "#155724" : "#856404",
                          },
                        ]}
                      >
                        {item.verified ? "✓ Verified" : "⏳ Pending"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {loanData && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
                    Loan Information
                  </Text>

                  <View style={styles.loanInfoCard}>
                    <View style={styles.loanInfoRow}>
                      <Text style={styles.loanInfoLabel}>Loan Amount</Text>
                      <Text style={styles.loanInfoValue}>
                        ₹{loanData.amount?.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.loanInfoRow}>
                      <Text style={styles.loanInfoLabel}>Monthly EMI</Text>
                      <Text style={styles.loanInfoValue}>
                        ₹{loanData.emi}
                      </Text>
                    </View>

                    <View style={styles.loanInfoRow}>
                      <Text style={styles.loanInfoLabel}>Tenure</Text>
                      <Text style={styles.loanInfoValue}>
                        {loanData.months} months
                      </Text>
                    </View>

                    <View style={styles.loanInfoRow}>
                      <Text style={styles.loanInfoLabel}>Interest Rate</Text>
                      <Text style={styles.loanInfoValue}>
                        {loanData.interestRate}% p.a.
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.downloadButton}>
                      <MaterialIcons name="download" size={20} color="#fff" />
                      <Text style={styles.downloadButtonText}>
                        Download Statement
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <View style={styles.settingsContainer}>
              <Text style={styles.sectionTitle}>Account Settings</Text>

              {[
                {
                  label: "Notifications",
                  desc: "Manage notification preferences",
                  icon: "notifications",
                  toggle: true,
                },
                {
                  label: "Language",
                  desc: "English (US)",
                  icon: "language",
                },
                {
                  label: "Two-Factor Authentication",
                  desc: "Enable for extra security",
                  icon: "security",
                  toggle: false,
                },
              ].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialIcons name={item.icon} size={24} color="#D4AF37" />
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.label}</Text>
                      <Text style={styles.settingDesc}>{item.desc}</Text>
                    </View>
                  </View>

                  {item.toggle ? (
                    <MaterialIcons name="toggle-on" size={24} color="#28A745" />
                  ) : (
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
                Other Options
              </Text>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleDownloadStatement}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name="description" size={24} color="#D4AF37" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Download Documents</Text>
                    <Text style={styles.settingDesc}>
                      Loan statements & agreements
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <MaterialIcons name="help" size={24} color="#D4AF37" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Help & Support</Text>
                    <Text style={styles.settingDesc}>
                      FAQs and contact support
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <MaterialIcons name="info" size={24} color="#D4AF37" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>About App</Text>
                    <Text style={styles.settingDesc}>Version 1.0.0</Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
              </TouchableOpacity>

              {/* LOGOUT */}
              <TouchableOpacity
                style={[styles.settingItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name="logout" size={24} color="#DC3545" />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: "#DC3545" }]}>
                      Logout
                    </Text>
                    <Text style={styles.settingDesc}>
                      Sign out from your account
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#DC3545" />
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 InstaLoan Pro</Text>
                <Text style={styles.footerText}>
                  Privacy Policy • Terms & Conditions
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  headerRow: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  greeting: {
    fontSize: 14,
    color: "#6C757D",
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#001F3F",
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#001F54",
    padding: 20,
    margin: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#001F54",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  profileEmail: {
    fontSize: 12,
    color: "#D4AF37",
    marginTop: 4,
  },
  profileMobile: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 2,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: "#001F54",
    fontWeight: "600",
    marginLeft: 8,
  },

  /* TABS */
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#D4AF37",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: "#001F54",
  },

  /* CONTENT */
  content: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001F54",
    marginBottom: 15,
    marginTop: 20,
  },

  infoCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 12,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#001F54",
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#001F54",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  helperText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#001F54",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
  },

  /* KYC */
  kycContainer: {
    paddingVertical: 10,
  },
  kycCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  kycRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  kycInfo: {
    marginLeft: 12,
    flex: 1,
  },
  kycName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#001F54",
  },
  kycDoc: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  kycStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kycStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  loanInfoCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  loanInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  loanInfoLabel: {
    fontSize: 14,
    color: "#666",
  },
  loanInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#001F54",
  },
  downloadButton: {
    backgroundColor: "#001F54",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  downloadButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },

  settingsContainer: {
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingInfo: { marginLeft: 15, flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: "600", color: "#001F54" },
  settingDesc: { fontSize: 12, color: "#666", marginTop: 4 },
  logoutItem: {
    marginTop: 20,
    borderLeftColor: "#DC3545",
  },

  footer: {
    alignItems: "center",
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    marginVertical: 3,
  },
});
