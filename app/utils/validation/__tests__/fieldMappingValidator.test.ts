import { FieldMappingValidator } from '../fieldMappingValidator';
import { FieldErrorType } from '../fieldValidation';

// Mock dependencies
jest.mock('../fieldValidation', () => {
  const original = jest.requireActual('../fieldValidation');
  return {
    ...original,
    validateFieldMapping: jest.fn().mockImplementation((data, hierarchy, options) => {
      // Simple mock implementation that returns valid result
      return {
        isValid: true,
        errors: []
      };
    })
  };
});

jest.mock('../../fieldHierarchyParser', () => ({
  stripIdSuffix: jest.fn(id => id.replace(/ 0 R$/, '')),
  addIdSuffix: jest.fn(id => `${id} 0 R`),
  sectionToFileMapping: {
    '5': 'namesInfo',
    '11': 'residencyInfo',
    '13': 'employmentInfo'
  }
}));

jest.mock('../../formHandler', () => ({
  generateFieldId: jest.fn((baseId, index, sectionPath) => {
    return index === 0 ? baseId : `${baseId}_${index}`;
  }),
  validateGeneratedFieldId: jest.fn().mockReturnValue(true)
}));

describe('FieldMappingValidator', () => {
  let validator: FieldMappingValidator;
  const mockFieldHierarchy = { fields: [] };
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    
    // Create fresh validator instance for each test
    validator = new FieldMappingValidator(mockFieldHierarchy);
    
    // Mock console methods to prevent test output noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  describe('Validation Modes', () => {
    it('should initialize with development mode by default', () => {
      expect(validator.getEnvironmentMode()).toBe('development');
      expect(validator.getOptions()).toEqual({
        strict: true,
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: true
      });
    });
    
    it('should correctly set production mode', () => {
      validator.setDevelopmentMode(false);
      
      expect(validator.getEnvironmentMode()).toBe('production');
      expect(validator.getOptions()).toEqual({
        strict: false,
        validateTypes: false,
        validateRequired: true,
        validateFormats: false,
        validateSuffixes: false
      });
    });
    
    it('should set custom mode when options don\'t match predefined modes', () => {
      validator.setOptions({
        strict: true,
        validateTypes: false,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: false
      });
      
      expect(validator.getEnvironmentMode()).toBe('custom');
    });
    
    it('should set validation mode using setValidationMode', () => {
      // Test development mode
      validator.setValidationMode('development');
      expect(validator.getEnvironmentMode()).toBe('development');
      expect(validator.getOptions().strict).toBe(true);
      expect(validator.getOptions().validateTypes).toBe(true);
      
      // Test production mode
      validator.setValidationMode('production');
      expect(validator.getEnvironmentMode()).toBe('production');
      expect(validator.getOptions().strict).toBe(false);
      expect(validator.getOptions().validateTypes).toBe(false);
      
      // Test custom mode
      validator.setValidationMode('custom', {
        strict: true,
        validateTypes: false,
        validateRequired: true,
        validateFormats: false,
        validateSuffixes: true
      });
      
      expect(validator.getEnvironmentMode()).toBe('custom');
      expect(validator.getOptions().strict).toBe(true);
      expect(validator.getOptions().validateTypes).toBe(false);
      expect(validator.getOptions().validateFormats).toBe(false);
      expect(validator.getOptions().validateSuffixes).toBe(true);
    });
    
    it('should toggle individual validation features', () => {
      // Start with development mode
      expect(validator.getEnvironmentMode()).toBe('development');
      
      // Toggle one feature
      validator.setValidationFeature('validateTypes', false);
      
      // Should switch to custom mode
      expect(validator.getEnvironmentMode()).toBe('custom');
      expect(validator.getOptions().validateTypes).toBe(false);
      expect(validator.getOptions().validateRequired).toBe(true);
      
      // Toggle another feature
      validator.setValidationFeature('validateFormats', false);
      expect(validator.getOptions().validateFormats).toBe(false);
      
      // Set features to match production mode
      validator.setValidationFeature('strict', false);
      validator.setValidationFeature('validateSuffixes', false);
      
      // Should now be in production mode
      expect(validator.getEnvironmentMode()).toBe('production');
    });
    
    it('should preserve mode when preserveMode flag is set', () => {
      validator.setValidationMode('development');
      expect(validator.getEnvironmentMode()).toBe('development');
      
      // Toggle feature but preserve mode
      validator.setValidationFeature('validateTypes', false, true);
      
      // Mode should still be development
      expect(validator.getEnvironmentMode()).toBe('development');
      // But the feature should be changed
      expect(validator.getOptions().validateTypes).toBe(false);
    });
  });
  
  describe('Runtime Optimization', () => {
    it('should optimize for server-side rendering', () => {
      validator.optimizeForRuntime({ isServerSide: true });
      
      expect(validator.getOptions()).toEqual({
        strict: false,
        validateTypes: false,
        validateRequired: true,
        validateFormats: false,
        validateSuffixes: false
      });
    });
    
    it('should optimize for initial render', () => {
      validator.optimizeForRuntime({ 
        isInitialRender: true,
        userHasEdited: false
      });
      
      expect(validator.getOptions()).toEqual({
        strict: false,
        validateTypes: false,
        validateRequired: false, // No required field validation on initial render
        validateFormats: false,
        validateSuffixes: false
      });
    });
    
    it('should perform full validation on submit', () => {
      // Start with production mode
      validator.setDevelopmentMode(false);
      expect(validator.getOptions().validateTypes).toBe(false);
      
      // Then optimize for submit
      validator.optimizeForRuntime({ isSubmitAttempt: true });
      
      expect(validator.getOptions()).toEqual({
        strict: true,
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: false // Preserves original setting
      });
    });
    
    it('should balance validation for critical paths', () => {
      validator.optimizeForRuntime({ isCriticalPath: true });
      
      expect(validator.getOptions()).toEqual({
        strict: false,
        validateTypes: true,
        validateRequired: true,
        validateFormats: true,
        validateSuffixes: false
      });
    });
    
    it('should prioritize submit validation over other optimizations', () => {
      validator.optimizeForRuntime({ 
        isServerSide: true,
        isInitialRender: true,
        isSubmitAttempt: true // This should take priority
      });
      
      // Should use submit validation settings
      expect(validator.getOptions().strict).toBe(true);
      expect(validator.getOptions().validateTypes).toBe(true);
    });
  });
  
  describe('Console Output', () => {
    it('should log validation results in development mode', () => {
      // Set up development mode
      validator.setDevelopmentMode(true);
      
      // Mock validateFieldMapping to return errors
      require('../fieldValidation').validateFieldMapping.mockReturnValueOnce({
        isValid: false,
        errors: [
          { type: FieldErrorType.MISSING_FIELD, message: 'Field missing', path: 'test.path' }
        ]
      });
      
      validator.validateSection({ test: 'data' }, 'TestSection');
      
      // Should log in development mode
      expect(console.log).toHaveBeenCalledWith('Validating section: TestSection');
      expect(console.warn).toHaveBeenCalled();
    });
    
    it('should suppress logs in production mode', () => {
      // Set up production mode
      validator.setDevelopmentMode(false);
      
      // Mock process.env.NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      validator.validateSection({ test: 'data' }, 'TestSection');
      
      // Should not log in production mode
      expect(console.log).not.toHaveBeenCalled();
      
      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
}); 