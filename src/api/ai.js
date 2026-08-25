const API_BASE = 'http://localhost:5000/api';

export const verifyArtisanCraft = async (imageFile) => {
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(imageFile);
  });

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/ai/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ image })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.reason || 'AI verification failed.');
  }

  return data;
};

export const generateAIResponse = async (messages, language = 'en') => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ messages, language })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate AI response');
    }

    if (data.success && data.message) {
      return data.message.content;
    }
    
    throw new Error('Invalid response from AI server');
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error; // Re-throw to be handled by the UI
  }
};
