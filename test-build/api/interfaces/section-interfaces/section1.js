"use strict";
/**
 * Section 1: Information About You
 *
 * TypeScript interface definitions for SF-86 Section 1 (Information About You) data structure.
 * Based on the established Field<T> interface patterns and PDF field ID mappings from section-1.json.
 * Enhanced with integration folder mappings for PDF-to-UI field mapping.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME_VALIDATION = void 0;
// ============================================================================
// HELPER TYPES
// ============================================================================
// SUFFIX_OPTIONS imported from base.ts to avoid duplication
/**
 * Name validation patterns
 */
exports.NAME_VALIDATION = {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    ALLOWED_CHARACTERS: /^[a-zA-Z\s\-'\.]*$/,
    INITIAL_PATTERN: /^[A-Z]\.?$/
};
// ============================================================================
// INTERFACE LAYER - TYPES, INTERFACES, AND CONSTANTS ONLY
// ============================================================================
//
// Note: Helper functions have been moved to the context layer to follow
// proper Interface → Context → Component architectural hierarchy.
// Functions like createDefaultSection1, updateSection1Field, and validateFullName
// are now implemented in app/state/contexts/sections2.0/section1.tsx
