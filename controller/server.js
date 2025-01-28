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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
