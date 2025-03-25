import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function ProfilePage() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    location: '',
    joined: '',
    photoURL: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          name: data.name || "",
          username: data.username || "",
          email: user.email || "",
          location: data.location || "",
          joined: data.joined || "",
          photoURL: data.photoURL || "https://i.pravatar.cc/300",
        });
      }
    };

    fetchProfileData();
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfileData(prev => ({ ...prev, photoURL: uri }));

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { photoURL: uri });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: profileData.photoURL }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* User Info */}
      <Text style={styles.name}>{profileData.name}</Text>
      <Text style={styles.username}>@{profileData.username}</Text>

      {/* Profile Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{profileData.email}</Text>

        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={styles.infoValue}>{profileData.location}</Text>

        <Text style={styles.infoLabel}>Joined:</Text>
        <Text style={styles.infoValue}>{profileData.joined}</Text>
      </View>

      {/* Proress*/}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("../component/progress")}
      >
        <Feather name="activity" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.settingsText}>View My Progress</Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("../component/settings")}
      >
        <Feather name="settings" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#191a2f",
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 40,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  username: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  infoSection: {
    width: "100%",
    backgroundColor: "#2c2f48",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    color: "white",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffa500",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "60%",
    marginTop: 10,
  },  
  settingsText: {
    color: "#191a2f",
    fontSize: 16,
    fontWeight: "bold",
  },
});
