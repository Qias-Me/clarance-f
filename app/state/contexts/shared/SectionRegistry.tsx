/**
 * Section Registry for SF-86 Form
 * 
 * This module provides registration functionality for all section contexts
 * in the SF-86 form. It maintains a registry of all section providers and 
 * hooks to enable centralized access and management.
 */

import React from 'react';

// Type definitions for section registration
type SectionProvider = React.FC<{ children: React.ReactNode }>;
type SectionHook = () => any;

// Registry to store all section providers and hooks
interface SectionRegistry {
  [sectionId: string]: {
    Provider: SectionProvider;
    useSection: SectionHook;
  };
}

// Initialize the registry
const sectionRegistry: SectionRegistry = {};

/**
 * Register a section context with the registry
 * 
 * @param sectionId - Unique identifier for the section (e.g., "section1")
 * @param Provider - React context provider component for the section
 * @param useSection - Custom hook for accessing the section context
 */
export const registerSectionContext = (
  sectionId: string,
  Provider: SectionProvider,
  useSection: SectionHook
): void => {
  if (sectionRegistry[sectionId]) {
    console.warn(`Section with ID "${sectionId}" is already registered. Overwriting previous registration.`);
  }
  
  sectionRegistry[sectionId] = {
    Provider,
    useSection
  };
  
  console.log(`Section "${sectionId}" successfully registered.`);
};

/**
 * Get a section provider from the registry
 * 
 * @param sectionId - Unique identifier for the section
 * @returns The section provider component or undefined if not found
 */
export const getSectionProvider = (sectionId: string): SectionProvider | undefined => {
  return sectionRegistry[sectionId]?.Provider;
};

/**
 * Get a section hook from the registry
 * 
 * @param sectionId - Unique identifier for the section
 * @returns The section hook or undefined if not found
 */
export const getSectionHook = (sectionId: string): SectionHook | undefined => {
  return sectionRegistry[sectionId]?.useSection;
};

/**
 * Check if a section is registered
 * 
 * @param sectionId - Unique identifier for the section
 * @returns Boolean indicating if the section is registered
 */
export const isSectionRegistered = (sectionId: string): boolean => {
  return !!sectionRegistry[sectionId];
};

/**
 * Get all registered section IDs
 * 
 * @returns Array of all registered section IDs
 */
export const getAllRegisteredSectionIds = (): string[] => {
  return Object.keys(sectionRegistry);
};

/**
 * Composite provider that wraps children with all registered section providers
 */
export const AllSectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let content = children;
  
  // Wrap content with each section provider, starting from the last one
  getAllRegisteredSectionIds().reverse().forEach(sectionId => {
    const { Provider } = sectionRegistry[sectionId];
    content = <Provider>{content}</Provider>;
  });
  
  return <>{content}</>;
}; 