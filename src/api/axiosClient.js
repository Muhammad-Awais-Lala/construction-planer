import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://167aliraza-construction-planer.hf.space',
  headers: { 'Content-Type': 'application/json' }
});

export default axiosClient;
