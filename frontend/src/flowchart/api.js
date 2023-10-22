import axios from 'axios';

const API_URL = 'http://ec2-3-93-45-20.compute-1.amazonaws.com:8000/api/circles/';

// Function to fetch data from the API
const fetchData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Export the fetchData function for use in other files
export { fetchData };
