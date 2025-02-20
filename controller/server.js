const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/exercises';
const API_KEY = 'F1MrXYbs75rYDmGS8V9GQw==nADb7j66vFLL1qmo';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = ""; // Add your OpenAI API key here

app.get('/', async (req, res) => {
  const searchTerm = req.query.name || ''; // Get search term from query params

  try {
    const response = await axios.get(API_NINJAS_URL, {
      headers: {
        'X-Api-Key': API_KEY,
      },
      params: {
        name: searchTerm, // Send search term to API
      },
    });

    res.json({ exercises: response.data });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/generate-workout', async (req, res) => {
  const { age, gender, goal, height, weight, activityLevel, preferences } = req.body;

  if (!age || !gender || !goal || !height || !weight || !activityLevel || !preferences) {
    return res.status(400).json({ error: "Missing biometric data" });
  }

  try {
    console.log("Sending request to OpenAI with formatted data...");

    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a fitness coach who provides well-structured and easy-to-read workout plans." },
          { 
            role: "user", 
            content: `User Details:
- **Age:** ${age} 
- **Gender:** ${gender}
- **Height:** ${height} cm
- **Weight:** ${weight} kg
- **Goal:** ${goal}
- **Activity Level:** ${activityLevel}
- **Preferences:** ${JSON.stringify(preferences)}

🔹 **Format Instructions:**
- Add extra line breaks between sections.
- Use bold markdown (#Day 1: Strength Training).
- Add bullet points and proper indentation.
- Keep responses concise but well-structured.

📌 **Generate a workout plan for the next 1 week!**`
          }
        ],
        temperature: 0.4,
        max_tokens: 250,
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      }
    );

    console.log("OpenAI Responded!!");
    return res.json({ workoutPlan: response.data.choices[0]?.message?.content || "No response from AI" });

  } catch (error) {
    console.error("OpenAI API Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: "Failed to generate AI workout", details: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
