// import axios from 'axios';
import apiDev from './apiDev';
import ApiEndpoints from './apiEndpoints';

// Types for dropdown data
export interface DropdownItem {
  subCastes: any[];
  id: string | number;
  name: string;
  description?:string
}
// Types for pooja request data
export interface PoojaRequestItem {
  id:number;
  title : string;
  scheduledDate: string;
  imageUrl?:string,
  subtitle?:string,
  price?:number
}
// Types for pooja request data
export interface AstroServiceItem {
  id:number;
  title : string;
  pricePerMin: string;
  imageUrl?:string,
  description?:string
}

export interface ChatMessage {
  id: number;
  sender: {
    name: string;
    isUser: boolean;
  };
  text: string;
}


export const apiService = {
  // Fetch cities based on pincode
  getCities: async (pincode: string): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(`${ApiEndpoints.CITY_API}/${pincode}`);
      if (response.data[0].Status === 'Success') {
        const postOffices = response.data[0].PostOffice || [];
        return postOffices.map((office: any) => ({
          id: office.Name,
          name: `${office.Name}, ${office.District}, ${office.State}`,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  // Fetch castes (mock data)
  getCastes: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.CASTE_API);
      return (
        response?.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching castes:', error);
      return [];
    }
  },

  // Fetch sub-castes based on caste 
  getSubCastes: async (casteId: number): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(`${ApiEndpoints.SUB_CASTE_API}?caste=${casteId}`);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching sub-castes:', error);
      return [];
    }
  },

  // Fetch gotras 
  getGotras: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.GOTRA_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },

    // Fetch getArea
  getArea: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.AREA_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },

   // Fetch getPoojaPerformed
  getPoojaPerformed: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.POOJA_PERFORMED_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },

  // Fetch getPoojaPerformed
  getAstrologyConsulationPerformed: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.ASTROLOGY_CONSLATION_PERFORMED_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },
   // Fetch getLanguages
  getLanguages: async (): Promise<DropdownItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.LANGUAGES_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },
  // Fetch poojaRequests
  getPoojaRequests: async (): Promise<PoojaRequestItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.POOJA_REQUESTS_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching pooja requests:', error);
      return [];
    }
  },
  // Fetch getAstroServices
  getAstroServices: async (): Promise<AstroServiceItem[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.ASTRO_SERVICES_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching astro services:', error);
      return [];
    }
  },
  // Fetch getMessages
  getMessages: async (): Promise<ChatMessage[]> => {
    try {
      const response = await apiDev.get(ApiEndpoints.MESSAGES_API);
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
};
