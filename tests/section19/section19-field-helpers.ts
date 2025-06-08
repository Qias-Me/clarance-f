/**
 * Section 19 Field Helper Functions
 * 
 * Comprehensive helper functions for filling all 277 fields in Section 19
 * across all 4 subsections with proper error handling and logging
 */

import { Page } from '@playwright/test';

export async function fillDateOfBirthFields(page: Page, entryIndex: number, dobData: any) {
  console.log(`  📅 Filling date of birth fields for entry ${entryIndex}...`);
  
  // Date field
  const dateField = page.locator(`input[type="date"], input[name*="dateOfBirth"], [data-testid*="date-of-birth"]`).nth(entryIndex);
  if (await dateField.isVisible()) {
    await dateField.fill(dobData.date || '');
    await page.waitForTimeout(200);
  }
  
  // Estimated checkbox
  const estimatedCheckbox = page.locator(`input[name*="estimated"], [data-testid*="estimated"]`).nth(entryIndex);
  if (await estimatedCheckbox.isVisible() && dobData.estimated) {
    await estimatedCheckbox.check();
    await page.waitForTimeout(200);
  }
  
  // Unknown checkbox
  const unknownCheckbox = page.locator(`input[name*="dobUnknown"], input[name*="dateUnknown"], [data-testid*="dob-unknown"]`).nth(entryIndex);
  if (await unknownCheckbox.isVisible() && dobData.unknown) {
    await unknownCheckbox.check();
    await page.waitForTimeout(200);
  }
}

export async function fillPlaceOfBirthFields(page: Page, entryIndex: number, pobData: any) {
  console.log(`  🌍 Filling place of birth fields for entry ${entryIndex}...`);
  
  // City field
  const cityField = page.locator(`input[name*="birthCity"], input[name*="placeOfBirth"], [data-testid*="birth-city"]`).nth(entryIndex);
  if (await cityField.isVisible()) {
    await cityField.fill(pobData.city || '');
    await page.waitForTimeout(200);
  }
  
  // Country dropdown
  const countryField = page.locator(`select[name*="birthCountry"], select[name*="placeOfBirth"], [data-testid*="birth-country"]`).nth(entryIndex);
  if (await countryField.isVisible() && pobData.country) {
    await countryField.selectOption(pobData.country);
    await page.waitForTimeout(200);
  }
  
  // Unknown checkbox
  const unknownCheckbox = page.locator(`input[name*="pobUnknown"], input[name*="birthUnknown"], [data-testid*="birth-unknown"]`).nth(entryIndex);
  if (await unknownCheckbox.isVisible() && pobData.unknown) {
    await unknownCheckbox.check();
    await page.waitForTimeout(200);
  }
}

export async function fillAddressFields(page: Page, entryIndex: number, addressData: any) {
  console.log(`  🏠 Filling address fields for entry ${entryIndex}...`);
  
  const addressFields = [
    { selector: `input[name*="street"], input[name*="address"], [data-testid*="street"]`, value: addressData.street },
    { selector: `input[name*="city"], [data-testid*="city"]`, value: addressData.city },
    { selector: `input[name*="zipCode"], input[name*="zip"], [data-testid*="zip"]`, value: addressData.zipCode }
  ];
  
  for (const field of addressFields) {
    const element = page.locator(field.selector).nth(entryIndex);
    if (await element.isVisible()) {
      await element.fill(field.value || '');
      await page.waitForTimeout(200);
    }
  }
  
  // State dropdown
  const stateField = page.locator(`select[name*="state"], [data-testid*="state"]`).nth(entryIndex);
  if (await stateField.isVisible() && addressData.state) {
    await stateField.selectOption(addressData.state);
    await page.waitForTimeout(200);
  }
  
  // Country dropdown
  const countryField = page.locator(`select[name*="country"], [data-testid*="country"]`).nth(entryIndex);
  if (await countryField.isVisible() && addressData.country) {
    await countryField.selectOption(addressData.country);
    await page.waitForTimeout(200);
  }
  
  // Unknown checkbox
  const unknownCheckbox = page.locator(`input[name*="addressUnknown"], [data-testid*="address-unknown"]`).nth(entryIndex);
  if (await unknownCheckbox.isVisible() && addressData.unknown) {
    await unknownCheckbox.check();
    await page.waitForTimeout(200);
  }
}

export async function fillCitizenshipFields(page: Page, entryIndex: number, citizenshipData: any) {
  console.log(`  🛂 Filling citizenship fields for entry ${entryIndex}...`);
  
  // Primary citizenship
  const country1Field = page.locator(`select[name*="citizenship"], select[name*="country1"], [data-testid*="citizenship"]`).nth(entryIndex);
  if (await country1Field.isVisible() && citizenshipData.country1) {
    await country1Field.selectOption(citizenshipData.country1);
    await page.waitForTimeout(200);
  }
  
  // Secondary citizenship
  const country2Field = page.locator(`select[name*="country2"], select[name*="secondaryCitizenship"], [data-testid*="citizenship-2"]`).nth(entryIndex);
  if (await country2Field.isVisible() && citizenshipData.country2) {
    await country2Field.selectOption(citizenshipData.country2);
    await page.waitForTimeout(200);
  }
}

export async function fillContactMethodFields(page: Page, entryIndex: number, contactData: any) {
  console.log(`  📞 Filling contact method fields for entry ${entryIndex}...`);
  
  const contactMethods = [
    { name: 'inPerson', checked: contactData.inPerson },
    { name: 'telephone', checked: contactData.telephone },
    { name: 'electronic', checked: contactData.electronic },
    { name: 'writtenCorrespondence', checked: contactData.writtenCorrespondence },
    { name: 'other', checked: contactData.other }
  ];
  
  for (const method of contactMethods) {
    const checkbox = page.locator(`input[name*="${method.name}"], input[name*="contact"], [data-testid*="${method.name}"]`).nth(entryIndex);
    if (await checkbox.isVisible()) {
      if (method.checked) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
      await page.waitForTimeout(200);
    }
  }
  
  // Other explanation
  if (contactData.other && contactData.otherExplanation) {
    const explanationField = page.locator(`textarea[name*="otherExplanation"], input[name*="otherExplanation"], [data-testid*="other-explanation"]`).nth(entryIndex);
    if (await explanationField.isVisible()) {
      await explanationField.fill(contactData.otherExplanation);
      await page.waitForTimeout(200);
    }
  }
}

export async function fillContactDateFields(page: Page, entryIndex: number, dateData: any) {
  console.log(`  📅 Filling contact date fields for entry ${entryIndex}...`);
  
  // First contact date
  const firstContactField = page.locator(`input[name*="firstContact"], [data-testid*="first-contact"]`).nth(entryIndex);
  if (await firstContactField.isVisible()) {
    await firstContactField.fill(dateData.firstContact || '');
    await page.waitForTimeout(200);
  }
  
  // First contact estimated
  const firstEstimatedCheckbox = page.locator(`input[name*="firstContactEstimated"], [data-testid*="first-estimated"]`).nth(entryIndex);
  if (await firstEstimatedCheckbox.isVisible() && dateData.firstContactEstimated) {
    await firstEstimatedCheckbox.check();
    await page.waitForTimeout(200);
  }
  
  // Last contact date
  const lastContactField = page.locator(`input[name*="lastContact"], [data-testid*="last-contact"]`).nth(entryIndex);
  if (await lastContactField.isVisible()) {
    await lastContactField.fill(dateData.lastContact || '');
    await page.waitForTimeout(200);
  }
  
  // Last contact estimated
  const lastEstimatedCheckbox = page.locator(`input[name*="lastContactEstimated"], [data-testid*="last-estimated"]`).nth(entryIndex);
  if (await lastEstimatedCheckbox.isVisible() && dateData.lastContactEstimated) {
    await lastEstimatedCheckbox.check();
    await page.waitForTimeout(200);
  }
}

export async function fillContactFrequencyFields(page: Page, entryIndex: number, frequency: string) {
  console.log(`  📊 Filling contact frequency fields for entry ${entryIndex}...`);
  
  // Contact frequency radio buttons
  const frequencyRadio = page.locator(`input[name*="frequency"][value="${frequency}"], [data-testid*="frequency-${frequency}"]`).nth(entryIndex);
  if (await frequencyRadio.isVisible()) {
    await frequencyRadio.click();
    await page.waitForTimeout(200);
  }
  
  // Alternative frequency selector
  const frequencySelect = page.locator(`select[name*="frequency"], [data-testid*="frequency"]`).nth(entryIndex);
  if (await frequencySelect.isVisible()) {
    await frequencySelect.selectOption(frequency);
    await page.waitForTimeout(200);
  }
}

export async function fillRelationshipTypeFields(page: Page, entryIndex: number, relationshipData: any) {
  console.log(`  🤝 Filling relationship type fields for entry ${entryIndex}...`);
  
  const relationships = [
    { name: 'professionalBusiness', checked: relationshipData.professionalBusiness, explanation: relationshipData.professionalExplanation },
    { name: 'personal', checked: relationshipData.personal, explanation: relationshipData.personalExplanation },
    { name: 'obligation', checked: relationshipData.obligation, explanation: relationshipData.obligationExplanation },
    { name: 'other', checked: relationshipData.other, explanation: relationshipData.otherExplanation }
  ];
  
  for (const relationship of relationships) {
    // Checkbox
    const checkbox = page.locator(`input[name*="${relationship.name}"], [data-testid*="${relationship.name}"]`).nth(entryIndex);
    if (await checkbox.isVisible()) {
      if (relationship.checked) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
      await page.waitForTimeout(200);
    }
    
    // Explanation field
    if (relationship.checked && relationship.explanation) {
      const explanationField = page.locator(`textarea[name*="${relationship.name}Explanation"], input[name*="${relationship.name}Explanation"], [data-testid*="${relationship.name}-explanation"]`).nth(entryIndex);
      if (await explanationField.isVisible()) {
        await explanationField.fill(relationship.explanation);
        await page.waitForTimeout(200);
      }
    }
  }
}

export async function fillAdditionalNamesTable(page: Page, entryIndex: number, namesData: any) {
  console.log(`  📋 Filling additional names table for entry ${entryIndex}...`);

  const rows = ['row1', 'row2', 'row3', 'row4'];
  const columns = ['last', 'first', 'middle', 'suffix'];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowData = namesData[rows[rowIndex]];
    if (!rowData) continue;

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const value = rowData[column];

      if (value) {
        const cellSelector = `input[name*="additionalNames"][name*="row${rowIndex + 1}"][name*="${column}"],
                             input[name*="names"][name*="${column}"],
                             [data-testid*="additional-name-${rowIndex + 1}-${column}"],
                             table input[name*="${column}"]`;

        const cellField = page.locator(cellSelector).nth(entryIndex * 4 + rowIndex);
        if (await cellField.isVisible()) {
          if (column === 'suffix' && cellField.tagName === 'SELECT') {
            await cellField.selectOption(value);
          } else {
            await cellField.fill(value);
          }
          await page.waitForTimeout(200);
        }
      }
    }
  }
}

export async function fillEmploymentFields(page: Page, entryIndex: number, employmentData: any) {
  console.log(`  💼 Filling employment fields for entry ${entryIndex}...`);

  // Employer name
  const employerNameField = page.locator(`input[name*="employerName"], input[name*="employer"], [data-testid*="employer-name"]`).nth(entryIndex);
  if (await employerNameField.isVisible()) {
    await employerNameField.fill(employmentData.employerName || '');
    await page.waitForTimeout(200);
  }

  // Unknown employer checkbox
  const unknownEmployerCheckbox = page.locator(`input[name*="unknownEmployer"], [data-testid*="unknown-employer"]`).nth(entryIndex);
  if (await unknownEmployerCheckbox.isVisible() && employmentData.unknownEmployer) {
    await unknownEmployerCheckbox.check();
    await page.waitForTimeout(200);
  }

  // Employer address fields
  const addressData = employmentData.employerAddress;
  if (addressData) {
    const employerAddressFields = [
      { selector: `input[name*="employerStreet"], input[name*="employerAddress"], [data-testid*="employer-street"]`, value: addressData.street },
      { selector: `input[name*="employerCity"], [data-testid*="employer-city"]`, value: addressData.city },
      { selector: `input[name*="employerZip"], [data-testid*="employer-zip"]`, value: addressData.zipCode }
    ];

    for (const field of employerAddressFields) {
      const element = page.locator(field.selector).nth(entryIndex);
      if (await element.isVisible()) {
        await element.fill(field.value || '');
        await page.waitForTimeout(200);
      }
    }

    // Employer state
    const employerStateField = page.locator(`select[name*="employerState"], [data-testid*="employer-state"]`).nth(entryIndex);
    if (await employerStateField.isVisible() && addressData.state) {
      await employerStateField.selectOption(addressData.state);
      await page.waitForTimeout(200);
    }

    // Employer country
    const employerCountryField = page.locator(`select[name*="employerCountry"], [data-testid*="employer-country"]`).nth(entryIndex);
    if (await employerCountryField.isVisible() && addressData.country) {
      await employerCountryField.selectOption(addressData.country);
      await page.waitForTimeout(200);
    }

    // Unknown employer address
    const unknownAddressCheckbox = page.locator(`input[name*="employerAddressUnknown"], [data-testid*="employer-address-unknown"]`).nth(entryIndex);
    if (await unknownAddressCheckbox.isVisible() && addressData.unknown) {
      await unknownAddressCheckbox.check();
      await page.waitForTimeout(200);
    }
  }
}

export async function fillGovernmentRelationshipFields(page: Page, entryIndex: number, govData: any) {
  console.log(`  🏛️ Filling government relationship fields for entry ${entryIndex}...`);

  // Has relationship radio
  const hasRelationshipRadio = page.locator(`input[name*="hasRelationship"][value="${govData.hasRelationship}"], [data-testid*="has-relationship-${govData.hasRelationship.toLowerCase()}"]`).nth(entryIndex);
  if (await hasRelationshipRadio.isVisible()) {
    await hasRelationshipRadio.click();
    await page.waitForTimeout(200);
  }

  // Description field
  if (govData.description) {
    const descriptionField = page.locator(`textarea[name*="relationshipDescription"], input[name*="description"], [data-testid*="relationship-description"]`).nth(entryIndex);
    if (await descriptionField.isVisible()) {
      await descriptionField.fill(govData.description);
      await page.waitForTimeout(200);
    }
  }

  // Additional details radio
  const additionalDetailsRadio = page.locator(`input[name*="additionalDetails"][value="${govData.additionalDetails}"], [data-testid*="additional-details-${govData.additionalDetails.toLowerCase()}"]`).nth(entryIndex);
  if (await additionalDetailsRadio.isVisible()) {
    await additionalDetailsRadio.click();
    await page.waitForTimeout(200);
  }
}
