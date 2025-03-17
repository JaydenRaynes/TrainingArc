import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

/**
 * Toggles dark mode and updates the preference in Firestore.
 * @param value - Boolean value indicating dark mode status.
 */
export const toggleDarkMode = async (value: boolean): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { darkMode: value });
      console.log("Dark mode preference updated:", value);
    } catch (error) {
      console.error("Error updating dark mode preference:", error);
      throw new Error("Failed to update dark mode preference.");
    }
  }
};

export default toggleDarkMode;

