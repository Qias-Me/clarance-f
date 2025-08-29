/**
 * Section 13 Factory Functions
 * Factory pattern implementation for creating Section 13 data structures
 */

import { createFieldFromReference } from '../../api/utils/sections-references-loader';
import type { 
  EmploymentDateRange,
  EmploymentAddress,
  PhoneInfo,
  MilitaryEmploymentEntry,
  NonFederalEmploymentEntry,
  SelfEmploymentEntry,
  UnemploymentEntry,
  EmploymentStatus
} from '../../api/interfaces/section-interfaces/section13';

// Field mapping configurations for different entry types
const FIELD_MAPPINGS = {
  military: {
    dates: {
      fromDate: 'form1[0].section_13_1-2[0].From_Datefield_Name_2[0]',
      fromEstimated: 'form1[0].section_13_1-2[0].#field[32]',
      toDate: 'form1[0].section_13_1-2[0].From_Datefield_Name_2[1]',
      toEstimated: 'form1[0].section_13_1-2[0].#field[36]',
      present: 'form1[0].section_13_1-2[0].#field[37]'
    },
    status: 'form1[0].section_13_1-2[0].p13a-1-1cb[0]',
    rank: 'form1[0].section_13_1-2[0].p3-t68[3]',
    dutyStation: {
      station: 'form1[0].section_13_1-2[0].p3-t68[4]',
      street: 'form1[0].section_13_1-2[0].TextField11[9]',
      city: 'form1[0].section_13_1-2[0].TextField11[10]',
      state: 'form1[0].section_13_1-2[0].TextField11[11]',
      zipCode: 'form1[0].section_13_1-2[0].TextField11[12]',
      country: 'form1[0].section_13_1-2[0].TextField11[13]'
    }
  },
  nonFederal: {
    dates: {
      fromDate: 'form1[0].section13_2-2[0].From_Datefield_Name_2[1]',
      fromEstimated: 'form1[0].section13_2-2[0].#field[32]',
      toDate: 'form1[0].section13_2-2[0].From_Datefield_Name_2[0]',
      toEstimated: 'form1[0].section13_2-2[0].#field[36]',
      present: 'form1[0].section13_2-2[0].#field[37]'
    },
    status: 'form1[0].section13_2-2[0].RadioButtonList[1]',
    employer: 'form1[0].section13_2-2[0].TextField11[0]',
    position: 'form1[0].section13_2-2[0].TextField11[1]',
    address: {
      street: 'form1[0].section13_2-2[0].TextField11[9]',
      city: 'form1[0].section13_2-2[0].TextField11[10]',
      state: 'form1[0].section13_2-2[0].TextField11[11]',
      zipCode: 'form1[0].section13_2-2[0].TextField11[12]',
      country: 'form1[0].section13_2-2[0].TextField11[13]'
    }
  },
  selfEmployment: {
    dates: {
      fromDate: 'form1[0].section13_3-2[0].From_Datefield_Name_2[1]',
      fromEstimated: 'form1[0].section13_3-2[0].#field[32]',
      toDate: 'form1[0].section13_3-2[0].From_Datefield_Name_2[0]',
      toEstimated: 'form1[0].section13_3-2[0].#field[36]',
      present: 'form1[0].section13_3-2[0].#field[37]'
    },
    businessName: 'form1[0].section13_3-2[0].p3-t68[3]',
    businessType: 'form1[0].section13_3-2[0].TextField11[0]',
    position: 'form1[0].section13_3-2[0].p3-t68[4]',
    address: {
      street: 'form1[0].section13_3-2[0].TextField11[9]',
      city: 'form1[0].section13_3-2[0].TextField11[10]',
      state: 'form1[0].section13_3-2[0].TextField11[11]',
      zipCode: 'form1[0].section13_3-2[0].TextField11[12]',
      country: 'form1[0].section13_3-2[0].TextField11[13]'
    }
  },
  unemployment: {
    dates: {
      fromDate: 'form1[0].section13_4[0].From_Datefield_Name_2[1]',
      fromEstimated: 'form1[0].section13_4[0].#field[32]',
      toDate: 'form1[0].section13_4[0].From_Datefield_Name_2[0]',
      toEstimated: 'form1[0].section13_4[0].#field[36]',
      present: 'form1[0].section13_4[0].#field[37]'
    },
    reference: {
      firstName: 'form1[0].section13_4[0].TextField11[1]',
      lastName: 'form1[0].section13_4[0].TextField11[0]',
      street: 'form1[0].section13_4[0].TextField11[2]',
      city: 'form1[0].section13_4[0].TextField11[3]'
    }
  }
} as const;

/**
 * Creates employment date range with field references
 */
export const createEmploymentDateRange = (mappings: typeof FIELD_MAPPINGS.military.dates): EmploymentDateRange => ({
  fromDate: createFieldFromReference(13, mappings.fromDate, ''),
  fromEstimated: createFieldFromReference(13, mappings.fromEstimated, false),
  toDate: createFieldFromReference(13, mappings.toDate, ''),
  toEstimated: createFieldFromReference(13, mappings.toEstimated, false),
  present: createFieldFromReference(13, mappings.present, false)
});

/**
 * Creates employment address with field references
 */
export const createEmploymentAddress = (mappings: typeof FIELD_MAPPINGS.military.dutyStation): EmploymentAddress => ({
  street: createFieldFromReference(13, mappings.street, ''),
  city: createFieldFromReference(13, mappings.city, ''),
  state: createFieldFromReference(13, mappings.state, ''),
  zipCode: createFieldFromReference(13, mappings.zipCode, ''),
  country: createFieldFromReference(13, mappings.country, 'United States')
});

/**
 * Factory function for creating employment entries
 */
export class EmploymentEntryFactory {
  static createMilitaryEntry(entryId: string | number): MilitaryEmploymentEntry {
    const mappings = FIELD_MAPPINGS.military;
    
    return {
      _id: entryId,
      employmentDates: createEmploymentDateRange(mappings.dates),
      employmentStatus: {
        ...createFieldFromReference(13, mappings.status, 'Full-time' as EmploymentStatus),
        options: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal']
      },
      rankTitle: createFieldFromReference(13, mappings.rank, ''),
      dutyStation: {
        dutyStation: createFieldFromReference(13, mappings.dutyStation.station, ''),
        ...createEmploymentAddress(mappings.dutyStation)
      },
      // Additional fields would be added here following the same pattern
    } as MilitaryEmploymentEntry;
  }
  
  static createNonFederalEntry(entryId: string | number): NonFederalEmploymentEntry {
    const mappings = FIELD_MAPPINGS.nonFederal;
    
    return {
      _id: entryId,
      employmentDates: createEmploymentDateRange(mappings.dates),
      employmentStatus: {
        ...createFieldFromReference(13, mappings.status, 'Full-time' as EmploymentStatus),
        options: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal']
      },
      employerName: createFieldFromReference(13, mappings.employer, ''),
      positionTitle: createFieldFromReference(13, mappings.position, ''),
      employerAddress: createEmploymentAddress(mappings.address),
      // Additional fields would be added here following the same pattern
    } as NonFederalEmploymentEntry;
  }
  
  static createSelfEmploymentEntry(entryId: string | number): SelfEmploymentEntry {
    const mappings = FIELD_MAPPINGS.selfEmployment;
    
    return {
      _id: entryId,
      employmentDates: createEmploymentDateRange(mappings.dates),
      businessName: createFieldFromReference(13, mappings.businessName, ''),
      businessType: createFieldFromReference(13, mappings.businessType, ''),
      positionTitle: createFieldFromReference(13, mappings.position, ''),
      businessAddress: createEmploymentAddress(mappings.address),
      // Additional fields would be added here following the same pattern
    } as SelfEmploymentEntry;
  }
  
  static createUnemploymentEntry(entryId: string | number): UnemploymentEntry {
    const mappings = FIELD_MAPPINGS.unemployment;
    
    return {
      _id: entryId,
      unemploymentDates: createEmploymentDateRange(mappings.dates),
      reference: {
        firstName: createFieldFromReference(13, mappings.reference.firstName, ''),
        lastName: createFieldFromReference(13, mappings.reference.lastName, ''),
        address: {
          street: createFieldFromReference(13, mappings.reference.street, ''),
          city: createFieldFromReference(13, mappings.reference.city, ''),
          state: createFieldFromReference(13, 'form1[0].section13_4[0].TextField11[4]', ''),
          zipCode: createFieldFromReference(13, 'form1[0].section13_4[0].TextField11[5]', ''),
          country: createFieldFromReference(13, 'form1[0].section13_4[0].TextField11[6]', 'United States')
        },
        phone: {
          number: createFieldFromReference(13, 'form1[0].section13_4[0].TextField11[7]', ''),
          extension: createFieldFromReference(13, 'form1[0].section13_4[0].TextField11[8]', ''),
          isDSN: createFieldFromReference(13, 'form1[0].section13_4[0].#field[40]', false),
          isDay: createFieldFromReference(13, 'form1[0].section13_4[0].#field[41]', false),
          isNight: createFieldFromReference(13, 'form1[0].section13_4[0].#field[42]', false)
        }
      },
      // Additional fields would be added here following the same pattern
    } as UnemploymentEntry;
  }
  
  /**
   * Creates an entry based on the employment type
   */
  static createEntry(type: 'military' | 'nonFederal' | 'selfEmployment' | 'unemployment', entryId: string | number) {
    switch (type) {
      case 'military':
        return this.createMilitaryEntry(entryId);
      case 'nonFederal':
        return this.createNonFederalEntry(entryId);
      case 'selfEmployment':
        return this.createSelfEmploymentEntry(entryId);
      case 'unemployment':
        return this.createUnemploymentEntry(entryId);
      default:
        throw new Error(`Unknown employment type: ${type}`);
    }
  }
}