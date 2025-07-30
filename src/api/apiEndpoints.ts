class ApiEndpoints {
  static readonly XMasterKey =
    '$2a$10$XR82L3T4Q4gtDUAvZKwioOsmNaU2X7QVpkZbtKJ90jdcoVal/Pd4a';

  static readonly CITY_API = 'https://api.postalpincode.in/pincode';
  static readonly BASE_URL = 'https://api.jsonbin.io';
  static readonly API_VERSION = 'v3/b';

  // Mock API endpoints for demonstration
  static readonly CASTE_API = `${ApiEndpoints.API_VERSION}/684010988a456b7966a95413`;
  static readonly SUB_CASTE_API = `${ApiEndpoints.API_VERSION}/6840110f8960c979a5a51370`;
  static readonly GOTRA_API = `${ApiEndpoints.API_VERSION}/684010bd8960c979a5a51350`;
  static readonly AREA_API = `${ApiEndpoints.API_VERSION}/68401ec68960c979a5a51838`;
  static readonly POOJA_PERFORMED_API = `${ApiEndpoints.API_VERSION}/684033358561e97a501f8459`;
  static readonly ASTROLOGY_CONSLATION_PERFORMED_API = `${ApiEndpoints.API_VERSION}/6840339b8a456b7966a9601b`;
  static readonly LANGUAGES_API = `${ApiEndpoints.API_VERSION}/68403db38a456b7966a963f6`;
  static readonly POOJA_REQUESTS_API = `${ApiEndpoints.API_VERSION}/68428e788561e97a50203819`;
  static readonly ASTRO_SERVICES_API = `${ApiEndpoints.API_VERSION}/6842ff2a8960c979a5a5f4f5`;
  static readonly MESSAGES_API = `${ApiEndpoints.API_VERSION}/68466cab8960c979a5a6dc41`;
  static readonly POOJA_ITEMS_API = `${ApiEndpoints.API_VERSION}/684675428960c979a5a6de75`;
  static readonly CANCELLATION_REASON_API = `${ApiEndpoints.API_VERSION}/684691198960c979a5a6e6f5`;
  static readonly CANCELLATION_POLICY_API = `${ApiEndpoints.API_VERSION}/684695808a456b7966ab29c0`;
  static readonly PAST_BOOKINGS_API = `${ApiEndpoints.API_VERSION}/6846d3ec8561e97a502165ce`;

  static readonly PANDIT_PUJA_LIST_API = `${ApiEndpoints.API_VERSION}/686ce57f8561e97a50338b51`;
  static readonly PUJA_ITEMS_API = `${ApiEndpoints.API_VERSION}/686d03318960c979a5b92ebd`;
  static readonly PUJA_DETAILS_API = `${ApiEndpoints.API_VERSION}/686d088a8561e97a50339c4d`;
  static readonly PUJA_LIST_API = `${ApiEndpoints.API_VERSION}/685e858d8561e97a502cbc73`;
  static readonly EARNINGS_HISTORY_API = `${ApiEndpoints.API_VERSION}/686e27ce9e410d0f5e41d8ea`;
  static readonly NOTIFICATION_DATA_API = `${ApiEndpoints.API_VERSION}/6867ade78561e97a50315d3b`;
}

export default ApiEndpoints;

export const BASE_URL = 'https://bb26c683ac14.ngrok-free.app';

export const POST_SIGNIN = '/app/auth/signin/';
export const GET_CITY = '/app/areas/';
export const GET_CASTE = '/panditji/castes/';
export const GET_SUBCASTE = '/panditji/castes/{casteId}/subcastes/';
export const GET_GOTRA = '/panditji/subcastes/{subCasteId}/gotras/';
export const GET_AREA = '/app/api/areas/?city_id={id}';
export const GET_POOJA = '/panditji/poojas/';
export const GET_LANGUAGES = '/panditji/languages/';
export const POST_SIGNUP = '/app/auth/register/';
export const POST_LOGOUT = '/app/auth/logout/';
export const POST_REFRESH_TOKEN = '/app/auth/refresh-token/';
export const GET_EDIT_PUJA = '/panditji/my-puja/';
export const GET_UNASSIGN_PUJA = '/panditji/unassign-poojas/';
export const POST_ADD_PUJA = '/panditji/add-pandit-puja/';
export const GET_PANDING_PUJA = '/panditji/booking-requests/';
export const GET_UPCOMING_PUJA = '/panditji/upcoming-poojas/';
export const GET_COMPLETED_PUA = '/panditji/completed-poojas/';
export const POST_UPDATE_STATUS = '/panditji/update-status/';
export const GET_UPCOMING_PUJA_DETAILS = '/panditji/upcoming-poojas/?id={id}';
export const POST_START_PUJA = '/panditji/start-pooja/';
export const POST_COMPETE_PUJA = '/panditji/complete-pooja/';
export const GET_PANDIT_PROFILE = '/panditji/my-details/';
export const POST_PANDIT_AVAILABILITY = '/panditji/availability/';
export const POST_CANCEL_BOOKING = '/panditji/bookings/{id}/cancel/';
export const GET_IN_PROGRESS_PUJA = '/panditji/bookings/in_progress/';
export const GET_WALLET = '/panditji/wallet/';
export const GET_TRANSACTIONS = '/panditji/wallet/transactions/';
export const PUT_SERVICES_AREAS = '/panditji/edit-service-areas/';
export const PUT_EDIT_PANDIT_PUJA = '/panditji/edit-pandit-poojas/';
export const PUT_PANDIT_LANGUAGE = '/panditji/edit-pandit-languages/';
export const PUT_PANDIT_DOCUMENTS = '/panditji/edit-pandit-documents/';
export const GET_PAST_BOOKINGS = '/panditji/bookings/past/';
export const POST_CONVERSATION = '/api/chat/conversations/start/';
export const GET_MESSAGE_HISTORY = '/api/chat/conversations/{uuid}/messages/';
