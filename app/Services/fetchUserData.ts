import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Biometric } from "../models/biometricModel";
import { Preferences } from "../models/preferenceModel";
import { Gym } from "../models/gymInfoModel";
// Define TypeScript interface for biometric data

export async function fetchUserBiometrics(): Promise<Biometric | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Biometric; // Cast the response as BiometricData
    } else {
      console.log("No biometric data found for user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching biometrics:", error);
    return null;
  }
}

export async function fetchUserPreferences(): Promise<Preferences | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "users", user.uid, "questionnaire", "data");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Preferences; // Cast the response as BiometricData
    } else {
      console.log("No biometric data found for user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching biometrics:", error);
    return null;
  }
}

export async function fetchUserGym(): Promise<Gym | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "users", user.uid, "gym", "testGym");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Gym; // Cast the response as BiometricData
    } else {
      console.log("No gym data found for user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching gym:", error);
    return null;
  }
}