import { supabase } from './supabase';

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation - at least 8 characters, including 1 uppercase, 1 lowercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Phone number validation - accepts formats with or without country code
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10,}$/;

// Full name validation - at least 2 words, each min 2 chars
const nameRegex = /^[A-Za-z]{2,}(?: [A-Za-z]{2,})+$/;

// Validation function for email format
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

// Validation function for password strength
export const isValidPassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

// Validation function for phone number
export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};

// Validation function for full name
export const isValidFullName = (name: string): boolean => {
  return nameRegex.test(name);
};

// Check if passwords match
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// Check if email already exists in database
export const isEmailUnique = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();
  
  if (error || !data) {
    return true; // Email is unique if no record found
  }
  return false; // Email exists
};

// Get error message for password
export const getPasswordErrorMessage = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return '';
};

// Get error message for email
export const getEmailErrorMessage = (email: string): string => {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return '';
};

// Get error message for phone
export const getPhoneErrorMessage = (phone: string): string => {
  if (!phone) return 'Phone number is required';
  if (!isValidPhone(phone)) return 'Please enter a valid phone number';
  return '';
};

// Get error message for full name
export const getFullNameErrorMessage = (name: string): string => {
  if (!name) return 'Full name is required';
  if (!isValidFullName(name)) return 'Please enter your first and last name';
  return '';
}; 