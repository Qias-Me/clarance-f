/**
 * JavaScript wrapper for FieldMappingService TypeScript module
 * This allows us to import the TypeScript class in JavaScript test files
 */

// Import directly from the compiled JavaScript output
// This assumes the TypeScript has been compiled to JavaScript
import { FieldMappingService as FieldMappingServiceTS } from '../../api/service/FieldMappingService';

// Re-export the service
export const FieldMappingService = FieldMappingServiceTS; 