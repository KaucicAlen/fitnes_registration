import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.173:5001', // Adjust this if needed
});

export default API;
