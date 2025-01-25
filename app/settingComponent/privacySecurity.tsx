import React, {useState} from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function PrivacySecurity({ setModalVisible }: any) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // State to toggle dropdown visibility

  const handleSignOut = async () => {
    try {
      if (auth.currentUser) {
        Alert.alert(
          "Confirm Sign Out",
          "Are you sure you want to sign out?",
          [
            {
              text: "Cancel",
              style: "cancel", 
            },
            {
              text: "Sign Out",
              style: "destructive", 
              onPress: async () => {
                try {
                  await signOut(auth);
                  Alert.alert("Success", "You have been signed out!");
                  router.replace("/login"); // Navigate to Login screen
                } catch (error) {
                  console.error("Error signing out:", error);
                  Alert.alert("Error", "Failed to sign out. Please try again.");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Notice", "You are not signed in.");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };
  

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteUser(user);
                Alert.alert("Success", "Account deleted successfully!");
                router.replace("/login");
              } catch (error) {
                console.error("Error deleting account:", error);
                Alert.alert("Error", (error as any).message);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <Text style={styles.toggleIcon}>{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.dropdownContent}>
          <Button title="Change Password" onPress={() => setModalVisible(true)} />
          <Button title="Two-Factor Authentication" onPress={() => Alert.alert("Coming soon!")} />
          <Button title="Delete Account" onPress={handleDeleteAccount} />
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  section: { 
    marginBottom: 30
   },

  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
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
