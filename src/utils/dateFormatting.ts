/**
 * Localized Date and Time Formatting Utilities
 * 
 * Provides consistent date and time formatting across the application
 * based on the user's selected language.
 */

import i18n from '../i18n';

/**
 * Format a date string according to the current locale
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatLocalizedDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const date = new Date(dateString);
  const locale = getLocaleFromLanguage(i18n.language);
  return date.toLocaleDateString(locale, options);
};

/**
 * Format a time string according to the current locale
 * @param timeString - Time string (HH:MM)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatLocalizedTime = (
  timeString: string,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  // Create a date object with the time
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  const locale = getLocaleFromLanguage(i18n.language);
  return date.toLocaleTimeString(locale, options);
};

/**
 * Format a full datetime according to the current locale
 * @param dateTimeString - ISO datetime string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted datetime string
 */
export const formatLocalizedDateTime = (
  dateTimeString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  const date = new Date(dateTimeString);
  const locale = getLocaleFromLanguage(i18n.language);
  return date.toLocaleDateString(locale, options);
};

/**
 * Format a relative date (e.g., "2 days ago", "in 3 hours")
 * @param dateString - ISO date string
 * @returns Relative date string
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const locale = getLocaleFromLanguage(i18n.language);
  
  // Use Intl.RelativeTimeFormat for proper localization
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (Math.abs(diffInSeconds) < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (Math.abs(diffInSeconds) < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};

/**
 * Get the proper locale string from language code
 * @param language - Language code (de, en, fr)
 * @returns Locale string for Intl APIs
 */
const getLocaleFromLanguage = (language: string): string => {
  switch (language) {
    case 'de':
      return 'de-DE';
    case 'en':
      return 'en-US';
    case 'fr':
      return 'fr-FR';
    default:
      return 'de-DE';
  }
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format a time for input fields (HH:MM)
 * @param time - Time string or Date object
 * @returns Time string in HH:MM format
 */
export const formatTimeForInput = (time: string | Date): string => {
  if (typeof time === 'string') {
    return time;
  }
  return time.toTimeString().slice(0, 5);
};