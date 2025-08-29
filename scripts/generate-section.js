#!/usr/bin/env node
/**
 * Section Generator Tool
 * Creates new SF-86 sections with modern architecture
 */

const fs = require('fs');
const path = require('path');

class SectionGenerator {
  constructor(sectionNumber, sectionTitle) {
    this.sectionNumber = sectionNumber;
    this.sectionTitle = sectionTitle;
    this.basePath = path.join(__dirname, '..', 'app');
  }

  async generate() {
    console.log(`🚀 Generating Section ${this.sectionNumber}: ${this.sectionTitle}`);
    
    try {
      // Generate all required files
      await this.generateContext();
      await this.generateComponent();
      await this.generateFieldMapping();
      await this.updateFieldConfig();
      await this.addRoute();
      
      console.log(`✅ Section ${this.sectionNumber} generated successfully!`);
      console.log(`📁 Files created:`);
      console.log(`   - Context: app/state/contexts/sections2.0/section${this.sectionNumber}.tsx`);
      console.log(`   - Component: app/components/Rendered2.0/Section${this.sectionNumber}Component.tsx`);
      console.log(`   - Mapping: app/state/contexts/sections2.0/section${this.sectionNumber}-field-mapping.ts`);
      console.log(`   - Route updated in app/routes.ts`);
      
    } catch (error) {
      console.error(`❌ Error generating section: ${error.message}`);
      process.exit(1);
    }
  }

  async generateContext() {
    const contextPath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${this.sectionNumber}.tsx`);
    
    const contextContent = `import React from 'react';
import { createSectionContext } from './base/BaseSectionContext';
import { generateDefaultData, generateValidationRules, useSectionConfig } from '../../../hooks/useSectionConfig';

// Section ${this.sectionNumber} data interface
export interface Section${this.sectionNumber}Data {
  // Generated from field config - will be populated by useSectionConfig
  [key: string]: unknown;
}

// Create section context with config-driven approach
function createSection${this.sectionNumber}Context() {
  // Get field configuration
  const config = useSectionConfig(${this.sectionNumber});
  
  if (!config) {
    throw new Error('Section ${this.sectionNumber} configuration not found');
  }

  // Generate default data and validation from config
  const defaultData = generateDefaultData(config.fields) as Section${this.sectionNumber}Data;
  const validateSection = generateValidationRules(config.fields);

  return createSectionContext<Section${this.sectionNumber}Data>({
    sectionName: 'Section${this.sectionNumber}',
    defaultData,
    validateSection,
    transformData: (data) => {
      // Add any section-specific transformations here
      return data;
    },
  });
}

// Export the context
export const {
  Provider: Section${this.sectionNumber}Provider,
  useContext: useSection${this.sectionNumber}Context,
  Context: Section${this.sectionNumber}Context,
} = createSection${this.sectionNumber}Context();

// Hook for easier access to section data
export function useSection${this.sectionNumber}() {
  const context = useSection${this.sectionNumber}Context();
  const config = useSectionConfig(${this.sectionNumber});
  
  return {
    ...context,
    sectionTitle: config?.title || 'Section ${this.sectionNumber}',
    fields: config?.fields || [],
  };
}
`;

    fs.writeFileSync(contextPath, contextContent);
  }

  async generateComponent() {
    const componentPath = path.join(this.basePath, 'components', 'Rendered2.0', `Section${this.sectionNumber}Component.tsx`);
    
    const componentContent = `import React from 'react';
import { withSectionWrapper } from './hoc/withSectionWrapper';
import { ConfigDrivenFieldRenderer } from './base/ConfigDrivenFieldRenderer';
import { Section${this.sectionNumber}Provider, useSection${this.sectionNumber} } from '../../state/contexts/sections2.0/section${this.sectionNumber}';

/**
 * Section ${this.sectionNumber}: ${this.sectionTitle}
 * 
 * Modern architecture using:
 * - withSectionWrapper HOC for common functionality
 * - Config-driven field rendering
 * - Type-safe context management
 */

const Section${this.sectionNumber}Fields = React.memo(() => {
  const { fields, sectionTitle } = useSection${this.sectionNumber}();

  return (
    <div className="section-${this.sectionNumber}-container">
      <div className="section-header">
        <h2 className="section-title">{sectionTitle}</h2>
        <p className="section-description">
          Please provide accurate information for Section ${this.sectionNumber}.
        </p>
      </div>

      <div className="section-content">
        <ConfigDrivenFieldRenderer 
          fields={fields}
          sectionNumber={${this.sectionNumber}}
        />
      </div>
    </div>
  );
});

Section${this.sectionNumber}Fields.displayName = 'Section${this.sectionNumber}Fields';

// Export the wrapped component
export const Section${this.sectionNumber}Component = withSectionWrapper({
  sectionNumber: ${this.sectionNumber},
  contextProvider: Section${this.sectionNumber}Provider,
  component: Section${this.sectionNumber}Fields,
  enableValidation: true,
  enableAutoSave: true,
});
`;

    fs.writeFileSync(componentPath, componentContent);
  }

  async generateFieldMapping() {
    const mappingPath = path.join(this.basePath, 'state', 'contexts', 'sections2.0', `section${this.sectionNumber}-field-mapping.ts`);
    
    const mappingContent = `/**
 * Section ${this.sectionNumber} Field Mapping
 * Maps SF-86 form fields to our data structure
 */

import { FieldConfig } from '../../../hooks/useSectionConfig';

export const section${this.sectionNumber}FieldMapping: Record<string, FieldConfig> = {
  // Field mappings will be populated based on section-fields.json config
  // This file allows for section-specific customizations and overrides
};

/**
 * Section-specific field transformations
 */
export const section${this.sectionNumber}Transformations = {
  // Custom transformation functions for complex field types
  
  // Example: Transform date fields to ISO format
  transformDateField: (value: string) => {
    if (!value) return null;
    try {
      return new Date(value).toISOString();
    } catch {
      return null;
    }
  },

  // Example: Normalize phone numbers
  transformPhoneField: (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/(\\d{3})(\\d{3})(\\d{4})/, '$1-$2-$3');
  },
};

/**
 * Section-specific validation rules (extends base validation)
 */
export const section${this.sectionNumber}ValidationRules = {
  // Custom validation functions that aren't covered by base validation
  
  // Example: Validate security clearance level
  validateSecurityLevel: (value: string) => {
    const validLevels = ['Public Trust', 'Secret', 'Top Secret'];
    return validLevels.includes(value);
  },
};
`;

    fs.writeFileSync(mappingPath, mappingContent);
  }

  async updateFieldConfig() {
    const configPath = path.join(this.basePath, 'config', 'section-fields.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Add basic section configuration
      config[`section${this.sectionNumber}`] = {
        title: this.sectionTitle,
        fields: [
          {
            name: 'placeholder',
            type: 'text',
            label: 'Placeholder Field',
            required: false,
            helpText: 'This is a placeholder. Update the configuration with actual fields.'
          }
        ]
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`📝 Added Section ${this.sectionNumber} to field configuration (update with actual fields)`);
    }
  }

  async addRoute() {
    const routesPath = path.join(this.basePath, 'routes.ts');
    
    if (fs.existsSync(routesPath)) {
      let routesContent = fs.readFileSync(routesPath, 'utf8');
      
      // Add import
      const importLine = `import { Section${this.sectionNumber}Component } from './components/Rendered2.0/Section${this.sectionNumber}Component';`;
      
      // Add route
      const routeLine = `  '/section${this.sectionNumber}': { component: Section${this.sectionNumber}Component, title: '${this.sectionTitle}' },`;
      
      // Simple insertion (would need more sophisticated parsing for production)
      if (!routesContent.includes(`Section${this.sectionNumber}Component`)) {
        routesContent = routesContent.replace(
          /import.*from.*Component';/g, 
          `$&\n${importLine}`
        );
        
        routesContent = routesContent.replace(
          /};/g,
          `  ${routeLine}\n};`
        );
        
        fs.writeFileSync(routesPath, routesContent);
        console.log(`🛣️  Added route for Section ${this.sectionNumber}`);
      }
    }
  }
}

// CLI Usage
if (require.main === module) {
  const sectionNumber = process.argv[2];
  const sectionTitle = process.argv[3];
  
  if (!sectionNumber || !sectionTitle) {
    console.error('Usage: node generate-section.js <section-number> "<section-title>"');
    console.error('Example: node generate-section.js 25 "Information Technology Systems"');
    process.exit(1);
  }
  
  new SectionGenerator(sectionNumber, sectionTitle).generate();
}

module.exports = SectionGenerator;