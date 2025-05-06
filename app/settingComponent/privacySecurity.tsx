import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function PrivacySecurity({ setModalVisible }: any) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  const handleSignOut = async () => {
    if (!auth.currentUser) {
      Alert.alert("Notice", "You are not signed in.");
      return;
    }

    Alert.alert("Confirm Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            Alert.alert("Success", "You have been signed out!");
            router.replace("/");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

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
      <View style={styles.dropdownHeader}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Coming soon!")}>
        <Text style={styles.buttonText}>Two-Factor Authentication</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSignOut}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Out</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
        <Text style={[styles.buttonText, styles.dangerButtonText]}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFA500",
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFA500"
   },
  toggleIcon: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFA500" 
  },
  button: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 10,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#0D0D0D" 
  },
  text: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: "#FFA500",
    borderWidth: 2,
  },
  secondaryButtonText: { 
    color: "#FFA500" 
  },
  dangerButton: {
    backgroundColor: "#D9534F",
  },
  dangerButtonText: { 
    color: "#FFF" 
  },
});
