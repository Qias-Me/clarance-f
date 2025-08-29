#!/usr/bin/env node
/**
 * Automated Section Migration Tool
 * Converts legacy section components to withSectionWrapper pattern
 */

const fs = require('fs');
const path = require('path');

class SectionMigrator {
  constructor(sectionPath) {
    this.sectionPath = sectionPath;
    this.sectionName = path.basename(sectionPath, '.tsx');
    this.sectionNumber = this.sectionName.match(/\d+/)?.[0];
  }

  migrate() {
    const content = fs.readFileSync(this.sectionPath, 'utf8');
    
    // Extract field definitions and validation rules
    const fields = this.extractFields(content);
    const validationRules = this.extractValidation(content);
    const customLogic = this.extractCustomLogic(content);

    // Generate migrated component
    const migratedComponent = this.generateComponent(fields, validationRules, customLogic);
    
    // Write migrated file
    const backupPath = `${this.sectionPath}.backup`;
    fs.copyFileSync(this.sectionPath, backupPath);
    fs.writeFileSync(this.sectionPath, migratedComponent);
    
    console.log(`✅ Migrated ${this.sectionName} (backup: ${backupPath})`);
    return { fields, validationRules, customLogic };
  }

  extractFields(content) {
    // Parse existing field definitions
    const fieldRegex = /(\w+):\s*{[^}]*type:\s*['"](\w+)['"]/g;
    const fields = [];
    let match;
    
    while ((match = fieldRegex.exec(content)) !== null) {
      fields.push({
        name: match[1],
        type: match[2],
        // Extract other properties...
      });
    }
    return fields;
  }

  generateComponent(fields, validationRules, customLogic) {
    return `import React from 'react';
import { withSectionWrapper } from '../hoc/withSectionWrapper';
import { FieldRenderer } from '../base/FieldRenderer';
import { Section${this.sectionNumber}Context } from '../../state/contexts/sections2.0/section${this.sectionNumber}';

const Section${this.sectionNumber}Fields = React.memo(() => {
  return (
    <div className="section-${this.sectionNumber}-fields">
      ${fields.map(field => `      <FieldRenderer field="${field.name}" type="${field.type}" />`).join('\n')}
    </div>
  );
});

${customLogic ? `// Custom Logic Block\n${customLogic}\n` : ''}

export const Section${this.sectionNumber}Component = withSectionWrapper({
  sectionNumber: ${this.sectionNumber},
  contextProvider: Section${this.sectionNumber}Context,
  component: Section${this.sectionNumber}Fields,
  ${validationRules ? `validationRules: ${JSON.stringify(validationRules, null, 2)},` : ''}
});
`;
  }
}

// Usage: node migrate-section.js path/to/SectionXComponent.tsx
const sectionPath = process.argv[2];
if (!sectionPath) {
  console.error('Usage: node migrate-section.js <section-component-path>');
  process.exit(1);
}

new SectionMigrator(sectionPath).migrate();