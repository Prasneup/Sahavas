export const isValidCoordinate = (lat: any, lng: any): boolean => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return (
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

export const validatePhoneNumber = (value: string): string => {
  if (value.length > 0 && !/^\d*$/.test(value)) return 'invalid_chars';
  if (value.length > 10) return 'invalid_length';
  
  if (value.length > 0 && value.length < 10) {
    return 'Nepal mobile numbers must be exactly 10 digits';
  } else if (value.length === 10 && !/^(98|97)/.test(value)) {
    return 'Nepal mobile numbers must start with 97 or 98';
  }
  return '';
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain both letters and numbers.';
  }
  return null;
};
