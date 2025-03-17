import axios from 'axios';

const OPENAI_API_KEY = 'your-api-key-here'; // Store this securely, do NOT expose it in frontend

const openAIService = async (prompt: string) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // Use 'gpt-4' or 'gpt-3.5-turbo' based on your needs
        messages: [{ role: 'system', content: 'You are a workout assistant.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'An error occurred while generating the workout.';
  }
};

export default openAIService;
