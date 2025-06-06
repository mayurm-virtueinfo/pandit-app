class ApiEndpoints {
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
  static readonly XMasterKey = '$2a$10$XR82L3T4Q4gtDUAvZKwioOsmNaU2X7QVpkZbtKJ90jdcoVal/Pd4a';
}

export default ApiEndpoints;