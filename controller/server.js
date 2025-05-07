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
const APININJA_API_KEY = "F1MrXYbs75rYDmGS8V9GQw==nADb7j66vFLL1qmo";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/generate-workout/:day", async (req, res) => {
  const userData = req.body;
  const day = req.params.day; // Get the day from the URL parameter

  if (!userData) {
    return res.status(400).json({ error: "Missing user data" });
  }

  try {
    console.log("Sending request to OpenAI with formatted data...");

    // // Dynamically construct user preferences
    // const formatPreferences = (prefObject) => {
    //   return Object.keys(prefObject)
    //     .filter((key) => prefObject[key])
    //     .join(", ") || "None";
    // };

    // // Format conditions: Check if it's an array, else treat it as a string
    // const formatConditions = (conditions) => {
    //   // If conditions is an array, join them into a comma-separated string
    //   if (Array.isArray(conditions)) {
    //     return conditions.length ? conditions.join(", ") : "None";
    //   }
    //   // If it's a string (like "none"), return it directly
    //   return conditions || "None";
    // };
    let gymSettings = "Ignore — user is not training at a gym.";
    if (userData.workoutPreference === "Gym" && userData.gym) {
      gymSettings = `- Gym(s): ${userData.gym.name?.join(", ") || "N/A"}
    - Equipment at Gym: ${userData.gym.equipment?.join(", ") || "N/A"}`;
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function getWorkoutDayBreakdown(startDateStr, preferredWorkoutDays) {
      console.log("startDateStr:", startDateStr); // ✅ Log start date string
      const startDate = new Date(startDateStr); // Expected format: 'YYYY-MM-DD'
      console.log("startDate:", startDate); // ✅ Log parsed start date
      const result = [];
    
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate.getTime());
        currentDate.setDate(startDate.getDate() + i);
    
        const dateStr = `${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}-${String(currentDate.getUTCDate()).padStart(2, '0')}-${currentDate.getUTCFullYear()}`;
        const dayOfWeek = dayNames[currentDate.getUTCDay()];
        const isWorkout = preferredWorkoutDays.includes(dayOfWeek);
    
        result.push(`${dateStr} (${dayOfWeek}) - ${isWorkout ? "Workout Day" : "Rest Day"}`);
      }
    
      return result.join("\n");
    }

    const formattedUserData = `
    ⚠️ VERY IMPORTANT: You are not allowed to improvise. You must strictly follow every rule. If any rule is broken, the response is invalid.

    📌 USER BIOMETRICS
    - Age: ${userData.age || "N/A"} years
    - Height: ${userData.height || "N/A"}
    - Weight: ${userData.weight || "N/A"}
    - Goal: ${userData.fitnessGoal || "N/A"}
    - Activity Level: ${userData.activityLevel || "N/A"}
    - Start Date: ${userData.startDate || "N/A"} (${day || "Monday"}) (format: YYYY-MM-DD)

    📆 7-Day Schedule Overview:
    ${getWorkoutDayBreakdown(userData.startDate, userData.daysPreference)}

    📌 USER PREFERENCES
    - Experience Level: ${userData.experienceLevel || "Intermediate"}
    - Location: ${userData.workoutPreference || "No preference"}
    - Preferred Equipment: ${userData.equipmentPreference?.join(", ") || "None"}
    - Preferred Muscle Groups: ${userData.workoutGroupPreference?.join(", ") || "None"}

    🚫 HARD LIMITORS
    - Medical/Physical Restrictions: ${userData.limitations || "None"} (Absolutely avoid incompatible exercises)
    - Rest Days: Must leave all non-preferred days blank (no exercises)

    🏋️ GYM SETTINGS (only if location is 'Gym')
    ${gymSettings}

    📏 WORKOUT STRUCTURE
    - Generate a workout plan for 7 consecutive days (starting on the start date)
    - Use only preferred workout days; others are rest days (include empty "exercises": [])
    - Do not exceed 60 minutes of total volume per workout
    - Avoid repeating exercises on consecutive days
    - Ensure rest between training the same muscle groups
    - 50–60% of exercises each week should target preferred muscle groups

    💡 INSTRUCTIONS
    - Use only equipment the user has access to
    - Replace exercises that conflict with limitations
    - Begin sessions with compound movements; isolate second if needed
    - Match weights to user experience (set to 0 for bodyweight)
    - For each exercise, the weight value must always be a number. Use 0 for bodyweight exercises. Do not use descriptive terms like "light", "moderate", or "heavy". Stick to numerical values only

    🧾 FORMAT REQUIREMENTS — RETURN STRICT JSON ONLY
    - The response MUST be a single JSON object using the structure below.
    - DO NOT include any extra text, comments, markdown, or formatting.
    - DO NOT wrap in triple backticks or quote blocks.
    - Respond ONLY with:

    {
      "Split": {
        "days": [
          {
            "day": "MM-DD-YYYY",
            "exercises": [
              {
                "name": "Push-Up",
                "muscle": "Chest",
                "equipment": "Body-weight",
                "weight": 0,
                "reps": 12,
                "sets": 3,
                "instructions": "Maintain straight body, lower to ground."
              }
            ]
          },
          {
            "day": "MM-DD-YYYY",
            "exercises": []
          }
        ]
      }
    }

    ⚠️ Do NOT include markdown, extra text, explanations, or formatting.
    ⚠️ The plan must include exactly 7 days, no more, no less.
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
        max_tokens: 3500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("user days:", userData.daysPreference); // ✅ Log user days
    console.log("Formatted User Data:", formattedUserData); // ✅ Log formatted user data
    console.log("OpenAI Raw Response:", response.data); // ✅ Log entire response

    const aiMessage = response.data?.choices?.[0]?.message?.content;
    console.log(aiMessage);
  
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


app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages array" });
  }

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: "Chatbot error", details: error.message });
  }
});

app.post("/generate-exercise/:exercise", async (req, res) => {
  const exercise = req.params.exercise;
  const userData = req.body;

  if (!userData || !exercise) {
    return res.status(400).json({ error: "Missing user data or exercise name/type" });
  }

  try {
    console.log("Sending request to OpenAI with formatted data...");

    // // Dynamically construct user preferences
    // const formatPreferences = (prefObject) => {
    //   return Object.keys(prefObject)
    //     .filter((key) => prefObject[key])
    //     .join(", ") || "None";
    // };

    // // Format conditions: Check if it's an array, else treat it as a string
    // const formatConditions = (conditions) => {
    //   // If conditions is an array, join them into a comma-separated string
    //   if (Array.isArray(conditions)) {
    //     return conditions.length ? conditions.join(", ") : "None";
    //   }
    //   // If it's a string (like "none"), return it directly
    //   return conditions || "None";
    // };

    const formattedUserData = `
    📌 USER BIOMETRICS
    - Age: ${userData.age || "N/A"} years
    - Height: ${userData.height || "N/A"}
    - Weight: ${userData.weight || "N/A"}
    - Goal: ${userData.fitnessGoal || "N/A"}
    - Activity Level: ${userData.activityLevel || "N/A"}
    
    📌 USER PREFERENCES
    - Experience Level: ${userData.experienceLevel || "Intermediate"}
    - Location: ${userData.workoutPreference || "No preference"}
    - Preferred Equipment: ${userData.equipmentPreference?.join(", ") || "None"}
    
    🚫 NON-FLEXIBLE LIMITATIONS
    - Medical/Physical Restrictions: ${userData.limitations || "None"} (Absolutely avoid incompatible exercises)
    - Rest Days: Must leave all non-preferred days blank (no exercises)
    
    🏋️ GYM SETTINGS (only if location is 'Gym')
    ${userData.workoutPreference === "Gym" && userData.gym ? `- Gym(s): ${userData.gym.name?.join(", ") || "N/A"}
    - Equipment at Gym: ${userData.gym.equipment?.join(", ") || "N/A"}` : "Ignore — user is not training at a gym."}
    
    📏 WORKOUT STRUCTURE
    - Generate a single exercise that is similar to ${exercise} or targets ${exercise} muscle group
    - Avoid repeating exercises on consecutive days
    
    💡 INSTRUCTIONS
    - Use only equipment the user has access to
    - Match weights to user experience (set to 0 for bodyweight)
    - For exercise, the weight value must always be a number. Use 0 for bodyweight exercises. Do not use descriptive terms like "light", "moderate", or "heavy". Stick to numerical values only
    
    🧾 FORMAT REQUIREMENTS — RETURN STRICT JSON ONLY
    - The response MUST be a single JSON object using the structure below.
    - DO NOT include any extra text, comments, markdown, or formatting.
    - DO NOT wrap in triple backticks or quote blocks.
    - Respond ONLY with:

    {
      "exercises": [
        {
          "name": "Push-Up",
          "muscle": "Chest",
          "equipment": "Body-weight",
          "weight": 0,
          "reps": 12,
          "sets": 3,
          "instructions": "Maintain straight body, lower to ground."
        }
      ]
    }

    `;

    //console.log("formatted data: ", formattedUserData);

    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a fitness coach who provides personalized exercises based on user details.",
          },
          { role: "user", content: formattedUserData },
        ],
        temperature: 0.4,
        max_tokens: 3500,
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

app.post("/find-exercises", async (req, res) => {
  const { muscle, name } = req.body;

  if (!muscle && !name) {
    return res.status(400).json({ error: "Please provide a muscle or name to search." });
  }

  try {
    const response = await axios.get("https://api.api-ninjas.com/v1/exercises", {
      params: {
        muscle, // e.g. "biceps"
        name,   // e.g. "curl"
      },
      headers: {
        "X-Api-Key": APININJA_API_KEY,
      },
    });

    return res.json({ exercises: response.data });
  } catch (error) {
    console.error("API Ninja Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch exercises",
      details: error.response?.data || error.message,
    });
  }
});

// const formattedUserData = `
// 📌 **User Biometrics:**
// - **Age:** ${userData.age || "N/A"}
// - **Gender:** ${userData.gender || "N/A"}
// - **Height:** ${userData.height ? `${userData.height} cm` : "N/A"}
// - **Weight:** ${userData.weight ? `${userData.weight} kg` : "N/A"}
// - **Goal:** ${userData.goal || "N/A"}
// - **Activity Level:** ${userData.activityLevel || "N/A"}
// - **Start Date:** ${userData.startDate || "N/A"}

// 📌 **User Preferences:**
// - **Fitness Level:** ${userData.fitnessLevel || "N/A"}
// - **Workout Duration:** ${userData.workoutDuration || "N/A"}
// - **Workout Frequency:** ${userData.workoutFrequency || "N/A"}
// - **Preferred Workout Type:** ${formatPreferences(userData.preferredWorkoutType)}
// - **Cardio Preferences:** ${formatPreferences(userData.cardioPreferences)}
// - **Equipment Preference:** ${formatPreferences(userData.equipmentPreference)}
// - **Workout Environment:** ${formatPreferences(userData.workoutEnvironment)}
// - **Workout Split Preference:** ${formatPreferences(userData.workoutSplit)}
// - **Time of Day Preference:** ${formatPreferences(userData.timeOfDayPreference)}
// - **Intensity Preference:** ${userData.intensityPreference || "N/A"}
// - **Focus Areas:** ${userData.preferences?.focusAreas?.join(", ") || "None"}


//    **IMPORTANT NOTES (Please make sure that any movements/exercises don't interfere with the following):**
// - **Medical Conditions:** ${formatConditions(userData.conditions)} 
// - **Disabilities:** ${userData.disabilities?.length ? userData.disabilities : "None"}
// - **Injuries:** ${userData.injuries?.length ? userData.injuries.join : "None"}

// 📌 **Gym Preferences (if applicable):**
// ${userData.gym ? `- **Nearby Gyms:** ${userData.gym.name?.join(", ")}\n- **Equipment Available:** ${userData.gym.equipment?.join(", ")}` : "User has no gym preferences."}

// 🔹 **Format Instructions:**
// - Format each individual exercise to fit the following structure:
//     export interface Exercise {
//       name: string; // Name of the exercise
//       muscle: string; // Target muscle group
//       equipment: string;  // Equipment needed to do it (default to "none" if no equipment)
//       weight: string;  // Recommended weight for the user based off of experience and preferences (provide weight in pounds, bodyweight if no equipment)
//       reps: string;  // Recommended number of repetitions for the user
//       sets: string;  // Recommended number of sets for the user
//       instructions?: string;  // Any optional notes
//     }
// - Format each workout for the day to fit the following structure:
//     export interface WorkoutDay {
//       day: string;  // Start with the start date given above, where it is formatted as MM-DD-YYYY
//       exercises: Exercise[]; // Add the exercises for the respective days
//     }
// - Format the entire split to fit the following structure:
//     export interface Split {
//       days: WorkoutDay[]; // Group the days into one split
//     }
// - Respond with the split already in JSON format, without any additional text or explanations
// - Generate a **7-day workout plan** based on the user's preferences.
// `;

// const formattedUserData = `
// 📌 **User Biometrics:**
// - **Age:** ${userData.age || "N/A"}
// - **Gender:** ${userData.gender || "N/A"}
// - **Height:** ${userData.height ? `${userData.height} cm` : "N/A"}
// - **Weight:** ${userData.weight ? `${userData.weight} kg` : "N/A"}
// - **Goal:** ${userData.goal || "N/A"}
// - **Activity Level:** ${userData.activityLevel || "N/A"}
// - **Start Date:** ${userData.startDate || "N/A"}

// 📌 **User Preferences:**
// - **Fitness Level:** ${userData.fitnessLevel || "N/A"}
// - **Workout Duration:** ${userData.workoutDuration || "N/A"}
// - **Workout Frequency:** ${userData.workoutFrequency || "N/A"}
// - **Preferred Workout Type:** ${formatPreferences(userData.preferredWorkoutType)}
// - **Cardio Preferences:** ${formatPreferences(userData.cardioPreferences)}
// - **Equipment Preference:** ${formatPreferences(userData.equipmentPreference)}
// - **Workout Environment:** ${formatPreferences(userData.workoutEnvironment)}
// - **Workout Split Preference:** ${formatPreferences(userData.workoutSplit)}
// - **Time of Day Preference:** ${formatPreferences(userData.timeOfDayPreference)}
// - **Intensity Preference:** ${userData.intensityPreference || "N/A"}
// - **Focus Areas:** ${userData.preferences?.focusAreas?.join(", ") || "None"}


//    **IMPORTANT NOTES (Please make sure that any movements/exercises don't interfere with the following):**
// - **Medical Conditions:** ${formatConditions(userData.conditions)} 
// - **Disabilities:** ${userData.disabilities?.length ? userData.disabilities : "None"}
// - **Injuries:** ${userData.injuries?.length ? userData.injuries.join : "None"}

// 📌 **Gym Preferences (if applicable):**
// ${userData.gym ? `- **Nearby Gyms:** ${userData.gym.name?.join(", ")}\n- **Equipment Available:** ${userData.gym.equipment?.join(", ")}` : "User has no gym preferences."}

// 🔹 **Format Instructions:**
// - Format one exercise with the name ${exercise} or of type ${exercise} to fit the following structure:
//     export interface Exercise {
//       name: string; // Name of the exercise
//       muscle: string; // Target muscle group
//       equipment: string;  // Equipment needed to do it (default to "none" if no equipment)
//       weight: string;  // Recommended weight for the user based off of experience and preferences (provide weight in pounds, bodyweight if no equipment)
//       reps: string;  // Recommended number of repetitions for the user
//       sets: string;  // Recommended number of sets for the user
//       instructions?: string;  // Any optional notes
//     }
// - Respond with the exercise already in JSON format, without any additional text or explanations
// - Generate ONE workout based on the user's preferences.
// `;