import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

// Define TypeScript interface for biometric data
interface BiometricData {
  age: number;
  gender: string;
  goal: string;
  height: number;
  weight: number;
  activityLevel: string;
  preferences: {
    trainingType: string;
    cardioPreference: string;
    gymEquipment: boolean;
    focusAreas: string[];
  };
}

export async function fetchUserBiometrics(): Promise<BiometricData | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as BiometricData; // Cast the response as BiometricData
    } else {
      console.log("No biometric data found for user.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching biometrics:", error);
    return null;
  }
}
