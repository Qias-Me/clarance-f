/**
 * Encapsulated Field Parser
 *
 * Provides a clean, hierarchical approach to parsing field information:
 * Section → Subsection → Entry
 *
 * - Subsections can be letters (A-H, both upper and lowercase) or numbers
 * - Default values: subsection = -1, entry = -1 when not found
 * - Strict pattern matching to avoid false positives
 */

export interface FieldHierarchy {
  section: number;
  subsection: string | number | -1;
  entry: number | -1;
  confidence: number;
  matchDetails?: string;
}

export class EncapsulatedFieldParser {

  /**
   * Main entry point for parsing field hierarchy
   * @param fieldName The field name to parse
   * @param verbose Whether to include match details
   * @returns FieldHierarchy or null if no valid section found
   */
  public static parseFieldHierarchy(fieldName: string, verbose: boolean = false): FieldHierarchy | null {
    if (!fieldName || typeof fieldName !== 'string') {
      return null;
    }

    // 🎯 DEBUG: Track our target field
    const isTargetField = fieldName.includes("Section11[0].From_Datefield_Name_2[2]");

    if (isTargetField) {
      console.log(`\n🔍 ENCAPSULATED PARSER - parseFieldHierarchy DEBUG:`);
      console.log(`   Original Field Name: "${fieldName}"`);
    }

    const normalizedName = fieldName.toLowerCase().trim();

    if (isTargetField) {
      console.log(`   Normalized Field Name: "${normalizedName}"`);
      console.log(`   Trying parsing strategies in order...`);
    }

    // Try different parsing strategies in order of specificity

    // 1. Explicit section references (highest confidence)
    if (isTargetField) {
      console.log(`   1. Trying parseExplicitSection...`);
    }
    const explicitResult = this.parseExplicitSection(normalizedName, verbose);
    if (explicitResult) {
      if (isTargetField) {
        console.log(`   ✅ EXPLICIT SECTION SUCCESS: ${JSON.stringify(explicitResult)}`);
      }
      return explicitResult;
    }

    // 2. Form-based section patterns
    if (isTargetField) {
      console.log(`   2. Trying parseFormSection...`);
    }
    const formResult = this.parseFormSection(normalizedName, verbose);
    if (formResult) {
      if (isTargetField) {
        console.log(`   ✅ FORM SECTION SUCCESS: ${JSON.stringify(formResult)}`);
      }
      return formResult;
    }

    // 3. Section with subsection patterns
    if (isTargetField) {
      console.log(`   3. Trying parseSectionWithSubsection...`);
    }
    const subsectionResult = this.parseSectionWithSubsection(normalizedName, verbose);
    if (subsectionResult) {
      if (isTargetField) {
        console.log(`   ✅ SUBSECTION SUCCESS: ${JSON.stringify(subsectionResult)}`);
      }
      return subsectionResult;
    }

    // 4. Entry-based patterns
    if (isTargetField) {
      console.log(`   4. Trying parseSectionWithEntry...`);
    }
    const entryResult = this.parseSectionWithEntry(normalizedName, verbose);
    if (entryResult) {
      if (isTargetField) {
        console.log(`   ✅ ENTRY SUCCESS: ${JSON.stringify(entryResult)}`);
      }
      return entryResult;
    }

    if (isTargetField) {
      console.log(`   ❌ NO ENCAPSULATED PARSER MATCH: All parsing strategies failed`);
    }

    return null;
  }

  /**
   * Parse explicit section references like "section12", "Section_8", etc.
   */
  private static parseExplicitSection(fieldName: string, verbose: boolean): FieldHierarchy | null {
    // Pattern: section12, Section_8, section-21, etc.
    const explicitPattern = /\bsection[_\s-]*(\d+)\b/i;
    const match = fieldName.match(explicitPattern);

    if (match) {
      const section = parseInt(match[1]);
      if (section >= 1 && section <= 30) {

        // Try to extract subsection and entry from the same field
        const subsection = this.extractSubsection(fieldName, section);
        const entry = this.extractEntry(fieldName, section);

        return {
          section,
          subsection: subsection ?? -1,
          entry: entry ?? -1,
          confidence: 0.98,
          ...(verbose && { matchDetails: `Explicit section reference: ${match[0]}` })
        };
      }
    }

    return null;
  }

  /**
   * Parse form-based section patterns like "form1[0].Section16_1[0]"
   */
  private static parseFormSection(fieldName: string, verbose: boolean): FieldHierarchy | null {
    // 🎯 DEBUG: Track our target field
    const isTargetField = fieldName.includes("Section11[0].From_Datefield_Name_2[2]");

    if (isTargetField) {
      console.log(`\n🔍 ENCAPSULATED PARSER - parseFormSection DEBUG:`);
      console.log(`   Field Name: "${fieldName}"`);
    }

    // Pattern: form1[0].Section16_1[0] -> Section 16, Entry 1
    const formSectionEntryPattern = /form\d+\[\d+\]\.section(\d+)_(\d+)\[\d+\]/i;

    if (isTargetField) {
      console.log(`   Testing Form Section Entry Pattern: ${formSectionEntryPattern.source}`);
    }

    const entryMatch = fieldName.match(formSectionEntryPattern);

    if (isTargetField) {
      console.log(`   Form Section Entry Match: ${entryMatch ? `Found: ${entryMatch[0]}, captured: ${entryMatch[1]}, ${entryMatch[2]}` : 'No match'}`);
    }

    if (entryMatch) {
      const section = parseInt(entryMatch[1]);
      const entry = parseInt(entryMatch[2]);

      if (isTargetField) {
        console.log(`   Parsed Section: ${section}, Entry: ${entry}, valid range (1-30): ${section >= 1 && section <= 30}`);
      }

      if (section >= 1 && section <= 30) {
        const subsection = this.extractSubsection(fieldName, section);

        const result = {
          section,
          subsection: subsection ?? -1,
          entry,
          confidence: 0.97,
          ...(verbose && { matchDetails: `Form section entry pattern: ${entryMatch[0]}` })
        };

        if (isTargetField) {
          console.log(`   ✅ FORM SECTION ENTRY SUCCESS: ${JSON.stringify(result)}`);
        }

        return result;
      }
    }

    // Pattern: form1[0].Section16[0] -> Section 16
    const formSectionPattern = /form\d+\[\d+\]\.section(\d+)\[\d+\]/i;

    if (isTargetField) {
      console.log(`   Testing Form Section Pattern: ${formSectionPattern.source}`);
    }

    const sectionMatch = fieldName.match(formSectionPattern);

    if (isTargetField) {
      console.log(`   Form Section Match: ${sectionMatch ? `Found: ${sectionMatch[0]}, captured: ${sectionMatch[1]}` : 'No match'}`);
    }

    if (sectionMatch) {
      const section = parseInt(sectionMatch[1]);

      if (isTargetField) {
        console.log(`   Parsed Section: ${section}, valid range (1-30): ${section >= 1 && section <= 30}`);
      }

      if (section >= 1 && section <= 30) {
        const subsection = this.extractSubsection(fieldName, section);
        const entry = this.extractEntry(fieldName, section);

        const result = {
          section,
          subsection: subsection ?? -1,
          entry: entry ?? -1,
          confidence: 0.96,
          ...(verbose && { matchDetails: `Form section pattern: ${sectionMatch[0]}` })
        };

        if (isTargetField) {
          console.log(`   ✅ FORM SECTION SUCCESS: ${JSON.stringify(result)}`);
        }

        return result;
      }
    }

    if (isTargetField) {
      console.log(`   ❌ NO FORM SECTION MATCH: Field does not match any form section patterns`);
    }

    return null;
  }

  /**
   * Parse section with subsection patterns like "section21c", "Section12A"
   */
  private static parseSectionWithSubsection(fieldName: string, verbose: boolean): FieldHierarchy | null {
    // Pattern: section21c, Section12A, section13b2, etc.
    const sectionSubsectionPattern = /\bsection(\d+)([a-h])(\d*)\b/i;
    const match = fieldName.match(sectionSubsectionPattern);

    if (match) {
      const section = parseInt(match[1]);
      const subsection = match[2].toUpperCase(); // Normalize to uppercase
      const entryStr = match[3];

      if (section >= 1 && section <= 30) {
        const entry = entryStr ? parseInt(entryStr) : this.extractEntry(fieldName, section) ?? -1;

        return {
          section,
          subsection,
          entry,
          confidence: 0.95,
          ...(verbose && { matchDetails: `Section subsection pattern: ${match[0]}` })
        };
      }
    }

    return null;
  }

  /**
   * Parse section with entry patterns
   */
  private static parseSectionWithEntry(fieldName: string, verbose: boolean): FieldHierarchy | null {
    // Look for entry patterns in known sections
    const entryPrefixes = {
      12: ['sect12entry', 'section12entry', 's12entry'],
      13: ['sect13entry', 'section13entry', 's13entry'],
      21: ['sect21entry', 'section21entry', 's21entry']
    };

    for (const [sectionNum, prefixes] of Object.entries(entryPrefixes)) {
      const section = parseInt(sectionNum);

      for (const prefix of prefixes) {
        const entryPattern = new RegExp(`\\b${prefix}(\\d+)\\b`, 'i');
        const match = fieldName.match(entryPattern);

        if (match) {
          const entry = parseInt(match[1]);
          const subsection = this.extractSubsection(fieldName, section);

          return {
            section,
            subsection: subsection ?? -1,
            entry,
            confidence: 0.93,
            ...(verbose && { matchDetails: `Section entry pattern: ${match[0]}` })
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract subsection from field name (A-H, both cases, or numbers)
   */
  private static extractSubsection(fieldName: string, section: number): string | number | null {
    // Look for subsection patterns specific to the section
    const subsectionPatterns = [
      // Letter subsections: A, B, C, etc. (case insensitive)
      new RegExp(`section${section}([a-h])\\b`, 'i'),
      new RegExp(`\\bs${section}([a-h])\\b`, 'i'),
      new RegExp(`\\bsection${section}_([a-h])\\b`, 'i'),
      // Numeric subsections
      new RegExp(`section${section}\\.(\\d+)\\b`, 'i'),
      new RegExp(`section${section}_(\\d+)\\b`, 'i'),
      // Subsection keyword patterns
      /subsection([a-h]|\d+)\b/i,
    ];

    for (const pattern of subsectionPatterns) {
      const match = fieldName.match(pattern);
      if (match && match[1]) {
        const subsection = match[1];
        // If it's a letter, normalize to uppercase
        if (/^[a-h]$/i.test(subsection)) {
          return subsection.toUpperCase();
        }
        // If it's a number, return as number
        if (/^\d+$/.test(subsection)) {
          return parseInt(subsection);
        }
      }
    }

    return null;
  }

  /**
   * Extract entry number from field name
   */
  private static extractEntry(fieldName: string, section: number): number | null {
    // Look for entry patterns
    const entryPatterns = [
      // Entry patterns: entry1, entry2, etc.
      /\bentry(\d+)\b/i,
      // Numbered patterns: _1, _2, etc. (but be careful not to match array indices)
      new RegExp(`section${section}[a-z]*[_-](\\d+)(?!\\])`, 'i'),
      // TextField patterns: TextField11[0], TextField11[1], etc.
      /textfield\d+\[(\d+)\]/i,
    ];

    for (const pattern of entryPatterns) {
      const match = fieldName.match(pattern);
      if (match && match[1]) {
        const entry = parseInt(match[1]);
        if (entry >= 0) {
          // For TextField patterns, convert 0-based to 1-based
          if (pattern.source.includes('textfield')) {
            return entry + 1;
          }
          return entry;
        }
      }
    }

    return null;
  }
}
