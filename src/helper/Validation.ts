export const validatePhoneNumber = (number: string) => {
  const trimmed = number.trim().replace(/\s+/g, '');
  const e164Regex = /^\+?[1-9]\d{7,14}$/; // E.164 standard: min 8, max 15 digits
  return e164Regex.test(trimmed);
};