# Mental Health Information Handling

This documentation outlines the security, privacy, and compliance measures implemented for handling sensitive mental health information within the SF-86 form processing system.

## Overview

Section 21 (Psychological and Emotional Health) of the SF-86 form contains highly sensitive personal information that requires special handling in accordance with:

- Health Insurance Portability and Accountability Act (HIPAA)
- Privacy Act of 1974
- Federal Information Security Management Act (FISMA)
- Agency-specific privacy regulations

## Security Features Implemented

The application implements several layers of protection for mental health data:

### 1. Access Controls

- **Consent Management**: User must explicitly provide consent before data is processed or displayed
- **Redaction Capabilities**: Data can be redacted during display where appropriate
- **Access Restrictions**: Limited to personnel with proper authorization

### 2. Technical Safeguards

- **Encryption**: Mental health data is encrypted during transmission and storage
- **Audit Logging**: All access and operations on mental health data are recorded
- **Persistence Management**: Consent and preferences are stored securely in localStorage
- **Session Management**: Consent is cleared on session timeout or explicit logout

### 3. User Interface Controls

- **Privacy Notices**: Clear disclosure of how information will be used
- **Explicit Consent**: Checkbox-based consent with disabled submit until confirmed
- **Visual Indicators**: Clear indicators when viewing sensitive information
- **Redaction Controls**: Ability to toggle sensitive data visibility

## Implementation Architecture

The mental health module uses a dedicated context architecture:

- `MentalHealthContext.tsx`: React context with privacy controls and consent management
- `mentalHealth.tsx`: Data structure and initial state
- `FieldMappingService.ts`: Maps form field data to mental health context

## Field Mapping Process

The `mapMentalHealthFields` method in `FieldMappingService.ts` implements a secure mapping process:

1. **Field Identification**: Locate mental health fields in the form hierarchy
2. **Metadata Preservation**: Maintain field IDs and metadata during mapping
3. **Contextual Mapping**: Map specific subsections (21A-21E) to their corresponding structure
4. **Validation**: Ensure required fields are properly mapped

## Testing

Comprehensive testing has been implemented to verify security features:

- `mentalHealth.test.js`: Unit tests for context features
- `test-mental-health-mapping.js`: Validation tests for field mapping
- `test-mental-health-security.js`: Security controls validation

## Usage Example

```jsx
// Wrap component with the provider
<MentalHealthProvider>
  <SensitiveComponent />
</MentalHealthProvider>

// Access data within components
function SensitiveComponent() {
  const { 
    data, 
    hasProvidedConsent, 
    isRedacted,
    setIsRedacted,
    logAccess 
  } = useMentalHealth();
  
  // Log access when viewing sensitive information
  const viewDiagnosis = () => {
    logAccess("Viewed diagnosis information");
    return data.diagnosedWithMentalHealthCondition;
  };
  
  // Only show data if consent provided and not redacted
  return (
    <div>
      {hasProvidedConsent && !isRedacted ? (
        <div>
          <h3>Diagnosis Information</h3>
          <p>{viewDiagnosis().value}</p>
        </div>
      ) : (
        <MentalHealthConsentForm 
          onConsent={(consent) => setHasProvidedConsent(consent)} 
        />
      )}
    </div>
  );
}
```

## Compliance Considerations

When implementing or modifying this module, ensure all changes maintain:

1. **HIPAA Compliance**: Protected health information must be safeguarded
2. **Privacy Act Requirements**: Consent and notification requirements
3. **Audit Trail**: Logging of all access and modifications
4. **Minimization**: Only collect and display necessary information

## Security Best Practices

1. Never bypass the consent mechanism
2. Always use the `logAccess` function when accessing mental health data
3. Set appropriate redaction defaults based on the user's role
4. Clear consent when the user logs out or changes
5. Regularly audit access logs for unauthorized access attempts 