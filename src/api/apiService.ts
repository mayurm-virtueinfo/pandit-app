// import axios from 'axios';
import {AxiosRequestConfig} from 'axios';
import apiDev from './apiDev';
import ApiEndpoints, {
  CREATE_MEETING,
  DELETEACCOUNT,
  GET_AREA,
  GET_BOOKING_AUTO_DETAILS,
  GET_CASTE,
  GET_CITY,
  GET_COMPLETED_PUA,
  GET_COMPLETED_PUJA,
  GET_COMPLETED_PUJA_DETAILS,
  GET_EDIT_PUJA,
  GET_GOTRA,
  GET_IN_PROGRESS_PUJA,
  GET_LANGUAGES,
  GET_MESSAGE_HISTORY,
  GET_PANDING_PUJA,
  GET_PANDIT_PROFILE,
  GET_PAST_BOOKINGS,
  GET_POOJA,
  GET_PUT_UPDATE_PROFILE,
  GET_SUBCASTE,
  GET_TRANSACTIONS,
  GET_UNASSIGN_PUJA,
  GET_UPCOMING_PUJA,
  GET_UPCOMING_PUJA_DETAILS,
  GET_WALLET,
  POST_ADD_PUJA,
  POST_CANCEL_BOOKING,
  POST_COMPETE_PUJA,
  POST_CONVERSATION,
  POST_LOGOUT,
  POST_PANDIT_AVAILABILITY,
  POST_RATE_USER,
  POST_REFRESH_TOKEN,
  POST_REGISTER_FCM,
  POST_REVIEW_IMAGE,
  POST_SIGNIN,
  POST_SIGNUP,
  POST_START_PUJA,
  POST_UPDATE_STATUS,
  PUT_EDIT_PANDIT_PUJA,
  PUT_PANDIT_DOCUMENTS,
  PUT_PANDIT_LANGUAGE,
  PUT_SERVICES_AREAS,
  REFUNDPOLICY,
  TERMSCONDITIONS,
  USERAGREEMENT,
} from './apiEndpoints';

// Types for dropdown data
export interface PanditPujaList {
  id: string | number;
  name: string;
  date?: string;
  image?: string;
}

export interface PujaList {
  upcomingPujas: PanditPujaList;
  completedPujas: PanditPujaList;
}

// Types for pooja request data
export interface PoojaRequestItem {
  id: number;
  title: string;
  scheduledDate: string;
  imageUrl?: string;
  subtitle?: string;
  price?: number;
}
// Types for pooja request data
export interface AstroServiceItem {
  id: number;
  title: string;
  pricePerMin: string;
  imageUrl?: string;
  description?: string;
}

export interface ChatMessage {
  id: number;
  sender: {
    name: string;
    isUser: boolean;
  };
  text: string;
}

export interface PoojaItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
}
export interface CancellationReason {
  id: number;
  reason: string;
  requiresSpecification?: boolean; // Optional, only for "Other"
}
export interface CancellationPolicy {
  id: number;
  description: string;
}
export interface PastBookingItem {
  id: number;
  poojaName: string;
  date: string; // ISO date string, e.g., "2024-09-26"
  maharajName: string;
  status: 'accepted' | 'completed' | 'cancelled' | 'rejected';
  imageUrl: string;
}

export interface PujaItemsItem {
  id: number;
  item: string;
  description: string;
}

export interface pujaDetails {
  id: number;
  name: string; // "Ganesh Chaturthi Puja"
  address: string; // "House no. 102, Ganesh Colony, GK Road, Ahmedabad"
  date: string; // "15/09/2025"
  time: string; // "10:00 AM"
  client: string; // "Dharmesh Shah"
  pricing: string; // "₹ 5000"
  puja_item_type: string; // "Including puja items"
  image: string;
}

export interface PanditPujaDetails {
  pujaDetails: pujaDetails;
}

export interface PujaListItemType {
  id: number;
  name: string;
  pujaPurpose: string;
  price: number;
  image: string;
  description: string;
  visualSection: string;
  status: string;
}

export interface PujaListDataResponse {
  pujaList: PujaListItemType[];
}

export interface EarningsHistoryResponse {
  [x: string]: any;
  id: number;
  poojaName: string;
  price: number;
  date: string;
}

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SignInRequest {
  mobile: string;
  firebase_uid: string;
}

export interface SignInResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  is_register: boolean;
  user: User;
}

export interface User {
  id(id: any): string;
  mobile: string;
  firebase_uid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: number;
  gender: number;
  profile_img: string;
  pandit_details: string;
}

export interface SignUpRequest {
  mobile: string;
  firebase_uid: string;
  first_name: string;
  last_name: string;
  role: number;
  address: string;
  city: string;
  profile_img: string;
  puja_ids: number[];
  area_ids: number[];
  pandit_detail: {
    address_city: number;
    caste: number;
    sub_caste: number;
    gotra: number;
    supported_languages: number[];
  };
  pandit_documents: {
    id_proof: string;
    pan_card: string;
    electricity_bill: string;
    certifications: string;
  };
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface EditRequest {
  id: number;
  user: number;
  image: string;
  pooja: number;
  name: string;
  pujaPurpose: string;
  price_with_samagri: number;
  price_without_samagri: number;
  custom_samagri_list: string;
  price_status: number;
}

export interface EditPuja {
  id: number;
  user: number;
  pooja: number;
  price_with_samagri: number;
  price_without_samagri: number;
  custom_samagri_list: string;
  price_status: number;
}

export interface AddPuja {
  user: number;
  pooja: number;
  price_with_samagri: number;
  price_without_samagri: number;
  price_status: number;
}

export interface UpdateStatus {
  booking_id: number;
  action: string;
  offer_id: number;
}

export interface StartCompetePuja {
  booking_id: number;
  pin: string;
}

export interface PanditAvailability {
  available_dates: string[];
  unavailable_dates: string[];
}

export interface bookingCancellation {
  cancellation_reason_type: string;
  cancellation_reason_other?: string;
}

export interface EditServiceArea {
  service_areas: area[];
}

export interface area {
  city: number;
  area: number;
}

export interface EditPanditPooja {
  pooja_ids: number[];
}

export interface EditPanditLanguage {
  language_ids: number[];
}

export interface EditPanditDocuments {
  id_proof: string;
}

export interface postConversations {
  booking_id: number;
}

export interface postRateUser {
  booking: number;
  rating: number;
  review: string;
}

export interface putUpdateProfile {
  firstName: string;
  lastName: string;
  city: string;
  caste: string;
  subCaste: string;
  gotra: string;
  address: string;
  profile_img: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface ReviewImageUpload {
  images: {
    profile_img: {
      uri: string;
      type: string;
      name: string;
    };
  };
}

// export const apiService = {
//   // Fetch castes (mock data)
//   getPujaList: async (): Promise<PujaList[]> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.PANDIT_PUJA_LIST_API);
//       return response?.data?.record || [];
//     } catch (error) {
//       console.error('Error fetching castes:', error);
//       return [];
//     }
//   },

//   getPujaItemsData: async (): Promise<PujaItemsItem[]> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.PUJA_ITEMS_API);
//       return response.data?.record || [];
//     } catch (error) {
//       console.error('Error fetching past bookings :', error);
//       return [];
//     }
//   },
//   getPujaDetailsData: async (): Promise<PanditPujaDetails> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.PUJA_DETAILS_API);
//       return response.data?.record || [];
//     } catch (error) {
//       console.error('Error fetching past bookings :', error);
//       // Return a default value that matches the PanditPujaDetails interface
//       return {
//         pujaDetails: {
//           id: 0,
//           name: '',
//           address: '',
//           date: '',
//           time: '',
//           client: '',
//           pricing: '',
//           puja_item_type: '',
//           image: '',
//         },
//       };
//     }
//   },

//   getPujaListData: async (): Promise<PujaListDataResponse> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.PUJA_LIST_API);
//       return response.data?.record || { recommendedPuja: [], pujaList: [] };
//     } catch (error) {
//       console.error('Error fetching puja list data:', error);
//       return { pujaList: [] };
//     }
//   },

//   getEaningsHistoryData: async (): Promise<EarningsHistoryResponse> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.EARNINGS_HISTORY_API);
//       return response.data?.record;
//     } catch (error) {
//       console.error('Error fetching earnings history data:', error);
//       // Return a default value that matches the EarningsHistoryResponse interface
//       return {
//         id: 0,
//         poojaName: '',
//         price: 0,
//         date: '',
//       };
//     }
//   },

//   getNotificationData: async (): Promise<NotificationData[]> => {
//     try {
//       const response = await apiDev.get(ApiEndpoints.NOTIFICATION_DATA_API);
//       return response.data?.record || [];
//     } catch (error) {
//       console.error('Error fetching past bookings :', error);
//       return [];
//     }
//   },
// };

export const postSignIn = (data: SignInRequest): Promise<SignInResponse> => {
  console.log('params data ::', data);
  let apiUrl = POST_SIGNIN;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error fetching sign in data:', error.response.data);
        reject(error);
      });
  });
};

export const getCity = () => {
  let apiUrl = GET_CITY;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error fetching city data:', error);
        reject(error);
      });
  });
};

export const getCaste = () => {
  let apiUrl = GET_CASTE;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error fetching caste data:', error);
        reject(error);
      });
  });
};

export const getSubCaste = (id: any) => {
  let apiUrl = GET_SUBCASTE.replace('{casteId}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getGotra = (id: any) => {
  let apiUrl = GET_GOTRA.replace('{subCasteId}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getAreas = (id: any) => {
  let apiUrl = GET_AREA.replace('{id}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const getPooja = (params: any): Promise<any> => {
  let apiUrl = GET_POOJA.replace('{page}', params.page);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error fetching pooja data:', error);
        reject(error);
      });
  });
};

export const getLanguage = () => {
  let apiUrl = GET_LANGUAGES;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error fetching language data:', error);
        reject(error);
      });
  });
};
// export const postSignUp = (data: FormData): Promise<SignInResponse> => { // Change type to FormData
//   console.log('params data ::', data); // This will now log the FormData object
//   let apiUrl = POST_SIGNUP;
//   // The config header is correct for multipart/form-data
//   const config: AxiosRequestConfig = {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   };
//   return new Promise((resolve, reject) => {
//     console.log("Data of api =-=-=----====--=->", data) // This will also log the FormData object
//     apiDev
//       .post(apiUrl, data, config) // Pass the FormData object directly
//       .then(response => {
//         console.log("response ------=-=-=-=-=-=-=-=-==-=-=---==-=-=->", response)
//         resolve(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching sign up data:', JSON.stringify(error.response.data));
//         reject(error);
//       });
//   });
// };

export const postSignUp = (data: FormData): Promise<SignInResponse> => {
  // Changed data type to FormData
  console.log('postSignUp params data (FormData object):', data); // This will log the FormData object

  // The 'Content-Type' header is critical for multipart/form-data.
  // Axios's postForm usually handles this, but explicitly setting it is good.
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  return new Promise((resolve, reject) => {
    apiDev
      .postForm(POST_SIGNUP, data, config) // Pass the FormData object directly, and the config
      .then(response => {
        console.log('postSignUp response:', response);
        resolve(response.data);
      })
      .catch(error => {
        // Log the full error response for better debugging
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(
            'postSignUp API Error Response Data:',
            error.response.data,
          );
          console.error(
            'postSignUp API Error Response Status:',
            error.response.status,
          );
          console.error(
            'postSignUp API Error Response Headers:',
            error.response.headers,
          );
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
          console.error(
            'postSignUp API Error Request (No Response):',
            error.request,
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('postSignUp API Error Message:', error.message);
        }
        reject(error);
      });
  });
};

export const postLogout = (data: LogoutRequest) => {
  let apiUrl = POST_LOGOUT;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error logout', error);
        reject(error);
      });
  });
};

export const postRefreshToken = (data: LogoutRequest) => {
  let apiUrl = POST_REFRESH_TOKEN;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error refreshing token', error);
        reject(error);
      });
  });
};

export const getPuja = () => {
  let apiUrl = GET_EDIT_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error get puja', error);
        reject(error);
      });
  });
};

export const putPuja = (data: EditRequest) => {
  let apiUrl = GET_EDIT_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error get puja', error);
        reject(error);
      });
  });
};

export const getUnassignPuja = () => {
  let apiUrl = GET_UNASSIGN_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error get UnassignPuja ', error);
        reject(error);
      });
  });
};

export const postAddPuja = (data: AddPuja) => {
  let apiUrl = POST_ADD_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error Add Puja ', error);
        reject(error);
      });
  });
};

export const getPandingPuja = () => {
  let apiUrl = GET_PANDING_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  });
};

export const getUpcomingPuja = () => {
  let apiUrl = GET_UPCOMING_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.log('error', error.response.data);
        reject(error);
      });
  });
};

export const getCompletedPuja = () => {
  let apiUrl = GET_COMPLETED_PUA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.log('error', error);
        reject(error);
      });
  });
};

export const postUpdateStatus = (data: UpdateStatus) => {
  let apiUrl = POST_UPDATE_STATUS;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error Update Puja Status', error.response.data.message);
        reject(error);
      });
  });
};

export const getUpcomingPujaDetails = (id: any) => {
  let apiUrl = GET_UPCOMING_PUJA_DETAILS.replace('{id}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export const postStartPuja = (data: StartCompetePuja) => {
  let apiUrl = POST_START_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error Start Puja',
          JSON.stringify(error.response.data.message),
        );
        reject(error);
      });
  });
};

export const postCompetePuja = (data: StartCompetePuja) => {
  let apiUrl = POST_COMPETE_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error Start Puja',
          JSON.stringify(error.response.data.message),
        );
        reject(error);
      });
  });
};

export const getPanditProfileDetails = () => {
  let apiUrl = GET_PANDIT_PROFILE;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error fetching pandit profile data:',
          error.response.data,
        );
        reject(error);
      });
  });
};

export const postPanditAvailability = (data: PanditAvailability) => {
  let apiUrl = POST_PANDIT_AVAILABILITY;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error Pandit availability', JSON.stringify(error));
        reject(error);
      });
  });
};

export const getPanditAvailability = () => {
  let apiUrl = POST_PANDIT_AVAILABILITY;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error Pandit availability',
          JSON.stringify(error.response.data),
        );
        reject(error);
      });
  });
};

export const postCancelBooking = (
  id: string,
  data: bookingCancellation,
): Promise<any> => {
  const apiUrl = POST_CANCEL_BOOKING.replace('{id}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error cancel booking:', error.response.data);
        reject(error);
      });
  });
};

export const getInProgressPuja = () => {
  let apiUrl = GET_IN_PROGRESS_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error In-progress puja :', error.response.data);
        reject(error);
      });
  });
};

export const getWallet = () => {
  let apiUrl = GET_WALLET;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error Wallet api :', error.response.data);
        reject(error);
      });
  });
};

export const getTransactions = () => {
  let apiUrl = GET_TRANSACTIONS;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error Transactions :', error.response.data);
        reject(error);
      });
  });
};

export const getServiceArea = () => {
  let apiUrl = PUT_SERVICES_AREAS;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get service areas api', error.response.data);
        reject(error);
      });
  });
};

export const putServiceArea = (data: EditServiceArea) => {
  let apiUrl = PUT_SERVICES_AREAS;
  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in put service areas api', error.response.data);
        reject(error);
      });
  });
};

export const getPanditPooja = () => {
  let apiUrl = PUT_EDIT_PANDIT_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get pandit puja api', error.response.data);
        reject(error);
      });
  });
};

export const putPanditPooja = (data: EditPanditPooja) => {
  let apiUrl = PUT_EDIT_PANDIT_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in put pandit puja api', error.response.data);
        reject(error);
      });
  });
};

export const getPanditLanguage = () => {
  let apiUrl = PUT_PANDIT_LANGUAGE;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get pandit language api', error.response.data);
        reject(error);
      });
  });
};

export const putPanditLanguage = (data: EditPanditLanguage) => {
  let apiUrl = PUT_PANDIT_LANGUAGE;
  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in put pandit language api', error.response.data);
        reject(error);
      });
  });
};

export const getPanditDocuments = () => {
  let apiUrl = PUT_PANDIT_DOCUMENTS;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get pandit documents api', error.response.data);
        reject(error);
      });
  });
};

export const putPanditDocuments = (formData: FormData) => {
  const apiUrl = PUT_PANDIT_DOCUMENTS;
  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        if (error.response && error.response.data) {
          console.error(
            'Error in put pandit documents api',
            JSON.stringify(error.response.data),
          );
        } else {
          console.error('Error in put pandit documents api', error);
        }
        reject(error);
      });
  });
};

export const getPastBookings = () => {
  let apiUrl = GET_PAST_BOOKINGS;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get past bookings api', error.response.data);
        reject(error);
      });
  });
};

export const postConversations = (data: postConversations): Promise<any> => {
  const apiUrl = POST_CONVERSATION;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error post conversation api:', error.response.data);
        reject(error);
      });
  });
};

export const getMessageHistory = (bookingID: string) => {
  let apiUrl = GET_MESSAGE_HISTORY.replace('{bookingID}', bookingID);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error in get message history api', error.response.data);
        reject(error);
      });
  });
};

export const postRegisterFCMToken = (
  device_token: string,
  app_type: string,
): Promise<any> => {
  let apiUrl = POST_REGISTER_FCM;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, {device_token, app_type})
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error in registering fcm token :: ', error);
        reject(error);
      });
  });
};

export const postRateUser = (data: postRateUser): Promise<any> => {
  const apiUrl = POST_RATE_USER;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error post rate user api:', error.response.data);
        reject(error);
      });
  });
};

export const getProfileData = () => {
  let apiUrl = GET_PUT_UPDATE_PROFILE;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Error in get update profile api', error.response.data);
        reject(error);
      });
  });
};

export const putUpdateProfile = (data: any): Promise<any> => {
  const apiUrl = GET_PUT_UPDATE_PROFILE;
  const isFormData =
    typeof FormData !== 'undefined' && data instanceof FormData;

  // Set headers for multipart/form-data if FormData is used
  const config: AxiosRequestConfig = isFormData
    ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    : {};

  return new Promise((resolve, reject) => {
    apiDev
      .put(apiUrl, data, config)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.log('error', error);
        if (error.response && error.response.data) {
          console.error('Error put update profile api:', error.response.data);
        } else if (error.message) {
          console.error('Error put update profile::::', error.message);
        } else {
          console.error('Error put update profile>>>>>>', error);
        }
        reject(error);
      });
  });
};

export const postReviewImageUpload = (data: any, id: string): Promise<any> => {
  // data should be a FormData instance with one or more 'images' fields
  const apiUrl = POST_REVIEW_IMAGE.replace('{id}', id);
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // If you need to send auth, add Authorization header here
      })
      .then(response => {
        console.log('response', response);
        resolve(response.data);
      })
      .catch(error => {
        console.error(
          'Error uploading review image:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};

export const getBookingAutoDetails = (bookingID: string) => {
  let apiUrl = GET_BOOKING_AUTO_DETAILS.replace('{id}', bookingID);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error(
          'Error in get booking auto details api',
          error.response.data,
        );
        reject(error);
      });
  });
};

export const getTermsConditions = (): Promise<any> => {
  let apiUrl = TERMSCONDITIONS;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl, {
        headers: {
          Accept: 'text/html',
        },
      })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error fetching Terms & Conditions:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};

export const getUserAgreement = (): Promise<any> => {
  let apiUrl = USERAGREEMENT;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl, {
        headers: {
          Accept: 'text/html',
        },
      })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error fetching User Agreement:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};

export const getRefundPolicy = (): Promise<any> => {
  let apiUrl = REFUNDPOLICY;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl, {
        headers: {
          Accept: 'text/html',
        },
      })
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error fetching Refund Policy:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};

export const deleteAccount = (params: any): Promise<any> => {
  let apiUrl = DELETEACCOUNT;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: params,
      })
      .then(response => {
        console.log('response', response);
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error deleting account:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};
export const createMeeting = (booking_id: number): Promise<any> => {
  let apiUrl = CREATE_MEETING;
  return new Promise((resolve, reject) => {
    apiDev
      .post(apiUrl, {booking_id})
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error creating meeting:',
          error?.response?.data || error,
        );
        reject(error);
      });
  });
};

export const getCompletePujaList = () => {
  let apiUrl = GET_COMPLETED_PUJA;
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error(
          'Error in get completed puja list api',
          error.response.data,
        );
        reject(error);
      });
  });
};

export const getCompletedPujaDetails = (bookingID: string) => {
  let apiUrl = GET_COMPLETED_PUJA_DETAILS.replace('{id}', bookingID);
  return new Promise((resolve, reject) => {
    apiDev
      .get(apiUrl)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error(
          'Error in get completed puja details api',
          error.response.data,
        );
        reject(error);
      });
  });
};
