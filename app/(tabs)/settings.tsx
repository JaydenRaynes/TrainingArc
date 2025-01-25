import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
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
    <ScrollView style={styles.container}>
      <ProfileSettings name={name} setName={setName} age={age} setAge={setAge} gender={gender} setGender={setGender} />
      <AppPreferences isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <NotificationsSettings isNotificationsEnabled={isNotificationsEnabled} setIsNotificationsEnabled={setIsNotificationsEnabled} />
      <PrivacySecurity setModalVisible={setModalVisible} />
      <ChangePasswordModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
});
