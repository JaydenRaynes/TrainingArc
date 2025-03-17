import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { fetchProfileData, saveProfileData } from "../utils/authHelper";
import { useRouter } from "expo-router";

export default function ProfileSettings({
  name = "",
  setName,
  username = "",
  setUsername,
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const animation = useState(new Animated.Value(0))[0];

  const handleSaveProfile = async () => {
    try {
      await saveProfileData({ name, username });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile data:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.section}>
      {/* Dropdown Header */}
      <TouchableOpacity style={styles.dropdownHeader} onPress={toggleDropdown}>
        <Text style={styles.sectionTitle}>Profile Settings</Text>
        <Text style={styles.toggleIcon}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Dropdown Content with Dynamic Height */}
      <Animated.View
        style={[
          styles.dropdownContent,
          {
            maxHeight: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400], // Adjust height dynamically
            }),
            opacity: animation,
          },
        ]}
      >
        {isExpanded && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#B0B0B0"
              value={name}
              onChangeText={setName}
            />
            {/* <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#B0B0B0"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            /> */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#B0B0B0"
              value={username}
              onChangeText={setUsername}
            />

            {/* Save Profile Button */}
            <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>

            {/* Set Biometrics Button */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/biometrics")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Update Biometrics
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1E1E2D",
    paddingVertical: 10,
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFA500" },

  toggleIcon: { fontSize: 18, fontWeight: "bold", color: "#FFA500" },

  dropdownContent: {
    backgroundColor: "#191a2f",
    paddingHorizontal: 15,
    paddingBottom: 15,
    overflow: "hidden",
  },

  input: {
    borderWidth: 1,
    borderColor: "#FFA500",
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    color: "#FFF",
    fontSize: 16,
    backgroundColor: "#1E1E2D",
  },

  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: "center",
  },

  buttonText: { fontSize: 16, fontWeight: "bold", color: "#0D0D0D" },

  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: "#FFA500",
    borderWidth: 2,
  },

  secondaryButtonText: { color: "#FFA500" },
});
