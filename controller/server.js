const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import axios

const app = express();
const PORT = 5000; // You can change this port number

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON requests

// API Ninjas base URL and your API key
const API_NINJAS_URL = 'https://api.api-ninjas.com/v1/exercises';
const API_KEY = 'F1MrXYbs75rYDmGS8V9GQw==nADb7j66vFLL1qmo';  // Replace this with your actual API key

// Example route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Route to fetch exercises from API Ninjas
app.get('/exercises', async (req, res) => {
  try {
    const response = await axios.get(API_NINJAS_URL, {
      headers: {
        'X-Api-Key': API_KEY, // Include your API key here
      },
    });
    
    // Send back the response from the API Ninjas
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
