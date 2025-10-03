/**
 * Application Categories
 * 
 * Centralized definition of all interest categories used throughout the Soul Circles application.
 * These categories are used for:
 * - User profile interests
 * - Event categories
 * - Place/location interests
 * - Search and filtering
 * 
 * Note: These are now translation keys that should be used with the t() function
 */

export const APP_CATEGORIES = [
  'categories.innerWork',
  'categories.spiritualPaths',
  'categories.natureConnection',
  'categories.artExpression',
  'categories.philosophy',
  'categories.community',
  'categories.culturalChange',
  'categories.events'
] as const;

export type AppCategory = typeof APP_CATEGORIES[number];

// Helper function to check if a string is a valid category key
export const isValidCategory = (categoryKey: string): categoryKey is AppCategory => {
  return APP_CATEGORIES.includes(categoryKey as AppCategory);
};

// Default category key for new items
export const DEFAULT_CATEGORY_KEY: AppCategory = 'categories.community';

// Legacy categories for backward compatibility with existing database data
export const LEGACY_CATEGORIES = [
  'Innere Arbeit & Bewusstseinsentwicklung',
  'Geistige Wege & spirituelle Strömungen',
  'Naturverbindung & Arbeit mit der Erde',
  'Kunst & schöpferischer Ausdruck',
  'Philosophie & freies Denken',
  'Gemeinschaft & echte Begegnung',
  'Kulturwandel & soziale Impulse',
  'Veranstaltungen & gemeinsames Handeln'
] as const;

export type LegacyCategory = typeof LEGACY_CATEGORIES[number];

// Helper function to check if a string is a valid legacy category
export const isValidLegacyCategory = (category: string): category is LegacyCategory => {
  return LEGACY_CATEGORIES.includes(category as LegacyCategory);
};

// Mapping from legacy categories to translation keys
export const LEGACY_TO_KEY_MAP: Record<LegacyCategory, AppCategory> = {
  'Innere Arbeit & Bewusstseinsentwicklung': 'categories.innerWork',
  'Geistige Wege & spirituelle Strömungen': 'categories.spiritualPaths',
  'Naturverbindung & Arbeit mit der Erde': 'categories.natureConnection',
  'Kunst & schöpferischer Ausdruck': 'categories.artExpression',
  'Philosophie & freies Denken': 'categories.philosophy',
  'Gemeinschaft & echte Begegnung': 'categories.community',
  'Kulturwandel & soziale Impulse': 'categories.culturalChange',
  'Veranstaltungen & gemeinsames Handeln': 'categories.events'
};

// Helper function to get translation key from legacy category
export const getLegacyCategoryKey = (legacyCategory: string): AppCategory | null => {
  if (isValidLegacyCategory(legacyCategory)) {
    return LEGACY_TO_KEY_MAP[legacyCategory];
  }
  return null;
};