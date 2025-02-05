import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface UserProfile {
  name?: string;
  age?: string;
  gender?: string;
  darkMode?: boolean;
  [key: string]: any;
}

export const fetchProfileData = async (): Promise<UserProfile | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Failed to fetch profile data.");
  }
};

export const saveProfileData = async (data: UserProfile): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, data);
    console.log("Profile data saved:", data);
  } catch (error) {
    console.error("Error saving profile data:", error);
    throw new Error("Failed to save profile data.");
  }
};

export default {fetchProfileData, saveProfileData};