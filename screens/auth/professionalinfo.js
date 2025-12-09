import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export default function ProfessionalInfo({ navigation }) {
  const [employment, setEmployment] = useState("");
  const [company, setCompany] = useState("");
  const [income, setIncome] = useState("");
  const [salariedDocuments, setSalariedDocuments] = useState([]);
  const [selfEmployedDocuments, setSelfEmployedDocuments] = useState([]);

  const pickDocument = async () => {
    try {
      let allowedTypes;
      
      if (employment === "salaried") {
        allowedTypes = ["application/pdf", "image/*"];
      } else {
        allowedTypes = ["application/pdf", "image/*", "application/vnd.openxmlformats-spreadsheetml.sheet"];
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
      });

      if (!result.canceled) {
        if (employment === "salaried") {
          setSalariedDocuments([...salariedDocuments, result.assets[0]]);
        } else {
          setSelfEmployedDocuments([...selfEmployedDocuments, result.assets[0]]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const removeDocument = (index) => {
    if (employment === "salaried") {
      setSalariedDocuments(salariedDocuments.filter((_, i) => i !== index));
    } else {
      setSelfEmployedDocuments(selfEmployedDocuments.filter((_, i) => i !== index));
    }
  };

  const proceed = () => {
    if (!employment || !income) {
      alert("Please fill required fields.");
      return;
    }

    const currentDocuments = employment === "salaried" ? salariedDocuments : selfEmployedDocuments;
    
    if (currentDocuments.length === 0) {
      alert("Please upload at least one document.");
      return;
    }

    navigation.navigate("KycVerification");

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step 2 of 4</Text>
      <Text style={styles.title}>Professional Details</Text>

      <Text style={styles.label}>Employment Type</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, employment === "salaried" && styles.selected]}
          onPress={() => setEmployment("salaried")}
        >
          <Text style={styles.optionText}>Salaried</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, employment === "self" && styles.selected]}
          onPress={() => setEmployment("self")}
        >
          <Text style={styles.optionText}>Self-Employed</Text>
        </TouchableOpacity>
      </View>

      {employment === "salaried" && (
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={company}
          onChangeText={setCompany}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Net Monthly Income"
        keyboardType="number-pad"
        value={income}
        onChangeText={setIncome}
      />

      {employment && (
        <View style={styles.documentSection}>
          <Text style={styles.label}>Upload Documents</Text>
          <Text style={styles.documentHint}>
            {employment === "salaried" 
              ? "Upload salary slips and/or bank statements (PDF or Image)" 
              : "Upload ITR, business documents, and/or GST certificates (PDF, Image, or Excel)"}
          </Text>

          <TouchableOpacity style={styles.documentButton} onPress={pickDocument}>
            <Text style={styles.documentButtonText}>+ Add Document</Text>
          </TouchableOpacity>

          {(employment === "salaried" ? salariedDocuments : selfEmployedDocuments).map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.documentName} numberOfLines={1}>
                {doc.name}
              </Text>
              <TouchableOpacity onPress={() => removeDocument(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {(employment === "salaried" ? salariedDocuments : selfEmployedDocuments).length > 0 && (
            <Text style={styles.documentCount}>
              {(employment === "salaried" ? salariedDocuments : selfEmployedDocuments).length} document{(employment === "salaried" ? salariedDocuments : selfEmployedDocuments).length > 1 ? "s" : ""} selected
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={proceed}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 25,
  },
  step: {
    color: "#777",
    marginBottom: 5,
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    marginBottom: 20,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  selected: {
    backgroundColor: "#001F54",
    borderColor: "#001F54",
  },
  optionText: {
    color: "#000",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    fontSize: 16,
    marginBottom: 15,
  },
  documentSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  documentHint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  documentButton: {
    width: "100%",
    height: 50,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  documentButtonText: {
    color: "#001F54",
    fontSize: 16,
    fontWeight: "600",
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#001F54",
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  removeText: {
    color: "#e74c3c",
    fontSize: 13,
    fontWeight: "600",
  },
  documentCount: {
    fontSize: 12,
    color: "#27ae60",
    fontWeight: "500",
    marginTop: 5,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#001F54",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});