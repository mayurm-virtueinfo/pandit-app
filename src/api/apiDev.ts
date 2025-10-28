import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiEndpoints, {BASE_URL} from './apiEndpoints';
import AppConstant from '../utils/AppContent';
import {clearSavedLanguage} from '../i18n';

const apiDev = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

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

let sessionHandler: any = null;

export const registerApiSessionHandler = (handler: any) => {
  sessionHandler = handler;
};

const subscribeTokenRefresh = (cb: any) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.map((cb: any) => cb(newAccessToken));
};

const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/app/auth/refresh-token/`,
      {refresh_token: refreshToken},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error refreshing token (custom logic)', error);
    if (sessionHandler) {
      sessionHandler();
    }
    throw error;
  }
};

apiDev.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refresh_token = await AsyncStorage.getItem(
            AppConstant.REFRESH_TOKEN,
          );
          if (!refresh_token) {
            isRefreshing = false;
            return Promise.reject(error);
          }

          console.log('---Accesstoken---refreshing---apiDev (custom logic)');
          const data = await refreshAccessToken(refresh_token);
          const newAccessToken = data?.access_token;

          if (newAccessToken) {
            await AsyncStorage.setItem(
              AppConstant.ACCESS_TOKEN,
              newAccessToken,
            );

            isRefreshing = false;
            onRefreshed(newAccessToken);

            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${newAccessToken}`;
            return apiDev(originalRequest);
          } else {
            isRefreshing = false;
            return Promise.reject(error);
          }
        } catch (refreshError) {
          isRefreshing = false;
          console.log(
            '---Accesstoken---refreshing---apiDev--failure (custom logic): ',
            refreshError,
          );

          // ✅ Call session handler here as a fallback too
          if (sessionHandler) sessionHandler();

          return Promise.reject(refreshError);
        }
      }

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
