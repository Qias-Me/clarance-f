// Import the SelfHealingManager for coordinate analysis
import { SelfHealingManager } from './self-healing.js';

/**
 * Enhance fields with coordinate analysis to improve their categorization
 * @param {Array} fields The fields to enhance
 * @returns {Array} Enhanced fields with improved categorization
 */
export function enhanceFieldsWithCoordinates(fields) {
  // Create a self-healing manager instance
  const selfHealer = new SelfHealingManager(2); // Use 2 iterations by default
  
  // Use the coordinate analysis feature
  return selfHealer.enhanceFieldsWithCoordinates(fields);
} 