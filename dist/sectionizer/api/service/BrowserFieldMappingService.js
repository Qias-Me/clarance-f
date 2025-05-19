import { ConfidenceLevel, FieldType } from '../enums/SF86DataEnums';
/**
 * Browser-compatible version of the FieldMappingService
 * This version doesn't rely on Node.js file system or URL modules
 */
export class BrowserFieldMappingService {
    commonFieldPatterns;
    constructor() {
        // Define common field patterns for recognition
        this.commonFieldPatterns = {
            name: /\b(name|full\s*name|first|last|middle|initial|suffix)\b/i,
            ssn: /\b(ssn|social\s*security|social\s*security\s*number)\b/i,
            dob: /\b(dob|birth|date\s*of\s*birth|birth\s*date|birth\s*day)\b/i,
            phone: /\b(phone|telephone|cell|mobile|contact\s*number)\b/i,
            email: /\b(email|e-mail|electronic\s*mail)\b/i,
            address: /\b(address|street|city|state|zip|postal|country|residence)\b/i,
            citizenship: /\b(citizen|citizenship|nationality|national|country\s*of\s*birth)\b/i,
            passport: /\b(passport|passport\s*number|passport\s*id|travel\s*document)\b/i,
            employment: /\b(employ|employer|employment|job|occupation|position|title|supervisor)\b/i,
            education: /\b(education|school|college|university|degree|diploma|major)\b/i,
            military: /\b(military|service|branch|rank|discharge|armed\s*forces)\b/i,
            reference: /\b(reference|refer|contact|person\s*who\s*knows\s*you)\b/i,
            financial: /\b(financ|money|debt|credit|loan|bankruptcy|economic)\b/i,
            legal: /\b(legal|law|crime|arrest|charge|offense|conviction|sentence)\b/i,
            medical: /\b(medic|health|treatment|condition|hospital|therapy|counseling)\b/i,
            substance: /\b(drug|alcohol|substance|addiction|abuse|controlled\s*substance)\b/i,
            foreign: /\b(foreign|abroad|overseas|international|travel|visit|country)\b/i,
            date: /\b(date|period|duration|from|to|start|end)\b/i,
            yesNo: /\b(yes|no|affirm|negative|positive|confirm|deny)\b/i
        };
    }
    /**
     * Stub method for browser compatibility
     * In browser context, we'll fetch mapping data from API instead of generating it
     */
    async generateFieldMappingReports() {
        console.log('Browser environment detected - field mapping reports would be fetched from API');
        return [];
    }
    /**
     * Maps physical attributes fields from field hierarchy to context
     */
    mapPhysicalAttributesFields(fieldHierarchy, physicalAttributesContext) {
        try {
            if (!fieldHierarchy || !physicalAttributesContext) {
                console.warn('Missing data for physical attributes mapping');
                return physicalAttributesContext;
            }
            // Deep clone to avoid modifying the original
            const updatedContext = JSON.parse(JSON.stringify(physicalAttributesContext));
            // Find all fields that could contain physical attributes data
            const fields = this.findRelevantFields(fieldHierarchy, 'physical');
            // Map height fields
            if (fields.some(f => this.matchesPattern(f.name, ['height', 'feet', 'inches']))) {
                const heightFt = this.findFieldValue(fields, ['height feet', 'feet', 'height_feet']);
                const heightIn = this.findFieldValue(fields, ['height inches', 'inches', 'height_inches']);
                if (heightFt !== null) {
                    updatedContext.heightFeet = heightFt;
                }
                if (heightIn !== null) {
                    updatedContext.heightInches = heightIn;
                }
            }
            // Map weight field
            const weight = this.findFieldValue(fields, ['weight', 'pounds', 'lbs']);
            if (weight !== null) {
                updatedContext.weight = weight;
            }
            // Map hair color
            const hairColor = this.findFieldValue(fields, ['hair', 'hair color', 'hair_color']);
            if (hairColor !== null) {
                updatedContext.hairColor = hairColor;
            }
            // Map eye color
            const eyeColor = this.findFieldValue(fields, ['eye', 'eye color', 'eye_color']);
            if (eyeColor !== null) {
                updatedContext.eyeColor = eyeColor;
            }
            // Map sex/gender
            const sex = this.findFieldValue(fields, ['sex', 'gender']);
            if (sex !== null) {
                updatedContext.sex = sex;
            }
            return updatedContext;
        }
        catch (error) {
            console.error('Error mapping physical attributes fields:', error);
            return physicalAttributesContext;
        }
    }
    /**
     * Find fields in the hierarchy that match certain patterns
     */
    findRelevantFields(fieldHierarchy, category) {
        if (!fieldHierarchy || typeof fieldHierarchy !== 'object') {
            return [];
        }
        const allFields = [];
        // Process each form in the hierarchy
        Object.values(fieldHierarchy).forEach((form) => {
            if (form && Array.isArray(form.fields)) {
                // Filter fields based on category patterns
                const relevantFields = form.fields.filter((field) => {
                    const fieldName = (field.name || '').toLowerCase();
                    const fieldLabel = (field.label || '').toLowerCase();
                    switch (category) {
                        case 'physical':
                            return this.matchesPattern(fieldName, ['height', 'weight', 'hair', 'eye', 'sex', 'gender', 'physical']) ||
                                this.matchesPattern(fieldLabel, ['height', 'weight', 'hair', 'eye', 'sex', 'gender', 'physical']);
                        case 'citizenship':
                            return this.matchesPattern(fieldName, ['citizen', 'nationality', 'country', 'birth']) ||
                                this.matchesPattern(fieldLabel, ['citizen', 'nationality', 'country', 'birth']);
                        case 'contact':
                            return this.matchesPattern(fieldName, ['phone', 'email', 'contact', 'address']) ||
                                this.matchesPattern(fieldLabel, ['phone', 'email', 'contact', 'address']);
                        default:
                            return false;
                    }
                });
                allFields.push(...relevantFields);
            }
        });
        return allFields;
    }
    /**
     * Check if a field name or label matches any of the provided patterns
     */
    matchesPattern(text, patterns) {
        if (!text)
            return false;
        text = text.toLowerCase();
        return patterns.some(pattern => {
            return text.includes(pattern.toLowerCase());
        });
    }
    /**
     * Find a field value by searching for pattern matches in field names/labels
     */
    findFieldValue(fields, patterns) {
        const matchingField = fields.find(field => {
            return this.matchesPattern(field.name, patterns) ||
                this.matchesPattern(field.label, patterns);
        });
        return matchingField ? matchingField.value : null;
    }
    /**
     * Maps citizenship fields from field hierarchy to context
     */
    mapCitizenshipFields(fieldHierarchy, citizenshipInfoContext) {
        try {
            if (!fieldHierarchy || !citizenshipInfoContext) {
                console.warn('Missing data for citizenship mapping');
                return citizenshipInfoContext;
            }
            // Deep clone to avoid modifying the original
            const updatedContext = JSON.parse(JSON.stringify(citizenshipInfoContext));
            // Find all fields that could contain citizenship data
            const fields = this.findRelevantFields(fieldHierarchy, 'citizenship');
            // Map citizenship fields
            // Implementation would map from fieldHierarchy to context
            return updatedContext;
        }
        catch (error) {
            console.error('Error mapping citizenship fields:', error);
            return citizenshipInfoContext;
        }
    }
    /**
     * Maps contact information fields from field hierarchy to context
     */
    mapContactFields(fieldHierarchy, contactInfoContext) {
        try {
            if (!fieldHierarchy || !contactInfoContext) {
                console.warn('Missing data for contact mapping');
                return contactInfoContext;
            }
            // Deep clone to avoid modifying the original
            const updatedContext = JSON.parse(JSON.stringify(contactInfoContext));
            // Find all fields that could contain contact data
            const fields = this.findRelevantFields(fieldHierarchy, 'contact');
            // Map contact fields
            // Implementation would map from fieldHierarchy to context
            return updatedContext;
        }
        catch (error) {
            console.error('Error mapping contact fields:', error);
            return contactInfoContext;
        }
    }
    /**
     * Utility method to get confidence level from numeric score
     */
    getConfidenceLevel(score) {
        if (score >= 0.8)
            return ConfidenceLevel.High;
        if (score >= 0.5)
            return ConfidenceLevel.Medium;
        return ConfidenceLevel.Low;
    }
    /**
     * Maps Selective Service fields from field hierarchy to context
     */
    mapSelectiveServiceFields(fieldHierarchy, serviceInfoContext) {
        try {
            if (!fieldHierarchy || !serviceInfoContext) {
                console.warn('Missing data for selective service mapping');
                return serviceInfoContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapSelectiveServiceFields in browser context');
            // Return the context unchanged
            return serviceInfoContext;
        }
        catch (error) {
            console.error('Error mapping selective service fields:', error);
            return serviceInfoContext;
        }
    }
    /**
     * Maps Mental Health fields from field hierarchy to context
     */
    mapMentalHealthFields(fieldHierarchy, mentalHealthContext) {
        try {
            if (!fieldHierarchy || !mentalHealthContext) {
                console.warn('Missing data for mental health mapping');
                return mentalHealthContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapMentalHealthFields in browser context');
            // Return the context unchanged
            return mentalHealthContext;
        }
        catch (error) {
            console.error('Error mapping mental health fields:', error);
            return mentalHealthContext;
        }
    }
    /**
     * Maps Investigations fields from field hierarchy to context
     */
    mapInvestigationsFields(fieldHierarchy, investigationsContext) {
        try {
            if (!fieldHierarchy || !investigationsContext) {
                console.warn('Missing data for investigations mapping');
                return investigationsContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapInvestigationsFields in browser context');
            // Return the context unchanged
            return investigationsContext;
        }
        catch (error) {
            console.error('Error mapping investigations fields:', error);
            return investigationsContext;
        }
    }
    /**
     * Maps Alcohol Use fields from field hierarchy to context
     */
    mapAlcoholFields(fieldHierarchy, alcoholUseContext) {
        try {
            if (!fieldHierarchy || !alcoholUseContext) {
                console.warn('Missing data for alcohol use mapping');
                return alcoholUseContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapAlcoholFields in browser context');
            // Return the context unchanged
            return alcoholUseContext;
        }
        catch (error) {
            console.error('Error mapping alcohol fields:', error);
            return alcoholUseContext;
        }
    }
    /**
     * Maps Finances fields from field hierarchy to context
     */
    mapFinancesFields(fieldHierarchy, financesContext) {
        try {
            if (!fieldHierarchy || !financesContext) {
                console.warn('Missing data for finances mapping');
                return financesContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapFinancesFields in browser context');
            // Return the context unchanged
            return financesContext;
        }
        catch (error) {
            console.error('Error mapping finances fields:', error);
            return financesContext;
        }
    }
    /**
     * Maps Technology Use fields from field hierarchy to context
     */
    mapTechnologyUseFields(fieldHierarchy, technologyContext) {
        try {
            if (!fieldHierarchy || !technologyContext) {
                console.warn('Missing data for technology use mapping');
                return technologyContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapTechnologyUseFields in browser context');
            // Return the context unchanged
            return technologyContext;
        }
        catch (error) {
            console.error('Error mapping technology fields:', error);
            return technologyContext;
        }
    }
    /**
     * Maps Association fields from field hierarchy to context
     */
    mapAssociationFields(fieldHierarchy, associationContext) {
        try {
            if (!fieldHierarchy || !associationContext) {
                console.warn('Missing data for association mapping');
                return associationContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapAssociationFields in browser context');
            // Return the context unchanged
            return associationContext;
        }
        catch (error) {
            console.error('Error mapping association fields:', error);
            return associationContext;
        }
    }
    /**
     * Maps Relatives fields from field hierarchy to context
     */
    mapRelativesFields(fieldHierarchy, relativesContext) {
        try {
            if (!fieldHierarchy || !relativesContext) {
                console.warn('Missing data for relatives mapping');
                return relativesContext;
            }
            // In the browser version, provide a simplified implementation
            console.log('Called mapRelativesFields in browser context');
            // Return the context unchanged
            return relativesContext;
        }
        catch (error) {
            console.error('Error mapping relatives fields:', error);
            return relativesContext;
        }
    }
}
