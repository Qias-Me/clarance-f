/**
 * Test Data Populator Utility
 *
 * Contains comprehensive test data for populating SF-86 form sections
 * during development and testing. This eliminates clutter from the main
 * startForm.tsx file.
 */

export const populateTestData = (sectionContexts: any) => {
  console.log("🧪 Populating form with test data for debugging...");

  try {
    // Populate Section 1 data
    if (sectionContexts.section1Context) {
      console.log("📝 Populating Section 1...");
      sectionContexts.section1Context.updateFullName("John", "Smith", "Doe", "Jr.");
    }

    // Populate Section 2 data
    if (sectionContexts.section2Context) {
      console.log("📝 Populating Section 2...");
      sectionContexts.section2Context.updateDateOfBirth("1990-01-15");
      sectionContexts.section2Context.updateEstimated(false);
    }

    // Populate Section 3 data
    if (sectionContexts.section3Context) {
      console.log("📝 Populating Section 3...");
      sectionContexts.section3Context.updatePlaceOfBirth("New York", "New York County", "United States", "NY");
    }

    // Populate Section 28 data (Court Actions)
    populateSection28TestData(sectionContexts);

    // Populate Section 30 data (Continuation Sheets)
    populateSection30TestData(sectionContexts);

    console.log("✅ Test data populated successfully!");
    console.log("📊 Expected field count increase from ~85 to ~649 fields");
    console.log("✅ All section contexts updated directly!");
  } catch (error) {
    console.error("❌ Error populating test data:", error);
  }
};

/**
 * Get minimal test data for quick testing
 */
export const getMinimalTestData = () => {
  return {
    section1: {
      firstName: "John",
      lastName: "Doe",
      middleName: "Smith"
    },
    section2: {
      dateOfBirth: "01/15/1990"
    },
    section29: {
      hasAssociation: "NO"
    }
  };
};

/**
 * Populate Section 28 test data (Court Actions)
 */
const populateSection28TestData = (sectionContexts: any) => {
  console.log("📝 Populating Section 28 (Court Actions)...");

  // Access Section 28 context from SF86FormContext
  const sf86Context = sectionContexts.sf86Context;
  if (!sf86Context) {
    console.warn("⚠️ SF86FormContext not available for Section 28 population");
    return;
  }

  // Find Section 28 registration
  const section28Registration = sf86Context.registeredSections.find((s: any) => s.sectionId === 'section28');
  if (!section28Registration?.context) {
    console.warn("⚠️ Section 28 context not registered");
    return;
  }

  const section28Context = section28Registration.context;

  try {
    // Set hasCourtActions to YES
    section28Context.updateHasCourtActions('YES');

    // Add a court action entry
    section28Context.addCourtAction();

    // Update the court action entry with test data
    section28Context.updateFieldValue('section28.courtActionEntries[0].dateOfAction.date.value', '2020-03');
    section28Context.updateFieldValue('section28.courtActionEntries[0].dateOfAction.estimated.value', 'NO');
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtName.value', 'Superior Court of California');
    section28Context.updateFieldValue('section28.courtActionEntries[0].natureOfAction.value', 'Civil lawsuit regarding contract dispute');
    section28Context.updateFieldValue('section28.courtActionEntries[0].resultsDescription.value', 'Case was settled out of court');
    section28Context.updateFieldValue('section28.courtActionEntries[0].principalParties.value', 'John Doe vs. ABC Corporation');

    // Update court address
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtAddress.street.value', '123 Court Street');
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtAddress.city.value', 'Los Angeles');
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtAddress.state.value', 'CA');
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtAddress.zipCode.value', '90210');
    section28Context.updateFieldValue('section28.courtActionEntries[0].courtAddress.country.value', 'United States');

    console.log("✅ Section 28 test data populated successfully");
  } catch (error) {
    console.error("❌ Error populating Section 28 test data:", error);
  }
};

/**
 * Populate Section 30 test data (Continuation Sheets)
 */
const populateSection30TestData = (sectionContexts: any) => {
  console.log("📝 Populating Section 30 (Continuation Sheets)...");

  // Access Section 30 context from SF86FormContext
  const sf86Context = sectionContexts.sf86Context;
  if (!sf86Context) {
    console.warn("⚠️ SF86FormContext not available for Section 30 population");
    return;
  }

  // Find Section 30 registration
  const section30Registration = sf86Context.registeredSections.find((s: any) => s.sectionId === 'section30');
  if (!section30Registration?.context) {
    console.warn("⚠️ Section 30 context not registered");
    return;
  }

  const section30Context = section30Registration.context;

  try {
    // Set hasContinuationSheets to YES
    section30Context.updateHasContinuationSheets('YES');

    // Add a continuation entry
    section30Context.addContinuationEntry();

    // Update the continuation entry with test data
    section30Context.updateFieldValue('section30.entries[0].remarks.value', 'This is additional information that could not fit in the original sections of the SF-86 form. This continuation sheet provides space for detailed explanations and additional context.');

    // Update personal info with PROPER DATE FORMATTING
    section30Context.updateFieldValue('section30.entries[0].personalInfo.fullName.value', 'John Smith Doe Jr.');
    section30Context.updateFieldValue('section30.entries[0].personalInfo.otherNamesUsed.value', 'Johnny Doe, J. Doe');
    section30Context.updateFieldValue('section30.entries[0].personalInfo.dateOfBirth.value', '01/15/1990'); // MM/DD/YYYY format
    section30Context.updateFieldValue('section30.entries[0].personalInfo.dateSigned.value', '06/27/2025'); // MM/DD/YYYY format

    console.log("✅ Section 30 test data populated successfully");
    console.log("🔧 Section 30 dates formatted as MM/DD/YYYY to prevent field length errors");
  } catch (error) {
    console.error("❌ Error populating Section 30 test data:", error);
  }
};

/**
 * Get comprehensive test data for all sections
 * This would contain the full test data that was previously in startForm.tsx
 */
export const getComprehensiveTestData = () => {
  // TODO: Move the complete test data objects here
  return {};
};