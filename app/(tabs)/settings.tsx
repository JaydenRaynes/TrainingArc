import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ProfileSettings from "../settingComponent/profileSetting";
import AppPreferences from "../settingComponent/appPreferences";
import NotificationsSettings from "../settingComponent/notificationSetting";
import PrivacySecurity from "../settingComponent/privacySecurity";
import ChangePasswordModal from "../settingComponent/changePasswordModal";

export default function Settings() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ProfileSettings name={name} setName={setName} age={age} setAge={setAge} gender={gender} setGender={setGender} />
        <AppPreferences isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <NotificationsSettings isNotificationsEnabled={isNotificationsEnabled} setIsNotificationsEnabled={setIsNotificationsEnabled} />
        <PrivacySecurity setModalVisible={setModalVisible} />
      </ScrollView>
      <ChangePasswordModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </View>
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
