import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { fetchProfileData, saveProfileData } from "../utils/authHelper";

export default function ProfileSettings({
  name,
  setName,
  age,
  setAge,
  gender,
  setGender,
}: any) {
  const [isExpanded, setIsExpanded] = useState(false); // State to toggle dropdown visibility

  const handleSaveProfile = async () => {
    try {
      await saveProfileData({ name, age, gender });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile data:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={styles.section}>
      {/* Dropdown Header */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.sectionTitle}>Profile Settings</Text>
        <Text style={styles.toggleIcon}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Dropdown Content */}
      {isExpanded && (
        <View style={styles.dropdownContent}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Gender"
            value={gender}
            onChangeText={setGender}
          />
          <Button title="Save Profile" onPress={handleSaveProfile} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdownContent: {
    padding: 15,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
