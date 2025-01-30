import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { auth } from "../firebaseConfig";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";

export default function ChangePasswordModal({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match!");
      return;
    }

    const user = auth.currentUser;

    if (user) {
      try {
        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(
          user.email as string,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);
        Alert.alert("Success", "Password updated successfully!");
        setModalVisible(false); // Close modal
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } catch (error: any) {
        console.error("Error updating password:", error);
        Alert.alert("Error", error.message);
      }
    } else {
      Alert.alert("Error", "No user is logged in.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Old Password"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonText}>Change</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay for better focus
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#191a2f",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    elevation: 10,
  },

  modalTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#FFA500" 
  },

  input: {
    width: "100%",
    backgroundColor: "#1E1E2D",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#FFA500",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },

  cancelButton: { 
    backgroundColor: "transparent", 
    borderWidth: 2, 
    borderColor: "#FFA500" 
  },

  cancelButtonText: { 
    color: "#FFA500" 
  },

  confirmButton: { 
    backgroundColor: "#FFA500" 
  },

  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#0D0D0D" 
  },
});
