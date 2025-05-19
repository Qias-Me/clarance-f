import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MentalHealthProvider, useMentalHealth, MentalHealthConsentForm } from '../../sections/MentalHealthContext';
import { mentalHealth } from '../../sections/mentalHealth';
import { FieldMappingService } from '../../../../../api/service/FieldMappingService';

// Mock LocalStorage
const mockLocalStorage = (() => {
  let store = Object.create(null); // Use Object.create(null) to avoid prototype issues
  return {
    getItem: jest.fn((key) => (key in store ? store[key] : null)),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = Object.create(null);
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock FieldMappingService
jest.mock('../../../../../api/service/FieldMappingService', () => {
  return {
    FieldMappingService: jest.fn().mockImplementation(() => {
      return {
        mapMentalHealthFields: jest.fn().mockImplementation((fieldHierarchy, mentalHealthContext) => {
          // Return modified context to simulate mapping
          return {
            ...mentalHealthContext,
            securityMetadata: {
              ...mentalHealthContext.securityMetadata,
              lastUpdated: new Date().toISOString(),
              hipaaProtected: true,
            },
            declaredMentallyIncompetent: {
              ...mentalHealthContext.declaredMentallyIncompetent,
              id: 'mock_mapped_id_1',
            }
          };
        })
      };
    })
  };
});

// Test component that uses the mental health context
const TestConsumer = () => {
  const { 
    data, 
    isConfidential, 
    isEncrypted, 
    requiresConsent, 
    hasProvidedConsent, 
    setHasProvidedConsent,
    isRedacted,
    setIsRedacted,
    logAccess
  } = useMentalHealth();
  
  return (
    <div>
      <div data-testid="confidential">{isConfidential ? 'Yes' : 'No'}</div>
      <div data-testid="encrypted">{isEncrypted ? 'Yes' : 'No'}</div>
      <div data-testid="requires-consent">{requiresConsent ? 'Yes' : 'No'}</div>
      <div data-testid="has-consent">{hasProvidedConsent ? 'Yes' : 'No'}</div>
      <div data-testid="redacted">{isRedacted ? 'Yes' : 'No'}</div>
      <div data-testid="field-id">{data.declaredMentallyIncompetent.id}</div>
      <button 
        data-testid="provide-consent" 
        onClick={() => setHasProvidedConsent(true)}
      >
        Provide Consent
      </button>
      <button 
        data-testid="remove-consent" 
        onClick={() => setHasProvidedConsent(false)}
      >
        Remove Consent
      </button>
      <button 
        data-testid="toggle-redaction" 
        onClick={() => setIsRedacted(!isRedacted)}
      >
        Toggle Redaction
      </button>
      <button 
        data-testid="log-access" 
        onClick={() => logAccess('View Mental Health Data')}
      >
        Log Access
      </button>
    </div>
  );
};

describe('Mental Health Context', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });
  
  test('renders with default values and security protections', () => {
    render(
      <MentalHealthProvider>
        <TestConsumer />
      </MentalHealthProvider>
    );
    
    expect(screen.getByTestId('confidential')).toHaveTextContent('Yes');
    expect(screen.getByTestId('encrypted')).toHaveTextContent('Yes');
    expect(screen.getByTestId('requires-consent')).toHaveTextContent('Yes');
    expect(screen.getByTestId('has-consent')).toHaveTextContent('No'); // Default is no consent
    expect(screen.getByTestId('redacted')).toHaveTextContent('Yes'); // Default is redacted
  });
  
  test('allows consent to be provided and persists to localStorage', async () => {
    render(
      <MentalHealthProvider>
        <TestConsumer />
      </MentalHealthProvider>
    );
    
    // Initially no consent
    expect(screen.getByTestId('has-consent')).toHaveTextContent('No');
    
    // Provide consent
    fireEvent.click(screen.getByTestId('provide-consent'));
    
    // Consent should be updated
    expect(screen.getByTestId('has-consent')).toHaveTextContent('Yes');
    
    // Should be saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('mentalHealthConsent', 'true');
  });
  
  test('allows redaction to be toggled', async () => {
    render(
      <MentalHealthProvider>
        <TestConsumer />
      </MentalHealthProvider>
    );
    
    // Initially redacted
    expect(screen.getByTestId('redacted')).toHaveTextContent('Yes');
    
    // Toggle redaction
    fireEvent.click(screen.getByTestId('toggle-redaction'));
    
    // Should now be unredacted
    expect(screen.getByTestId('redacted')).toHaveTextContent('No');
  });
  
  test('logs access to mental health data', async () => {
    // Mock console.log to check logging
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <MentalHealthProvider>
        <TestConsumer />
      </MentalHealthProvider>
    );
    
    // Log access
    fireEvent.click(screen.getByTestId('log-access'));
    
    // Check that access was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ACCESS LOG'), expect.any(String), 'View Mental Health Data');
    
    consoleLogSpy.mockRestore();
  });
  
  test('consent form allows user to provide consent', async () => {
    const handleConsent = jest.fn();
    
    render(<MentalHealthConsentForm onConsent={handleConsent} />);
    
    // Find consent checkbox and button
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /provide consent/i });
    
    // Initially button should be disabled
    expect(submitButton).toBeDisabled();
    
    // Check the checkbox
    fireEvent.click(consentCheckbox);
    
    // Button should be enabled
    expect(submitButton).not.toBeDisabled();
    
    // Click submit
    fireEvent.click(submitButton);
    
    // Handler should be called with true
    expect(handleConsent).toHaveBeenCalledWith(true);
  });
  
  test('integrates with FieldMappingService when consent is provided', async () => {
    // Create mock field hierarchy
    const mockFieldHierarchy = {
      sections: {
        21: {
          title: 'Psychological and Emotional Health',
          fields: [
            { id: 'mock_id_1', name: 'declaredMentallyIncompetent', label: 'Declared Mentally Incompetent' }
          ]
        }
      }
    };
    
    // Create instance of service and spy on the mapping method
    const fieldMappingService = new FieldMappingService();
    const mappingSpy = jest.spyOn(fieldMappingService, 'mapMentalHealthFields');
    
    // Create test scenario
    const TestScenario = () => {
      const { data, hasProvidedConsent, setHasProvidedConsent } = useMentalHealth();
      
      // Effect to map data when consent changes
      React.useEffect(() => {
        if (hasProvidedConsent) {
          fieldMappingService.mapMentalHealthFields(mockFieldHierarchy, data);
        }
      }, [hasProvidedConsent, data]);
      
      return (
        <div>
          <div data-testid="field-id">{data.declaredMentallyIncompetent.id}</div>
          <button 
            data-testid="provide-consent" 
            onClick={() => setHasProvidedConsent(true)}
          >
            Provide Consent
          </button>
        </div>
      );
    };
    
    render(
      <MentalHealthProvider>
        <TestScenario />
      </MentalHealthProvider>
    );
    
    // Initial ID should be the default
    expect(screen.getByTestId('field-id')).toHaveTextContent('14351');
    
    // Provide consent
    fireEvent.click(screen.getByTestId('provide-consent'));
    
    // Mapping function should be called
    expect(mappingSpy).toHaveBeenCalledWith(mockFieldHierarchy, expect.any(Object));
    
    // After mapping, field ID should be updated (in a real scenario)
    // In our test the mock will return 'mock_mapped_id_1'
    await waitFor(() => {
      expect(screen.getByTestId('field-id')).toHaveTextContent('mock_mapped_id_1');
    });
  });
}); 