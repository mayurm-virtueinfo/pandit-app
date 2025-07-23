// import axios from 'axios';
import {AxiosRequestConfig} from 'axios';
import apiDev from './apiDev';
import ApiEndpoints, {
  GET_AREA,
  GET_CASTE,
  GET_CITY,
  GET_COMPLETED_PUA,
  GET_EDIT_PUJA,
  GET_GOTRA,
  GET_LANGUAGES,
  GET_PANDING_PUJA,
  GET_PANDIT_PROFILE,
  GET_POOJA,
  GET_SUBCASTE,
  GET_UNASSIGN_PUJA,
  GET_UPCOMING_PUJA,
  GET_UPCOMING_PUJA_DETAILS,
  POST_ADD_PUJA,
  POST_COMPETE_PUJA,
  POST_LOGOUT,
  POST_REFRESH_TOKEN,
  POST_SIGNIN,
  POST_SIGNUP,
  POST_START_PUJA,
  POST_UPDATE_STATUS,
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
}

export interface StartCompetePuja {
  booking_id: number;
  pin: string;
}

export const apiService = {
  // Fetch castes (mock data)
  getPujaList: async (): Promise<PujaList[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.PANDIT_PUJA_LIST_API);
      return response?.data?.record || [];
    } catch (error) {
      console.error('Error fetching castes:', error);
      return [];
    }
  },

  getPujaItemsData: async (): Promise<PujaItemsItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.PUJA_ITEMS_API);
      return response.data?.record || [];
    } catch (error) {
      console.error('Error fetching past bookings :', error);
      return [];
    }
  },
  getPujaDetailsData: async (): Promise<PanditPujaDetails> => {
    try {
      const response = await apiDev.get(ApiEndpoints.PUJA_DETAILS_API);
      return response.data?.record || [];
    } catch (error) {
      console.error('Error fetching past bookings :', error);
      // Return a default value that matches the PanditPujaDetails interface
      return {
        pujaDetails: {
          id: 0,
          name: '',
          address: '',
          date: '',
          time: '',
          client: '',
          pricing: '',
          puja_item_type: '',
          image: '',
        },
      };
    }
  },

  getPujaListData: async (): Promise<PujaListDataResponse> => {
    try {
      const response = await apiDev.get(ApiEndpoints.PUJA_LIST_API);
      return response.data?.record || {recommendedPuja: [], pujaList: []};
    } catch (error) {
      console.error('Error fetching puja list data:', error);
      return {pujaList: []};
    }
  },

  getEaningsHistoryData: async (): Promise<EarningsHistoryResponse> => {
    try {
      const response = await apiDev.get(ApiEndpoints.EARNINGS_HISTORY_API);
      return response.data?.record;
    } catch (error) {
      console.error('Error fetching earnings history data:', error);
      // Return a default value that matches the EarningsHistoryResponse interface
      return {
        id: 0,
        poojaName: '',
        price: 0,
        date: '',
      };
    }
  },

  getNotificationData: async (): Promise<NotificationData[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.NOTIFICATION_DATA_API);
      return response.data?.record || [];
    } catch (error) {
      console.error('Error fetching past bookings :', error);
      return [];
    }
  },
};

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
        console.error('Error fetching sign in data:', error);
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

export const getPooja = () => {
  let apiUrl = GET_POOJA;
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
export const postSignUp = (data: SignUpRequest): Promise<SignInResponse> => {
  console.log('params data ::', data);
  let apiUrl = POST_SIGNUP;
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return new Promise((resolve, reject) => {
    apiDev
      .postForm(apiUrl, data, config)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error fetching sign up data:', JSON.stringify(error));
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
        console.log('error', error);
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
        console.error(
          'Error Update Puja Status',
          JSON.stringify(error.response.data.message),
        );
        reject(error);
      });
  });
};

export const getUpcingPujaDetails = (id: any) => {
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
        console.error('Error fetching pandit profile data:', error);
        reject(error);
      });
  });
};
