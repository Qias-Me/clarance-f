/**
 * Section 13: Employment Activities - Context Provider
 *
 * React context provider for SF-86 Section 13 using the new Form Architecture 2.0.
 * This provider manages employment history data with full CRUD operations,
 * validation, and integration with the central SF86FormContext.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import get from 'lodash/get';
import type {
  Section13,
  Section13ValidationRules,
  Section13FieldUpdate,
  MilitaryEmploymentEntry,
  NonFederalEmploymentEntry,
  SelfEmploymentEntry,
  UnemploymentEntry,
  EmploymentEntry,
  FederalEmploymentInfo,
  EmploymentType,
  EmploymentStatus
} from '../../../../api/interfaces/sections2.0/section13';
// Import helper functions for field creation
import { createFieldFromReference } from '../../../../api/utils/sections-references-loader';
import { mapLogicalFieldToPdfField } from './section13-field-mapping';

import type { ValidationResult, ValidationError, ChangeSet } from '../shared/base-interfaces';
import { useSF86Form } from './SF86FormContext';
import {
  mapPdfFieldToUiPath,
  mapUiPathToPdfField,
  isValidFieldMapping,
  getFieldMetadata,
  generateDynamicFieldMapping,
  getCachedFieldMapping,
  type FieldMapping,
  type FieldMetadata
} from './section13-field-mapping';

import {
  initializeEnhancedIntegration,
  getEnhancedFieldMapping,
  validateImplementationCoverage,
  getEmploymentTypeStatistics
} from './section13-enhanced-integration';

import { createFieldFromReference, validateSectionFieldCount } from '../../../../api/utils/sections-references-loader';
import { 
  TOTAL_SECTION_13_FIELDS,
  FIELD_COUNTS_BY_TYPE,
  MAX_EMPLOYMENT_ENTRIES,
  MIN_EMPLOYMENT_DURATION_MONTHS,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS
} from '~/constants/section13-constants';


// ============================================================================
// MOVED FROM INTERFACE - DEFAULT CREATORS AND VALIDATORS
// ============================================================================

export const createDefaultMilitaryEmploymentEntry = (entryId: string | number): MilitaryEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.1Entry1FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[32]', // Maps to sect13A.1Entry1FromEstimated
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.1Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[36]', // Maps to sect13A.1Entry1ToEstimated
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[37]', // Maps to sect13A.1Entry1Present
        false
      )
    },
    employmentStatus: {
      ...createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p13a-1-1cb[0]', // Maps to sect13A.1Entry1EmploymentStatus
        'Full-time' as EmploymentStatus
      ),
      options: EMPLOYMENT_STATUS_OPTIONS
    },
    rankTitle: createFieldFromReference(
      13,
      'form1[0].section_13_1-2[0].p3-t68[3]', // Maps to sect13A.1Entry1RankTitle
      ''
    ),
    dutyStation: {
      dutyStation: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[4]', // Maps to sect13A.1Entry1DutyStation
        ''
      ),
      street: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[9]', // Maps to sect13A.1Entry1DutyStreet
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[10]', // Maps to sect13A.1Entry1DutyCity
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].School6_State[2]', // Maps to sect13A.1Entry1State
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[11]', // Maps to sect13A.1Entry1DutyZip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].DropDownList20[0]', // Maps to sect13A.1Entry1Country
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[1]', // Maps to sect13A.1Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[12]', // Maps to sect13A.1Entry1Extension1
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    supervisor: {
      name: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[0]', // Maps to sect13A.1Entry1SupervisorName
        ''
      ),
      title: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[1]', // Maps to sect13A.1Entry1SupervisorRank
        ''
      ),
      email: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].p3-t68[2]', // Maps to sect13A.1Entry1SupervisorEmail
        ''
      ),
      emailUnknown: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[30]', // Maps to email unknown checkbox
        false
      ),
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].p3-t68[0]', // Maps to sect13A.1Entry1SupervisorPhone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[2]', // Maps to supervisor phone extension
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[17]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[16]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].#field[15]', // Maps to Night checkbox
          false
        )
      },
      workLocation: {
        street: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[3]', // Maps to sect13A.1Entry1SupervisorAddress
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[4]', // Maps to sect13A.1Entry1SupervisorCity
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section_13_1-2[0].School6_State[0]', // Maps to sect13A.1Entry1State
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[5]', // Maps to sect13A.1Entry1Superviso (zip)
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section_13_1-2[0].DropDownList18[0]', // Maps to supervisor country
            ''
          ),
          options: []
        }
      },
      hasApoFpo: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[17]', // Maps to APO/FPO indicator
        false
      ),
      apoFpoAddress: {
        apoFpo: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[17]', // Maps to sect13A.1Entry1_b_APO
          ''
        ),
        street: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[16]', // Maps to sect13A.1Entry1_b_Street
          ''
        ),
        zipCode: createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].TextField11[18]', // Maps to sect13A.1Entry1_b_Zip
          ''
        )
      },
      canContact: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].#field[30]', // Maps to can contact checkbox
        "YES" as "YES" | "NO"
      ),
      contactRestrictions: createFieldFromReference(
        13,
        'form1[0].section_13_1-2[0].TextField11[13]', // Maps to contact restrictions
        ''
      )
    },
    otherExplanation: createFieldFromReference(
      13,
      'form1[0].section_13_1-2[0].TextField11[13]', // Maps to sect13A.1Entry1OtherExplanation
      ''
    ),
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const createDefaultNonFederalEmploymentEntry = (entryId: string | number): NonFederalEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.2Entry1FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.2Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    employmentStatus: {
      ...createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].RadioButtonList[1]', // Maps to employment status
        'Full-time' as EmploymentStatus
      ),
      options: EMPLOYMENT_STATUS_OPTIONS
    },
    employerName: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].TextField11[0]', // Maps to sect13A.2Entry1RecentEmployer
      ''
    ),
    positionTitle: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].TextField11[1]', // Maps to sect13A.2Entry1RecentTitle
      ''
    ),
    employerAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[2]', // Maps to sect13A.2Entry1Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[3]', // Maps to sect13A.2Entry1City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].School6_State[0]', // Maps to state dropdown
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[4]', // Maps to sect13A.2Entry1Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].DropDownList18[0]', // Maps to country dropdown
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].p3-t68[0]', // Maps to sect13A.2Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[8]', // Maps to sect13A.2Entry1Extension1
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    hasAdditionalPeriods: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].RadioButtonList[2]', // Maps to additional periods question
      false
    ),
    additionalPeriods: [], // Will be populated dynamically
    hasPhysicalWorkAddress: createFieldFromReference(
      13,
      'form1[0].section13_2-2[0].RadioButtonList[3]', // Maps to physical work address question
      false
    ),
    supervisor: {
      name: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[9]', // Maps to sect13A.2Entry1_SupervisorName
        ''
      ),
      title: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[10]', // Maps to supervisor title
        ''
      ),
      email: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].p3-t68[2]', // Maps to supervisor email
        ''
      ),
      emailUnknown: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[30]', // Maps to email unknown checkbox
        false
      ),
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].p3-t68[1]', // Maps to supervisor phone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[11]', // Maps to supervisor extension
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[17]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[16]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].#field[15]', // Maps to Night checkbox
          false
        )
      },
      workLocation: {
        street: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[12]', // Maps to supervisor work address
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[13]', // Maps to supervisor city
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_2-2[0].School6_State[1]', // Maps to supervisor state
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section13_2-2[0].TextField11[14]', // Maps to supervisor zip
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_2-2[0].DropDownList19[0]', // Maps to supervisor country
            ''
          ),
          options: []
        }
      },
      hasApoFpo: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].RadioButtonList[4]', // Maps to APO/FPO question
        false
      ),
      canContact: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].#field[30]', // Maps to can contact checkbox
        "YES" as "YES" | "NO"
      ),
      contactRestrictions: createFieldFromReference(
        13,
        'form1[0].section13_2-2[0].TextField11[15]', // Maps to contact restrictions
        ''
      )
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const createDefaultSelfEmploymentEntry = (entryId: string | number): SelfEmploymentEntry => {
  return {
    _id: entryId,
    employmentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].From_Datefield_Name_2[1]', // Maps to sect13A.3Entry1Start
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].From_Datefield_Name_2[0]', // Maps to sect13A.3Entry1ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    businessName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].p3-t68[3]', // Maps to sect13A.3Entry1Employment
      ''
    ),
    businessType: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[0]', // Maps to business type
      ''
    ),
    positionTitle: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].p3-t68[4]', // Maps to sect13A.3Entry1PositionTitle
      ''
    ),
    businessAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[9]', // Maps to sect13A.3Entry1Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[10]', // Maps to sect13A.3Entry1City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].School6_State[0]', // Maps to state dropdown
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[11]', // Maps to sect13A.3Entry1Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].DropDownList18[0]', // Maps to country dropdown
          ''
        ),
        options: []
      }
    },
    phone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].p3-t68[1]', // Maps to sect13A.3Entry1Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[12]', // Maps to sect13A.3Entry1Ext
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[26]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[27]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[28]', // Maps to Night checkbox
        false
      )
    },
    verifierFirstName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[1]', // Maps to sect13A.3Entry1_FName
      ''
    ),
    verifierLastName: createFieldFromReference(
      13,
      'form1[0].section13_3-2[0].TextField11[2]', // Maps to sect13A.3Entry1_LName
      ''
    ),
    verifierAddress: {
      street: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[3]', // Maps to sect13A.3Entry1_Street
        ''
      ),
      city: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[4]', // Maps to sect13A.3Entry1_City
        ''
      ),
      state: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].School6_State[1]', // Maps to verifier state
          ''
        ),
        options: []
      },
      zipCode: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[5]', // Maps to sect13A.3Entry1_Zip
        ''
      ),
      country: {
        ...createFieldFromReference(
          13,
          'form1[0].section13_3-2[0].DropDownList19[0]', // Maps to verifier country
          ''
        ),
        options: []
      }
    },
    verifierPhone: {
      number: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].p3-t68[2]', // Maps to sect13A.3Entry1_a_Phone
        ''
      ),
      extension: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].TextField11[6]', // Maps to sect13A.3Entry1_a_ext
        ''
      ),
      isDSN: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[17]', // Maps to DSN checkbox
        false
      ),
      isDay: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[16]', // Maps to Day checkbox
        false
      ),
      isNight: createFieldFromReference(
        13,
        'form1[0].section13_3-2[0].#field[15]', // Maps to Night checkbox
        false
      )
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const createDefaultUnemploymentEntry = (entryId: string | number): UnemploymentEntry => {
  return {
    _id: entryId,
    unemploymentDates: {
      fromDate: createFieldFromReference(
        13,
        'form1[0].section13_4[0].From_Datefield_Name_2[1]', // Maps to sect13A.4Entry1_FromDate
        ''
      ),
      fromEstimated: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[32]', // Maps to estimated checkbox
        false
      ),
      toDate: createFieldFromReference(
        13,
        'form1[0].section13_4[0].From_Datefield_Name_2[0]', // Maps to sect13A.4Entry1_ToDate
        ''
      ),
      toEstimated: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[36]', // Maps to estimated checkbox
        false
      ),
      present: createFieldFromReference(
        13,
        'form1[0].section13_4[0].#field[37]', // Maps to present checkbox
        false
      )
    },
    reference: {
      firstName: createFieldFromReference(
        13,
        'form1[0].section13_4[0].TextField11[1]', // Maps to sect13A.4Entry1_FName
        ''
      ),
      lastName: createFieldFromReference(
        13,
        'form1[0].section13_4[0].TextField11[0]', // Maps to sect13A.4Entry1_LName
        ''
      ),
      address: {
        street: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[2]', // Maps to sect13A.4Entry1_Street
          ''
        ),
        city: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[3]', // Maps to sect13A.4Entry1_City
          ''
        ),
        state: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_4[0].School6_State[0]', // Maps to state dropdown
            ''
          ),
          options: []
        },
        zipCode: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[4]', // Maps to sect13A.4Entry1_Zip
          ''
        ),
        country: {
          ...createFieldFromReference(
            13,
            'form1[0].section13_4[0].DropDownList18[0]', // Maps to country dropdown
            ''
          ),
          options: []
        }
      },
      phone: {
        number: createFieldFromReference(
          13,
          'form1[0].section13_4[0].p3-t68[0]', // Maps to sect13A.4Entry1_Phone
          ''
        ),
        extension: createFieldFromReference(
          13,
          'form1[0].section13_4[0].TextField11[5]', // Maps to sect13A.4Entry1_Ext
          ''
        ),
        isDSN: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[26]', // Maps to DSN checkbox
          false
        ),
        isDay: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[27]', // Maps to Day checkbox
          false
        ),
        isNight: createFieldFromReference(
          13,
          'form1[0].section13_4[0].#field[28]', // Maps to Night checkbox
          false
        )
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const createDefaultFederalEmploymentInfo = (): FederalEmploymentInfo => ({
  // Canonical mapping JSON only contains these two fields
  clearanceLevel: createFieldFromReference(13, 'form1[0].section13_5[0].TextField11[3]', ''),
  clearanceDate: createFieldFromReference(13, 'form1[0].section13_5[0].From_Datefield_Name_2[2]', ''),
  // Initialize other fields as empty Field<T> for UI (no PDF mapping)
  hasFederalEmployment: createFieldFromReference(13, 'form1[0].section13_5[0].#unmapped', 'NO' as 'YES' | 'NO'),
  securityClearance: createFieldFromReference(13, 'form1[0].section13_5[0].#unmapped2', 'NO' as 'YES' | 'NO'),
  investigationDate: createFieldFromReference(13, 'form1[0].section13_5[0].#unmapped3', ''),
  polygraphDate: createFieldFromReference(13, 'form1[0].section13_5[0].#unmapped4', ''),
  accessToClassified: createFieldFromReference(13, 'form1[0].section13_5[0].#unmapped5', 'NO' as 'YES' | 'NO'),
  classificationLevel: createFieldFromReference(13, 'form1[0].section13_5[0].TextField11[4]', ''),
});

export const createDefaultSection13 = (includeInitialEntry: boolean = false): Section13 => {
  // Validate field count against sections-references
  validateSectionFieldCount(13);

  const defaultSection: Section13 = {
    _id: 13,
    section13: {
      // Employment type selection
      employmentType: {
        ...createFieldFromReference(
          13,
          'form1[0].section_13_1-2[0].RadioButtonList[0]', // Maps to employment type radio group
          'Other' as EmploymentType
        ),
        options: EMPLOYMENT_TYPE_OPTIONS
      },

      // Subsection structures
      militaryEmployment: {
        entries: [] as MilitaryEmploymentEntry[]
      },
      nonFederalEmployment: {
        entries: [] as NonFederalEmploymentEntry[]
      },
      selfEmployment: {
        entries: [] as SelfEmploymentEntry[]
      },
      unemployment: {
        entries: [] as UnemploymentEntry[]
      },

      // Generic entries (for backward compatibility)
      entries: [] as EmploymentEntry[],

      // Employment record issues (Section 13A.5)
      employmentRecordIssues: {
        wasFired: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[0]', // Maps to fired question
          false
        ),
        quitAfterBeingTold: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[1]', // Maps to quit question
          false
        ),
        leftByMutualAgreement: createFieldFromReference(
          13,
          'form1[0].section13_4[0].RadioButtonList[2]', // Maps to mutual agreement question
          false
        )
      },

      // Disciplinary actions (Section 13A.6)
      disciplinaryActions: {
        warningDates: [],
      },

      // Federal employment information
      federalInfo: createDefaultFederalEmploymentInfo(),

    }
  };

  // Add initial entries if requested for all employment types
  if (includeInitialEntry) {
    // Add initial entries for all employment types to support the 1086 field mappings
    defaultSection.section13.militaryEmployment.entries.push(
      createDefaultMilitaryEmploymentEntry(Date.now())
    );
    
    defaultSection.section13.nonFederalEmployment.entries.push(
      createDefaultNonFederalEmploymentEntry(Date.now() + 1)
    );
    
    defaultSection.section13.selfEmployment.entries.push(
      createDefaultSelfEmploymentEntry(Date.now() + 2)
    );
    
    defaultSection.section13.unemployment.entries.push(
      createDefaultUnemploymentEntry(Date.now() + 3)
    );
  }

  return defaultSection;
};

export const validateEmploymentDates = (
  dateRange: EmploymentDateRange,
  context: Section13ValidationContext
): EmploymentValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if from date is provided
  if (!dateRange.fromDate.value) {
    errors.push("Employment start date is required");
  }

  // Check if to date is provided when not currently employed
  if (!dateRange.present.value && !dateRange.toDate.value) {
    errors.push("Employment end date is required when not currently employed");
  }

  // Validate date format and logic
  if (dateRange.fromDate.value && dateRange.toDate.value) {
    const fromDate = new Date(dateRange.fromDate.value);
    const toDate = new Date(dateRange.toDate.value);
    
    if (fromDate > toDate) {
      errors.push("Employment start date cannot be after end date");
    }
    
    if (toDate > context.currentDate) {
      warnings.push("Employment end date is in the future");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const formatEmploymentDate = (date: string, format: 'MM/YYYY' | 'MM/DD/YYYY' = 'MM/YYYY'): string => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (format === 'MM/YYYY') {
      return dateObj.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
    } else {
      return dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
  } catch {
    return date;
  }
};

export const calculateEmploymentDuration = (fromDate: string, toDate: string): number => {
  if (!fromDate || !toDate) return 0;

  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
    return diffMonths;
  } catch {
    return 0;
  }
};


import {
  initializeAllSection13Fields,
  getRequiredEntryIndices,
  ensurePathExists,
  validateFieldCoverage
} from '../../../utils/section13-field-initializer';

/**
 * Helper function to create a field using the logical path mapping system
 */
function createMappedField<T>(logicalPath: string, defaultValue: T): any {
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  // Removed logging from here to prevent infinite loops
  // Logging should be done in useEffect or event handlers only

  try {
    return createFieldFromReference(13, pdfFieldName, defaultValue);
  } catch (error) {
    // Silent fallback to prevent console spam
    return {
      name: pdfFieldName,
      id: pdfFieldName,
      type: 'text',
      label: logicalPath,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };
  }
}

/**
 * Helper function to create a mapped field with entry indexing support
 * Automatically generates the correct logical path for employment entries
 */
function createMappedFieldForEntry<T>(employmentType: string, entryIndex: number, fieldPath: string, defaultValue: T): any {
  const logicalPath = `section13.${employmentType}.entries[${entryIndex}].${fieldPath}`;
  const pdfFieldName = mapLogicalFieldToPdfField(logicalPath);
  // Removed logging from here to prevent infinite loops
  // Logging should be done in useEffect or event handlers only

  try {
    return createFieldFromReference(13, pdfFieldName, defaultValue);
  } catch (error) {
    // Silent fallback to prevent console spam
    return {
      name: pdfFieldName,
      id: pdfFieldName,
      type: 'text',
      label: logicalPath,
      value: defaultValue,
      rect: { x: 0, y: 0, width: 0, height: 0 }
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS (Moved from Interface Layer)
// ============================================================================

/**
 * Creates a default military employment entry (Section 13A.1)
 * Maps to the correct PDF field names from section-13.json
 */
export const createDefaultMilitaryEmploymentEntry = (entryId: string | number): MilitaryEmploymentEntry => {
  return {
    _id: entryId,

    // Basic Employment Information - CORRECTED FIELD MAPPINGS
    employerName: createMappedField('employerName', ''),
    positionTitle: createMappedField('positionTitle', ''),

    // Supervisor Information - CORRECTED FIELD MAPPINGS
    supervisor: {
      name: createMappedField('supervisor.name', ''),
      title: createMappedField('supervisor.title', ''),
      email: createMappedField('supervisor.email', ''),
      emailUnknown: createMappedField('supervisor.emailUnknown', false),
      phone: {
        number: createMappedField('supervisor.phone.number', ''),
        extension: createMappedField('supervisor.phone.extension', ''),
        isDSN: createMappedField('supervisor.phone.isDSN', false),
        isDay: createMappedField('supervisor.phone.isDay', false),
        isNight: createMappedField('supervisor.phone.isNight', false)
      },
      workLocation: {
        street: createMappedField('supervisor.workLocation.street', ''),
        city: createMappedField('supervisor.workLocation.city', ''),
        state: createMappedField('supervisor.workLocation.state', ''),
        zipCode: createMappedField('supervisor.workLocation.zipCode', ''),
        country: createMappedField('supervisor.workLocation.country', 'United States')
      },
      hasApoFpo: createMappedField('supervisor.hasApoFpo', false),
      canContact: createMappedField('supervisor.canContact', 'YES' as "YES" | "NO"),
      contactRestrictions: createMappedField('supervisor.contactRestrictions', '')
    },



    // Employment Dates - CORRECTED FIELD MAPPINGS
    employmentDates: {
      fromDate: createMappedField('employmentDates.fromDate', ''),
      toDate: createMappedField('employmentDates.toDate', ''),
      fromEstimated: createMappedField('employmentDates.fromEstimated', false),
      toEstimated: createMappedField('employmentDates.toEstimated', false),
      present: createMappedField('employmentDates.present', false)
    },

    employmentStatus: {
      ...createMappedField('employmentStatus', 'Full-time' as EmploymentStatus),
      options: ['Full-time', 'Part-time'] as const
    },

    rankTitle: createMappedField('rankTitle', ''),
    dutyStation: {
      dutyStation: createMappedField('dutyStation.dutyStation', ''),
      street: createMappedField('dutyStation.street', ''),
      city: createMappedField('dutyStation.city', ''),
      state: {
        ...createMappedField('dutyStation.state', ''),
        options: []
      },
      zipCode: createMappedField('dutyStation.zipCode', ''),
      country: {
        ...createMappedField('dutyStation.country', ''),
        options: []
      }
    },

    phone: {
      number: createMappedField('phone.number', ''),
      extension: createMappedField('phone.extension', ''),
      isDSN: createMappedField('phone.isDSN', false),
      isDay: createMappedField('phone.isDay', false),
      isNight: createMappedField('phone.isNight', false)
    },

    otherExplanation: createMappedField('otherExplanation', '')
  };
};

/**
 * Creates a default non-federal employment entry (Section 13A.2)
 */
export const createDefaultNonFederalEmploymentEntry = (entryId: string | number): NonFederalEmploymentEntry => {
  return {
    _id: entryId,

    // Basic Employment Information - NOW USING MAPPED FIELDS (canonical uiPaths)
    employerName: createMappedField('section13.nonFederalEmployment.entries[0].employerName', ''),
    positionTitle: createMappedField('section13.nonFederalEmployment.entries[0].positionTitle', ''),

    // Supervisor Information - NOW USING MAPPED FIELDS
    supervisor: {
      name: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.name', ''),
      title: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.title', ''),
      email: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.email', ''),
      emailUnknown: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.emailUnknown', false),
      phone: {
        number: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.phone.number', ''),
      },
      workLocation: {
        street: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.workLocation.street', ''),
      },
      canContact: createMappedField('section13.nonFederalEmployment.entries[0].supervisor.canContact', "YES" as "YES" | "NO"),
    },

    // Employer Address - NOW USING MAPPED FIELDS
    employerAddress: {
      street: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.street', ''),
      city: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.city', ''),
      state: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.state', ''),
      zipCode: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.zipCode', ''),
      country: createMappedField('section13.nonFederalEmployment.entries[0].employerAddress.country', '')
    },

    // Employment Dates - NOW USING MAPPED FIELDS
    employmentDates: {
      fromDate: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.fromDate', ''),
      toDate: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.toDate', ''),
      fromEstimated: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.fromEstimated', false),
      present: createMappedField('section13.nonFederalEmployment.entries[0].employmentDates.present', false)
    },

    employmentStatus: {
      ...createMappedField('section13.nonFederalEmployment.entries[0].employmentStatus', 'Full-time' as EmploymentStatus),
      options: ['Full-time', 'Part-time'] as const
    },

    phone: {
      number: createMappedField('section13.nonFederalEmployment.entries[0].phone.number', ''),
      extension: createMappedField('section13.nonFederalEmployment.entries[0].phone.extension', ''),
      isDay: createMappedField('section13.nonFederalEmployment.entries[0].phone.isDay', false),
      isNight: createMappedField('section13.nonFederalEmployment.entries[0].phone.isNight', false)
    },

    hasAdditionalPeriods: createMappedField('section13.nonFederalEmployment.entries[0].hasAdditionalPeriods', false),
    additionalPeriods: [],
    multipleEmploymentPeriods: {
      periods: []
    },
    hasPhysicalWorkAddress: createMappedField('section13.nonFederalEmployment.entries[0].hasPhysicalWorkAddress', false)
  };
};

/**
 * Creates a default self-employment entry (Section 13A.3)
 */
export const createDefaultSelfEmploymentEntry = (entryId: string | number): SelfEmploymentEntry => {
  return {
    _id: entryId,

    businessName: createFieldFromReference(13, 'sect13A.3Entry1Employment', ''),
    businessType: createFieldFromReference(13, 'sect13A.3Entry1BusinessType', ''),
    positionTitle: createFieldFromReference(13, 'sect13A.3Entry1PositionTitle', ''),

    businessAddress: {
      street: createFieldFromReference(13, 'sect13A.3Entry1Street', ''),
      city: createFieldFromReference(13, 'sect13A.3Entry1City', ''),
      state: {
        ...createFieldFromReference(13, 'sect13A.3Entry1State', ''),
        options: []
      },
      zipCode: createFieldFromReference(13, 'sect13A.3Entry1Zip', ''),
      country: {
        ...createFieldFromReference(13, 'sect13A.3Entry1Country', ''),
        options: []
      }
    },

    employmentDates: {
      fromDate: createFieldFromReference(13, 'sect13A.3Entry1FromDate', ''),
      toDate: createFieldFromReference(13, 'sect13A.3Entry1ToDate', ''),
      fromEstimated: createFieldFromReference(13, 'sect13A.3Entry1FromEstimated', false),
      toEstimated: createFieldFromReference(13, 'sect13A.3Entry1ToEstimated', false),
      present: createFieldFromReference(13, 'sect13A.3Entry1Present', false)
    },

    phone: {
      number: createFieldFromReference(13, 'sect13A.3Entry1Phone', ''),
      extension: createFieldFromReference(13, 'sect13A.3Entry1Ext', ''),
      isDSN: createFieldFromReference(13, 'sect13A.3Entry1DSN', false),
      isDay: createFieldFromReference(13, 'sect13A.3Entry1Day', false),
      isNight: createFieldFromReference(13, 'sect13A.3Entry1Night', false)
    },

    verifierFirstName: createFieldFromReference(13, 'sect13A.3Entry1_FName', ''),
    verifierLastName: createFieldFromReference(13, 'sect13A.3Entry1_LName', ''),

    verifierAddress: {
      street: createFieldFromReference(13, 'sect13A.3Entry1_Street', ''),
      city: createFieldFromReference(13, 'sect13A.3Entry1_City', ''),
      state: {
        ...createFieldFromReference(13, 'sect13A.3Entry1_State', ''),
        options: []
      },
      zipCode: createFieldFromReference(13, 'sect13A.3Entry1_Zip', ''),
      country: {
        ...createFieldFromReference(13, 'sect13A.3Entry1_Country', ''),
        options: []
      }
    },

    verifierPhone: {
      number: createFieldFromReference(13, 'sect13A.3Entry1_a_Phone', ''),
      extension: createFieldFromReference(13, 'sect13A.3Entry1_a_ext', ''),
      isDSN: createFieldFromReference(13, 'sect13A.3Entry1_DSN', false),
      isDay: createFieldFromReference(13, 'sect13A.3Entry1_Day', false),
      isNight: createFieldFromReference(13, 'sect13A.3Entry1_Night', false)
    }
  };
};

/**
 * Creates a default unemployment entry (Section 13A.4)
 */
export const createDefaultUnemploymentEntry = (entryId: string | number): UnemploymentEntry => {
  return {
    _id: entryId,

    unemploymentDates: {
      fromDate: createFieldFromReference(13, 'sect13A.4Entry1FromDate', ''),
      toDate: createFieldFromReference(13, 'sect13A.4Entry1ToDate', ''),
      fromEstimated: createFieldFromReference(13, 'sect13A.4Entry1FromEstimated', false),
      toEstimated: createFieldFromReference(13, 'sect13A.4Entry1ToEstimated', false),
      present: createFieldFromReference(13, 'sect13A.4Entry1Present', false)
    },

    reference: {
      firstName: createFieldFromReference(13, 'sect13A.4Entry1_FName', ''),
      lastName: createFieldFromReference(13, 'sect13A.4Entry1_LName', ''),
      address: {
        street: createFieldFromReference(13, 'sect13A.4Entry1_Street', ''),
        city: createFieldFromReference(13, 'sect13A.4Entry1_City', ''),
        state: {
          ...createFieldFromReference(13, 'sect13A.4Entry1_State', ''),
          options: []
        },
        zipCode: createFieldFromReference(13, 'sect13A.4Entry1_Zip', ''),
        country: {
          ...createFieldFromReference(13, 'sect13A.4Entry1_Country', ''),
          options: []
        }
      },
      phone: {
        number: createFieldFromReference(13, 'sect13A.4Entry1_Phone', ''),
        extension: createFieldFromReference(13, 'sect13A.4Entry1_Ext', ''),
        isDSN: createFieldFromReference(13, 'sect13A.4Entry1_DSN', false),
        isDay: createFieldFromReference(13, 'sect13A.4Entry1_Day', false),
        isNight: createFieldFromReference(13, 'sect13A.4Entry1_Night', false)
      }
    }
  };
};

/**
 * Creates default federal employment information - NOW USING MAPPED FIELDS
 */
export const createDefaultFederalEmploymentInfo = (): FederalEmploymentInfo => ({
  hasFederalEmployment: createMappedField('sect13A.5Entry1HasFederalEmployment', "NO" as "YES" | "NO"),
  securityClearance: createMappedField('sect13A.5Entry1SecurityClearance', "NO" as "YES" | "NO"),
  clearanceLevel: createMappedField('sect13A.5Entry1ClearanceLevel', ''),
  clearanceDate: createMappedField('sect13A.5Entry1ClearanceDate', ''),
  investigationDate: createMappedField('sect13A.5Entry1InvestigationDate', ''),
  polygraphDate: createMappedField('sect13A.5Entry1PolygraphDate', ''),
  accessToClassified: createMappedField('sect13A.5Entry1AccessToClassified', "NO" as "YES" | "NO"),
  classificationLevel: createMappedField('sect13A.5Entry1ClassificationLevel', '')
});

/**
 * Creates a default Section 13 data structure
 */
export const createDefaultSection13 = (includeInitialEntry: boolean = false): Section13 => {
  const defaultSection: Section13 = {
    _id: 13,
    section13: {
      // Main employment questions - NOW USING MAPPED FIELDS
      hasEmployment: createMappedField('sect13HasEmployment', "NO" as "YES" | "NO"),
      hasGaps: createMappedField('sect13HasGaps', "NO" as "YES" | "NO"),
      gapExplanation: createMappedField('sect13GapExplanation', ''),

      // Employment type selection - NOW USING MAPPED FIELDS
      employmentType: {
        ...createMappedField('sect13EmploymentType', 'Other' as EmploymentType),
        options: ['Military', 'Federal', 'Non-Federal', 'Self-Employment', 'Unemployment', 'Other'] as const
      },

      // Subsection structures
      militaryEmployment: {
        entries: [] as MilitaryEmploymentEntry[]
      },
      nonFederalEmployment: {
        entries: [] as NonFederalEmploymentEntry[]
      },
      selfEmployment: {
        entries: [] as SelfEmploymentEntry[]
      },
      unemployment: {
        entries: [] as UnemploymentEntry[]
      },

      // Generic entries (for backward compatibility)
      entries: [] as EmploymentEntry[],

      // Employment record issues (Section 13A.5) - NOW USING MAPPED FIELDS
      employmentRecordIssues: {
        wasFired: createMappedField('sect13A.5WasFired', false),
        quitAfterBeingTold: createMappedField('sect13A.5QuitAfterBeingTold', false),
        leftByMutualAgreement: createMappedField('sect13A.5LeftByMutualAgreement', false)
        // Note: hasChargesOrAllegations and hasUnsatisfactoryPerformance fields don't exist in the PDF
      },

      // Disciplinary actions (Section 13A.6) - NOW USING MAPPED FIELDS
      disciplinaryActions: {
        receivedWrittenWarning: createMappedField('sect13A.6ReceivedWrittenWarning', false),
        warningDates: [],
        warningReasons: []
      },

      // Federal employment information
      federalInfo: createDefaultFederalEmploymentInfo(),
    }
  };

  // Add initial entry if requested
  if (includeInitialEntry) {
    defaultSection.section13.militaryEmployment.entries.push(createDefaultMilitaryEmploymentEntry(Date.now()));
  }

  return defaultSection;
};

/**
 * Update Section 13 field values following the Field<T> interface pattern
 * Handle nested employment entries and complex data structures
 */
export const updateSection13Field = (
  section13Data: Section13,
  update: Section13FieldUpdate
): Section13 => {
  const { fieldPath, newValue, entryIndex } = update;
  // Deep clone to avoid mutation
  const newData = JSON.parse(JSON.stringify(section13Data));

  console.log(`🔍 SECTION13 Field Update:`, {
    fieldPath,
    newValue,
    entryIndex,
    valueType: typeof newValue
  });

  // Legacy general flags (hasEmployment/hasGaps/gapExplanation) removed – not in canonical mapping

  // Handle employment entries
  if (fieldPath.includes('entries') && entryIndex !== undefined) {
    if (entryIndex >= 0 && entryIndex < newData.section13.entries.length) {
      const entry = newData.section13.entries[entryIndex];

      // Handle employment dates
      if (fieldPath.includes('employmentDates.fromDate') || fieldPath.includes('fromDate')) {
        entry.employmentDates.fromDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.toDate') || fieldPath.includes('toDate')) {
        entry.employmentDates.toDate.value = newValue;
      }
      else if (fieldPath.includes('employmentDates.fromEstimated') || fieldPath.includes('fromEstimated')) {
        entry.employmentDates.fromEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.toEstimated') || fieldPath.includes('toEstimated')) {
        entry.employmentDates.toEstimated.value = Boolean(newValue);
      }
      else if (fieldPath.includes('employmentDates.present') || fieldPath.includes('present')) {
        entry.employmentDates.present.value = Boolean(newValue);
      }

      // Handle employer information
      else if (fieldPath.includes('employmentType')) {
        entry.employmentType.value = newValue;
      }
      else if (fieldPath.includes('employmentStatus')) {
        entry.employmentStatus.value = newValue;
      }
      else if (fieldPath.includes('employerName')) {
        entry.employerName.value = newValue;
      }
      else if (fieldPath.includes('positionTitle')) {
        entry.positionTitle.value = newValue;
      }

      // Handle employer address
      else if (fieldPath.includes('employerAddress.street') || fieldPath.includes('street')) {
        entry.employerAddress.street.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.city') || fieldPath.includes('city')) {
        entry.employerAddress.city.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.state') || fieldPath.includes('state')) {
        entry.employerAddress.state.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.zipCode') || fieldPath.includes('zipCode')) {
        entry.employerAddress.zipCode.value = newValue;
      }
      else if (fieldPath.includes('employerAddress.country') || fieldPath.includes('country')) {
        entry.employerAddress.country.value = newValue;
      }

      // Handle supervisor information
      else if (fieldPath.includes('supervisor.name') || fieldPath.endsWith('supervisorName')) {
        entry.supervisor.name.value = newValue;
      }
      else if (fieldPath.includes('supervisor.title') || fieldPath.endsWith('supervisorTitle')) {
        entry.supervisor.title.value = newValue;
      }
      else if (fieldPath.includes('supervisor.email') || fieldPath.endsWith('supervisorEmail')) {
        entry.supervisor.email.value = newValue;
      }
      else if (fieldPath.includes('supervisor.phone') || fieldPath.endsWith('supervisorPhone')) {
        entry.supervisor.phone.value = newValue;
      }
    }
    return newData;
  }

  // Fallback: try to guess the right field from the field path
  try {
    const pathParts = fieldPath.split('.');
    const lastPart = pathParts[pathParts.length - 1];

    // no-op for removed legacy general flags
  } catch (error) {
    console.error(`Section13: Failed to update field at path ${fieldPath}:`, error);
  }

  return newData;
};

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

export interface Section13ContextType {
  // State
  section13Data: Section13;
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;

  // Basic Actions
  updateEmploymentInfo: (fieldPath: string, value: string) => void;
  updateFieldValue: (path: string, value: any) => void;
  updateField: (fieldPath: string, value: any) => void;

  // Employment Entry Management
  addMilitaryEmploymentEntry: () => void;
  removeMilitaryEmploymentEntry: (entryId: string) => void;
  updateMilitaryEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addNonFederalEmploymentEntry: () => void;
  removeNonFederalEmploymentEntry: (entryId: string) => void;
  updateNonFederalEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addSelfEmploymentEntry: () => void;
  removeSelfEmploymentEntry: (entryId: string) => void;
  updateSelfEmploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  addUnemploymentEntry: () => void;
  removeUnemploymentEntry: (entryId: string) => void;
  updateUnemploymentEntry: (entryId: string, fieldPath: string, value: any) => void;

  // Validation
  validateSection: () => ValidationResult;
  validateEmploymentEntry: (entryType: string, entryId: string) => ValidationResult;

  // Utility
  resetSection: () => void;
  loadSection: (data: Section13) => void;
  getChanges: () => any;
  getEmploymentEntryCount: (entryType: string) => number;
  getTotalEmploymentYears: () => number;
}

// ============================================================================
// HELPER FUNCTIONS - MOVED FROM INTERFACE TO CONTEXT
// ============================================================================

/**
 * Parse a field path into segments
 * @param fieldPath The field path to parse
 * @returns Array of path segments
 */
const parseFieldPath = (fieldPath: string): string[] => {
  return fieldPath.split('.');
};

/**
 * Parse an array segment like "entries[0]" into name and index
 * Extracts array name and numeric index from notation
 * @param segment - The array segment to parse
 * @returns Object with name and index properties
 */
const parseArraySegment = (segment: string): { name: string; index: number } => {
  const [name, indexStr] = segment.split('[');
  const index = parseInt(indexStr.replace(']', ''), 10);
  return { name, index };
};

/**
 * Type guard to check if a value is a Field<T> type
 * Used for runtime type checking of field values
 * @param value - The value to check
 * @returns True if the value has Field<T> structure
 */
const isFieldType = (value: any): boolean => {
  return value && typeof value === 'object' && 'value' in value;
};

/**
 * Updates a specific field in the Section 13 data structure
 * Uses lodash for safe deep cloning and path-based updates
 * Handles nested structures and Field<T> types automatically
 * @param section13Data - The current Section 13 data
 * @param update - The field update to apply
 * @returns Updated Section 13 data with changes applied
 */
const updateSection13Field = (
  section13Data: Section13,
  update: Section13FieldUpdate
): Section13 => {
  const { fieldPath, newValue } = update;
  
  // Use lodash cloneDeep for proper deep cloning
  const newData = cloneDeep(section13Data);
  
  // Parse the field path to handle nested structures and Field<T> types
  const pathSegments = parseFieldPath(fieldPath);
  let current: any = newData;
  
  // Navigate to the parent of the field to update
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    
    // Handle array indices like entries[0]
    if (segment.includes('[')) {
      const { name, index } = parseArraySegment(segment);
      
      if (!current[name]) {
        current[name] = [];
      }
      if (!current[name][index]) {
        current[name][index] = {};
      }
      current = current[name][index];
    } else {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment];
    }
  }
  
  // Set the final value
  const finalSegment = pathSegments[pathSegments.length - 1];
  
  // Handle Field<T> structure
  if (isFieldType(current[finalSegment])) {
    current[finalSegment].value = newValue;
  } else if (finalSegment.includes('[')) {
    // Handle array assignment
    const { name, index } = parseArraySegment(finalSegment);
    if (!current[name]) {
      current[name] = [];
    }
    current[name][index] = newValue;
  } else {
    // Direct assignment for simple fields or creating new Field<T>
    if (typeof newValue === 'object' && newValue !== null && 'value' in newValue) {
      current[finalSegment] = newValue;
    } else {
      // Create Field<T> structure if needed
      current[finalSegment] = {
        id: `section13.${fieldPath}`,
        value: newValue,
        label: '',
        name: finalSegment,
        type: 'PDFTextField',
        required: false,
        section: 13,
        rect: { x: 0, y: 0, width: 0, height: 0 }
      };
    }
  }
  
  return newData;
};


// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Creates the initial Section 13 state with proper entry initialization
 * Includes all required entries for full field coverage (1086 fields)
 */
const createInitialSection13State = (): Section13 => {
  const section = createDefaultSection13(true); // Include initial entries for full field coverage
  
  // Get required entry indices from field mappings
  const requiredIndices = getRequiredEntryIndices();
  
  // Ensure we have enough entries for each type based on field mappings
  Object.entries(requiredIndices).forEach(([type, maxIndex]) => {
    if (maxIndex >= 0) {
      const targetPath = `section13.${type}.entries`;
      
      // Create entries array if it doesn't exist
      ensurePathExists(section, targetPath);
      
      // Get current entries array
      let entries = get(section, targetPath) || [];
      
      // Add missing entries
      while (entries.length <= maxIndex) {
        const entryId = `${type}-${entries.length}-${Date.now()}`;
        
        // Create appropriate entry based on type
        switch (type) {
          case 'militaryEmployment':
            entries.push(createDefaultMilitaryEmploymentEntry(entryId));
            break;
          case 'nonFederalEmployment':
            entries.push(createDefaultNonFederalEmploymentEntry(entryId));
            break;
          case 'selfEmployment':
            entries.push(createDefaultSelfEmploymentEntry(entryId));
            break;
          case 'unemployment':
            break;
          default:
            // Create a basic entry structure
            entries.push({ _id: entryId });
            break;
        }
      }
      
      // Set the entries back
      set(section, targetPath, entries);
    }
  });
  
  // Initialize all fields from the mapping file
  // This ensures all 1086 fields have proper Field<T> structures
  const fullyInitializedSection = initializeAllSection13Fields(section);
  
  // Validate field coverage
  const coverage = validateFieldCoverage(fullyInitializedSection);
  console.log(`✅ Section 13 initialized with ${coverage.found}/${coverage.total} fields`);
  if (coverage.missing.length > 0) {
    console.warn(`⚠️ Missing ${coverage.missing.length} fields:`, coverage.missing.slice(0, 10));
  }
  
  return fullyInitializedSection;
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const defaultValidationRules: Section13ValidationRules = {
  requiresEmploymentHistory: true,
  requiresGapExplanation: true,
  maxEmploymentEntries: 10,
  requiresEmployerName: true,
  requiresPositionTitle: true,
  requiresEmploymentDates: true,
  requiresSupervisorInfo: true,
  allowsEstimatedDates: true,
  maxEmployerNameLength: 100,
  maxPositionDescriptionLength: 500,
  maxCommentLength: 1000,
  timeFrameYears: 10
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const Section13Context = createContext<Section13ContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface Section13ProviderProps {
  children: React.ReactNode;
}

export const Section13Provider: React.FC<Section13ProviderProps> = ({ children }) => {
  // ============================================================================
  // CORE STATE MANAGEMENT
  // ============================================================================

  const [section13Data, setSection13Data] = useState<Section13>(createInitialSection13State());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialData] = useState<Section13>(createInitialSection13State());
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isDirty = JSON.stringify(section13Data) !== JSON.stringify(initialData);

  // Set initialized flag after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Log field creation only in debug mode and only when employment type changes
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    if (isDebugMode && isInitialized && section13Data.section13?.employmentType?.value) {
      console.log(`🔄 Section13: Employment type changed to: ${section13Data.section13.employmentType.value}`);
      console.log(`📋 Section13: Active entries:`, {
        military: section13Data.section13.militaryEmployment?.entries?.length || 0,
        nonFederal: section13Data.section13.nonFederalEmployment?.entries?.length || 0,
        selfEmployment: section13Data.section13.selfEmployment?.entries?.length || 0,
        unemployment: section13Data.section13.unemployment?.entries?.length || 0
      });
    }
  }, [section13Data.section13?.employmentType?.value, isInitialized]);

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  const validateSection = useCallback((): ValidationResult => {
    const validationErrors: ValidationError[] = [];
    const validationWarnings: ValidationError[] = [];

    // Validate employment type selection
    if (!section13Data.section13?.employmentType?.value) {
      validationErrors.push({
        field: 'section13.employmentType',
        message: 'Employment type selection is required',
        code: 'EMPLOYMENT_TYPE_REQUIRED'
      });
    }

    // Validate employment entries based on type
    const employmentType = section13Data.section13?.employmentType?.value;
    
    if (employmentType === 'Military Service') {
      const militaryEntries = section13Data.section13?.militaryEmployment?.entries || [];
      if (militaryEntries.length === 0) {
        validationWarnings.push({
          field: ['section13','militaryEmployment','entries'].join('.'),
          message: 'At least one military employment entry is recommended',
          code: 'MILITARY_ENTRY_RECOMMENDED'
        });
      }
      
      // Validate military entry completeness
      militaryEntries.forEach((entry, index) => {
        if (!entry.employmentDates?.fromDate?.value) {
          validationErrors.push({
            field: `section13.militaryEmployment.entries[${index}].employmentDates.fromDate`,
            message: 'Employment start date is required',
            code: 'FROM_DATE_REQUIRED'
          });
        }
        
        if (!entry.rankTitle?.value) {
          validationWarnings.push({
            field: `section13.militaryEmployment.entries[${index}].rankTitle`,
            message: 'Rank/title is recommended for military employment',
            code: 'RANK_TITLE_RECOMMENDED'
          });
        }
        
        if (!entry.supervisor?.name?.value) {
          validationWarnings.push({
            field: `section13.militaryEmployment.entries[${index}].supervisor.name`,
            message: 'Supervisor name is recommended',
            code: 'SUPERVISOR_NAME_RECOMMENDED'
          });
        }
      });
    }

    // Validate non-federal employment entries
    if (['Private Company', 'State Government', 'Local Government', 'Non-Profit Organization', 'Contract Work', 'Consulting'].includes(employmentType || '')) {
      const nonFederalEntries = section13Data.section13?.nonFederalEmployment?.entries || [];
      if (nonFederalEntries.length === 0) {
        validationWarnings.push({
          field: ['section13','nonFederalEmployment','entries'].join('.'),
          message: 'At least one non-federal employment entry is recommended',
          code: 'NON_FEDERAL_ENTRY_RECOMMENDED'
        });
      }
      
      // Validate non-federal entry completeness
      nonFederalEntries.forEach((entry, index) => {
        if (!entry.employerName?.value) {
          validationErrors.push({
            field: `section13.nonFederalEmployment.entries[${index}].employerName`,
            message: 'Employer name is required',
            code: 'EMPLOYER_NAME_REQUIRED'
          });
        }
        
        if (!entry.positionTitle?.value) {
          validationWarnings.push({
            field: `section13.nonFederalEmployment.entries[${index}].positionTitle`,
            message: 'Position title is recommended',
            code: 'POSITION_TITLE_RECOMMENDED'
          });
        }
      });
    }

    // Validate self-employment entries
    if (employmentType === 'Self-Employment') {
      const selfEmploymentEntries = section13Data.section13?.selfEmployment?.entries || [];
      if (selfEmploymentEntries.length === 0) {
        validationWarnings.push({
          field: ['section13','selfEmployment','entries'].join('.'),
          message: 'At least one self-employment entry is recommended',
          code: 'SELF_EMPLOYMENT_ENTRY_RECOMMENDED'
        });
      }
      
      // Validate self-employment entry completeness
      selfEmploymentEntries.forEach((entry, index) => {
        if (!entry.businessName?.value) {
          validationErrors.push({
            field: `section13.selfEmployment.entries[${index}].businessName`,
            message: 'Business name is required',
            code: 'BUSINESS_NAME_REQUIRED'
          });
        }
        
        if (!entry.verifierFirstName?.value || !entry.verifierLastName?.value) {
          validationWarnings.push({
            field: `section13.selfEmployment.entries[${index}].verifier`,
            message: 'Verifier contact information is recommended',
            code: 'VERIFIER_CONTACT_RECOMMENDED'
          });
        }
      });
    }

    // Validate unemployment entries
    if (employmentType === 'Unemployment') {
      const unemploymentEntries = section13Data.section13?.unemployment?.entries || [];
      if (unemploymentEntries.length === 0) {
        validationWarnings.push({
          field: ['section13','unemployment','entries'].join('.'),
          message: 'At least one unemployment period entry is recommended',
          code: 'UNEMPLOYMENT_ENTRY_RECOMMENDED'
        });
      }
      
      // Validate unemployment entry completeness
      unemploymentEntries.forEach((entry, index) => {
        if (!entry.reference?.firstName?.value || !entry.reference?.lastName?.value) {
          validationWarnings.push({
            field: `section13.unemployment.entries[${index}].reference`,
            message: 'Reference contact information is recommended',
            code: 'REFERENCE_CONTACT_RECOMMENDED'
          });
        }
      });
    }

    // Validate employment record issues if any issues are indicated
    const recordIssues = section13Data.section13?.employmentRecordIssues;
    if (recordIssues?.wasFired?.value || recordIssues?.quitAfterBeingTold?.value || recordIssues?.leftByMutualAgreement?.value) {
      if (!recordIssues.employmentDates?.fromDate?.value) {
        validationErrors.push({
          field: ['section13','employmentRecordIssues','employmentDates','toDate'].join('.'),
          message: 'Employment dates are required when reporting employment issues',
          code: 'EMPLOYMENT_ISSUE_DATES_REQUIRED'
        });
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings
    };
  }, [section13Data]);

/**
 * Adds a new employment entry of the specified type
 */
const addEmploymentEntry = useCallback((type: EmploymentType) => {
  const newData = cloneDeep(section13Data);
  const entryId = Date.now();
  
  switch(type) {
    case 'Military Service':
      newData.section13.militaryEmployment.entries.push(
        createDefaultMilitaryEmploymentEntry(entryId)
      );
      break;
    case 'Private Company':
    case 'Non-Profit Organization':
    case 'State Government':
    case 'Local Government':
      newData.section13.nonFederalEmployment.entries.push(
        createDefaultNonFederalEmploymentEntry(entryId)
      );
      break;
    case 'Self-Employment':
    case 'Consulting':
    case 'Contract Work':
      newData.section13.selfEmployment.entries.push(
        createDefaultSelfEmploymentEntry(entryId)
      );
      break;
    case 'Unemployment':
      newData.section13.unemployment.entries.push(
        createDefaultUnemploymentEntry(entryId)
      );
      break;
  }
  
  setSection13Data(newData);
}, [section13Data]);


  // Update errors when section data changes (but not during initial render)
  useEffect(() => {
    // Skip validation on initial render to avoid infinite loops
    if (!isInitialized) return;

    const validationResult = validateSection();
    const newErrors: Record<string, string> = {};

    validationResult.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Only update errors if they actually changed (using previous errors via state updater)
    setErrors(prevErrors => {
      const currentErrorKeys = Object.keys(prevErrors);
      const newErrorKeys = Object.keys(newErrors);
      const errorsChanged =
        currentErrorKeys.length !== newErrorKeys.length ||
        currentErrorKeys.some(key => prevErrors[key] !== newErrors[key]);

      return errorsChanged ? newErrors : prevErrors;
    });
  }, [section13Data, isInitialized]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const updateEmploymentInfo = useCallback((fieldPath: string, value: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, `section13.${fieldPath}.value`, value);
      return newData;
    });
  }, []);

  /**
   * Generic field update function for integration compatibility
   * Maps generic field paths to Section 13 specific update functions
   * Now enhanced to support PDF field ID resolution
   */
  const updateFieldValue = useCallback((path: string, value: any) => {
    // Check if path is a PDF field ID and resolve to UI path
    const resolvedPath = mapPdfFieldToUiPath(path) || path;
    
    setSection13Data(prevData => {
      return updateSection13Field(prevData, { fieldPath: resolvedPath, newValue: value });
    });
  }, []);

  /**
   * Update a specific field by path
   */
  const updateField = useCallback((fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      set(newData, fieldPath, value);
      return newData;
    });
  }, []);

  // ============================================================================
  // EMPLOYMENT ENTRY MANAGEMENT
  // ============================================================================

  /**
   * Add a new military employment entry
   */
  const addMilitaryEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `military_${Date.now()}`;

      // Create new entry using the factory function from interface
      const newEntry = createDefaultMilitaryEmploymentEntry(newEntryId);

      if (!newData.section13.militaryEmployment) {
        newData.section13.militaryEmployment = { entries: [] };
      }

      newData.section13.militaryEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a military employment entry
   */
  const removeMilitaryEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.militaryEmployment?.entries) {
        newData.section13.militaryEmployment.entries =
          newData.section13.militaryEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a military employment entry field
   */
  const updateMilitaryEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.militaryEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.militaryEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new non-federal employment entry
   */
  const addNonFederalEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `nonFederal_${Date.now()}`;

      const newEntry = createDefaultNonFederalEmploymentEntry(newEntryId);

      if (!newData.section13.nonFederalEmployment) {
        newData.section13.nonFederalEmployment = { entries: [] };
      }

      newData.section13.nonFederalEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a non-federal employment entry
   */
  const removeNonFederalEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.nonFederalEmployment?.entries) {
        newData.section13.nonFederalEmployment.entries =
          newData.section13.nonFederalEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a non-federal employment entry field
   */
  const updateNonFederalEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.nonFederalEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.nonFederalEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new self-employment entry
   */
  const addSelfEmploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `selfEmployment_${Date.now()}`;

      const newEntry = createDefaultSelfEmploymentEntry(newEntryId);

      if (!newData.section13.selfEmployment) {
        newData.section13.selfEmployment = { entries: [] };
      }

      newData.section13.selfEmployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove a self-employment entry
   */
  const removeSelfEmploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.selfEmployment?.entries) {
        newData.section13.selfEmployment.entries =
          newData.section13.selfEmployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update a self-employment entry field
   */
  const updateSelfEmploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.selfEmployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.selfEmployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  /**
   * Add a new unemployment entry
   */
  const addUnemploymentEntry = useCallback(() => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const newEntryId = `unemployment_${Date.now()}`;

      const newEntry = createDefaultUnemploymentEntry(newEntryId);

      if (!newData.section13.unemployment) {
        newData.section13.unemployment = { entries: [] };
      }

      newData.section13.unemployment.entries.push(newEntry);
      return newData;
    });
  }, []);

  /**
   * Remove an unemployment entry
   */
  const removeUnemploymentEntry = useCallback((entryId: string) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      if (newData.section13.unemployment?.entries) {
        newData.section13.unemployment.entries =
          newData.section13.unemployment.entries.filter(entry => entry._id !== entryId);
      }
      return newData;
    });
  }, []);

  /**
   * Update an unemployment entry field
   */
  const updateUnemploymentEntry = useCallback((entryId: string, fieldPath: string, value: any) => {
    setSection13Data(prevData => {
      const newData = cloneDeep(prevData);
      const entryIndex = newData.section13.unemployment?.entries.findIndex(entry => entry._id === entryId);

      if (entryIndex !== undefined && entryIndex >= 0) {
        set(newData, `section13.unemployment.entries[${entryIndex}].${fieldPath}`, value);
      }

      return newData;
    });
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get the count of entries for a specific employment type
   */
  const getEmploymentEntryCount = useCallback((entryType: string): number => {
    switch (entryType) {
      case 'militaryEmployment':
        return section13Data.section13.militaryEmployment?.entries?.length || 0;
      case 'nonFederalEmployment':
        return section13Data.section13.nonFederalEmployment?.entries?.length || 0;
      case 'selfEmployment':
        return section13Data.section13.selfEmployment?.entries?.length || 0;
      case 'unemployment':
        return section13Data.section13.unemployment?.entries?.length || 0;
      default:
        return 0;
    }
  }, [section13Data]);

  /**
   * Calculate total employment years (simplified calculation)
   */
  const getTotalEmploymentYears = useCallback((): number => {
    // This would need proper date parsing and calculation
    // For now, return a placeholder
    return 0;
  }, []);

  /**
   * Validate a specific employment entry
   */
  const validateEmploymentEntry = useCallback((entryType: string, entryId: string): ValidationResult => {
    // Placeholder validation - would implement specific validation logic
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const resetSection = useCallback(() => {
    const newData = createInitialSection13State();
    setSection13Data(newData);
    setErrors({});
  }, []);

  const loadSection = useCallback((data: Section13) => {
    setSection13Data(cloneDeep(data));
    setErrors({});
  }, []);

  const getChanges = useCallback((): ChangeSet => {
    const changes: ChangeSet = {};

    // Simple change detection - compare with initial data
    if (JSON.stringify(section13Data) !== JSON.stringify(initialData)) {
      changes['section13'] = {
        oldValue: initialData,
        newValue: section13Data,
        timestamp: new Date()
      };
    }

    return changes;
  }, [section13Data, initialData]);

  // ============================================================================
  // SF86FORM INTEGRATION
  // ============================================================================
  // Access SF86FormContext to sync with loaded data
  const sf86Form = useSF86Form();

  // Sync with SF86FormContext when data is loaded (only on initial load)
  const [hasSyncedWithForm, setHasSyncedWithForm] = useState(false);
  
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    // Only sync once when form data becomes available
    if (!hasSyncedWithForm && sf86Form.formData.section13) {
      if (isDebugMode) {
        console.log('🔄 Section13: Syncing with SF86FormContext loaded data');
      }

      // Load the data from SF86FormContext
      loadSection(sf86Form.formData.section13);
      setHasSyncedWithForm(true);

      if (isDebugMode) {
        console.log('✅ Section13: Data sync complete');
      }
    }
  }, [sf86Form.formData.section13, loadSection, hasSyncedWithForm]);

  // Auto-sync Section 13 data to SF86FormContext when it changes
  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=true');

    if (isInitialized && section13Data && isDirty) {
      if (isDebugMode) {
        console.log('🔄 Section13: Auto-syncing data to SF86FormContext');
      }

      // Update the central form context with Section 13 data
      sf86Form.updateSectionData('section13', section13Data);

      if (isDebugMode) {
        console.log('✅ Section13: Auto-sync complete');
      }
    }
  }, [section13Data, isInitialized, isDirty, sf86Form.updateSectionData]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: Section13ContextType = {
    // State
    section13Data,
    isLoading,
    errors,
    isDirty,

    // Basic Actions
    updateEmploymentInfo,
    updateFieldValue,
    updateField,

    // Employment Entry Management
    addMilitaryEmploymentEntry,
    removeMilitaryEmploymentEntry,
    updateMilitaryEmploymentEntry,

    addNonFederalEmploymentEntry,
    removeNonFederalEmploymentEntry,
    updateNonFederalEmploymentEntry,

    addSelfEmploymentEntry,
    removeSelfEmploymentEntry,
    updateSelfEmploymentEntry,

    addUnemploymentEntry,
    removeUnemploymentEntry,
    updateUnemploymentEntry,

    // Validation
    validateSection,
    validateEmploymentEntry,

    // Utility
    resetSection,
    loadSection,
    getChanges,
    getEmploymentEntryCount,
    getTotalEmploymentYears
  };

  return (
    <Section13Context.Provider value={contextValue}>
      {children}
    </Section13Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSection13 = (): Section13ContextType => {
  const context = useContext(Section13Context);
  if (!context) {
    throw new Error('useSection13 must be used within a Section13Provider');
  }
  return context;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Section13Provider;
