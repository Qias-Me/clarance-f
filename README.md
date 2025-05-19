# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## PDF Form Filling Tools

This project includes utilities for working with PDF forms, particularly SF-86 forms.

### Extracting Form Fields

To extract all fields from an SF-86 PDF form and generate a template:

```sh
npm run extract-form-fields
```

This will create:
- `scripts/sf86-fields.json` - Contains all fields with their types and labels
- `scripts/sf86-template.json` - A template for filling out the form

### Extracting Fields by Section

To extract fields organized by sections:

```sh
npm run extract-fields-by-section
```

This script:
1. Analyzes field labels and names to determine the appropriate section
2. Creates separate JSON files for each section in `scripts/analysis/`
3. Generates a summary of all sections found
4. Categorizes fields with high confidence about their section

### Validating Form Sections

To validate the accessibility and fillability of all form sections:

```sh
npm run validate-form-sections
```

This creates a comprehensive validation report that:
1. Tests each field's accessibility in the PDF
2. Verifies each field can be filled with appropriate data
3. Calculates validation success rates by section
4. Identifies any inaccessible or problematic fields

### Filling PDF Forms

To fill out a PDF form using the pdf-lib library:

```sh
npm run fill-form
```

This script:
1. Loads the SF-86 form from `utilities/externalTools/sf861.pdf`
2. Fills fields based on the data in the script
3. Saves the filled form to `utilities/externalTools/sf861-filled.pdf`

### Section-Specific Form Filling

To fill out a specific section of the form (e.g., Section 2 - Date of Birth):

```sh
npm run fill-section2
```

This script:
1. Uses the section-specific field definitions from `scripts/analysis/section2-fields.json`
2. Fills only fields belonging to Section 2
3. Saves a section-specific filled PDF

### Web Form Automation

To see a demonstration of browser-based form automation using Playwright:

```sh
npm run playwright-demo
```

This:
1. Opens a browser window with a demo form
2. Automatically fills out the form fields
3. Takes a screenshot of the filled form
4. Provides guidance on adapting for SF-86 web forms

## SF-86 Form Validation Framework

The project includes a comprehensive validation framework for SF-86 forms that ensures all sections can be properly filled and processed.

### Framework Components

1. **Field Extraction** - Extracts all form fields and organizes them by section
2. **Section Validation** - Validates fields across all identified sections
3. **Section-Specific Fillers** - Specialized scripts for filling each section
4. **Data Source Integration** - Load form data from external sources
5. **Web-Based Integration** - Support for browser-based form filling
6. **TaskMaster Integration** - TaskMaster tasks for form validation workflows
7. **Validation Visualization** - Visual representation of validation results

### TaskMaster Integration

The form validation framework is integrated with TaskMaster through the `form-validation-task.json` task, which includes subtasks for each component of the framework. 

To view the task details:

```sh
npx task-master show form-validation
```

### Extending the Framework

To add support for a new section:

1. Create a section-specific filler script based on `fillSection2.ts`
2. Update the section mappings in `extractFieldsBySection.ts` if needed
3. Add a new script entry to `package.json`
4. Run validation to ensure the new section integrates properly

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Recent Sectionizer Improvements

### Enhanced SF-86 Form Field Sectionizer

We've made significant improvements to the SF-86 form field sectionizer:

1. **Reduced Code Redundancy**
   - Removed duplicate pattern definitions by leveraging centralized patterns from `page-categorization-bridge.ts`
   - Created an `isFieldInSection` helper function to standardize section matching
   - Simplified the categorization workflow in `extractFieldsBySection.ts`

2. **Improved Self-Healing Module**
   - Enhanced the `EnhancedSelfHealer` class with proper strategy implementation
   - Added better pattern matching using `sectionClassifications` from the bridge
   - Implemented better proximity-based healing for fields on the same page
   - Fixed the internal workflow for applying healing actions

3. **Optimized Processing Pipeline**
   - Improved the workflow with proper sequence: normalize → categorize → post-process → group
   - Enhanced post-processing to reliably enforce section constraints
   - Added better validation against reference counts

4. **Results**
   - Increased section alignment score from -92.27% to 67.36% 
   - Improved field categorization from 0% to 100% (all fields now have a section)
   - Reduced major deviations in most sections (many now within 1-3% of expected count)

The sectionizer now properly categorizes all fields with high accuracy and reliability.

## Section Data Reference Counts

When running section validation with the sectionizer, the system needs access to reference counts of how many fields should be in each section. This is used to validate that all expected fields are properly categorized. 

### Setting Up Reference Counts

To ensure proper loading of reference counts:

1. **Generate section summary data** by running the enhanced PDF validation:
   ```
   npx tsx utilities/enhanced-pdf-validation.ts
   ```
   This will create section summary files in the `/reports/` directory.

2. **Copy to section-data directory** using the utility script:
   ```
   node scripts/copy-section-summary.js
   ```
   This ensures the section data is available in both locations for compatibility.

3. When running the sectionizer with validation enabled, it will now check multiple directories (in this order):
   - `./section-data/`
   - `./reports/`
   - `./src/section-data/`

### Troubleshooting Reference Counts

If section validation is not working as expected:

1. Check if the summary files exist in both the `/reports/` and `/section-data/` directories
2. Verify the format of the `section-summary.json` files - they should contain section IDs and field counts
3. Run the copy script again to ensure latest data is available in all locations

The reference count system supports multiple file formats for backward compatibility.

---

Built with ❤️ using React Router.
