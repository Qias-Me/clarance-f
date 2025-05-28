import type { EnhancedField, MatchRule } from "../types.js";
import * as bridge from "./bridgeAdapter.js";
import fs from "fs/promises";
import path from "path";
import { ruleLoader } from "./rule-loader.js";
import { ruleExporter } from "./rule-exporter.js";
import chalk from "chalk";
import { extractSectionInfo, identifySectionByPage } from "./fieldParsing.js";
import { validateSectionCounts } from "./validation.js";
import type { SectionedField } from "./fieldGrouping.js";

/**
 * Self-healing rule generator for SF-86 field categorization
 * Analyzes unknown fields and proposes new rules to improve categorization
 */
export class RulesGenerator {
  private skipGenericPatterns: boolean;

  constructor(skipGenericPatterns: boolean = true) {
    this.skipGenericPatterns = skipGenericPatterns;
  }

  /**
   * Analyzes unknown fields and generates new rule candidates
   * @param unknownFields Array of uncategorized fields
   * @returns Map of section numbers to new rules
   */
  public async generateRuleCandidates(
    unknownFields: EnhancedField[]
  ): Promise<Map<string, MatchRule[]>> {
    // Initialize empty map to store rule candidates by section
    const ruleCandidates = new Map<string, MatchRule[]>();

    if (!unknownFields || unknownFields.length === 0) {
      console.log("No unknown fields to analyze.");
      return ruleCandidates;
    }

    console.log(
      `Analyzing ${unknownFields.length} unknown fields for rule generation...`
    );

    // Group fields by potential section using various heuristics
    const sectionGroups = this.groupFieldsByPotentialSection(unknownFields);

    // For each section group, generate rule candidates
    for (const [section, fields] of sectionGroups.entries()) {
      const candidates = this.generateCandidatesForSection(section, fields);
      if (candidates.length > 0) {
        ruleCandidates.set(section, candidates);
      }
    }

    return ruleCandidates;
  }

  /**
   * Groups unknown fields by their potential section
   * @param fields Array of unknown fields
   * @returns Map of section numbers to fields
   */
  private groupFieldsByPotentialSection(
    fields: EnhancedField[]
  ): Map<string, EnhancedField[]> {
    const groups = new Map<string, EnhancedField[]>();

    // Track fields that couldn't be assigned
    const unassigned: EnhancedField[] = [];

    for (const field of fields) {
      let assigned = false;

      // Method 1: Try to extract section number from field name
      const nameSection = this.extractSectionFromName(field.name);

      // Method 2: Try to determine section from page number if it has a page
      let pageSection: number | null = null;
      if (field.page && field.page > 0) {
        // Use identifySectionByPage directly imported from page categorization bridge
        pageSection = identifySectionByPage(field.page);
      }

      // Method 3: Try the extractSectionInfo from consolidated utility
      const sectionInfo = extractSectionInfo(field.name);
      const sectionFromInfo = sectionInfo ? String(sectionInfo.section) : null;

      // Method 4: Try using advancedCategorization if available
      let advancedResult = null;
      if (typeof bridge.advancedCategorization === "function") {
        const categorizedField = bridge.advancedCategorization(field);
        if (categorizedField && categorizedField.section > 0) {
          advancedResult = { section: categorizedField.section };
        }
      }

      // Use the most reliable detection method (prioritize name over page over sectionInfo over advanced)
      const sectionId =
        nameSection ||
        (pageSection ? String(pageSection) : null) ||
        sectionFromInfo ||
        (advancedResult ? String(advancedResult.section) : null);

      if (sectionId) {
        // Only assign to sections 1-30
        const sectionNum = parseInt(sectionId);
        if (sectionNum >= 1 && sectionNum <= 30) {
          // Add to the appropriate group
          if (!groups.has(sectionId)) {
            groups.set(sectionId, []);
          }
          groups.get(sectionId)!.push(field);
          assigned = true;
        }
      }

      if (!assigned) {
        unassigned.push(field);
      }
    }

    // Try second-pass assignment for unassigned fields using content analysis
    if (unassigned.length > 0) {
      this.assignFieldsByContent(unassigned, groups);
    }

    // Log group statistics
    console.log(
      `Grouped ${fields.length} fields into ${groups.size} potential sections`
    );
    for (const [section, sectionFields] of groups.entries()) {
      console.log(`  Section ${section}: ${sectionFields.length} fields`);
    }

    return groups;
  }

  /**
   * Extracts potential section number from field name
   * @param fieldName Field name to analyze
   * @returns Section number string or null if not found
   */
  private extractSectionFromName(fieldName: string): string | null {
    // Pattern 1: Look for explicit "section" followed by a number
    const explicitMatch = fieldName.match(/section(\d+)/i);
    if (explicitMatch && explicitMatch[1]) {
      const section = parseInt(explicitMatch[1]);
      if (section >= 1 && section <= 30) {
        return String(section);
      }
    }

    // Pattern 2: Look for pattern like "13A" at the start
    const prefixMatch = fieldName.match(/^(\d+)[a-z]/i);
    if (prefixMatch && prefixMatch[1]) {
      const section = parseInt(prefixMatch[1]);
      if (section >= 1 && section <= 30) {
        return String(section);
      }
    }

    // Pattern 3: Look for section notation with underscore/dash
    const separatorMatch = fieldName.match(/[_-](\d+)[a-z]?[_-]/i);
    if (separatorMatch && separatorMatch[1]) {
      const section = parseInt(separatorMatch[1]);
      if (section >= 1 && section <= 30) {
        return String(section);
      }
    }

    return null;
  }

  /**
   * Second-pass assignment using content similarity and clustering
   * @param unassigned Unassigned fields to process
   * @param groups Existing section groups to add to
   */
  private assignFieldsByContent(
    unassigned: EnhancedField[],
    groups: Map<string, EnhancedField[]>
  ): void {
    // Skip if no unassigned fields
    if (unassigned.length === 0) return;

    // For each unassigned field, try to find the most similar assigned group
    for (const field of unassigned) {
      let bestSection: string | null = null;
      let bestScore = 0;

      // Compare with fields in each group
      for (const [section, sectionFields] of groups.entries()) {
        if (sectionFields.length === 0) continue;

        // Calculate similarity based on field attributes
        const score = this.calculateSimilarityScore(field, sectionFields);

        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      }

      // Assign to best matching section if score is high enough
      if (bestSection && bestScore > 0.5) {
        groups.get(bestSection)!.push(field);
      } else {
        // Create fallback group for truly unknown fields
        const fallbackSection = "1"; // Default to section 1 as fallback
        if (!groups.has(fallbackSection)) {
          groups.set(fallbackSection, []);
        }
        groups.get(fallbackSection)!.push(field);
      }
    }
  }

  /**
   * Calculate similarity score between a field and a group of fields
   * @param field Field to compare
   * @param groupFields Group of fields to compare against
   * @returns Similarity score (0-1)
   */
  private calculateSimilarityScore(
    field: EnhancedField,
    groupFields: EnhancedField[]
  ): number {
    // Bail if no group fields
    if (groupFields.length === 0) return 0;

    // Simple scoring based on name similarity and page proximity
    let nameScore = 0;
    let pageScore = 0;

    // Find closest field by page number
    const fieldPage = field.page;
    if (fieldPage > 0) {
      const pageDistances = groupFields
        .filter((f) => f.page > 0)
        .map((f) => Math.abs(f.page - fieldPage));

      if (pageDistances.length > 0) {
        const minDistance = Math.min(...pageDistances);
        // Closer pages = higher score (max 30 pages away = 0 score)
        pageScore = Math.max(0, 1 - minDistance / 30);
      }
    }

    // Find name similarity by common substrings
    const fieldName = field.name.toLowerCase();

    for (const groupField of groupFields) {
      const groupFieldName = groupField.name.toLowerCase();

      // Simple prefix/suffix matching
      const prefixLength = this.commonPrefixLength(fieldName, groupFieldName);
      const suffixLength = this.commonSuffixLength(fieldName, groupFieldName);

      // Score based on largest common portion
      const maxCommonLength = Math.max(prefixLength, suffixLength);
      const nameSimScore =
        maxCommonLength / Math.min(fieldName.length, groupFieldName.length);

      // Track the highest name similarity
      nameScore = Math.max(nameScore, nameSimScore);
    }

    // Combine scores with weights (name is more important than page)
    return nameScore * 0.7 + pageScore * 0.3;
  }

  /**
   * Calculate length of common prefix between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Length of common prefix
   */
  private commonPrefixLength(str1: string, str2: string): number {
    const minLength = Math.min(str1.length, str2.length);
    let i = 0;
    while (i < minLength && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  /**
   * Calculate length of common suffix between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Length of common suffix
   */
  private commonSuffixLength(str1: string, str2: string): number {
    const minLength = Math.min(str1.length, str2.length);
    let i = 0;
    while (
      i < minLength &&
      str1[str1.length - 1 - i] === str2[str2.length - 1 - i]
    ) {
      i++;
    }
    return i;
  }

  /**
   * Generates rule candidates for a specific section with optimized pattern matching
   * @param section Section number or string
   * @param fields Fields to analyze
   * @returns Array of rule candidates
   */
  private generateCandidatesForSection(
    section: string,
    fields: EnhancedField[]
  ): MatchRule[] {
    if (fields.length === 0) return [];

    console.log(
      `Generating rules for section ${section} with ${fields.length} fields...`
    );

    // Convert section string to number for MatchRule objects
    const sectionNum = parseInt(section, 10);

    // Cache field data for performance
    const fieldNames = [...new Set(fields.map((f) => f.name))];
    const fieldValues = [
      ...new Set(
        fields
          .filter((f) => f.value && typeof f.value === "string")
          .map((f) => f.value as string)
      ),
    ];

    // Create lookup map for faster field access
    const fieldMap = new Map<string, EnhancedField[]>();
    fields.forEach((field) => {
      if (!field.name) return;
      if (!fieldMap.has(field.name)) {
        fieldMap.set(field.name, []);
      }
      fieldMap.get(field.name)!.push(field);
    });

    // Rule collections with different confidence levels
    const ruleCandidates: {
      explicit: MatchRule[]; // Highest confidence - explicit section references
      special: MatchRule[]; // High confidence - custom rules for special sections
      content: MatchRule[]; // Medium-high confidence - value-based
      prefix: MatchRule[]; // Medium confidence - common prefixes
      pattern: MatchRule[]; // Lower confidence - frequency-based patterns
    } = {
      explicit: [],
      special: [],
      content: [],
      prefix: [],
      pattern: [],
    };

    // 1. Exact section identifiers in field names (highest confidence)
    // Expanded pattern set to catch more variations
    const explicitPatterns: Array<[string, number]> = [
      // Core section identifiers - ordered by specificity (most specific first)
      [`section[_\\. ]*(0*${section}|${section})\\b`, 0.98],
      [`\\bsection${section}\\b`, 0.98],
      [`\\bsection${section}_`, 0.98],
      [`\\bs(0*${section}|${section})[_\\. ]`, 0.97],
      [`\\[${section}\\]`, 0.97],
      [`\\bform\\d*_section${section}\\b`, 0.97],
      [`\\bs${section}_`, 0.97],
      // Additional number formats
      [`section[_\\. ]*${parseInt(section).toString()}\\b`, 0.98], // Unpadded
      [`section[_\\. ]*${section.padStart(2, "0")}\\b`, 0.98], // Zero-padded
      // Extra variations
      [`\\b${section}\\.\\d+\\b`, 0.96], // Section.subsection format
      [`\\bsec${section}\\b`, 0.96], // Abbreviated form
      // Double-digit section support
      [`\\bsection${section}[a-z]\\b`, 0.95], // section10a
      [`\\bsection${section}\\d\\b`, 0.95], // section10-1
    ];

    // Track fields that have been matched by explicit patterns
    const matchedByExplicit = new Set<string>();

    // Process explicit patterns with optimized regex handling
    for (const [patternStr, confidence] of explicitPatterns) {
      try {
        const pattern = new RegExp(patternStr, "i");
        const matches = fieldNames.filter(
          (name) => !matchedByExplicit.has(name) && pattern.test(name)
        );

        if (matches.length > 0) {
          // Mark these fields as matched
          matches.forEach((m) => matchedByExplicit.add(m));

          ruleCandidates.explicit.push({
            pattern,
            section: sectionNum,
            confidence,
            description: `Fields explicitly matching ${pattern}`,
          });
        }
      } catch (error) {
        console.warn(`Invalid regex pattern for section ${section}: ${error}`);
      }
    }

    console.log(
      `Found ${matchedByExplicit.size} fields with explicit section ${section} patterns`
    );

    // 2. Special case rules for specific sections (domain knowledge)
    this.addSpecialCaseRulesForSection(section, fields, ruleCandidates.special);

    // 3. Generate content-based rules using field values
    ruleCandidates.content.push(
      ...this.createValueBasedPatterns(fields, sectionNum.toString())
    );

    // 4. Only proceed with more complex pattern generation if we don't have enough explicit matches
    const needsMorePatterns = matchedByExplicit.size < fieldNames.length * 0.5;

    if (needsMorePatterns && !this.skipGenericPatterns) {
      // CRITICAL: Skip generic pattern generation for ALL sections to prevent overly broad patterns
      // Only use explicit patterns and special case rules to avoid "^form1[0]" type patterns
      console.log(`⚠️  Skipping generic pattern generation for section ${sectionNum} to prevent overly broad patterns like "^form1[0]"`);

      // NOTE: We completely disable prefix-based and pattern-based rules that create overly broad patterns
      // This prevents the generation of patterns that match across multiple sections

      // 7. Add rules based on field values
      if (fieldValues.length > 0) {
        // Look for section number in field values
        const sectionInValuePattern = new RegExp(
          `(section|sect\\.?)\\s*(0*${section}|${section})\\b`,
          "i"
        );
        const fieldsWithSectionInValue = fields.filter(
          (f) =>
            typeof f.value === "string" &&
            sectionInValuePattern.test(f.value as string)
        );

        if (fieldsWithSectionInValue.length > 0) {
          const namePatterns = new Set<string>();
          fieldsWithSectionInValue.forEach((field) => {
            if (field.name && !matchedByExplicit.has(field.name)) {
              const escapedName = this.escapeRegExp(field.name);
              if (!namePatterns.has(escapedName)) {
                namePatterns.add(escapedName);
                ruleCandidates.content.push({
                  pattern: new RegExp(`^${escapedName}$`, "i"),
                  section: sectionNum,
                  confidence: 0.92,
                  description: `Field with section ${section} in its value`,
                });
              }
            }
          });
        }
      }
    }

    // 8. Handle subsections if present
    this.addSubsectionPatterns(
      section,
      fieldNames,
      sectionNum,
      ruleCandidates.explicit
    );

    // Combine all rule types with priority order (higher confidence rules first)
    const allRules = [
      ...ruleCandidates.explicit,
      ...ruleCandidates.special,
      ...ruleCandidates.content,
      ...ruleCandidates.prefix,
      ...ruleCandidates.pattern,
    ];

    // Deduplicate patterns
    const uniqueRules = this.deduplicatePatterns(allRules);
    console.log(
      `Generated ${uniqueRules.length} unique rule candidates for section ${section}`
    );

    return uniqueRules;
  }

  /**
   * Generate prefix-based rules from field names
   * @param fieldNames Array of field names
   * @param totalFieldCount Total number of fields for calculating confidence
   * @param sectionNum Section number
   * @param prefixRules Array to store generated rules
   */
  private generatePrefixBasedRules(
    fieldNames: string[],
    totalFieldCount: number,
    sectionNum: number,
    prefixRules: MatchRule[]
  ): void {
    // Analyze field name prefixes with optimized approach
    const prefixMap = new Map<string, number>();
    const minPrefixLen = 4; // Minimum prefix length to consider
    const maxPrefixLen = 15; // Maximum prefix length to avoid over-fitting

    // Count prefixes with single iteration
    for (const name of fieldNames) {
      // Only process prefixes of reasonable length
      for (
        let i = minPrefixLen;
        i <= Math.min(name.length, maxPrefixLen);
        i++
      ) {
        const prefix = name.substring(0, i);
        prefixMap.set(prefix, (prefixMap.get(prefix) || 0) + 1);
      }
    }

    // Filter and convert to rules
    const commonPrefixThreshold = Math.max(
      3,
      Math.floor(totalFieldCount * 0.05)
    );

    // Skip common generic prefixes that would match too many fields across sections
    const skipPrefixes = new Set([
      "form",
      "form1",
      "form1[0]",
      "form1[0].",
      "field",
      "input",
      "sect",
      "cont",
      "text",
      "data",
      // Additional overly broad patterns that should never be generated
      "radio",
      "checkbox",
      "dropdown",
      "date",
      "textfield",
      "button",
      "list",
      "area",
      "name",
      "value",
      "label",
      "type",
      "id",
      "class",
      "style",
      "div",
      "span",
      "p",
      "h1",
      "h2",
      "h3",
      "table",
      "row",
      "cell",
      "column",
      "header",
      "footer",
      "main",
      "section",
      "article",
      "aside",
      "nav",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "video",
      "audio",
      "canvas",
      "svg",
      "path",
      "g",
      "rect",
      "circle",
      "line",
      "polygon",
      "polyline",
      "ellipse",
      "text",
      "tspan",
      "defs",
      "use",
      "symbol",
      "marker",
      "pattern",
      "clipPath",
      "mask",
      "filter",
      "feGaussianBlur",
      "feOffset",
      "feFlood",
      "feComposite",
      "feMorphology",
      "feColorMatrix",
      "animate",
      "animateTransform",
      "animateMotion",
      "set",
      "switch",
      "foreignObject",
      "metadata",
      "title",
      "desc"
    ]);

    // Generate rules from significant prefixes
    for (const [prefix, count] of prefixMap.entries()) {
      if (count >= commonPrefixThreshold && prefix.length >= minPrefixLen) {
        // Skip if it's a common generic prefix
        if (skipPrefixes.has(prefix.toLowerCase())) continue;

        // Enhanced check: skip any patterns that start with form1[0] as they are too broad
        if (prefix.match(/^form1\[0\]/i)) continue;

        // Additional check: skip other overly broad patterns that would match across sections
        if (prefix.match(/^form\d*\[/i)) continue; // Skip any form[N] patterns

        // Skip patterns that are too generic (high coverage across all fields)
        const coverage = count / totalFieldCount;
        if (coverage > 0.8) continue; // Skip if matches more than 80% of fields

        // Additional check: Skip patterns that are known to be overly broad
        const lowerPrefix = prefix.toLowerCase();
        if (lowerPrefix.includes('text') ||
            lowerPrefix.includes('radio') ||
            lowerPrefix.includes('dropdown') ||
            lowerPrefix.includes('date') ||
            lowerPrefix.includes('checkbox') ||
            lowerPrefix.includes('button') ||
            lowerPrefix.includes('field') ||
            lowerPrefix.includes('input') ||
            lowerPrefix.length < 8) { // Very short patterns are usually too broad
          continue;
        }

        // Calculate confidence based on prevalence and specificity
        const specificity = Math.min(1, prefix.length / 10); // Longer prefixes are more specific
        const confidence = 0.85 + coverage * 0.05 + specificity * 0.05;

        prefixRules.push({
          pattern: new RegExp(`^${this.escapeRegExp(prefix)}`, "i"),
          section: sectionNum,
          confidence: Math.min(0.93, confidence),
          description: `Fields starting with '${prefix}' (${count} fields, ${(
            coverage * 100
          ).toFixed(1)}%)`,
        });
      }
    }
  }

  /**
   * Generate pattern-based rules from field names
   * @param fieldNames All field names
   * @param alreadyMatched Set of field names already matched by explicit patterns
   * @param sectionNum Section number
   * @param patternRules Array to store generated pattern rules
   * @param existingRules Array of existing rules to check for redundancy
   */
  private generatePatternBasedRules(
    fieldNames: string[],
    alreadyMatched: Set<string>,
    sectionNum: number,
    patternRules: MatchRule[],
    existingRules: MatchRule[]
  ): void {
    // Focus on unmatched fields
    const unmatchedFields = fieldNames.filter(
      (name) => !alreadyMatched.has(name)
    );
    if (unmatchedFields.length === 0) return;

    // Extract distinctive patterns with more sophisticated heuristics
    const patterns = this.extractDistinctivePatterns(unmatchedFields);

    // Test each pattern for coverage and redundancy
    for (const pattern of patterns) {
      // Find fields this pattern would match
      const matchingFields = unmatchedFields.filter((name) =>
        pattern.test(name)
      );

      // Only use patterns with good coverage that don't duplicate existing rules
      const hasGoodCoverage =
        matchingFields.length >= Math.max(5, unmatchedFields.length * 0.1);
      const isNotRedundant = !existingRules.some((r) =>
        this.arePatternsEquivalent(r.pattern, pattern)
      );

      if (hasGoodCoverage && isNotRedundant) {
        // Calculate confidence based on specificity and coverage
        const patternSpecificity = pattern.source.length / 20;
        const coverage = matchingFields.length / unmatchedFields.length;
        const confidence = 0.85 + patternSpecificity * 0.01 + coverage * 0.01;

        patternRules.push({
          pattern,
          section: sectionNum,
          confidence: Math.min(0.87, confidence),
          description: `Pattern matching ${
            matchingFields.length
          } unmatched fields (${(coverage * 100).toFixed(1)}%)`,
        });
      }
    }

    // If we still need more coverage, add specific field name patterns
    if (patternRules.length < 3 && unmatchedFields.length > 10) {
      // Find most frequent field patterns using tokenization
      const frequentTokens = this.findFrequentTokens(unmatchedFields);

      for (const [token, count] of frequentTokens.entries()) {
        if (count >= 3 && token.length >= 5) {
          const coverage = count / unmatchedFields.length;

          // Skip overly broad tokens
          const lowerToken = token.toLowerCase();
          if (lowerToken.includes('text') ||
              lowerToken.includes('radio') ||
              lowerToken.includes('dropdown') ||
              lowerToken.includes('date') ||
              lowerToken.includes('checkbox') ||
              lowerToken.includes('button') ||
              lowerToken.includes('field') ||
              lowerToken.includes('input') ||
              lowerToken.includes('form1[0]') ||
              lowerToken.match(/^form\d*\[/) ||
              coverage > 0.7) { // Skip if matches more than 70% of unmatched fields
            continue;
          }

          patternRules.push({
            pattern: new RegExp(this.escapeRegExp(token), "i"),
            section: sectionNum,
            confidence: 0.83 + coverage * 0.02,
            description: `Common token: '${token}' (${count} fields)`,
          });
        }
      }
    }
  }

  /**
   * Add subsection patterns for field grouping
   * @param section Section number string
   * @param fieldNames Field names
   * @param sectionNum Section number as a number
   * @param patterns Array to add patterns to
   */
  private addSubsectionPatterns(
    section: string,
    fieldNames: string[],
    sectionNum: number,
    patterns: MatchRule[]
  ): void {
    // Find subsection patterns more efficiently
    const subsections = this.extractSubsectionPatterns(section, fieldNames);

    for (const [subsection, pattern] of subsections) {
      patterns.push({
        pattern,
        section: sectionNum,
        subsection,
        confidence: 0.95,
        description: `Subsection ${subsection} field pattern`,
      });
    }
  }

  /**
   * Find frequent tokens in field names for pattern generation
   * @param fieldNames Array of field names
   * @returns Map of token to frequency
   */
  private findFrequentTokens(fieldNames: string[]): Map<string, number> {
    const tokenCounts = new Map<string, number>();

    for (const name of fieldNames) {
      // Tokenize by common separators
      const tokens = name.split(/[\[\]\._\-\s]+/).filter((t) => t.length >= 3);

      // Count each token
      for (const token of tokens) {
        tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
      }
    }

    // Return only tokens that appear multiple times and are not overly broad
    return new Map(
      [...tokenCounts.entries()]
        .filter(([token, count]) => {
          const lowerToken = token.toLowerCase();
          return count >= 2 &&
                 !lowerToken.includes('form1') &&
                 !lowerToken.includes('form[') &&
                 lowerToken !== 'form' &&
                 lowerToken !== '0';
        })
        .sort(([tokenA, countA], [tokenB, countB]) => countB - countA)
        .slice(0, 10)
    ); // Take only top 10 tokens
  }

  /**
   * Extract distinctive patterns from field names
   * @param fieldNames Array of field names
   * @returns Array of regex patterns
   */
  private extractDistinctivePatterns(fieldNames: string[]): RegExp[] {
    if (fieldNames.length < 3) return [];

    const patterns: RegExp[] = [];

    // Look for common components
    const parts: string[][] = fieldNames.map((name) => {
      // Split by common separators
      return name.split(/[\[\]\.\_\-]/);
    });

    // Count part frequencies
    const partCounts: Record<string, number> = {};

    for (const nameParts of parts) {
      for (const part of nameParts) {
        if (part.length > 0) {
          partCounts[part] = (partCounts[part] || 0) + 1;
        }
      }
    }

    // Find significant parts (appear in at least 30% of fields)
    const minCount = Math.max(3, Math.ceil(fieldNames.length * 0.3));
    const significantParts = Object.entries(partCounts)
      .filter(([part, count]) => count >= minCount && part.length >= 3)
      .filter(([part]) => {
        // Filter out overly broad patterns
        const lowerPart = part.toLowerCase();
        return !lowerPart.includes('form1') &&
               !lowerPart.includes('form[') &&
               !lowerPart.includes('text') &&
               !lowerPart.includes('radio') &&
               !lowerPart.includes('dropdown') &&
               !lowerPart.includes('date') &&
               !lowerPart.includes('checkbox') &&
               !lowerPart.includes('button') &&
               !lowerPart.includes('field') &&
               !lowerPart.includes('input') &&
               lowerPart !== 'form' &&
               lowerPart !== '0' &&
               lowerPart.length >= 5; // Require minimum length for specificity
      })
      .map(([part]) => part);

    // Create regex patterns for each significant part
    for (const part of significantParts) {
      const escapedPart = this.escapeRegExp(part);
      patterns.push(new RegExp(`${escapedPart}`, "i"));
    }

    return patterns;
  }

  /**
   * Deduplicate a list of match rules
   * @param rules Array of rules to deduplicate
   * @returns Deduplicated rules
   */
  private deduplicatePatterns(rules: MatchRule[]): MatchRule[] {
    // Use pattern source and confidence as deduplication key
    const uniqueRules = new Map<string, MatchRule>();

    for (const rule of rules) {
      const key = `${rule.pattern.source}|${rule.subsection || "_default"}`;

      // If we have this pattern already, keep the one with higher confidence
      if (uniqueRules.has(key)) {
        const existing = uniqueRules.get(key)!;
        if ((rule.confidence || 0) > (existing.confidence || 0)) {
          uniqueRules.set(key, rule);
        }
      } else {
        uniqueRules.set(key, rule);
      }
    }

    // Return unique rules sorted by confidence (highest first)
    return Array.from(uniqueRules.values()).sort(
      (a, b) => (b.confidence || 0) - (a.confidence || 0)
    );
  }

  /**
   * Remove conflicting generic rules that could cause cross-section contamination
   * @param allRules Map of section numbers to their rules
   * @returns Map with conflicting rules removed
   */
  public removeConflictingGenericRules(allRules: Map<number, MatchRule[]>): Map<number, MatchRule[]> {
    console.log("🔍 Detecting and removing conflicting generic rules...");

    // Track patterns that appear in multiple sections with same confidence
    const patternTracker = new Map<string, Array<{section: number, confidence: number, rule: MatchRule}>>();

    // First pass: collect all patterns and their sections
    for (const [section, rules] of allRules.entries()) {
      for (const rule of rules) {
        const patternKey = `${rule.pattern.source}_${rule.pattern.flags}`;

        if (!patternTracker.has(patternKey)) {
          patternTracker.set(patternKey, []);
        }

        patternTracker.get(patternKey)!.push({
          section,
          confidence: rule.confidence || 0,
          rule
        });
      }
    }

    // Second pass: identify conflicting patterns
    const conflictingPatterns = new Set<string>();
    const genericPatternsToRemove = new Set<string>();

    for (const [patternKey, occurrences] of patternTracker.entries()) {
      // Check if it's a generic pattern (regardless of how many sections it appears in)
      const pattern = occurrences[0].rule.pattern.source;
      const isGenericPattern =
        // CRITICAL: Remove ALL form1[0] patterns - these are overly broad
        pattern.startsWith('^form1[0]') ||
        pattern.startsWith('^form1\\[0\\]') ||
        pattern === '^form1[0]' ||
        pattern === '^form1\\[0\\]' ||
        pattern.includes('form1[0]') ||
        pattern.includes('form1\\[0\\]') ||
        // Remove other overly broad patterns
        pattern === 'text' ||
        pattern === 'dropdown' ||
        pattern === 'radio' ||
        pattern === 'date' ||
        pattern === 'marital' ||
        pattern === 'spouse' ||
        pattern === 'partner' ||
        pattern.match(/^form\d*\[/) ||
        pattern.match(/^\\^form\d*\\?\[/) ||
        pattern.match(/^sect\d+$/) ||
        pattern.match(/^section\d+$/) ||
        // Additional overly broad patterns that should never be section-specific
        pattern.length < 8 || // Very short patterns are usually too broad
        (pattern.includes('form1') && pattern.length < 15) || // Short form1 patterns
        // Remove patterns that match too broadly across field types
        (pattern.includes('text') && pattern.length < 12) ||
        (pattern.includes('radio') && pattern.length < 12) ||
        (pattern.includes('dropdown') && pattern.length < 12) ||
        (pattern.includes('date') && pattern.length < 12);

      if (isGenericPattern) {
        // CRITICAL: Do NOT remove field-clusterer patterns - they are carefully crafted
        const isFieldClustererPattern =
          pattern.includes('Sections7-9') ||
          pattern.includes('Section11') ||
          pattern.includes('section_12') ||
          pattern.includes('Section14_1') ||
          pattern.includes('Section15') ||
          pattern.includes('Section16') ||
          pattern.includes('Section17') ||
          pattern.includes('Section18') ||
          pattern.includes('Section20') ||
          pattern.includes('Section29') ||
          pattern.includes('Section30') ||
          pattern.includes('SSN[');

        if (isFieldClustererPattern) {
          console.log(`✅ Keeping field-clusterer pattern: ${pattern}`);
          console.log(`   This is a carefully crafted pattern that should not be removed`);
          continue; // Keep this pattern
        }

        console.log(`❌ Found overly broad generic pattern: ${pattern}`);
        console.log(`   Appears in sections: ${occurrences.map(o => o.section).join(', ')}`);
        console.log(`   Removing this pattern as it's too generic for section-specific rules`);

        conflictingPatterns.add(patternKey);
        genericPatternsToRemove.add(pattern);
      }
      // Also check for patterns that appear in multiple sections with similar confidence
      else if (occurrences.length > 1) {
        const confidences = occurrences.map(o => o.confidence);
        const minConf = Math.min(...confidences);
        const maxConf = Math.max(...confidences);

        if (maxConf - minConf <= 0.1) {
          console.log(`❌ Found conflicting multi-section pattern: ${pattern}`);
          console.log(`   Appears in sections: ${occurrences.map(o => o.section).join(', ')}`);
          console.log(`   Confidence range: ${minConf} - ${maxConf}`);

          conflictingPatterns.add(patternKey);
          genericPatternsToRemove.add(pattern);
        }
      }
    }

    // Third pass: remove conflicting generic patterns
    const cleanedRules = new Map<number, MatchRule[]>();
    let totalRemoved = 0;

    for (const [section, rules] of allRules.entries()) {
      const filteredRules = rules.filter(rule => {
        const patternKey = `${rule.pattern.source}_${rule.pattern.flags}`;
        const shouldRemove = conflictingPatterns.has(patternKey);

        if (shouldRemove) {
          console.log(`🗑️  Removing conflicting rule from section ${section}: ${rule.pattern.source} (confidence: ${rule.confidence})`);
          totalRemoved++;
        }

        return !shouldRemove;
      });

      cleanedRules.set(section, filteredRules);
    }

    console.log(`✅ Removed ${totalRemoved} conflicting generic rules from ${conflictingPatterns.size} patterns`);

    if (genericPatternsToRemove.size > 0) {
      console.log("📋 Removed patterns:", Array.from(genericPatternsToRemove).join(', '));
    }

    return cleanedRules;
  }

  /**
   * Add special case rules for specific sections based on known content
   * @param section Section number string
   * @param fields Fields in the section
   * @param rules Array to add rules to
   */
  private addSpecialCaseRulesForSection(
    section: string,
    fields: EnhancedField[],
    rules: MatchRule[]
  ): void {
    // Convert section to number for MatchRule
    const sectionNum = parseInt(section, 10);

    // Map of section numbers to special case patterns
    // These are hand-crafted patterns based on knowledge of the form
    const specialCases: Record<string, Array<[RegExp, string, number]>> = {
      // Format: [pattern, description, confidence]
      "10": [
        [/foreign.*contacts/i, "Foreign contacts fields", 0.95],
        [/foreign.*national/i, "Foreign national fields", 0.95],
        [/foreign.*associate/i, "Foreign associate fields", 0.95],
      ],
      "11": [
        [/Section11/i, "Fields containing 'Section11' belong to section 11", 0.99],
        [/\.Section11\[/i, "Fields with .Section11[ pattern", 0.99],
        [/residence/i, "Residence fields", 0.90],
        [/address/i, "Address fields", 0.85],
        [/lived/i, "Where you lived fields", 0.85],
        [/landlord/i, "Landlord fields", 0.90],
        [/verifier/i, "Verifier fields", 0.90],
      ],
      "8": [
        [/passport/i, "Passport fields", 0.95],
        [/travel.*document/i, "Travel document fields", 0.9],
        [/document.*number/i, "Document number fields", 0.85],
        [/issued.*date/i, "Document issued date fields", 0.85],
        [/expir.*date/i, "Document expiration date fields", 0.85],
        [/country.*issu/i, "Country of issuance fields", 0.85],
      ],
      "12": [
        [/education/i, "Education fields", 0.95],
        [/school/i, "School fields", 0.95],
        [/degree/i, "Degree fields", 0.9],
        [/college/i, "College fields", 0.9],
        [/university/i, "University fields", 0.9],
        [/diploma/i, "Diploma fields", 0.85],
        [/graduate/i, "Graduate fields", 0.85],
      ],
      "13": [
        [/employment.*record/i, "Employment record fields", 0.95],
        [/employer/i, "Employer fields", 0.9],
        [/employment/i, "Employment fields", 0.9],
        [/job/i, "Job fields", 0.85],
        [/work/i, "Work fields", 0.8],
        [/occupation/i, "Occupation fields", 0.85],
      ],
      "16": [
        [/financial.*record/i, "Financial record fields", 0.95],
        [/bankruptcy/i, "Bankruptcy fields", 0.95],
        [/debt/i, "Debt fields", 0.9],
      ],
      "18": [
        [/foreign.*travel/i, "Foreign travel fields", 0.95],
        [/travel/i, "Travel fields", 0.9],
        [/passport/i, "Passport fields", 0.95],
      ],
      "24": [
        [/substance.*abuse/i, "Substance abuse fields", 0.95],
        [/drug/i, "Drug use fields", 0.9],
        [/alcohol/i, "Alcohol use fields", 0.9],
      ],
      "26": [
        [/financial.*record/i, "Financial record fields", 0.95],
        [/financial.*conflict/i, "Financial conflict fields", 0.95],
      ],
      "27": [
        [/information.*technology/i, "IT fields", 0.95],
        [/computer/i, "Computer related fields", 0.9],
        [/hacking/i, "Hacking related fields", 0.95],
        [/unauthorized.*access/i, "Unauthorized access fields", 0.95],
      ],
    };

    // Add any special case patterns for this section
    if (specialCases[section]) {
      console.log(
        `Adding ${specialCases[section].length} special case patterns for section ${section}`
      );

      for (const [pattern, description, confidence] of specialCases[section]) {
        rules.push({
          pattern,
          section: sectionNum,
          confidence,
          description,
        });
      }
    }

    // Add any additional patterns based on field examination
    const fieldValues = fields
      .filter((f) => f.value && typeof f.value === "string")
      .map((f) => f.value as string);

    // Look for common topics in field values
    const topics = this.extractCommonTopics(fieldValues);
    for (const [topic, count] of Object.entries(topics)) {
      if (count >= 3) {
        rules.push({
          pattern: new RegExp(this.escapeRegExp(topic), "i"),
          section: sectionNum,
          confidence: 0.88,
          description: `Fields related to '${topic}' (${count} occurrences)`,
        });
      }
    }
  }

  /**
   * Find most frequent fields in a list of field names
   * @param fieldNames Array of field names
   * @param limit Max number to return
   * @returns Array of most frequent field names
   */
  private findMostFrequentFields(
    fieldNames: string[],
    limit: number
  ): string[] {
    // Get fields that appear multiple times
    const counts: Record<string, number> = {};

    for (const name of fieldNames) {
      // Create simplified versions of the names for comparison
      const simpleName = name
        .toLowerCase()
        .replace(/\d+/g, "N") // Replace numbers with N
        .replace(/[_\-\.]/g, "_"); // Normalize separators

      counts[simpleName] = (counts[simpleName] || 0) + 1;
    }

    // Sort by frequency
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name]) => name);

    return sorted;
  }

  /**
   * Extract common topics from field values
   * @param values Array of field values
   * @returns Map of topics to frequency
   */
  private extractCommonTopics(values: string[]): Record<string, number> {
    const topics: Record<string, number> = {};

    // List of common topics that might be useful for categorization
    const topicTerms = [
      "employment",
      "education",
      "travel",
      "residence",
      "citizenship",
      "criminal",
      "drug",
      "alcohol",
      "financial",
      "foreign",
      "military",
      "mental",
      "security",
      "personal",
      "identity",
      "medical",
      "legal",
      "contact",
      "reference",
      "investigation",
      "background",
      "clearance",
      "psychological",
      "technology",
      "computer",
      "internet",
      "social",
      "media",
      "marriage",
      "family",
      "relative",
      "spouse",
      "dependent",
      "address",
      "history",
      "record",
      "activity",
      "government",
      "classified",
      "sensitive",
      "training",
      "certificate",
      "license",
      "passport",
      "visa",
      "clearance",
    ];

    // Count occurrences of these topics in values
    for (const value of values) {
      if (!value) continue;

      const lowerValue = value.toLowerCase();
      for (const term of topicTerms) {
        if (lowerValue.includes(term)) {
          topics[term] = (topics[term] || 0) + 1;
        }
      }
    }

    return topics;
  }

  /**
   * Extract subsection patterns from field names
   * @param section Main section number
   * @param fieldNames Field names to analyze
   * @returns Map of subsection identifier to pattern
   */
  private extractSubsectionPatterns(
    section: string,
    fieldNames: string[]
  ): Map<string, RegExp> {
    const patterns = new Map<string, RegExp>();

    // Common pattern: section10a, section10b, etc.
    const subsectionPattern = new RegExp(`section${section}([a-z]\\d*)`, "i");
    const subsections = new Set<string>();

    for (const name of fieldNames) {
      const match = name.match(subsectionPattern);
      if (match && match[1]) {
        subsections.add(match[1].toUpperCase());
      }
    }

    // Create patterns for each subsection
    for (const sub of subsections) {
      patterns.set(sub, new RegExp(`section${section}${sub}`, "i"));
    }

    // Also look for X.Y.Z notation
    const dotNotationPattern = new RegExp(`${section}\\.([a-z\\d]+)`, "i");
    for (const name of fieldNames) {
      const match = name.match(dotNotationPattern);
      if (match && match[1]) {
        const sub = match[1].toUpperCase();
        patterns.set(sub, new RegExp(`${section}\\.${match[1]}`, "i"));
      }
    }

    return patterns;
  }

  /**
   * Creates patterns based on field values
   * @param fields Fields to analyze
   * @param section Section ID string
   * @returns Array of rule candidates
   */
  private createValueBasedPatterns(
    fields: EnhancedField[],
    section: string
  ): MatchRule[] {
    const patterns: MatchRule[] = [];
    const sectionNum = parseInt(section, 10);

    // Find fields with distinctive values
    const fieldsWithValues = fields.filter(
      (f) => f.value && typeof f.value === "string" && f.value.length > 0
    );

    // Look for fields with section number in their value
    const sectionInValue = fieldsWithValues.filter((f) => {
      if (typeof f.value !== "string") return false;
      return (
        f.value.includes(`Section ${section}`) ||
        f.value.includes(`section ${section}`)
      );
    });

    if (sectionInValue.length > 0) {
      // Create pattern based on field name
      for (const field of sectionInValue) {
        patterns.push({
          pattern: new RegExp(this.escapeRegExp(field.name), "i"),
          section: sectionNum,
          confidence: 0.9,
          description: `Field with section ${section} in its value`,
        });
      }
    }

    return patterns;
  }

  /**
   * Properly escapes all special regex characters in a string
   * @param string String to escape
   * @returns Escaped string safe for use in RegExp constructor
   */
  private escapeRegExp(string: string): string {
    // Return an empty string if input is undefined or null
    if (!string) return "";

    // Escape all special regex characters:
    // . * + ? ^ $ { } ( ) | [ ] \ /
    // Use single escaping for RegExp constructor - double escaping causes issues
    return string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  }

  /**
   * Checks if two regex patterns are equivalent
   * @param pattern1 First pattern
   * @param pattern2 Second pattern
   * @returns True if patterns are equivalent
   */
  private arePatternsEquivalent(pattern1: RegExp, pattern2: RegExp): boolean {
    // Quick equality check
    if (pattern1.toString() === pattern2.toString()) {
      return true;
    }

    // For more sophisticated comparison, normalize patterns
    const norm1 = pattern1.source.replace(/\\\s/g, " ").replace(/\s+/g, "\\s+");
    const norm2 = pattern2.source.replace(/\\\s/g, " ").replace(/\s+/g, "\\s+");

    // Simple pattern similarity check
    const similarity = this.patternSimilarity(norm1, norm2);
    return similarity > 0.9;
  }

  /**
   * Calculate similarity between two pattern strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  private patternSimilarity(str1: string, str2: string): number {
    // Very basic similarity - ratio of common characters
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Count common characters
    let common = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) {
        common++;
      }
    }

    // Calculate similarity
    return common / Math.max(s1.length, s2.length);
  }

  /**
   * Updates rule files with new candidates
   * @param ruleCandidates Map of section numbers to new rules
   * @param generateJson Whether to also generate JSON files (for backwards compatibility)
   * @returns Promise resolving to array of updated section names
   */
  public async updateRuleFiles(
    ruleCandidates: Map<string, MatchRule[]>,
    generateJson: boolean = true
  ): Promise<string[]> {
    if (!ruleCandidates || ruleCandidates.size === 0) {
      console.log("No rule candidates to update.");
      return [];
    }

    const updatedSections: string[] = [];
    let updatedRulesCount = 0;

    // Process each section's rule candidates
    for (const [section, rules] of ruleCandidates.entries()) {
      if (rules.length === 0) continue;

      console.log(
        `Updating rules for section ${section} with ${rules.length} candidates...`
      );

      try {
        // Ensure section is a valid number between 1-30
        const sectionNum = parseInt(section, 10);

        if (isNaN(sectionNum) || sectionNum < 1 || sectionNum > 30) {
          console.warn(`Invalid section number: ${section}, skipping.`);
          continue;
        }

        // // Get section name from structure or default
        // const sectionName = `Section ${section}`;

        // Export rules to TypeScript file
        const tsPath = await ruleExporter.exportRulesToTypeScript(
          sectionNum,
          rules
        );
        console.log(`Updated TypeScript rule file: ${tsPath}`);

        // If requested, also export to JSON for backwards compatibility
        if (generateJson) {
          const jsonPath = await ruleExporter.exportRules(section, rules);
          console.log(`Updated JSON rule file: ${jsonPath}`);
        }

        updatedSections.push(section);
        updatedRulesCount += rules.length;

        console.log(
          `Updated TypeScript rule file for section ${section} with ${rules.length} rules`
        );
      } catch (error) {
        console.error(`Error updating rules for section ${section}:`, error);
      }
    }

    console.log(
      `Updated ${updatedRulesCount} rules across ${updatedSections.length} sections`
    );
    return updatedSections;
  }
}

// Export a singleton instance
export const rulesGenerator = new RulesGenerator();
