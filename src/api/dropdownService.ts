import axios from 'axios';

// Types for dropdown data
export interface DropdownItem {
  id: string | number;
  name: string;
  description?:string
}

// Base API URLs
// https://api.postalpincode.in/pincode/362002
const CITY_API = 'https://api.postalpincode.in/pincode';
const BASE_URL = 'https://api.jsonbin.io';
const API_VERSION = 'v3/b';


// Mock API endpoints for demonstration
const CASTE_API = `${BASE_URL}/${API_VERSION}/684010988a456b7966a95413`;
const SUB_CASTE_API = `${BASE_URL}/${API_VERSION}/6840110f8960c979a5a51370`;
const GOTRA_API = `${BASE_URL}/${API_VERSION}/684010bd8960c979a5a51350`;
const AREA_API = `${BASE_URL}/${API_VERSION}/68401ec68960c979a5a51838`;
const POOJA_PERFORMED_API = `${BASE_URL}/${API_VERSION}/684033358561e97a501f8459`;
const ASTROLOGY_CONSLATION_PERFORMED_API = `${BASE_URL}/${API_VERSION}/6840339b8a456b7966a9601b`;
const LANGUAGES_API = `${BASE_URL}/${API_VERSION}/68403db38a456b7966a963f6`;
const XMasterKey = `$2a$10$XR82L3T4Q4gtDUAvZKwioOsmNaU2X7QVpkZbtKJ90jdcoVal/Pd4a`;

export const dropdownService = {
  // Fetch cities based on pincode
  getCities: async (pincode: string): Promise<DropdownItem[]> => {
    try {
      const response = await axios.get(`${CITY_API}/${pincode}`);
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
      const response = await axios.get(CASTE_API);
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
      const response = await axios.get(`${SUB_CASTE_API}?caste=${casteId}`);
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
      const response = await axios.get(GOTRA_API, {
        headers: {
          'X-Master-Key': XMasterKey
        }
      });
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
      const response = await axios.get(AREA_API, {
        headers: {
          'X-Master-Key': XMasterKey
        }
      });
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
      const response = await axios.get(POOJA_PERFORMED_API, {
        headers: {
          'X-Master-Key': XMasterKey
        }
      });
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
      const response = await axios.get(ASTROLOGY_CONSLATION_PERFORMED_API, {
        headers: {
          'X-Master-Key': XMasterKey
        }
      });
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
      const response = await axios.get(LANGUAGES_API, {
        headers: {
          'X-Master-Key': XMasterKey
        }
      });
      return (
        response.data?.record || []
      );
    } catch (error) {
      console.error('Error fetching gotras:', error);
      return [];
    }
  },
};
