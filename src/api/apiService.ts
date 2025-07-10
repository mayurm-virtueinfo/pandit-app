// import axios from 'axios';
import apiDev from './apiDev';
import ApiEndpoints, { POST_SIGNIN } from './apiEndpoints';

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
  status: string
}

export interface PujaListDataResponse {
  pujaList: PujaListItemType[];
}

export interface EarningsHistoryResponse {
  [x: string]: any;
  id: number;
  poojaName: string;
  price: number;
  date: string
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
      return response.data?.record || { recommendedPuja: [], pujaList: [] };
    } catch (error) {
      console.error('Error fetching puja list data:', error);
      return { pujaList: [] };
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
}

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
