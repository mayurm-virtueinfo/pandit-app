import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here if needed
// instance.interceptors.request.use(config => {
//   // Do something before request is sent
//   return config;
// }, error => {
//   // Do something with request error
//   return Promise.reject(error);
// });

// instance.interceptors.response.use(response => {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response;
// }, error => {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   return Promise.reject(error);
// });

export default instance;