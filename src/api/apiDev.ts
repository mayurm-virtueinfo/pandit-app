import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiEndpoints from './apiEndpoints';
import AppConstant from '../utils/AppContent';

// Create an axios instance

const apiDev = axios.create({
  // baseURL: Config.BASE_URL,
  baseURL: 'https://7e068c23fb22.ngrok-free.app',
  // baseURL: ApiEndpoints.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptors
apiDev.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem(AppConstant.ACCESS_TOKEN);
    console.log('Access token :: ', token);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['X-Master-Key'] = ApiEndpoints.XMasterKey;
    console.log('------------------------------------------------');
    console.log('------------apiDev-config-------------');
    console.log('------------------------------------------------');
    console.log('BaseUrl : ', config.baseURL);
    console.log('Url : ', config.url);
    console.log('Headers : ', config.headers);
    console.log('------------------------------------------------');
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let refreshSubscribers: any = [];

const subscribeTokenRefresh = (cb: any) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.map((cb: any) => cb(newAccessToken));
};

// Custom refresh token logic (since postRefreshToken has issues)
const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Use axios directly to avoid circular dependency and issues with postRefreshToken
    const response = await axios.post(
      'https://7e068c23fb22.ngrok-free.app/app/auth/refresh-token/',
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error refreshing token (custom logic)', error);
    throw error;
  }
};

apiDev.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Fix: Use || instead of && for status check, and check for _retry
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refresh_token = await AsyncStorage.getItem(AppConstant.REFRESH_TOKEN);
          if (!refresh_token) {
            isRefreshing = false;
            return Promise.reject(error);
          }
          console.log('---Accesstoken---refreshing---apiDev (custom logic)');
          const data = await refreshAccessToken(refresh_token);
          const newAccessToken = data?.access_token;
          // Optionally, handle new refresh token if returned
          // const newRefreshToken = data?.refresh_token;

          if (newAccessToken) {
            await AsyncStorage.setItem(AppConstant.ACCESS_TOKEN, newAccessToken);
            // Optionally, update refresh token
            // if (newRefreshToken) {
            //   await AsyncStorage.setItem(AppConstant.REFRESH_TOKEN, newRefreshToken);
            // }
            isRefreshing = false;
            onRefreshed(newAccessToken);
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiDev(originalRequest);
          } else {
            isRefreshing = false;
            return Promise.reject(error);
          }
        } catch (refreshError) {
          isRefreshing = false;
          console.log('---Accesstoken---refreshing---apiDev--failure (custom logic): ', refreshError);
          return Promise.reject(refreshError);
        }
      }

      // If already refreshing, queue the request
      return new Promise(resolve => {
        subscribeTokenRefresh(async (newAccessToken: string) => {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          resolve(apiDev(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default apiDev;
