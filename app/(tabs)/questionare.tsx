import React, { act, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { theme } from "../utils/theme";

const Checkbox = ({ label, value, onChange }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={() => onChange(!value)}>
    <View style={[styles.checkbox, value && styles.checkboxChecked]} />
    <Text>{label}</Text>
  </TouchableOpacity>
);

const WorkoutQuestionnaire = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [disabilities, setDisabilities] = useState("");
  const [conditions, setConditions] = useState("");
  const [injuries, setInjuries] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [workoutFrequency, setWorkoutFrequency] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [intensityPreference, setIntensityPreference] = useState("");
  //const [recoveryNeeds, setRecoveryNeeds] = useState("");
  const [equipmentPreference, setEquipmentPreference] = useState({
    Dumbbells: false, 
    Barbells: false,
    Kettlebells: false, 
    ResistanceBands: false, 
    None: false
  });
  const [preferredWorkoutType, setPreferredWorkoutType] = useState({
    Cardio: false, 
    Strength: false, 
    Yoga: false, 
    Hit: false, 
    Bodyweight: false
  });
  const [workoutEnvironment, setWorkoutEnvironment] = useState({
    Home: false, 
    Gym: false, 
    Outdoor: false
  });
  const [cardioPreference, setCardioPreference] = useState({
    Running: false, 
    Cycling: false, 
    Swimming: false, 
    Rowing: false, 
    Walking: false
  });
  const [activityLevel, setActivityLevel] = useState({
    Active: false, 
    Slightly_Active: false, 
    Not_Active: false 
  });
  const [timeOfDayPreference, setTimeOfDayPreference] = useState({
    Morning: false, 
    Afternoon: false, 
    Evening: false, 
    Night: false, 
    Any: false
  });
  const [workoutSplit, setWorkoutSplit] = useState({
    Full_Body: false,
    Weekly_Splits: false, 
    Single_Area_Focus: false
  });



  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }
  
    // Checking if all necessary fields are filled out
    if (!age || !gender || !height || !weight || !fitnessLevel || !fitnessGoal || !workoutFrequency || !workoutDuration ||
      !disabilities || !conditions || !injuries || !equipmentPreference || !preferredWorkoutType || !workoutEnvironment || 
      !cardioPreference || !activityLevel || !timeOfDayPreference || !workoutSplit) {
      Alert.alert("Please fill out all required fields");
      return;
    }
  
    // Create the userData object
    const userData = {
      age,
      gender,
      height,
      weight,
      fitnessLevel,
      disabilities,
      conditions,
      injuries,
      fitnessGoal,
      workoutFrequency,
      workoutDuration,
      intensityPreference,
      equipmentPreference,
      preferredWorkoutType,
      workoutEnvironment,
      cardioPreference,
      activityLevel,
      timeOfDayPreference,
      workoutSplit,
    };
  
    const userDocRef = doc(db, "users", user.uid, "questionnaire", "data");
  
    try {
      await setDoc(userDocRef, userData, { merge: true });
      Alert.alert("Success", "Questionnaire Submitted");
    } catch (error) {
      console.error("Error saving data: ", error);  // Log the error for debugging
      Alert.alert("Error", "Failed to save data");
    }
  };

    

  const handleCheckboxChange = (category, key) => {
    if (category === "equipmentPreference") {
      setEquipmentPreference(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "preferredWorkoutType") {
      setPreferredWorkoutType(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "workoutEnvironment") {
      setWorkoutEnvironment(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "cardioPreference") {
      setCardioPreference(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "activityLevel") {
      setActivityLevel(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "timeOfDayPreference") {
      setTimeOfDayPreference(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (category === "workoutSplit") {
      setWorkoutSplit(prev => ({ ...prev, [key]: !prev[key] }));
    }
    };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Workout Questionnaire</Text>

      <Text style={styles.label}>Age:</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />

      <Text style={styles.label}>Gender:</Text>
      <TextInput style={styles.input} value={gender} onChangeText={setGender} />

      <Text style={styles.label}>Height(ft/in):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />

      <Text style={styles.label}>Weight(lbs):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

      <Text style={styles.label}>Fitness Level:</Text>
      <TextInput style={styles.input} value={fitnessLevel} onChangeText={setFitnessLevel} />

      <Text style={styles.label}>Workout Frequency:</Text>
      <TextInput style={styles.input} value={workoutFrequency} onChangeText={setWorkoutFrequency} />

      <Text style={styles.label}>Current Activity Level:</Text>
      {Object.keys(activityLevel).map((key) => (
        <Checkbox key={key} label={key} value={activityLevel[key]} onChange={() => handleCheckboxChange("activityLevel", key)} />
      ))}

      <Text style={styles.label}>Fitness Goals:</Text>
      <TextInput style={styles.input} value={fitnessGoal} onChangeText={setFitnessGoal} />

      <Text style={styles.label}>Preferred Training Intensity:</Text>
      <TextInput style={styles.input} value={intensityPreference} onChangeText={setIntensityPreference} />

      <Text style={styles.label}>Physical Disabilities:</Text>
      <TextInput style={styles.input} value={disabilities} onChangeText={setDisabilities} />

      <Text style={styles.label}>Chronic Conditions:</Text>
      <TextInput style={styles.input} value={conditions} onChangeText={setConditions} />

      <Text style={styles.label}>Past or Current Injuries:</Text>
      <TextInput style={styles.input} value={injuries} onChangeText={setInjuries} />

      <Text style={styles.label}>Preferred Equipment:</Text>
      {Object.keys(equipmentPreference).map((key) => (
        <Checkbox key={key} label={key} value={equipmentPreference[key]} onChange={() => handleCheckboxChange("equipmentPreference", key)} />
      ))}

      <Text style={styles.label}>Preferred Workout Type:</Text>
      {Object.keys(preferredWorkoutType).map((key) => (
        <Checkbox key={key} label={key} value={preferredWorkoutType[key]} onChange={() => handleCheckboxChange("preferredWorkoutType", key)} />
      ))}

      <Text style={styles.label}>Workout Environment:</Text>
      {Object.keys(workoutEnvironment).map((key) => (
        <Checkbox key={key} label={key} value={workoutEnvironment[key]} onChange={() => handleCheckboxChange("workoutEnvironment", key)} />
      ))}

      <Text style={styles.label}>Cardio Preference:</Text>
      {Object.keys(cardioPreference).map((key) => (
        <Checkbox key={key} label={key} value={cardioPreference[key]} onChange={() => handleCheckboxChange("cardioPreference", key)} />
      ))}

      <Text style={styles.label}>Time of Day Prefrence:</Text>
      {Object.keys(timeOfDayPreference).map((key) => (
        <Checkbox key={key} label={key} value={timeOfDayPreference[key]} onChange={() => handleCheckboxChange("timeOfDayPreference", key)} />
      ))}

      <Text style={styles.label}>Workout Duration (hrs/mins):</Text>
      <TextInput style={styles.input} value={workoutDuration} onChangeText={setWorkoutDuration} />

      <Text style={styles.label}>Workout Target Prefrence:</Text>
      {Object.keys(workoutSplit).map((key) => (
        <Checkbox key={key} label={key} value={workoutSplit[key]} onChange={() => handleCheckboxChange("workoutSplit", key)} />
      ))}

      <Button title="Submit" onPress={handleSubmit} color={theme.colors.primary}/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: theme.fontSize.extraLarge,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
  label: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.extraSmall,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.small,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    color: theme.colors.text,
    fontSize: theme.fontSize.medium,
    marginBottom: theme.spacing.medium,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "grey",
    borderRadius: theme.borderRadius.small,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.text,
    borderRadius: 5,
    marginRight: theme.spacing.small,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    fontWeight: "500",
  },
  buttonContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.medium,
    alignItems: "center",
    marginTop: theme.spacing.large,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
  },
});


export default WorkoutQuestionnaire;