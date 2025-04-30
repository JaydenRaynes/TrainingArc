import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ProfileSettings from "../settingComponent/profileSetting";
import { Stack } from "expo-router";
import NotificationsSettings from "../settingComponent/notificationSetting";
import PrivacySecurity from "../settingComponent/privacySecurity";
import ChangePasswordModal from "../settingComponent/changePasswordModal";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";

export default function Settings() {
  const [name, setName] = useState("");
  //const [age, setAge] = useState("");
  //const [gender, setGender] = useState("");
  const [username, setUsername] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  return (
    <>
    <Stack.Screen options = {{ headerShown: false }} />
    <View style={styles.container}>
    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Text style={{ color: "white", fontSize: 18 }}>←</Text>
        </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ProfileSettings name={name} setName={setName} username={username} setUsername={setUsername} />
        <NotificationsSettings isNotificationsEnabled={isNotificationsEnabled} setIsNotificationsEnabled={setIsNotificationsEnabled} />
        <PrivacySecurity setModalVisible={setModalVisible} />
      </ScrollView>
      <ChangePasswordModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191a2f", // Dark theme background
    padding: 10,
  },

  scrollViewContent: {
    paddingBottom: 50, // Prevents content from getting cut off
  },
});
