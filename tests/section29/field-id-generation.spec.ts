import { test, expect } from '../fixtures/section29-fixtures';
import { SECTION29_TEST_DATA, SECTION29_SELECTORS } from '../fixtures/section29-fixtures';

/**
 * Section29 Field ID Generation Tests
 * 
 * Comprehensive tests to validate that generated field IDs exactly match
 * the PDF patterns identified in JSON analysis. These tests ensure that
 * the Section29 Context generates field IDs that are compatible with
 * the actual SF-86 PDF form structure.
 * 
 * Expected PDF Field Patterns (from JSON analysis):
 * - Subsection Questions: form1[0].Section29[0].RadioButtonList[0], form1[0].Section29_2[0].RadioButtonList[0]
 * - Entry #1 Organization Name: form1[0].Section29[0].TextField11[1]
 * - Entry #2 Organization Name: form1[0].Section29[0].TextField11[8]
 * - Entry #1 Address Street: form1[0].Section29[0].#area[1].TextField11[0]
 * - Entry #2 Address Street: form1[0].Section29[0].#area[3].TextField11[0]
 * - Entry #1 From Date: form1[0].Section29[0].From_Datefield_Name_2[0]
 * - Entry #2 From Date: form1[0].Section29[0].From_Datefield_Name_2[2]
 */

test.describe('Section29 Field ID Generation', () => {
  test.beforeEach(async ({ section29Page }) => {
    await section29Page.waitForSelector(SECTION29_SELECTORS.BASIC_FORM, { timeout: 10000 });
  });

  // ============================================================================
  // SUBSECTION QUESTION FIELD ID TESTS
  // ============================================================================

  test.describe('Subsection Question Field IDs', () => {
    test('should generate correct field ID for terrorism organizations question', async ({ section29Utils, section29Page }) => {
      // Navigate to field ID validation test
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      // Execute field ID validation
      await section29Utils.executeFieldIdValidationTests();

      // Verify terrorism organizations question field ID
      await section29Utils.assertFieldIdPattern('terrorism_orgs_id_pattern', true);
      
      // Get the actual field ID value for detailed verification
      const actualId = await section29Utils.getElementText('field-id-terrorism_orgs_id_value');
      expect(actualId).toContain('form1[0].Section29[0].RadioButtonList[0]');
    });

    test('should generate correct field ID for terrorism activities question', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify terrorism activities question field ID
      await section29Utils.assertFieldIdPattern('terrorism_activities_id_pattern', true);
      
      const actualId = await section29Utils.getElementText('field-id-terrorism_activities_id_value');
      expect(actualId).toContain('form1[0].Section29_2[0].RadioButtonList[0]');
    });

    test('should generate unique field IDs for different subsection questions', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Get both field IDs
      const terrorismOrgsId = await section29Utils.getElementText('field-id-terrorism_orgs_id_value');
      const terrorismActivitiesId = await section29Utils.getElementText('field-id-terrorism_activities_id_value');

      // Verify they are different
      expect(terrorismOrgsId).not.toBe(terrorismActivitiesId);
      
      // Verify they follow expected patterns
      expect(terrorismOrgsId).toContain('Section29[0]');
      expect(terrorismActivitiesId).toContain('Section29_2[0]');
    });
  });

  // ============================================================================
  // ORGANIZATION ENTRY FIELD ID TESTS
  // ============================================================================

  test.describe('Organization Entry Field IDs', () => {
    test('should generate correct field IDs for Entry #1 organization fields', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify Entry #1 organization name field ID
      await section29Utils.assertFieldIdPattern('entry1_org_name_pattern', true);
      const entry1NameId = await section29Utils.getElementText('field-id-entry1_org_name_id');
      expect(entry1NameId).toContain('form1[0].Section29[0].TextField11[1]');

      // Verify Entry #1 address street field ID
      await section29Utils.assertFieldIdPattern('entry1_street_pattern', true);
      const entry1StreetId = await section29Utils.getElementText('field-id-entry1_street_id');
      expect(entry1StreetId).toContain('form1[0].Section29[0].#area[1].TextField11[0]');

      // Verify Entry #1 from date field ID
      await section29Utils.assertFieldIdPattern('entry1_from_date_pattern', true);
      const entry1FromDateId = await section29Utils.getElementText('field-id-entry1_from_date_id');
      expect(entry1FromDateId).toContain('form1[0].Section29[0].From_Datefield_Name_2[0]');
    });

    test('should generate correct field IDs for Entry #2 organization fields', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify Entry #2 organization name field ID (higher index pattern)
      await section29Utils.assertFieldIdPattern('entry2_org_name_pattern', true);
      const entry2NameId = await section29Utils.getElementText('field-id-entry2_org_name_id');
      expect(entry2NameId).toContain('form1[0].Section29[0].TextField11[8]');

      // Verify Entry #2 address street field ID (higher area index)
      await section29Utils.assertFieldIdPattern('entry2_street_pattern', true);
      const entry2StreetId = await section29Utils.getElementText('field-id-entry2_street_id');
      expect(entry2StreetId).toContain('form1[0].Section29[0].#area[3].TextField11[0]');

      // Verify Entry #2 from date field ID (higher date index)
      await section29Utils.assertFieldIdPattern('entry2_from_date_pattern', true);
      const entry2FromDateId = await section29Utils.getElementText('field-id-entry2_from_date_id');
      expect(entry2FromDateId).toContain('form1[0].Section29[0].From_Datefield_Name_2[2]');
    });

    test('should generate different field IDs for Entry #1 vs Entry #2', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Compare Entry #1 vs Entry #2 organization name field IDs
      const entry1NameId = await section29Utils.getElementText('field-id-entry1_org_name_id');
      const entry2NameId = await section29Utils.getElementText('field-id-entry2_org_name_id');
      
      expect(entry1NameId).not.toBe(entry2NameId);
      expect(entry1NameId).toContain('TextField11[1]'); // Entry #1 uses lower index
      expect(entry2NameId).toContain('TextField11[8]'); // Entry #2 uses higher index

      // Compare Entry #1 vs Entry #2 address street field IDs
      const entry1StreetId = await section29Utils.getElementText('field-id-entry1_street_id');
      const entry2StreetId = await section29Utils.getElementText('field-id-entry2_street_id');
      
      expect(entry1StreetId).not.toBe(entry2StreetId);
      expect(entry1StreetId).toContain('#area[1]'); // Entry #1 uses lower area index
      expect(entry2StreetId).toContain('#area[3]'); // Entry #2 uses higher area index

      // Compare Entry #1 vs Entry #2 from date field IDs
      const entry1FromDateId = await section29Utils.getElementText('field-id-entry1_from_date_id');
      const entry2FromDateId = await section29Utils.getElementText('field-id-entry2_from_date_id');
      
      expect(entry1FromDateId).not.toBe(entry2FromDateId);
      expect(entry1FromDateId).toContain('From_Datefield_Name_2[0]'); // Entry #1 uses index 0
      expect(entry2FromDateId).toContain('From_Datefield_Name_2[2]'); // Entry #2 uses index 2
    });

    test('should maintain consistent field ID patterns across multiple entries', async ({ section29Utils, section29Page }) => {
      // Test with actual form to verify field ID generation in real context
      await section29Utils.navigateToBasicTests();
      
      // Enable terrorism organizations and add multiple entries
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Get field IDs from actual form elements
      const entry1NameId = await section29Utils.getFieldId('terrorism-org-name-0');
      const entry2NameId = await section29Utils.getFieldId('terrorism-org-name-1');
      const entry1StreetId = await section29Utils.getFieldId('terrorism-org-street-0');
      const entry2StreetId = await section29Utils.getFieldId('terrorism-org-street-1');

      // Verify Entry #1 patterns
      expect(entry1NameId).toMatch(/form1\[0\]\.Section29\[0\]\.TextField11\[1\]/);
      expect(entry1StreetId).toMatch(/form1\[0\]\.Section29\[0\]\.#area\[1\]\.TextField11\[0\]/);

      // Verify Entry #2 patterns
      expect(entry2NameId).toMatch(/form1\[0\]\.Section29\[0\]\.TextField11\[8\]/);
      expect(entry2StreetId).toMatch(/form1\[0\]\.Section29\[0\]\.#area\[3\]\.TextField11\[0\]/);

      // Verify uniqueness
      expect(entry1NameId).not.toBe(entry2NameId);
      expect(entry1StreetId).not.toBe(entry2StreetId);
    });
  });

  // ============================================================================
  // ACTIVITY ENTRY FIELD ID TESTS
  // ============================================================================

  test.describe('Activity Entry Field IDs', () => {
    test('should generate correct field ID for activity description', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify activity description field ID
      await section29Utils.assertFieldIdPattern('activity_description_pattern', true);
      const activityDescriptionId = await section29Utils.getElementText('field-id-activity_description_id');
      expect(activityDescriptionId).toContain('form1[0].Section29_2[0].TextField11[0]');
    });

    test('should generate activity field IDs with correct subsection prefix', async ({ section29Utils, section29Page }) => {
      // Test with actual form
      await section29Utils.navigateToBasicTests();
      
      // Enable terrorism activities and add entry
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Get field ID from actual form element
      const activityDescriptionId = await section29Utils.getFieldId('terrorism-activity-description-0');

      // Verify it uses Section29_2 prefix (different from organization Section29)
      expect(activityDescriptionId).toMatch(/form1\[0\]\.Section29_2\[0\]\.TextField11\[0\]/);
      expect(activityDescriptionId).toContain('Section29_2'); // Not Section29
    });

    test('should generate unique activity field IDs for multiple entries', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Enable terrorism activities and add multiple entries
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Get field IDs from actual form elements
      const activity1DescriptionId = await section29Utils.getFieldId('terrorism-activity-description-0');
      const activity2DescriptionId = await section29Utils.getFieldId('terrorism-activity-description-1');

      // Verify they are different
      expect(activity1DescriptionId).not.toBe(activity2DescriptionId);
      
      // Both should follow the activity pattern but with different indices
      expect(activity1DescriptionId).toContain('Section29_2[0]');
      expect(activity2DescriptionId).toContain('Section29_2[0]');
    });
  });

  // ============================================================================
  // FIELD ID PATTERN COMPLIANCE TESTS
  // ============================================================================

  test.describe('PDF Pattern Compliance', () => {
    test('should match exact PDF field naming conventions', async ({ section29Utils, section29Page }) => {
      await section29Utils.switchToTestTab('fieldid');
      await section29Page.waitForSelector('[data-testid="section29-field-id-validation"]', { timeout: 5000 });

      await section29Utils.executeFieldIdValidationTests();

      // Verify all expected patterns pass validation
      const expectedPatterns = [
        'terrorism_orgs_id_pattern',
        'terrorism_activities_id_pattern',
        'entry1_org_name_pattern',
        'entry1_street_pattern',
        'entry1_from_date_pattern',
        'entry2_org_name_pattern',
        'entry2_street_pattern',
        'entry2_from_date_pattern',
        'activity_description_pattern'
      ];

      for (const pattern of expectedPatterns) {
        await section29Utils.assertFieldIdPattern(pattern, true);
      }
    });

    test('should use consistent form prefix across all fields', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up multiple entries across different subsections
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Collect all field IDs
      const fieldIds = [
        await section29Utils.getFieldId('terrorism-org-name-0'),
        await section29Utils.getFieldId('terrorism-org-street-0'),
        await section29Utils.getFieldId('terrorism-org-city-0'),
        await section29Utils.getFieldId('terrorism-org-from-date-0'),
        await section29Utils.getFieldId('terrorism-activity-description-0')
      ];

      // Verify all use the same form prefix
      for (const fieldId of fieldIds) {
        expect(fieldId).toMatch(/^form1\[0\]\./);
      }
    });

    test('should use correct section identifiers for different subsections', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Set up entries in different subsections
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Get field IDs from different subsections
      const orgFieldId = await section29Utils.getFieldId('terrorism-org-name-0');
      const activityFieldId = await section29Utils.getFieldId('terrorism-activity-description-0');

      // Verify correct section identifiers
      expect(orgFieldId).toContain('Section29[0]'); // Organizations use Section29
      expect(activityFieldId).toContain('Section29_2[0]'); // Activities use Section29_2
      
      // Verify they don't use each other's identifiers
      expect(orgFieldId).not.toContain('Section29_2');
      expect(activityFieldId).not.toContain('Section29[0]');
    });

    test('should generate field IDs compatible with PDF form structure', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Create comprehensive test scenario
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');

      // Test all organization field types
      const fieldIdTests = [
        { testId: 'terrorism-org-name-0', expectedPattern: /TextField11\[1\]/ },
        { testId: 'terrorism-org-street-0', expectedPattern: /#area\[1\]\.TextField11\[0\]/ },
        { testId: 'terrorism-org-city-0', expectedPattern: /#area\[1\]\.TextField11\[1\]/ },
        { testId: 'terrorism-org-from-date-0', expectedPattern: /From_Datefield_Name_2\[0\]/ },
        { testId: 'terrorism-org-to-date-0', expectedPattern: /From_Datefield_Name_2\[1\]/ },
        { testId: 'terrorism-org-present-0', expectedPattern: /#field\[13\]/ },
        { testId: 'terrorism-org-name-1', expectedPattern: /TextField11\[8\]/ },
        { testId: 'terrorism-org-street-1', expectedPattern: /#area\[3\]\.TextField11\[0\]/ },
        { testId: 'terrorism-org-from-date-1', expectedPattern: /From_Datefield_Name_2\[2\]/ }
      ];

      for (const { testId, expectedPattern } of fieldIdTests) {
        const fieldId = await section29Utils.getFieldId(testId);
        expect(fieldId).toMatch(expectedPattern);
        expect(fieldId).toMatch(/^form1\[0\]\.Section29\[0\]\./); // All should have correct prefix
      }
    });
  });

  // ============================================================================
  // FIELD ID UNIQUENESS TESTS
  // ============================================================================

  test.describe('Field ID Uniqueness', () => {
    test('should generate unique field IDs across all form elements', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Create maximum test scenario
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      await section29Utils.setSubsectionFlag('terrorismActivities', 'YES');
      await section29Utils.addActivityEntry('terrorismActivities');
      await section29Utils.addActivityEntry('terrorismActivities');

      // Collect all field IDs
      const allFieldIds: string[] = [];
      
      // Organization field IDs
      for (let i = 0; i < 3; i++) {
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-name-${i}`));
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-street-${i}`));
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-city-${i}`));
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-from-date-${i}`));
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-to-date-${i}`));
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-org-present-${i}`));
      }
      
      // Activity field IDs
      for (let i = 0; i < 2; i++) {
        allFieldIds.push(await section29Utils.getFieldId(`terrorism-activity-description-${i}`));
      }

      // Verify all field IDs are unique
      const uniqueFieldIds = new Set(allFieldIds);
      expect(uniqueFieldIds.size).toBe(allFieldIds.length);
      
      // Verify no empty or undefined field IDs
      for (const fieldId of allFieldIds) {
        expect(fieldId).toBeTruthy();
        expect(fieldId.length).toBeGreaterThan(0);
      }
    });

    test('should maintain field ID uniqueness during entry operations', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test field ID stability during add/remove operations
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      
      // Add entries
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      const firstEntryId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      const secondEntryId = await section29Utils.getFieldId('terrorism-org-name-1');
      
      // Verify they are different
      expect(firstEntryId).not.toBe(secondEntryId);
      
      // Remove first entry
      await section29Utils.removeEntry('terrorismOrganizations', 0);
      
      // Remaining entry should maintain its field ID structure
      const remainingEntryId = await section29Utils.getFieldId('terrorism-org-name-0');
      expect(remainingEntryId).toBeTruthy();
      expect(remainingEntryId).toMatch(/^form1\[0\]\.Section29\[0\]\./);
    });

    test('should generate consistent field IDs for same entry positions', async ({ section29Utils, section29Page }) => {
      await section29Utils.navigateToBasicTests();
      
      // Test field ID consistency for same positions across sessions
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const firstSessionId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Clear and recreate
      await section29Utils.clearFormData();
      await section29Utils.navigateToBasicTests();
      await section29Utils.setSubsectionFlag('terrorismOrganizations', 'YES');
      await section29Utils.addOrganizationEntry('terrorismOrganizations');
      
      const secondSessionId = await section29Utils.getFieldId('terrorism-org-name-0');
      
      // Same position should generate same field ID pattern
      expect(firstSessionId).toBe(secondSessionId);
    });
  });
});
