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
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

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
      const data = await AsyncStorage.getItem("@BasicInfoData");
      if (data) {
        const parsed = JSON.parse(data);
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
    } catch (e) {
      console.log("Error loading profile:", e);
    }
  };

  const handleEditSave = async () => {
    if (!editForm.fullName || !editForm.email || !editForm.mobile)
      return Alert.alert("Error", "Full Name, Email & Mobile are required.");

    try {
      const updated = { ...userData, ...editForm };
      await AsyncStorage.setItem("@BasicInfoData", JSON.stringify(updated));
      setUserData(updated);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Error", "Unable to update profile.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () =>
          navigation.reset({ index: 0, routes: [{ name: "login" }] }),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>My Profile</Text>
          <Text style={styles.username}>
            {userData?.fullName?.split(" ")[0] || "User"} 👋
          </Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#001F3F" />
        </TouchableOpacity>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <View>
            <Text style={styles.profileName}>{userData?.fullName}</Text>
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
          style={[styles.tab, activeTab === "profile" && styles.activeTab]}
          onPress={() => setActiveTab("profile")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profile" && styles.activeTabText,
            ]}
          >
            Profile Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "settings" && styles.activeTabText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLVIEW */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <View>
            {editMode ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <View>
                  <Text style={styles.sectionTitle}>Edit Information</Text>

                  {[
                    { key: "fullName", label: "Full Name *" },
                    { key: "email", label: "Email *", keyboard: "email-address" },
                    { key: "mobile", label: "Mobile *", keyboard: "phone-pad" },
                    { key: "dob", label: "Date of Birth" },
                    { key: "address", label: "Address" },
                    { key: "city", label: "City" },
                    { key: "state", label: "State" },
                    { key: "pincode", label: "Pincode", keyboard: "numeric" },
                  ].map((item) => (
                    <View key={item.key} style={styles.formGroup}>
                      <Text style={styles.label}>{item.label}</Text>
                      <TextInput
                        style={styles.input}
                        value={editForm[item.key]}
                        keyboardType={item.keyboard}
                        onChangeText={(t) =>
                          setEditForm({ ...editForm, [item.key]: t })
                        }
                      />
                    </View>
                  ))}

                  {/* PAN NON EDITABLE */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>PAN Number</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: "#eee" }]}
                      editable={false}
                      value={editForm.pan}
                    />
                  </View>

                  {/* SAVE / CANCEL BUTTONS */}
                  <View style={{ height: -4 }} />
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleEditSave}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ height: 2}} />
                </View>
              </KeyboardAvoidingView>
            ) : (
              <>
                {/* PERSONAL INFO */}
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.formDisplayCard}>
                  <Text style={styles.displayLabel}>Full Name</Text>
                  <Text style={styles.displayValue}>{userData?.fullName}</Text>

                  <Text style={styles.displayLabel}>Email</Text>
                  <Text style={styles.displayValue}>{userData?.email}</Text>

                  <Text style={styles.displayLabel}>Mobile</Text>
                  <Text style={styles.displayValue}>{userData?.mobile}</Text>

                  <Text style={styles.displayLabel}>PAN</Text>
                  <Text style={styles.displayValue}>{userData?.pan}</Text>

                  <Text style={styles.displayLabel}>DOB</Text>
                  <Text style={styles.displayValue}>{userData?.dob}</Text>
                </View>

                {/* ADDRESS */}
                <Text style={styles.sectionTitle}>Address Details</Text>
                <View style={styles.formDisplayCard}>
                  <Text style={styles.displayLabel}>Address</Text>
                  <Text style={styles.displayValue}>{userData?.address}</Text>

                  <Text style={styles.displayLabel}>City</Text>
                  <Text style={styles.displayValue}>{userData?.city}</Text>

                  <Text style={styles.displayLabel}>State</Text>
                  <Text style={styles.displayValue}>{userData?.state}</Text>

                  <Text style={styles.displayLabel}>Pincode</Text>
                  <Text style={styles.displayValue}>{userData?.pincode}</Text>
                </View>

                {/* KYC */}
                <Text style={styles.sectionTitle}>KYC Verification</Text>
                {[
                  {
                    label: "PAN Verification",
                    icon: "assignment-ind",
                    verified: userData?.panVerified,
                  },
                  {
                    label: "Aadhaar Verification",
                    icon: "perm-identity",
                    verified: userData?.aadharVerified,
                  },
                  {
                    label: "Bank Verification",
                    icon: "account-balance",
                    verified: userData?.bankVerified,
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.kycCard}>
                    <View style={styles.kycRow}>
                      <View style={styles.kycLeft}>
                        <MaterialIcons
                          name={item.icon}
                          size={28}
                          color={item.verified ? "#28A745" : "#FFC107"}
                        />
                        <View style={styles.kycInfo}>
                          <Text style={styles.kycName}>{item.label}</Text>
                          <Text style={styles.kycDoc}>
                            {item.verified
                              ? "Verified Successfully"
                              : "Verification Pending"}
                          </Text>
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
                          style={{
                            color: item.verified ? "#155724" : "#856404",
                            fontWeight: "700",
                          }}
                        >
                          {item.verified ? "✓ Verified" : "⏳ Pending"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <View>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert("Language", "Language selection coming soon!")}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="language" size={24} color="#D4AF37" />
                <Text style={styles.settingText}>Language</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
            </TouchableOpacity>

            {/* INFO CARDS */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <MaterialIcons name="schedule" size={32} color="#D4AF37" />
                <Text style={styles.infoTitle}>Business Hours</Text>
                <Text style={styles.infoText}>Mon–Fri: 9 AM – 9 PM</Text>
                <Text style={styles.infoText}>Sat–Sun: 10 AM – 8 PM</Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialIcons name="security" size={32} color="#D4AF37" />
                <Text style={styles.infoTitle}>Secure & Encrypted</Text>
                <Text style={styles.infoText}>
                  Your data is fully protected & private.
                </Text>
              </View>
            </View>

            {/* LOGOUT */}
            <TouchableOpacity
              style={[styles.settingItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="logout" size={24} color="#DC3545" />
                <Text style={[styles.settingText, { color: "#DC3545" }]}>
                  Logout
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#DC3545" />
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
              <Text style={styles.footerText}>© 2024 InstaLoan Pro</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ======================= STYLES ======================= */
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
  greeting: { fontSize: 14, color: "#6C757D" },
  username: { fontSize: 24, fontWeight: "700", color: "#001F3F" },

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
  avatarText: { fontSize: 32, fontWeight: "700", color: "#001F54" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#fff" },
  profileEmail: { fontSize: 12, color: "#D4AF37", marginTop: 4 },
  profileMobile: { fontSize: 12, color: "#ccc", marginTop: 2 },

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
    fontWeight: "700",
    marginLeft: 8,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#D4AF37" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#666" },
  activeTabText: { color: "#001F54" },

  scrollContent: { flex: 1, paddingHorizontal: 15},

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#001F54",
    marginBottom: 15,
    marginTop: 20,
  },

  formDisplayCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  displayLabel: {
    fontSize: 13,
    color: "#555",
    marginTop: 10,
    fontWeight: "600",
  },
  displayValue: {
    fontSize: 15,
    color: "#001F54",
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },

  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#001F54", marginBottom: 6 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#001F54",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "700",
    textAlign: "center",
  },

  kycCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  kycRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kycLeft: { flexDirection: "row", alignItems: "center" },
  kycInfo: { marginLeft: 12 },
  kycName: { fontSize: 14, fontWeight: "700", color: "#001F54" },
  kycDoc: { fontSize: 12, color: "#555" },
  kycStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: "600",
    color: "#001F54",
  },
  logoutItem: { borderLeftColor: "#DC3545" },

  infoSection: { paddingVertical: 20 },
  infoCard: {
    backgroundColor: "#f0f4f8",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
    color: "#001F54",
  },
  infoText: { fontSize: 12, color: "#666", marginTop: 5, textAlign: "center" },

  footer: {
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop:30,
    
  },
  footerText: { fontSize: 12, color: "#999" },
});