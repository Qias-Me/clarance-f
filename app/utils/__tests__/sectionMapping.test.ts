import {
  sectionMapping,
  getComponentNameForSection,
  getComponentPathForSection,
  getContextFileForSection,
  getContextPathForSection,
  getSectionName,
  getSectionInfo,
  getAllSectionInfo
} from '../sectionMapping';

describe('Section Mapping Utility', () => {
  describe('sectionMapping', () => {
    it('should have mapping for all 30 sections', () => {
      expect(Object.keys(sectionMapping).length).toBe(30);
      
      // Check each section exists 1-30
      for (let i = 1; i <= 30; i++) {
        expect(sectionMapping[i]).toBeDefined();
        expect(sectionMapping[i].id).toBe(i);
      }
    });

    it('should have correct structure for each section', () => {
      Object.values(sectionMapping).forEach(section => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('name');
        expect(section).toHaveProperty('componentName');
        expect(section).toHaveProperty('contextFile');
        expect(typeof section.id).toBe('number');
        expect(typeof section.name).toBe('string');
        expect(typeof section.componentName).toBe('string');
        expect(typeof section.contextFile).toBe('string');
      });
    });
  });

  describe('getComponentNameForSection', () => {
    it('should return correct component name for valid section', () => {
      expect(getComponentNameForSection(1)).toBe('RenderBasicInfo');
      expect(getComponentNameForSection(5)).toBe('RenderNames');
      expect(getComponentNameForSection(30)).toBe('RenderSignature');
    });

    it('should return undefined for invalid section', () => {
      expect(getComponentNameForSection(0)).toBeUndefined();
      expect(getComponentNameForSection(31)).toBeUndefined();
    });
  });

  describe('getComponentPathForSection', () => {
    it('should return correct component path for valid section', () => {
      expect(getComponentPathForSection(1)).toBe('app/components/Rendered/RenderBasicInfo');
      expect(getComponentPathForSection(5)).toBe('app/components/Rendered/RenderNames');
      expect(getComponentPathForSection(30)).toBe('app/components/Rendered/RenderSignature');
    });

    it('should return undefined for invalid section', () => {
      expect(getComponentPathForSection(0)).toBeUndefined();
      expect(getComponentPathForSection(31)).toBeUndefined();
    });
  });

  describe('getContextFileForSection', () => {
    it('should return correct context file for valid section', () => {
      expect(getContextFileForSection(1)).toBe('personalInfo');
      expect(getContextFileForSection(5)).toBe('namesInfo');
      expect(getContextFileForSection(30)).toBe('signature');
    });

    it('should return undefined for invalid section', () => {
      expect(getContextFileForSection(0)).toBeUndefined();
      expect(getContextFileForSection(31)).toBeUndefined();
    });
  });

  describe('getContextPathForSection', () => {
    it('should return correct context path for valid section', () => {
      expect(getContextPathForSection(1)).toBe('app/state/contexts/sections/personalInfo');
      expect(getContextPathForSection(5)).toBe('app/state/contexts/sections/namesInfo');
      expect(getContextPathForSection(30)).toBe('app/state/contexts/sections/signature');
    });

    it('should return undefined for invalid section', () => {
      expect(getContextPathForSection(0)).toBeUndefined();
      expect(getContextPathForSection(31)).toBeUndefined();
    });
  });

  describe('getSectionName', () => {
    it('should return correct section name for valid section', () => {
      expect(getSectionName(1)).toBe('Full Name');
      expect(getSectionName(5)).toBe('Other Names Used');
      expect(getSectionName(30)).toBe('Continuation Space');
    });

    it('should return undefined for invalid section', () => {
      expect(getSectionName(0)).toBeUndefined();
      expect(getSectionName(31)).toBeUndefined();
    });
  });

  describe('getSectionInfo', () => {
    it('should return complete section info for valid section', () => {
      const section1 = getSectionInfo(1);
      expect(section1).toBeDefined();
      expect(section1?.id).toBe(1);
      expect(section1?.name).toBe('Full Name');
      expect(section1?.componentName).toBe('RenderBasicInfo');
      expect(section1?.contextFile).toBe('personalInfo');
    });

    it('should return undefined for invalid section', () => {
      expect(getSectionInfo(0)).toBeUndefined();
      expect(getSectionInfo(31)).toBeUndefined();
    });
  });

  describe('getAllSectionInfo', () => {
    it('should return array with all 30 sections', () => {
      const allSections = getAllSectionInfo();
      expect(allSections.length).toBe(30);
      
      // Verify the array contains all section ids 1-30
      const sectionIds = allSections.map(section => section.id).sort();
      for (let i = 1; i <= 30; i++) {
        expect(sectionIds).toContain(i);
      }
    });
  });
}); 