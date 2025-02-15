import axios from 'axios';

const API = axios.create({
  baseURL: 'https://fitnesregistration-production.up.railway.app', // Adjust this if needed
});

export default API;
