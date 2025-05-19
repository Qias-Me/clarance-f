import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RenderMentalHealth } from '../RenderMentalHealth';
import { MentalHealthProvider } from '../../../state/contexts/sections/MentalHealthContext';
import type { MentalHealth, SecurityMetadata } from 'api/interfaces/sections/mentalHealth';
import { FieldMappingService } from 'api/service/FieldMappingService';
import type { FormInfo } from 'api/interfaces/FormInfo';

// Mock the section components to simplify testing
jest.mock('../../_mental/section21A', () => ({
  RenderSection21A: () => <div data-testid="section21A">Section 21A Component</div>
}));

jest.mock('../../_mental/section21B', () => ({
  RenderSection21B: () => <div data-testid="section21B">Section 21B Component</div>
}));

jest.mock('../../_mental/section21C', () => ({
  RenderSection21C: () => <div data-testid="section21C">Section 21C Component</div>
}));

jest.mock('../../_mental/section21D', () => ({
  RenderSection21D: () => <div data-testid="section21D">Section 21D Component</div>
}));

jest.mock('../../_mental/section21D1', () => ({
  RenderSection21D1: () => <div data-testid="section21D1">Section 21D1 Component</div>
}));

jest.mock('../../_mental/section21E', () => ({
  RenderSection21E: () => <div data-testid="section21E">Section 21E Component</div>
}));

describe('RenderMentalHealth Component', () => {
  // Create correctly typed Field objects
  const createField = (value: 'YES' | 'NO' = 'NO') => ({
    value,
    id: 'test-id',
    type: 'radio',
    label: 'Test Field'
  });
  
  // Default props for the component with correct typing
  const defaultProps = {
    data: {
      _id: 21,
      declaredMentallyIncompetent: createField('NO'),
      consultMentalHealth: createField('NO'),
      hospitalizedMentalHealth: createField('NO'),
      beenDiagnosed: createField('NO'),
      delayedTreatment: createField('NO'),
      currentlyInTreatment: createField('NO'),
      substantialAffects: createField('NO'),
      counseling: createField('NO'),
      securityMetadata: {
        encryptedAtRest: true,
        restrictedAccess: true,
        auditLoggingEnabled: true,
        consentRequired: true,
        privacyNoticeDisplayed: true,
        section: 21,
        sectionTitle: "Psychological and Emotional Health",
        containsProtectedHealthInformation: true,
        lastUpdated: new Date().toISOString(),
        sensitivityLevel: "HIGH" as const,
        dataRetentionPolicy: "RESTRICTED" as const,
        accessControlLevel: "NEED_TO_KNOW" as const,
        hipaaProtected: true
      } as SecurityMetadata
    } as MentalHealth,
    onInputChange: jest.fn(),
    onAddEntry: jest.fn(),
    onRemoveEntry: jest.fn(),
    getDefaultNewItem: jest.fn((path) => {
      if (path === 'mentalHealth.section21A') {
        return [{ dateOccurred: { value: '' } }];
      }
      return {};
    }),
    isReadOnlyField: jest.fn(() => false),
    path: 'mentalHealth',
    formInfo: { 
      formId: 'test-form', 
      title: 'Test Form', 
      status: 'complete',
      employee_id: '123456',
      suffix: 'SF-86'
    } as FormInfo
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main component with section title', () => {
    render(<RenderMentalHealth {...defaultProps} />);
    expect(screen.getByText(/Section 21 - Psychological and Emotional Health/i)).toBeInTheDocument();
  });

  test('displays all required section options', () => {
    render(<RenderMentalHealth {...defaultProps} />);
    
    // Check for all section prompts
    expect(screen.getByText(/Section 21A Has a court or administrative agency EVER issued an order declaring you mentally incompetent/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 21B Has a court or administrative agency EVER ordered you to consult with a mental health professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 21C Have you EVER been hospitalized for a mental health condition/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 21D Have you EVER been diagnosed by a physician or other health professional/i)).toBeInTheDocument();
  });

  test('shows section 21A component when declared mentally incompetent is true', () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        declaredMentallyIncompetent: createField('YES'),
        section21A: [{}]
      }
    };

    render(<RenderMentalHealth {...props} />);
    expect(screen.getByTestId('section21A')).toBeInTheDocument();
  });

  test('shows section 21B component when ordered to consult is true', () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        consultMentalHealth: createField('YES'),
        section21B: [{}]
      }
    };

    render(<RenderMentalHealth {...props} />);
    expect(screen.getByTestId('section21B')).toBeInTheDocument();
  });

  test('shows section 21C component when hospitalized is true', () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        hospitalizedMentalHealth: createField('YES'),
        section21C: [{}]
      }
    };

    render(<RenderMentalHealth {...props} />);
    expect(screen.getByTestId('section21C')).toBeInTheDocument();
  });

  test('shows section 21D component when diagnosed is true', () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        beenDiagnosed: createField('YES'),
        section21D: [{}]
      }
    };

    render(<RenderMentalHealth {...props} />);
    expect(screen.getByTestId('section21D')).toBeInTheDocument();
  });

  test('shows section 21D1 component when in treatment is true', () => {
    const props = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        beenDiagnosed: createField('YES'),
        currentlyInTreatment: createField('YES'),
        section21D1: [{}]
      }
    };

    render(<RenderMentalHealth {...props} />);
    expect(screen.getByTestId('section21D1')).toBeInTheDocument();
  });

  test('calls onInputChange when options are changed', () => {
    render(<RenderMentalHealth {...defaultProps} />);
    
    // Find the radio button for "Yes" and click it
    const yesOption = screen.getAllByLabelText('Yes')[0];
    fireEvent.click(yesOption);
    
    expect(defaultProps.onInputChange).toHaveBeenCalled();
    expect(defaultProps.onAddEntry).toHaveBeenCalled();
  });

  test('integrates with FieldMappingService when mapping fields', () => {
    // Create a mock field hierarchy
    const mockFieldHierarchy = {
      sections: {
        21: {
          title: 'Psychological and Emotional Health',
          fields: [
            { 
              id: 'mental-incompetent-1', 
              name: 'Section21A-DeclaredIncompetent', 
              value: 'Yes',
              label: 'Have you ever been declared mentally incompetent?'
            }
          ]
        }
      }
    };

    // Initialize the service
    const fieldMappingService = new FieldMappingService();
    
    // Call the mapping function with properly typed initial context
    const initialContext = {
      ...defaultProps.data
    };
    
    const mappedContext = fieldMappingService.mapMentalHealthFields(
      mockFieldHierarchy,
      initialContext
    );
    
    // Verify basic mapping worked
    expect(mappedContext).toBeDefined();
    expect(mappedContext.securityMetadata).toBeDefined();
    
    // Render with the mapped data
    const props = {
      ...defaultProps,
      data: mappedContext
    };
    
    render(<RenderMentalHealth {...props} />);
    expect(screen.getByText(/Section 21 - Psychological and Emotional Health/i)).toBeInTheDocument();
  });

  test('wraps component with MentalHealthProvider for proper context integration', () => {
    render(
      <MentalHealthProvider>
        <RenderMentalHealth {...defaultProps} />
      </MentalHealthProvider>
    );
    
    // Component should render normally when wrapped with provider
    expect(screen.getByText(/Section 21 - Psychological and Emotional Health/i)).toBeInTheDocument();
  });
}); 