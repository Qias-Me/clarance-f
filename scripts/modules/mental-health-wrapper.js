/**
 * JavaScript wrapper for mentalHealth context TypeScript module
 * This allows us to import the TypeScript module in JavaScript test files
 */

// Import directly from the TypeScript module
import { mentalHealth as mentalHealthTS } from '../../app/state/contexts/sections/mentalHealth';

// Re-export the mental health context
export const mentalHealth = mentalHealthTS; 