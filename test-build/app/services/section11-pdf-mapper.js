"use strict";
/**
 * Section 11 - Where You Have Lived PDF Mapper
 * Maps Section 11 residence history data to PDF field structure
 * Handles 252 fields organized in 4 residence entries
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSection11ToPDFFields = mapSection11ToPDFFields;
exports.validateSection11ForPDF = validateSection11ForPDF;
exports.getSection11MappingStats = getSection11MappingStats;
const section_11_mappings_json_1 = __importDefault(require("../../api/mappings/section-11-mappings.json"));
const Logger_1 = require("./Logger");
/**
 * Maps Section 11 data to PDF fields
 * @param section11Data The Section 11 form data
 * @returns Map of PDF field IDs to values
 */
function mapSection11ToPDFFields(section11Data) {
    const pdfFieldMap = new Map();
    if (!section11Data?.section11) {
        Logger_1.logger.warn('No Section 11 data provided', 'Section11PDFMapper');
        return pdfFieldMap;
    }
    const section = section11Data.section11;
    // Map base fields
    if (section.hasLivedAbroad) {
        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === 'section11.hasLivedAbroad');
        if (mapping) {
            pdfFieldMap.set(mapping.pdfFieldId, section.hasLivedAbroad.value || '');
        }
    }
    // Map residence entries (up to 4 entries, 63 fields each)
    if (section.residences && Array.isArray(section.residences)) {
        section.residences.forEach((residence, index) => {
            if (!residence || index >= 4)
                return; // Only process first 4 entries
            const entryNum = index + 1;
            // Map address fields
            if (residence.streetAddress) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].streetAddress`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.streetAddress.value || '');
                }
            }
            if (residence.streetAddress2) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].streetAddress2`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.streetAddress2.value || '');
                }
            }
            if (residence.apartmentNumber) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].apartmentNumber`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.apartmentNumber.value || '');
                }
            }
            if (residence.city) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].city`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.city.value || '');
                }
            }
            if (residence.stateOrProvince) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].stateOrProvince`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.stateOrProvince.value || '');
                }
            }
            if (residence.country) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].country`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.country.value || '');
                }
            }
            if (residence.zipCode) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].zipCode`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.zipCode.value || '');
                }
            }
            // Map date fields
            if (residence.fromMonth) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].fromMonth`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.fromMonth.value || '');
                }
            }
            if (residence.fromYear) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].fromYear`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.fromYear.value || '');
                }
            }
            if (residence.toMonth) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].toMonth`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.toMonth.value || '');
                }
            }
            if (residence.toYear) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].toYear`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.toYear.value || '');
                }
            }
            if (residence.isCurrentResidence) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].isCurrentResidence`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.isCurrentResidence.value || false);
                }
            }
            // Map person who knows you fields (3 per residence)
            if (residence.personsWhoKnowYou && Array.isArray(residence.personsWhoKnowYou)) {
                residence.personsWhoKnowYou.forEach((person, personIndex) => {
                    if (!person || personIndex >= 3)
                        return; // Only process first 3 persons
                    // Map person name
                    if (person.fullName) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].fullName`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.fullName.value || '');
                        }
                    }
                    // Map person relationship
                    if (person.relationship) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].relationship`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.relationship.value || '');
                        }
                    }
                    // Map person phone
                    if (person.phoneNumber) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].phoneNumber`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.phoneNumber.value || '');
                        }
                    }
                    // Map person email
                    if (person.email) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].email`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.email.value || '');
                        }
                    }
                    // Map person address fields
                    if (person.streetAddress) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].streetAddress`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.streetAddress.value || '');
                        }
                    }
                    if (person.streetAddress2) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].streetAddress2`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.streetAddress2.value || '');
                        }
                    }
                    if (person.apartmentNumber) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].apartmentNumber`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.apartmentNumber.value || '');
                        }
                    }
                    if (person.city) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].city`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.city.value || '');
                        }
                    }
                    if (person.stateOrProvince) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].stateOrProvince`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.stateOrProvince.value || '');
                        }
                    }
                    if (person.country) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].country`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.country.value || '');
                        }
                    }
                    if (person.zipCode) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].zipCode`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.zipCode.value || '');
                        }
                    }
                    // Map date knew person fields
                    if (person.dateKnewFromMonth) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].dateKnewFromMonth`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.dateKnewFromMonth.value || '');
                        }
                    }
                    if (person.dateKnewFromYear) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].dateKnewFromYear`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.dateKnewFromYear.value || '');
                        }
                    }
                    if (person.dateKnewToMonth) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].dateKnewToMonth`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.dateKnewToMonth.value || '');
                        }
                    }
                    if (person.dateKnewToYear) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].dateKnewToYear`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.dateKnewToYear.value || '');
                        }
                    }
                    // Map additional person fields
                    if (person.frequencyOfContact) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].frequencyOfContact`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.frequencyOfContact.value || '');
                        }
                    }
                    if (person.canConfirmDates) {
                        const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].personsWhoKnowYou[${personIndex}].canConfirmDates`);
                        if (mapping) {
                            pdfFieldMap.set(mapping.pdfFieldId, person.canConfirmDates.value || false);
                        }
                    }
                });
            }
            // Map additional residence fields
            if (residence.residenceType) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].residenceType`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.residenceType.value || '');
                }
            }
            if (residence.ownershipStatus) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].ownershipStatus`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.ownershipStatus.value || '');
                }
            }
            if (residence.militaryHousing) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].militaryHousing`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.militaryHousing.value || false);
                }
            }
            if (residence.explanation) {
                const mapping = section_11_mappings_json_1.default.mappings.find(m => m.uiPath === `section11.residences[${index}].explanation`);
                if (mapping) {
                    pdfFieldMap.set(mapping.pdfFieldId, residence.explanation.value || '');
                }
            }
        });
    }
    Logger_1.logger.info('Section 11 PDF mapping complete', 'Section11PDFMapper', {
        totalFieldsMapped: pdfFieldMap.size,
        hasResidences: !!section.residences?.length,
        residenceCount: section.residences?.length || 0
    });
    return pdfFieldMap;
}
/**
 * Validate Section 11 data for PDF generation
 */
function validateSection11ForPDF(section11Data) {
    const errors = [];
    const warnings = [];
    if (!section11Data?.section11) {
        errors.push('Section 11 data is missing');
        return { isValid: false, errors, warnings };
    }
    const section = section11Data.section11;
    // Check for required fields
    if (!section.hasLivedAbroad) {
        errors.push('Has lived abroad question is required');
    }
    // Validate residence entries
    if (section.residences && section.residences.length > 0) {
        section.residences.forEach((residence, index) => {
            if (!residence.streetAddress?.value) {
                warnings.push(`Residence ${index + 1}: Street address is missing`);
            }
            if (!residence.city?.value) {
                warnings.push(`Residence ${index + 1}: City is missing`);
            }
            if (!residence.country?.value) {
                warnings.push(`Residence ${index + 1}: Country is missing`);
            }
            if (!residence.fromMonth?.value || !residence.fromYear?.value) {
                warnings.push(`Residence ${index + 1}: From date is incomplete`);
            }
            if (!residence.isCurrentResidence?.value && (!residence.toMonth?.value || !residence.toYear?.value)) {
                warnings.push(`Residence ${index + 1}: To date is incomplete for non-current residence`);
            }
            // Validate persons who know you
            if (residence.personsWhoKnowYou && residence.personsWhoKnowYou.length > 0) {
                residence.personsWhoKnowYou.forEach((person, personIndex) => {
                    if (!person.fullName?.value) {
                        warnings.push(`Residence ${index + 1}, Person ${personIndex + 1}: Name is missing`);
                    }
                    if (!person.phoneNumber?.value && !person.email?.value) {
                        warnings.push(`Residence ${index + 1}, Person ${personIndex + 1}: Contact information is missing`);
                    }
                });
            }
        });
    }
    else if (section.hasLivedAbroad?.value === 'YES') {
        errors.push('Residence entries are required when has lived abroad is YES');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Get mapping statistics for Section 11
 */
function getSection11MappingStats(section11Data) {
    const pdfFieldMap = mapSection11ToPDFFields(section11Data);
    const totalPossibleFields = 252; // Total fields in Section 11
    let totalResidences = 0;
    let completeResidences = 0;
    let partialResidences = 0;
    let emptyResidences = 0;
    if (section11Data?.section11?.residences) {
        section11Data.section11.residences.forEach(residence => {
            totalResidences++;
            const requiredFields = [
                residence.streetAddress?.value,
                residence.city?.value,
                residence.country?.value,
                residence.fromMonth?.value,
                residence.fromYear?.value
            ];
            const filledFields = requiredFields.filter(f => f).length;
            if (filledFields === requiredFields.length) {
                completeResidences++;
            }
            else if (filledFields > 0) {
                partialResidences++;
            }
            else {
                emptyResidences++;
            }
        });
    }
    return {
        totalFields: totalPossibleFields,
        mappedFields: pdfFieldMap.size,
        percentage: (pdfFieldMap.size / totalPossibleFields) * 100,
        residenceStats: {
            total: totalResidences,
            complete: completeResidences,
            partial: partialResidences,
            empty: emptyResidences
        }
    };
}
