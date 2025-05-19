import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { mentalHealth } from "./mentalHealth";

/**
 * MentalHealth Context with Privacy Controls
 * 
 * This context includes special handling for sensitive mental health information
 * with enhanced privacy controls, including:
 * - Confidentiality markers
 * - Consent requirements
 * - Redaction capabilities
 * - Audit logging
 * 
 * Section 21: Psychological and Emotional Health
 */

// Constants for localStorage keys
const CONSENT_STORAGE_KEY = 'mentalHealthConsent';
const REDACTION_STORAGE_KEY = 'mentalHealthRedaction';

// Context metadata with privacy and security settings
export const mentalHealthMetadata = {
  context: mentalHealth,
  section: 21,
  title: "Psychological and Emotional Health",
  confidential: true,
  encryptionEnabled: true,
  accessRestricted: true,
  auditEnabled: true,
  consentRequired: true,
  redactionEnabled: true,
  privacyNoticeRequired: true,
  hipaaProtected: true
};

// TypeScript type for the context
export type MentalHealthContextType = {
  data: typeof mentalHealth;
  isConfidential: boolean;
  isEncrypted: boolean;
  isRestricted: boolean;
  requiresConsent: boolean;
  hasProvidedConsent: boolean;
  setHasProvidedConsent: (hasConsent: boolean) => void;
  isRedacted: boolean;
  setIsRedacted: (redacted: boolean) => void;
  logAccess: (action: string) => void;
  clearConsent: () => void;
};

// Create the React Context
export const MentalHealthContext = createContext<MentalHealthContextType | undefined>(undefined);

// Props for the provider component
export type MentalHealthProviderProps = {
  children: ReactNode;
  initialConsent?: boolean;
  initialRedaction?: boolean;
};

/**
 * Provider component for Mental Health data
 * Manages state for consent, redaction, and access logging
 * Persists preferences to localStorage
 */
export function MentalHealthProvider({
  children,
  initialConsent = false,
  initialRedaction = true
}: MentalHealthProviderProps) {
  // Initialize state from localStorage or defaults
  const [hasProvidedConsent, setHasProvidedConsentState] = useState<boolean>(() => {
    try {
      // Try to get consent from localStorage
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      return storedConsent ? storedConsent === 'true' : initialConsent;
    } catch (error) {
      console.warn('Error accessing localStorage for consent:', error);
      return initialConsent;
    }
  });
  
  const [isRedacted, setIsRedactedState] = useState<boolean>(() => {
    try {
      // Try to get redaction preference from localStorage
      const storedRedaction = localStorage.getItem(REDACTION_STORAGE_KEY);
      return storedRedaction ? storedRedaction === 'true' : initialRedaction;
    } catch (error) {
      console.warn('Error accessing localStorage for redaction:', error);
      return initialRedaction;
    }
  });
  
  // Update localStorage when consent changes
  const setHasProvidedConsent = (value: boolean) => {
    setHasProvidedConsentState(value);
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value.toString());
      // Log the consent status change (for audit purposes)
      logAccess(`Consent status changed to: ${value ? 'provided' : 'withdrawn'}`);
    } catch (error) {
      console.error('Error storing consent in localStorage:', error);
    }
  };
  
  // Update localStorage when redaction preference changes
  const setIsRedacted = (value: boolean) => {
    setIsRedactedState(value);
    try {
      localStorage.setItem(REDACTION_STORAGE_KEY, value.toString());
      // Log the redaction status change (for audit purposes)
      logAccess(`Redaction status changed to: ${value ? 'redacted' : 'visible'}`);
    } catch (error) {
      console.error('Error storing redaction preference in localStorage:', error);
    }
  };
  
  // Clear consent (used for logout or session expiration)
  const clearConsent = () => {
    setHasProvidedConsentState(false);
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      logAccess('Consent cleared');
    } catch (error) {
      console.error('Error clearing consent from localStorage:', error);
    }
  };
  
  // Function to log access to this sensitive information
  const logAccess = (action: string) => {
    const timestamp = new Date().toISOString();
    
    // In a real implementation, this would record to a secure audit log
    console.log(`[AUDIT LOG] ${timestamp} - Mental Health data: ${action}`);
    
    // In a production environment, we would log:
    // - User ID
    // - Timestamp
    // - Action (view, edit, export)
    // - Fields accessed
    // - IP address
    // - System information
    
    // For very sensitive systems, you might also want to:
    try {
      // Store in localStorage for demo purposes (real systems would use server-side logging)
      const auditLogs = JSON.parse(localStorage.getItem('mentalHealthAuditLog') || '[]');
      auditLogs.push({ timestamp, action });
      localStorage.setItem('mentalHealthAuditLog', JSON.stringify(auditLogs));
    } catch (error) {
      console.error('Error storing audit log:', error);
    }
  };
  
  // Context value with data and privacy controls
  const contextValue: MentalHealthContextType = {
    data: mentalHealth,
    isConfidential: mentalHealthMetadata.confidential,
    isEncrypted: mentalHealthMetadata.encryptionEnabled,
    isRestricted: mentalHealthMetadata.accessRestricted,
    requiresConsent: mentalHealthMetadata.consentRequired,
    hasProvidedConsent,
    setHasProvidedConsent,
    isRedacted,
    setIsRedacted,
    logAccess,
    clearConsent
  };
  
  return (
    <MentalHealthContext.Provider value={contextValue}>
      {children}
    </MentalHealthContext.Provider>
  );
}

/**
 * Hook for consuming the MentalHealth context
 * Handles consent checking and access logging
 */
export function useMentalHealth() {
  const context = useContext(MentalHealthContext);
  
  if (context === undefined) {
    throw new Error("useMentalHealth must be used within a MentalHealthProvider");
  }
  
  // Log access when context is accessed
  useEffect(() => {
    context.logAccess("Context accessed");
  }, [context]);
  
  // If consent is required but not provided, return redacted or restricted data
  if (context.requiresConsent && !context.hasProvidedConsent) {
    // In a real implementation, you might return a redacted version
    // or throw a permission error
    console.warn("Attempting to access mental health data without consent");
  }
  
  return context;
}

/**
 * Component for requesting and recording user consent
 * Includes checkbox for explicit consent
 */
export function MentalHealthConsentForm({
  onConsent
}: {
  onConsent: (hasConsent: boolean) => void
}) {
  const [isChecked, setIsChecked] = useState(false);
  
  return (
    <div className="consent-form">
      <h2>Consent for Mental Health Information</h2>
      <p>
        This section contains sensitive mental health information protected by HIPAA and 
        the Privacy Act of 1974. Your consent is required before accessing or processing
        this information.
      </p>
      
      <div className="privacy-notice">
        <h3>Privacy Notice</h3>
        <p>
          The information you provide will be used to process your security clearance 
          application. This data is protected under HIPAA and the Privacy Act, and access 
          is strictly limited to authorized personnel with a need to know.
        </p>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your information</li>
          <li>Request corrections</li>
          <li>Withdraw consent at any time</li>
          <li>Request data portability</li>
        </ul>
      </div>
      
      <div className="consent-checkbox">
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          I have read and understood the privacy notice and consent to the processing 
          of my mental health information as described above.
        </label>
      </div>
      
      <div className="actions">
        <button 
          disabled={!isChecked}
          onClick={() => onConsent(true)}
        >
          Provide Consent
        </button>
        <button onClick={() => onConsent(false)}>
          Decline
        </button>
      </div>
    </div>
  );
}

export default MentalHealthProvider; 