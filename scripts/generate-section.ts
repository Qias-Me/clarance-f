#!/usr/bin/env tsx
/**
 * Section Generation Script
 * 
 * Automatically generates section components, contexts, and interfaces
 * Reduces 30+ manual files to automated generation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface SectionDefinition {
  sectionNumber: number;
  sectionName: string;
  sectionTitle: string;
  sectionDescription: string;
  fields: FieldDefinition[];
  subsections?: SubsectionDefinition[];
  validationRules?: Record<string, any>;
}

interface FieldDefinition {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'radio' | 'checkbox';
  required?: boolean;
  label?: string;
  placeholder?: string;
  options?: string[];
  validation?: string;
}

interface SubsectionDefinition {
  name: string;
  repeatable?: boolean;
  maxEntries?: number;
  fields: FieldDefinition[];
}

/**
 * Generate TypeScript interface from field definitions
 */
function generateInterface(section: SectionDefinition): string {
  const fieldTypes = section.fields.map(field => {
    const fieldType = getFieldType(field);
    const required = field.required ? '' : '?';
    return `  ${field.name}${required}: ${fieldType};`;
  }).join('\n');
  
  const subsectionTypes = section.subsections?.map(sub => {
    const subFields = sub.fields.map(field => {
      const fieldType = getFieldType(field);
      return `    ${field.name}: ${fieldType};`;
    }).join('\n');
    
    const subType = `{\n${subFields}\n  }`;
    return `  ${sub.name}: ${sub.repeatable ? `${subType}[]` : subType};`;
  }).join('\n') || '';
  
  return `/**
 * Section ${section.sectionNumber}: ${section.sectionTitle}
 * Auto-generated interface
 */

import type { Field, FieldWithOptions } from '../../../api/interfaces/formDefinition2.0';
import type { 
  BaseSection, 
  PersonName, 
  DateRange, 
  Address 
} from '../../../api/interfaces/section-interfaces/shared/base-types';

export interface Section${section.sectionNumber}Data {
${fieldTypes}
${subsectionTypes}
}

export interface Section${section.sectionNumber} extends BaseSection<Section${section.sectionNumber}Data> {
  sectionNumber: ${section.sectionNumber};
  sectionName: '${section.sectionName}';
}`;
}

/**
 * Generate context using base context factory
 */
function generateContext(section: SectionDefinition): string {
  return `/**
 * Section ${section.sectionNumber} Context
 * Auto-generated using BaseSectionContext
 */

import { createBaseSectionContext } from '../../base/BaseSectionContext';
import type { Section${section.sectionNumber}Data } from '../../../api/interfaces/section-interfaces/section${section.sectionNumber}';
import { section${section.sectionNumber}Config } from '../../../config/sections/section${section.sectionNumber}.config';

// Create the context using the base factory
const {
  Context: Section${section.sectionNumber}Context,
  Provider: Section${section.sectionNumber}Provider,
  useSection: useSection${section.sectionNumber}
} = createBaseSectionContext<Section${section.sectionNumber}Data>(
  section${section.sectionNumber}Config,
  {
    enableAutoSave: true,
    autoSaveDelay: 2000,
    enableChangeTracking: true,
    enableIncrementalValidation: true,
    validationDebounce: 300
  }
);

export {
  Section${section.sectionNumber}Context,
  Section${section.sectionNumber}Provider,
  useSection${section.sectionNumber}
};`;
}

/**
 * Generate component using HOC wrapper
 */
function generateComponent(section: SectionDefinition): string {
  const fieldComponents = section.fields.map(field => {
    return generateFieldComponent(field);
  }).join('\n\n      ');
  
  return `/**
 * Section ${section.sectionNumber} Component
 * Auto-generated using withSectionWrapper HOC
 */

import React, { memo } from 'react';
import { withSectionWrapper } from '../hoc/withSectionWrapper';
import { useSection${section.sectionNumber} } from '../../state/contexts/sections2.0/section${section.sectionNumber}';
import { FieldRenderer } from '../fields/FieldRenderer';

const Section${section.sectionNumber}Fields: React.FC = () => {
  const { 
    data, 
    updateField, 
    errors, 
    warnings, 
    isLoading 
  } = useSection${section.sectionNumber}();
  
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      ${fieldComponents}
    </div>
  );
};

export const Section${section.sectionNumber}Component = withSectionWrapper(
  Section${section.sectionNumber}Fields,
  {
    sectionNumber: ${section.sectionNumber},
    title: '${section.sectionTitle}',
    description: '${section.sectionDescription}',
    enableProgressBar: true,
    enableAutoSave: true,
    enableKeyboardShortcuts: true
  }
);`;
}

/**
 * Generate field component
 */
function generateFieldComponent(field: FieldDefinition): string {
  const fieldType = field.type === 'select' || field.type === 'radio' ? 'FieldWithOptions' : 'Field';
  
  return `<FieldRenderer
        config={{
          id: '${field.name}',
          label: '${field.label || field.name}',
          type: '${field.type}',
          required: ${field.required || false},
          placeholder: '${field.placeholder || ''}'
        }}
        value={data.${field.name}}
        onChange={(value) => updateField('${field.name}', value)}
        error={errors.${field.name}}
        warning={warnings.${field.name}}
      />`;
}

/**
 * Generate configuration file
 */
function generateConfig(section: SectionDefinition): string {
  return `/**
 * Section ${section.sectionNumber} Configuration
 * Auto-generated configuration
 */

import type { SectionConfig } from '../../../api/interfaces/section-interfaces/shared/base-types';
import type { Section${section.sectionNumber}Data } from '../../../api/interfaces/section-interfaces/section${section.sectionNumber}';
import { CommonValidationRules } from '../../../api/interfaces/section-interfaces/shared/validation-patterns';

export const section${section.sectionNumber}Config: SectionConfig<Section${section.sectionNumber}Data> = {
  sectionNumber: ${section.sectionNumber},
  sectionName: '${section.sectionName}',
  sectionTitle: '${section.sectionTitle}',
  sectionDescription: '${section.sectionDescription}',
  initialData: createDefaultSection${section.sectionNumber}Data(),
  validationRules: {
    ${section.fields
      .filter(f => f.required)
      .map(f => `${f.name}: CommonValidationRules.requiredText`)
      .join(',\n    ')}
  }
};

function createDefaultSection${section.sectionNumber}Data(): Section${section.sectionNumber}Data {
  return {
    ${section.fields.map(f => `${f.name}: createField(${getDefaultValue(f)})`).join(',\n    ')}
  };
}

function createField<T>(value: T): any {
  return {
    id: '',
    value,
    label: '',
    name: '',
    type: 'PDFTextField',
    required: false,
    section: ${section.sectionNumber},
    rect: { x: 0, y: 0, width: 0, height: 0 }
  };
}`;
}

/**
 * Get TypeScript type for field
 */
function getFieldType(field: FieldDefinition): string {
  switch (field.type) {
    case 'text':
      return 'Field<string>';
    case 'number':
      return 'Field<number>';
    case 'boolean':
    case 'checkbox':
      return 'Field<boolean>';
    case 'date':
      return 'Field<string>'; // ISO date string
    case 'select':
    case 'radio':
      return field.options 
        ? `FieldWithOptions<${field.options.map(o => `'${o}'`).join(' | ')}>` 
        : 'FieldWithOptions<string>';
    default:
      return 'Field<any>';
  }
}

/**
 * Get default value for field type
 */
function getDefaultValue(field: FieldDefinition): string {
  switch (field.type) {
    case 'text':
    case 'date':
      return "''";
    case 'number':
      return '0';
    case 'boolean':
    case 'checkbox':
      return 'false';
    case 'select':
    case 'radio':
      return field.options?.[0] ? `'${field.options[0]}'` : "''";
    default:
      return 'null';
  }
}

/**
 * Generate all files for a section
 */
async function generateSection(section: SectionDefinition) {
  const basePath = path.join(process.cwd(), 'app');
  
  // Generate interface
  const interfacePath = path.join(
    basePath,
    '../api/interfaces/section-interfaces',
    `section${section.sectionNumber}.ts`
  );
  fs.writeFileSync(interfacePath, generateInterface(section));
  console.log(`✅ Generated interface: ${interfacePath}`);
  
  // Generate config
  const configPath = path.join(
    basePath,
    'config/sections',
    `section${section.sectionNumber}.config.ts`
  );
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, generateConfig(section));
  console.log(`✅ Generated config: ${configPath}`);
  
  // Generate context
  const contextPath = path.join(
    basePath,
    'state/contexts/sections2.0',
    `section${section.sectionNumber}.tsx`
  );
  fs.writeFileSync(contextPath, generateContext(section));
  console.log(`✅ Generated context: ${contextPath}`);
  
  // Generate component
  const componentPath = path.join(
    basePath,
    'components/Rendered2.0',
    `Section${section.sectionNumber}Component.tsx`
  );
  fs.writeFileSync(componentPath, generateComponent(section));
  console.log(`✅ Generated component: ${componentPath}`);
  
  console.log(`\n✨ Section ${section.sectionNumber} generated successfully!`);
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: tsx generate-section.ts <section-number> [--name "Section Name"] [--title "Section Title"]

Examples:
  tsx generate-section.ts 16 --name "Foreign Activities" --title "Foreign Activities and Interests"
  tsx generate-section.ts 17 --name "Marital Status" --title "Marital and Relationship Status"
    `);
    return;
  }
  
  const sectionNumber = parseInt(args[0]);
  const nameIndex = args.indexOf('--name');
  const titleIndex = args.indexOf('--title');
  
  const sectionName = nameIndex > -1 ? args[nameIndex + 1] : `Section ${sectionNumber}`;
  const sectionTitle = titleIndex > -1 ? args[titleIndex + 1] : sectionName;
  
  // Example section definition - in real use, this would come from a schema file
  const section: SectionDefinition = {
    sectionNumber,
    sectionName,
    sectionTitle,
    sectionDescription: `Please provide information for ${sectionTitle}.`,
    fields: [
      {
        name: 'field1',
        type: 'text',
        required: true,
        label: 'Field 1',
        placeholder: 'Enter value'
      },
      {
        name: 'field2',
        type: 'boolean',
        required: false,
        label: 'Field 2'
      }
    ]
  };
  
  await generateSection(section);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { generateSection, SectionDefinition };