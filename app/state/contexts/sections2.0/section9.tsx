/**
 * Section9 Context Provider - Citizenship of Your Parents
 *
 * React Context provider for SF-86 Section 9 (Citizenship of Your Parents) with
 * SF86FormContext integration and optimized defensive check logic.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode
} from 'react';
import { cloneDeep } from 'lodash';
import type {
  Section9,
  BornInUSInfo,
  NaturalizedCitizenInfo,
  DerivedCitizenInfo,
  NonUSCitizenInfo
} from '../../../../api/interfaces/sections2.0/section9';
import { createDefaultSection9 } from '../../../../api/interfaces/sections2.0/section9';
import type {
  ValidationResult,
  ValidationError,
  ChangeSet,
  BaseSectionContext
} from '../shared/base-interfaces';
import { useSection86FormIntegration } from '../shared/section-context-integration';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

export interface Section9ContextType {
  // State
  section9Data: Section9;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateCitizenshipStatus: (status: Section9['section9']['status']['value']) => void;
  updateFieldValue: (fieldPath: string, newValue: any) => void;
  updateBornToUSParentsInfo: (field: keyof BornInUSInfo, value: any) => void;
  updateNaturalizedInfo: (field: keyof NaturalizedCitizenInfo, value: any) => void;
  updateDerivedInfo: (field: keyof DerivedCitizenInfo, value: any) => void;
  updateNonUSCitizenInfo: (field: keyof NonUSCitizenInfo, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section9) => void;
  getChanges: () => ChangeSet;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

// Use the DRY createDefaultSection9 from the interface
// This eliminates hardcoded values and uses sections-references as single source of truth

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section9Context = createContext<Section9ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section9ProviderProps {
  children: React.ReactNode;
}

export const Section9Provider: React.FC<Section9ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section9Data, setSection9Data] = useState<Section9>(createDefaultSection9());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section9>(createDefaultSection9());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = useMemo(() => {
    return JSON.stringify(section9Data) !== JSON.stringify(initialData);
  }, [section9Data, initialData]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Basic validation based on citizenship status
    const status = section9Data.section9.status.value;

    if (status === "I am a U.S. citizen or national by birth, born to U.S. parent(s), in a foreign country. (Complete 9.1) ") {
      // Validate born to US parents info
      const bornInfo = section9Data.section9.bornToUSParents;
      if (bornInfo && !bornInfo.documentNumber.value.trim()) {
        validationErrors.push({
          field: 'documentNumber',
          message: 'Document number is required for birth to US parents',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    } else if (status === "I am a naturalized U.S. citizen. (Complete 9.2) ") {
      // Validate naturalized citizen info
      const natInfo = section9Data.section9.naturalizedCitizen;
      if (natInfo && !natInfo.naturalizedCertificateNumber.value.trim()) {
        validationErrors.push({
          field: 'naturalizedCertificateNumber',
          message: 'Certificate number is required for naturalized citizens',
          code: 'VALIDATION_ERROR',
          severity: 'error'
        });
      }
    }

    // Update local errors
    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    setErrors(newErrors);

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section9Data]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateCitizenshipStatus = useCallback((status: Section9['section9']['status']['value']) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      newData.section9.status.value = status;
      return newData;
    });
  }, []);

  const updateBornToUSParentsInfo = useCallback((field: keyof BornInUSInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section9.bornToUSParents) {
        (newData.section9.bornToUSParents[field] as any).value = value;
      }
      return newData;
    });
  }, []);

  const updateNaturalizedInfo = useCallback((field: keyof NaturalizedCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section9.naturalizedCitizen) {
        (newData.section9.naturalizedCitizen[field] as any).value = value;
      }
      return newData;
    });
  }, []);

  const updateDerivedInfo = useCallback((field: keyof DerivedCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section9.derivedCitizen) {
        (newData.section9.derivedCitizen[field] as any).value = value;
      }
      return newData;
    });
  }, []);

  const updateNonUSCitizenInfo = useCallback((field: keyof NonUSCitizenInfo, value: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section9.nonUSCitizen) {
        (newData.section9.nonUSCitizen[field] as any).value = value;
      }
      return newData;
    });
  }, []);

  const updateFieldValue = useCallback((fieldPath: string, newValue: any) => {
    setSection9Data(prevData => {
      const newData = cloneDeep(prevData);
      const pathParts = fieldPath.split('.');
      let current: any = newData;

      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      const lastKey = pathParts[pathParts.length - 1];
      if (current[lastKey] && typeof current[lastKey] === 'object' && 'value' in current[lastKey]) {
        current[lastKey].value = newValue;
      } else {
        current[lastKey] = newValue;
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createDefaultSection9();
    setSection9Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section9) => {
    setSection9Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section9Data) !== JSON.stringify(initialData)) {
      changes['section9'] = {
        oldValue: initialData,
        newValue: section9Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section9Data, initialData]);

  // ============================================================================
  // FIELD FLATTENING FOR PDF GENERATION
  // ============================================================================

  /**
   * Flatten Section9 data structure into Field objects for PDF generation
   * This converts the nested Section9 structure into a flat object with Field<T> objects
   * Following the Section 29 pattern for consistency
   */
  const flattenSection9Fields = useCallback((): Record<string, any> => {
    const flatFields: Record<string, any> = {};

    const addField = (field: any, _path: string) => {
      if (
        field &&
        typeof field === "object" &&
        "id" in field &&
        "value" in field
      ) {
        flatFields[field.id] = field;
      }
    };

    // Flatten section9 citizenship information fields
    if (section9Data.section9) {
      // Main citizenship status
      addField(section9Data.section9.status, 'section9.status');

      // Born to US Parents subsection (9.1)
      if (section9Data.section9.bornToUSParents) {
        const bornInfo = section9Data.section9.bornToUSParents;
        addField(bornInfo.documentType, 'section9.bornToUSParents.documentType');
        if (bornInfo.otherExplanation) addField(bornInfo.otherExplanation, 'section9.bornToUSParents.otherExplanation');
        addField(bornInfo.documentNumber, 'section9.bornToUSParents.documentNumber');
        addField(bornInfo.documentIssueDate, 'section9.bornToUSParents.documentIssueDate');
        addField(bornInfo.isIssueDateEstimated, 'section9.bornToUSParents.isIssueDateEstimated');
        addField(bornInfo.issueCity, 'section9.bornToUSParents.issueCity');
        if (bornInfo.issueState) addField(bornInfo.issueState, 'section9.bornToUSParents.issueState');
        if (bornInfo.issueCountry) addField(bornInfo.issueCountry, 'section9.bornToUSParents.issueCountry');

        // Name on document
        if (bornInfo.nameOnDocument) {
          addField(bornInfo.nameOnDocument.lastName, 'section9.bornToUSParents.nameOnDocument.lastName');
          addField(bornInfo.nameOnDocument.firstName, 'section9.bornToUSParents.nameOnDocument.firstName');
          if (bornInfo.nameOnDocument.middleName) addField(bornInfo.nameOnDocument.middleName, 'section9.bornToUSParents.nameOnDocument.middleName');
          if (bornInfo.nameOnDocument.suffix) addField(bornInfo.nameOnDocument.suffix, 'section9.bornToUSParents.nameOnDocument.suffix');
        }

        addField(bornInfo.wasBornOnMilitaryInstallation, 'section9.bornToUSParents.wasBornOnMilitaryInstallation');
        if (bornInfo.militaryBaseName) addField(bornInfo.militaryBaseName, 'section9.bornToUSParents.militaryBaseName');
      }

      // Naturalized Citizen subsection (9.2)
      if (section9Data.section9.naturalizedCitizen) {
        const natInfo = section9Data.section9.naturalizedCitizen;
        addField(natInfo.naturalizedCertificateNumber, 'section9.naturalizedCitizen.naturalizedCertificateNumber');

        // Name on certificate
        if (natInfo.nameOnCertificate) {
          addField(natInfo.nameOnCertificate.lastName, 'section9.naturalizedCitizen.nameOnCertificate.lastName');
          addField(natInfo.nameOnCertificate.firstName, 'section9.naturalizedCitizen.nameOnCertificate.firstName');
          if (natInfo.nameOnCertificate.middleName) addField(natInfo.nameOnCertificate.middleName, 'section9.naturalizedCitizen.nameOnCertificate.middleName');
          if (natInfo.nameOnCertificate.suffix) addField(natInfo.nameOnCertificate.suffix, 'section9.naturalizedCitizen.nameOnCertificate.suffix');
        }

        // Court address
        if (natInfo.courtAddress) {
          addField(natInfo.courtAddress.street, 'section9.naturalizedCitizen.courtAddress.street');
          addField(natInfo.courtAddress.city, 'section9.naturalizedCitizen.courtAddress.city');
          if (natInfo.courtAddress.state) addField(natInfo.courtAddress.state, 'section9.naturalizedCitizen.courtAddress.state');
          if (natInfo.courtAddress.zipCode) addField(natInfo.courtAddress.zipCode, 'section9.naturalizedCitizen.courtAddress.zipCode');
        }

        addField(natInfo.certificateIssueDate, 'section9.naturalizedCitizen.certificateIssueDate');
        addField(natInfo.isCertificateDateEstimated, 'section9.naturalizedCitizen.isCertificateDateEstimated');
        if (natInfo.otherExplanation) addField(natInfo.otherExplanation, 'section9.naturalizedCitizen.otherExplanation');
      }

      // Derived Citizen subsection (9.3)
      if (section9Data.section9.derivedCitizen) {
        const derivedInfo = section9Data.section9.derivedCitizen;
        if (derivedInfo.alienRegistrationNumber) addField(derivedInfo.alienRegistrationNumber, 'section9.derivedCitizen.alienRegistrationNumber');
        if (derivedInfo.permanentResidentCardNumber) addField(derivedInfo.permanentResidentCardNumber, 'section9.derivedCitizen.permanentResidentCardNumber');
        if (derivedInfo.certificateOfCitizenshipNumber) addField(derivedInfo.certificateOfCitizenshipNumber, 'section9.derivedCitizen.certificateOfCitizenshipNumber');

        // Name on document
        if (derivedInfo.nameOnDocument) {
          addField(derivedInfo.nameOnDocument.lastName, 'section9.derivedCitizen.nameOnDocument.lastName');
          addField(derivedInfo.nameOnDocument.firstName, 'section9.derivedCitizen.nameOnDocument.firstName');
          if (derivedInfo.nameOnDocument.middleName) addField(derivedInfo.nameOnDocument.middleName, 'section9.derivedCitizen.nameOnDocument.middleName');
          if (derivedInfo.nameOnDocument.suffix) addField(derivedInfo.nameOnDocument.suffix, 'section9.derivedCitizen.nameOnDocument.suffix');
        }

        addField(derivedInfo.basis, 'section9.derivedCitizen.basis');
        if (derivedInfo.otherExplanation) addField(derivedInfo.otherExplanation, 'section9.derivedCitizen.otherExplanation');
      }

      // Non-US Citizen subsection (9.4)
      if (section9Data.section9.nonUSCitizen) {
        const nonUSInfo = section9Data.section9.nonUSCitizen;
        addField(nonUSInfo.entryDate, 'section9.nonUSCitizen.entryDate');
        addField(nonUSInfo.isEntryDateEstimated, 'section9.nonUSCitizen.isEntryDateEstimated');

        // Entry location
        if (nonUSInfo.entryLocation) {
          addField(nonUSInfo.entryLocation.city, 'section9.nonUSCitizen.entryLocation.city');
          if (nonUSInfo.entryLocation.state) addField(nonUSInfo.entryLocation.state, 'section9.nonUSCitizen.entryLocation.state');
        }

        // Country of citizenship
        if (nonUSInfo.countryOfCitizenship) {
          addField(nonUSInfo.countryOfCitizenship.country1, 'section9.nonUSCitizen.countryOfCitizenship.country1');
          if (nonUSInfo.countryOfCitizenship.country2) addField(nonUSInfo.countryOfCitizenship.country2, 'section9.nonUSCitizen.countryOfCitizenship.country2');
        }

        addField(nonUSInfo.hasAlienRegistration, 'section9.nonUSCitizen.hasAlienRegistration');
        if (nonUSInfo.alienRegistrationNumber) addField(nonUSInfo.alienRegistrationNumber, 'section9.nonUSCitizen.alienRegistrationNumber');
        if (nonUSInfo.alienRegistrationExpiration) addField(nonUSInfo.alienRegistrationExpiration, 'section9.nonUSCitizen.alienRegistrationExpiration');
        if (nonUSInfo.isAlienExpDateEstimated) addField(nonUSInfo.isAlienExpDateEstimated, 'section9.nonUSCitizen.isAlienExpDateEstimated');
        if (nonUSInfo.visaType) addField(nonUSInfo.visaType, 'section9.nonUSCitizen.visaType');
        if (nonUSInfo.visaNumber) addField(nonUSInfo.visaNumber, 'section9.nonUSCitizen.visaNumber');
        if (nonUSInfo.visaIssueDate) addField(nonUSInfo.visaIssueDate, 'section9.nonUSCitizen.visaIssueDate');
        if (nonUSInfo.isVisaIssueDateEstimated) addField(nonUSInfo.isVisaIssueDateEstimated, 'section9.nonUSCitizen.isVisaIssueDateEstimated');
        if (nonUSInfo.location) addField(nonUSInfo.location, 'section9.nonUSCitizen.location');
        if (nonUSInfo.i94Number) addField(nonUSInfo.i94Number, 'section9.nonUSCitizen.i94Number');
      }
    }

    return flatFields;
  }, [section9Data]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================

  // Create BaseSectionContext for integration
  const contextId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const baseSectionContext: BaseSectionContext = useMemo(() => ({
    sectionId: 'section9',
    sectionName: 'Section 9: Citizenship of Your Parents',
    sectionData: section9Data, // Use structured data format (preferred)
    isLoading,
    errors: Object.values(errors).map(msg => ({ field: 'general', message: msg, code: 'ERROR', severity: 'error' as const })),
    isDirty,
    lastUpdated: new Date(),
    updateFieldValue,
    validateSection,
    resetSection,
    loadSection,
    getChanges
  }), [section9Data, isLoading, errors, isDirty, updateFieldValue, validateSection, resetSection, loadSection, getChanges]);

  // Integration with main form context
  const integration = useSection86FormIntegration(
    'section9',
    'Section 9: Citizenship of Your Parents',
    section9Data,
    setSection9Data,
    validateSection,
    getChanges
    // Removed flattenFields parameter to use structured format (preferred)
  );



  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section9ContextType = {
    // State
    section9Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateCitizenshipStatus,
    updateFieldValue,
    updateBornToUSParentsInfo,
    updateNaturalizedInfo,
    updateDerivedInfo,
    updateNonUSCitizenInfo,

    // Validation
    validateSection,

    // Utility
    resetSection,
    loadSection,
    getChanges,
  };

  return (
    <Section9Context.Provider value={contextValue}>
      {children}
    </Section9Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection9 = (): Section9ContextType => {
  const context = useContext(Section9Context);
  if (!context) {
    throw new Error('useSection9 must be used within a Section9Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section9Provider;
