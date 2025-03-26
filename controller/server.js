const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = ""; // Remember to keep your API key safe!

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/generate-workout", async (req, res) => {
  const userData = req.body;

  if (!userData) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    console.log("Sending request to OpenAI with formatted data...");

    // Dynamically construct user preferences
    const formatPreferences = (prefObject) => {
      return Object.keys(prefObject)
        .filter((key) => prefObject[key])
        .join(", ") || "None";
    };

    // Format conditions: Check if it's an array, else treat it as a string
    const formatConditions = (conditions) => {
      // If conditions is an array, join them into a comma-separated string
      if (Array.isArray(conditions)) {
        return conditions.length ? conditions.join(", ") : "None";
      }
      // If it's a string (like "none"), return it directly
      return conditions || "None";
    };

    const formattedUserData = `
    📌 **User Biometrics:**
    - **Age:** ${userData.age || "N/A"}
    - **Gender:** ${userData.gender || "N/A"}
    - **Height:** ${userData.height ? `${userData.height} cm` : "N/A"}
    - **Weight:** ${userData.weight ? `${userData.weight} kg` : "N/A"}
    - **Goal:** ${userData.goal || "N/A"}
    - **Activity Level:** ${userData.activityLevel || "N/A"}

    📌 **User Preferences:**
    - **Fitness Level:** ${userData.fitnessLevel || "N/A"}
    - **Workout Duration:** ${userData.workoutDuration || "N/A"}
    - **Workout Frequency:** ${userData.workoutFrequency || "N/A"}
    - **Preferred Workout Type:** ${formatPreferences(userData.preferredWorkoutType)}
    - **Cardio Preferences:** ${formatPreferences(userData.cardioPreferences)}
    - **Equipment Preference:** ${formatPreferences(userData.equipmentPreference)}
    - **Workout Environment:** ${formatPreferences(userData.workoutEnvironment)}
    - **Workout Split Preference:** ${formatPreferences(userData.workoutSplit)}
    - **Time of Day Preference:** ${formatPreferences(userData.timeOfDayPreference)}
    - **Intensity Preference:** ${userData.intensityPreference || "N/A"}
    - **Focus Areas:** ${userData.preferences?.focusAreas?.join(", ") || "None"}


       **IMPORTANT NOTES (Please make sure that any movements/exercises don't interfere with the following):**
    - **Medical Conditions:** ${formatConditions(userData.conditions)} 
    - **Disabilities:** ${userData.disabilities?.length ? userData.disabilities : "None"}
    - **Injuries:** ${userData.injuries?.length ? userData.injuries.join : "None"}

    📌 **Gym Preferences (if applicable):**
    ${userData.gym ? `- **Nearby Gyms:** ${userData.gym.name?.join(", ")}\n- **Equipment Available:** ${userData.gym.equipment?.join(", ")}` : "User has no gym preferences."}

    🔹 **Format Instructions:**
    - Format each individual exercise to fit the following structure:
        export interface Exercise {
          name: string; // Name of the exercise
          muscle: string; // Target muscle group
          equipment: string;  // Equipment needed to do it (default to "body_only" if no equipment)
          instructions?: string;  // Any optional notes
        }
    - Format each workout for the day to fit the following structure:
        export interface WorkoutDay {
          day: string;  // Start with "Day 1"
          exercises: Exercise[]; // Add the exercises for the respective days
        }
    - Format the entire split to fit the following structure:
        export interface Split {
          days: WorkoutDay[]; // Group the days into one split
        }
    - Respond with the split already in JSON format, without any additional text or explanations
    - Generate a **7-day workout plan** based on the user's preferences.
    `;


    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a fitness coach who provides personalized, structured workout plans based on user details.",
          },
          { role: "user", content: formattedUserData },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("OpenAI Raw Response:", response.data); // ✅ Log entire response

    const aiMessage = response.data?.choices?.[0]?.message?.content;
  
    if (!aiMessage) {
      throw new Error("OpenAI did not return a valid workout plan.");
    }
    return res.json({ workoutPlan: aiMessage });
  } catch (error) {
    console.error(
      "OpenAI API Error:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      error: "Failed to generate AI workout",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
