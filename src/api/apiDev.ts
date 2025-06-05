import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiEndpoints from './apiEndpoints';

// Create an axios instance

const apiDev = axios.create({
  // baseURL: Config.BASE_URL,
  baseURL:
    // 'https://stagcms.laggitgolf.com',
    ApiEndpoints.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
// Request interceptors
apiDev.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    // This is testing access token to handle 403 ( Refresh token expired )
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlY2QxOTIyMC04NmZkLTExZWYtOTQwOS03YmY0Y2VlYWU3MWUiLCJlbnYiOiJERVYiLCJjcmVhdGVkRGF0ZSI6MTcyODU2MTA2MzA1MiwiaWF0IjoxNzI4NTYxMDYzLCJleHAiOjE3Mjg1NzE4NjN9.tHh-DOvvWInIN0FRH56ydTgAWTQsx1qkgbwKIpvRuQY";
    // const userId = await AsyncStorage.getItem(USER_DATA_KEY.userId); // get the access token from AsyncStorage

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Only set multipart/form-data for specific requests (e.g., file uploads)
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
// Response Intercepter

let isRefreshing = false;
let refreshSubscribers: any = [];

const subscribeTokenRefresh = (cb: any) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newAccessToken: string) => {
  refreshSubscribers.map((cb: any) => cb(newAccessToken));
};

apiDev.interceptors.response.use(
  response => response, // pass through the response if it's successful
  async error => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        // isRefreshing = true;
        // console.log("---Accesstoken---refreshing---apiDev");
        // try {
        //   console.log("---refreshing----apiDev-1");
        //   const response: any = await postUserRefreshTokenApi();
        //   console.log("---refreshing----apiDev-2 : ", response);
        //   const data = response?.data?.data;
        //   const tokens = data?.tokens;
        //   console.log("---refreshing----apiDev-3 : ");
        //   const newAccessToken = tokens.accessToken;
        //   const newRefreshToken = tokens.refreshToken;
        //   console.log("---refreshing----apiDev-4");
        //   // Store the new access token
        //   await AsyncStorage.setItem(USER_DATA_KEY.accessToken, newAccessToken);
        //   await AsyncStorage.setItem(
        //     USER_DATA_KEY.refreshToken,
        //     newRefreshToken
        //   );
        //   console.log("---refreshing----apiDev-5");
        //   isRefreshing = false;
        //   onRefreshed(newAccessToken);
        //   console.log("---refreshing----apiDev-6");
        //   // Retry the original request with the new token
        //   console.log("---Accesstoken---refreshing---apiDev-done-success");
        //   return apiDev(originalRequest);
        // } catch (error: any) {
        //   // Need to apply this code if neccesary
        //   // setTimeout(() => {
        //   //   signOutAp();
        //   // }, 500);
        //   isRefreshing = false;
        //   if (error.status == 403) {
        //     console.log("Refresh token has expired : Please redirect to login");

        //     try {
        //       clearAsyncStorageExceptKey("isOnboarding");
        //     } catch (error: any) {
        //       console.log("Logout Error AsyncStorage : ", error.toString());
        //     }

        //     try {
        //       await GoogleSignin.revokeAccess();
        //       await GoogleSignin.signOut();
        //     } catch (error: any) {
        //       console.log("Logout Error Google : ", error.toString());
        //     }

        //     navigateToLoginScreen();
        //   }
        //   console.log(
        //     "---Accesstoken---refreshing---apiDev--failure : ",
        //     error
        //   );
        //   // Handle refresh token failure (e.g., log out the user)
        //   return Promise.reject(error);
        // }
      }

      return new Promise(resolve => {
        subscribeTokenRefresh(async (newAccessToken: string) => {
          // const userId = await AsyncStorage.getItem(USER_DATA_KEY.userId);
          // originalRequest.headers['Content-Type'] = 'multipart/form-data';
          // originalRequest.headers['Accept'] = 'application/json';
          originalRequest.headers['x-access-token'] = `${newAccessToken}`;
          // originalRequest.headers['x-user-id'] = `${userId}`;
          resolve(apiDev(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default apiDev;
